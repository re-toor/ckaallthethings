# CoreDNS for Kubernetes — Complete Expert Reference Guide
> **Version Coverage:** CoreDNS 1.13.2 (December 2025) · Kubernetes 1.29–1.32  
> **Last Updated:** February 2026  
> **CKA 2026 Aligned**

---

## Table of Contents

1. [Overview & History](#1-overview--history)
2. [Architecture & Internal Components](#2-architecture--internal-components)
3. [Corefile — Configuration Reference](#3-corefile--configuration-reference)
4. [Plugins — Complete Reference](#4-plugins--complete-reference)
5. [Deployment & Kubernetes Objects](#5-deployment--kubernetes-objects)
6. [Advanced Configurations & Use Cases](#6-advanced-configurations--use-cases)
7. [Troubleshooting — Systematic Diagnosis](#7-troubleshooting--systematic-diagnosis)
8. [Performance Tuning & Monitoring](#8-performance-tuning--monitoring)
9. [CKA 2026 Quick Reference](#9-cka-2026-quick-reference)
10. [Security Hardening](#10-security-hardening)
11. [Complete Reference Tables](#11-complete-reference-tables)
12. [Multi-Cluster DNS & Advanced Topics](#12-multi-cluster-dns--advanced-topics)

---

## 1. Overview & History

### 1.1 What is CoreDNS?

CoreDNS is the **default DNS server for Kubernetes clusters** (GA since Kubernetes 1.13, December 2018).[^k8s-dns-concepts] It is a flexible, extensible DNS server written in Go, a **CNCF Graduated project**,[^cncf-coredns] licensed under Apache 2.0.

CoreDNS replaced `kube-dns` and is architecturally different: **every feature is a plugin**.[^coredns-manual] The Corefile declares which plugins are active and in what order they process each DNS query.

| Property | Value |
|---|---|
| Written in | Go (golang) |
| License | Apache 2.0 |
| Governance | CNCF Graduated Project |
| Default in Kubernetes | Since v1.13 (GA, December 2018) |
| Latest stable (Feb 2026) | **1.13.2** (December 2025) |
| Protocol support | UDP/TCP, DoT (RFC 7858),[^rfc7858] DoH (RFC 8484),[^rfc8484] DoQ (RFC 9250)[^rfc9250] |
| Replaces | kube-dns (deprecated) |
| Source | https://github.com/coredns/coredns |

### 1.2 CoreDNS vs kube-dns

| Feature | CoreDNS | kube-dns |
|---|---|---|
| Architecture | Single binary, plugin chain | 3 containers: dnsmasq + kubedns + sidecar |
| Configuration | Corefile (declarative) | Command-line flags per container |
| Extensibility | Plugin API — no fork needed | Fork required |
| Memory footprint | ~70–170 Mi (configurable) | Higher baseline |
| Metrics | Prometheus native (prometheus plugin) | Via sidecar exporter |
| DNS protocols | UDP, TCP, DoT, DoH, DoQ | UDP, TCP only |
| Maintained | Yes — active CNCF project | Deprecated |

### 1.3 Release History (Recent — 2025) [^coredns-releases]

| Version | Date | Key Changes |
|---|---|---|
| **1.13.2** | Dec 2025 | Kubernetes API rate limiting, regex length limit (ReDoS protection), DoH3 initial support, pre-compile CNAME rewrite regexp, multisocket OOM cap |
| 1.13.1 | Oct 2025 | Bug fixes, performance improvements |
| **1.13.0** | Oct 2025 | Nomad plugin GA, improved shutdown handling, new `show_first`/`consolidate` options in errors plugin, graceful SIGTERM handling improvements |
| 1.12.4 | Sep 2025 | DoH context propagation fix, label offset handling in file plugin, connection leak fixes in gRPC/transfer, `prefer` option support |
| **1.12.3** | Aug 2025 | `startup_timeout` for kubernetes plugin, `fallthrough` in gRPC, EDNS0 `unset` action in rewrite, SRV case preservation per RFC 6763 |
| **1.12.2** | Jun 2025 | `multicluster` plugin for cross-cluster DNS via ServiceImport CRDs, QUIC concurrent stream limiting, `fallthrough` in file plugin |
| **1.12.1** | Mar 2025 | CNAME lookup limit increased 7→10, `failfast_all_unhealthy_upstreams` in forward, kubernetes pod DeletionTimestamp fix |
| 1.12.0 | Jan 2025 | DoQ improvements, EndpointSlice optimizations, AutoPath allocation optimization |

> **CKA Exam Tip:** The exam tests you on CoreDNS in `kube-system`. Know how to inspect, edit, and restart CoreDNS. Most common tasks: editing the ConfigMap (Corefile), debugging DNS resolution from inside pods, and understanding DNS naming conventions.

---

## 2. Architecture & Internal Components

### 2.1 High-Level Architecture

```
┌──────────────────── Kubernetes Cluster ──────────────────────────┐
│                                                                  │
│   [App Pod]  ── DNS Query ──>  [kube-dns Service :53]            │
│      ↑                                │                          │
│   /etc/resolv.conf              LoadBalances                     │
│   nameserver 10.96.0.10        ┌──────┴──────┐                   │
│   ndots:5                  [CoreDNS Pod-1] [CoreDNS Pod-2]       │
│                                    │                             │
│                           Plugin Chain:                          │
│                      errors → health → ready → kubernetes        │
│                      → prometheus → forward → cache → reload     │
│                                    │                             │
│              ┌─────────────────────┼──────────────────┐          │
│        [k8s API]             [Upstream DNS]        [Cache]       │
│    (cluster.local)        (/etc/resolv.conf)    (in-memory)      │
│                                                                  │
│   [ConfigMap: coredns / Corefile] ──mounted──> CoreDNS Pods      │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Kubernetes Objects Deployed by CoreDNS

| Kind | Name | Namespace | Purpose |
|---|---|---|---|
| Deployment | coredns | kube-system | Runs CoreDNS pods (default: 2 replicas) |
| Service | kube-dns | kube-system | ClusterIP (e.g., 10.96.0.10), port 53 UDP+TCP, port 9153 metrics |
| ConfigMap | coredns | kube-system | Contains the Corefile configuration |
| ServiceAccount | coredns | kube-system | Identity for API calls |
| ClusterRole | system:coredns | — | list/watch: Endpoints, EndpointSlices, Services, Pods, Namespaces |
| ClusterRoleBinding | system:coredns | — | Binds ClusterRole to coredns ServiceAccount |
| PodDisruptionBudget | coredns | kube-system | Ensures at least 1 pod stays up during disruptions |

> **EndpointSlices vs Endpoints:** Since Kubernetes 1.21, CoreDNS defaults to watching **EndpointSlices** (`discovery.k8s.io/v1`) instead of the legacy Endpoints API. EndpointSlices are more scalable (they shard large endpoint sets). The ClusterRole grants access to both for backward compatibility. On Kubernetes 1.32, only EndpointSlices are used internally.

### 2.3 Plugin Chain — The Core Concept

Every DNS query passes through **each plugin in the Corefile in declaration order**. A plugin may:

- **Handle the request** and return a response (terminal plugin)
- **Modify** the request or response (middleware plugin)
- **Pass through** to the next plugin in the chain
- **Produce side effects** (logging, metrics, health endpoint)

```
DNS Request arrives at port 53
         │
    ┌────▼────┐   errors   — catches panics, logs all errors to stdout
    └────┬────┘
    ┌────▼────┐   log      — logs all queries (optional, debug only)
    └────┬────┘
    ┌────▼────┐   health   — HTTP /health endpoint (lameduck on SIGTERM)
    └────┬────┘
    ┌────▼────┐   ready    — HTTP /ready readiness probe endpoint
    └────┬────┘
    ┌────▼────┐   kubernetes — resolves cluster.local (TERMINAL for internal)
    └────┬────┘              If not a cluster zone, falls through
    ┌────▼────┐   prometheus — collects DNS metrics on :9153
    └────┬────┘
    ┌────▼────┐   forward  — forwards external queries upstream (TERMINAL)
    └────┬────┘
    ┌────▼────┐   cache    — caches responses in memory
    └────┬────┘
    ┌────▼────┐   loop     — detects forwarding loops, halts if found
    └────┬────┘
    ┌────▼────┐   reload   — watches Corefile, hot-reloads on change
    └────┬────┘
    ┌────▼────┐   loadbalance — round-robins A/AAAA answers
    └─────────┘
    DNS Response returned to client pod
```

### 2.4 DNS Resolution Paths

#### Internal Service (cluster.local)

```bash
# Pod's /etc/resolv.conf (injected by kubelet):
nameserver 10.96.0.10        # kube-dns Service ClusterIP
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5

# Query: curl http://my-service
# With ndots:5, 'my-service' has 0 dots < 5 → search expansion fires:
# 1. my-service.default.svc.cluster.local  ← CoreDNS answers (FOUND)
# 2. my-service.svc.cluster.local           ← only reached if #1 fails
# 3. my-service.cluster.local               ← only reached if #2 fails
# 4. my-service.                            ← absolute query

# Cross-namespace: curl http://my-service.other-ns
# 'my-service.other-ns' has 1 dot < 5 → search expansion:
# 1. my-service.other-ns.default.svc.cluster.local  ← NXDOMAIN
# 2. my-service.other-ns.svc.cluster.local           ← NXDOMAIN
# 3. my-service.other-ns.cluster.local               ← NXDOMAIN
# 4. my-service.other-ns.                            ← if still not found
# Use FQDN: my-service.other-ns.svc.cluster.local to avoid this!
```

#### External DNS Resolution

```bash
# Query: curl https://api.github.com
# CoreDNS kubernetes plugin: "not my zone (cluster.local), fall through"
# CoreDNS forward plugin: forwards to /etc/resolv.conf on the node
#   (typically cloud provider DNS, e.g., 169.254.169.253 on AWS)
# Response cached by cache plugin for TTL seconds
```

### 2.5 DNS Record Types in Kubernetes [^k8s-dns-concepts]

| Record Type | Pattern | Example |
|---|---|---|
| A / AAAA | `<service>.<ns>.svc.cluster.local` | `my-svc.default.svc.cluster.local → 10.96.5.10` |
| A / AAAA (headless) | `<service>.<ns>.svc.cluster.local` | Returns all pod IPs |
| A / AAAA (pod) | `<ip-dashes>.<ns>.pod.cluster.local` | `10-0-0-5.default.pod.cluster.local → 10.0.0.5` |
| SRV | `_<port>._<proto>.<svc>.<ns>.svc.cluster.local` | `_http._tcp.web.default.svc.cluster.local` [^rfc6763] |
| PTR | `<reversed-ip>.in-addr.arpa` | `10.5.96.10.in-addr.arpa → svc.ns.svc.cluster.local` |
| CNAME | ExternalName service | `ext.default.svc.cluster.local → CNAME → external.example.com` |
| A (StatefulSet pod) | `<pod>.<svc>.<ns>.svc.cluster.local` | `cassandra-0.cassandra.default.svc.cluster.local` |

> **Accuracy Note:** Pod IP records (`<ip-dashes>.<ns>.pod.cluster.local`) are only served when `pods` is set to `insecure` or `verified` in the kubernetes plugin. With the default `pods disabled`, these records return NXDOMAIN.

---

## 3. Corefile — Configuration Reference

### 3.1 Corefile Syntax & Structure

```corefile
# Syntax:
<zones> [<port>] {
    <plugin> [options]
    ...
}

# Multiple zones can share a server block (space-separated)
# Multiple server blocks can coexist in one Corefile

# Default Kubernetes Corefile (kubeadm, Kubernetes 1.29+):
.:53 {
    errors
    health {
        lameduck 5s
    }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
        pods insecure
        fallthrough in-addr.arpa ip6.arpa
        ttl 30
    }
    prometheus :9153
    forward . /etc/resolv.conf {
        max_concurrent 1000
    }
    cache 30
    loop
    reload
    loadbalance
}
```

### 3.2 Viewing & Editing the Corefile

```bash
# View the CoreDNS ConfigMap (contains Corefile)
kubectl get configmap coredns -n kube-system -o yaml

# Edit the ConfigMap interactively
kubectl edit configmap coredns -n kube-system

# Extract Corefile to local file
kubectl get configmap coredns -n kube-system \
  -o jsonpath='{.data.Corefile}' > Corefile

# Apply a modified ConfigMap from file
kubectl apply -f coredns-configmap.yaml

# Force reload (reload plugin does this automatically ~every 30s)
# But for urgent changes, force a rolling restart:
kubectl rollout restart deployment coredns -n kube-system

# Watch rollout status
kubectl rollout status deployment coredns -n kube-system

# Verify reload happened via logs
kubectl logs -n kube-system -l k8s-app=kube-dns | grep reload
# Expected: [INFO] plugin/reload: Running configuration MD5 = <hash>
```

> **Hot Reload:** The `reload` plugin watches the ConfigMap for changes and automatically reloads CoreDNS configuration within ~30 seconds. **No pod restart needed for config changes.** However, for major structural changes (adding new plugins that require memory allocation), a forced restart is safer.

### 3.3 Multiple Server Blocks

```corefile
# Multiple zones in one Corefile — each block is independent

# Block 1: Cluster DNS
.:53 {
    errors
    health { lameduck 5s }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
        pods insecure
        fallthrough in-addr.arpa ip6.arpa
        ttl 30
    }
    prometheus :9153
    forward . /etc/resolv.conf
    cache 30
    loop
    reload
    loadbalance
}

# Block 2: Stub domain → private DNS server
# (Separate server block = separate listener, different zone)
corp.internal:53 {
    errors
    forward . 10.10.0.53 10.10.0.54 {
        max_concurrent 200
    }
    cache 60
}

# Block 3: Another stub domain
test.example:53 {
    errors
    forward . 172.16.0.53
    cache 30
}
```

> **Important Distinction:** Stub domains can also be implemented with multiple `forward` lines **inside a single .:53 block** (order matters — most-specific match first). Separate server blocks give each zone its own server instance and plugin chain.

### 3.4 Import Plugin — Splitting Configuration

```corefile
# ConfigMap can have multiple keys
# The 'import' plugin includes other config files

# Key: Corefile
.:53 {
    errors
    health { lameduck 5s }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
        pods insecure
        fallthrough in-addr.arpa ip6.arpa
    }
    # Import custom overrides (appended to this server block)
    import /etc/coredns/custom/*.override
    prometheus :9153
    forward . /etc/resolv.conf
    cache 30
    loop
    reload
    loadbalance
}
# Import additional server blocks
import /etc/coredns/custom/*.server

# Key: custom-stub.server (adds a separate server block)
stub.corp:53 {
    forward . 10.20.0.10
    cache 30
}
```

### 3.5 Environment Variables in Corefile

```corefile
# Use {$VAR_NAME} syntax for environment variable substitution
.:53 {
    forward . {$UPSTREAM_DNS_1} {$UPSTREAM_DNS_2}
    cache {$CACHE_TTL}
}

# Set env vars in the CoreDNS Deployment spec:
# spec:
#   template:
#     spec:
#       containers:
#         - name: coredns
#           env:
#             - name: UPSTREAM_DNS_1
#               value: "8.8.8.8"
#             - name: UPSTREAM_DNS_2
#               value: "8.8.4.4"
#             - name: CACHE_TTL
#               value: "300"
```

---

## 4. Plugins — Complete Reference

### 4.1 `kubernetes` Plugin (Core Plugin) [^plugin-kubernetes]

The kubernetes plugin connects to the Kubernetes API server and synthesizes DNS responses from Services, EndpointSlices,[^k8s-endpointslices] Pods, and Namespaces.

```corefile
kubernetes [ZONES...] {
    resyncperiod DURATION      # full resync interval (default: 0 = watch only)
    endpoint URL               # kube-apiserver URL (default: in-cluster auto-detect)
    tls CERT KEY CACERT        # TLS certificates for API communication
    kubeconfig KUBECONFIG [CTX] # kubeconfig for out-of-cluster deployment
    namespaces NS [NS...]       # restrict to specific namespaces only
    namespace_labels EXPR       # label selector for namespace filtering
    labels EXPR                 # label selector for object filtering
    pods POD-MODE               # disabled (default) | insecure | verified
    endpoint_pod_names          # use pod name as endpoint name in A records
    ttl TTL                     # response TTL in seconds (default: 5, max: 3600)
    noendpoints                 # disable endpoint/headless service records
    fallthrough [ZONES...]      # fall through to next plugin on NXDOMAIN
    ignore empty_service        # return NXDOMAIN for services with 0 ready endpoints
    multicluster ZONES...       # cross-cluster DNS via ServiceImport CRDs [1.12.2+]
    startup_timeout DURATION    # max wait for initial API sync [1.12.3+, default: 5s]
}
```

#### pods Mode Comparison

| Mode | Behavior | Security | Use Case |
|---|---|---|---|
| `disabled` (default) | Pod A records never served | Most secure | General use |
| `insecure` | Always return A record from query IP (no validation) | **INSECURE** | Legacy kube-dns migration only |
| `verified` | Only return if pod with that IP exists in same namespace | Moderate | SSL cert use cases, service mesh |

> **Accuracy Note:** `pods insecure` is set in the default kubeadm Corefile for backward compatibility with kube-dns, but `pods disabled` is safer for new clusters that don't rely on pod IP DNS.

#### Example Configurations

```corefile
# Production standard
kubernetes cluster.local in-addr.arpa ip6.arpa {
    pods insecure
    fallthrough in-addr.arpa ip6.arpa
    ttl 30
}

# Restrict to specific namespaces
kubernetes cluster.local {
    namespaces production staging monitoring
    pods verified
    ttl 60
}

# Label-based namespace filtering
kubernetes cluster.local {
    namespace_labels environment in (production, staging)
    pods insecure
    fallthrough in-addr.arpa ip6.arpa
    ttl 30
}

# Label-based object filtering
kubernetes cluster.local {
    labels app in (web, api), environment=production
    pods disabled
    ttl 30
}

# Longer startup timeout for slow API servers [1.12.3+]
kubernetes cluster.local {
    startup_timeout 30s
    pods insecure
    fallthrough in-addr.arpa ip6.arpa
    ttl 30
}

# multicluster plugin: cross-cluster DNS via ServiceImport CRDs [1.12.2+]
# Requires: kubernetes-sigs/mcs-api CRDs + a multi-cluster controller
clusterset.local {
    multicluster clusterset.local
}
cluster.local {
    kubernetes cluster.local {
        pods insecure
        fallthrough in-addr.arpa ip6.arpa
    }
}
```

### 4.2 `forward` Plugin [^plugin-forward]

```corefile
forward FROM TO... {
    except IGNORED_NAMES                    # don't forward these names
    force_tcp                               # always use TCP (not UDP)
    prefer_udp                              # prefer UDP, retry TCP on truncation
    expire DURATION                         # expire upstream after this duration (default: 10s)
    max_fails N                             # unhealthy after N consecutive failures (default: 2)
    health_check DURATION [no_rec]          # health check interval (default: 0.5s)
    max_concurrent N                        # max simultaneous upstream queries (default: 0=unlimited)
    tls CERT KEY CA                         # TLS certs for DoT upstreams
    tls_servername NAME                     # SNI hostname for DoT
    policy random|round_robin|sequential    # upstream selection (default: random)
    failfast_all_unhealthy_upstreams        # SERVFAIL immediately if all upstreams down [1.12.1+]
}

# Examples:

# Standard: forward to node DNS
forward . /etc/resolv.conf {
    max_concurrent 1000
}

# Explicit upstream resolvers
forward . 8.8.8.8 8.8.4.4 1.1.1.1 {
    max_fails 3
    health_check 5s
    prefer_udp
    policy round_robin
}

# Stub domain to private DNS
forward corp.internal. 10.1.0.53 10.1.0.54 {
    max_concurrent 500
    max_fails 2
}

# DNS over TLS (DoT) to upstream
forward . tls://8.8.8.8 tls://8.8.4.4 {
    tls_servername dns.google
    health_check 5s
    prefer_udp
}

# Failfast when all upstreams are down [1.12.1+]
forward . 10.0.0.1 10.0.0.2 {
    failfast_all_unhealthy_upstreams
    health_check 2s
    max_fails 1
}
```

> **Accuracy Note on `prefer_udp`:** This is recommended for AWS/cloud environments. Some EC2 instance types have a bug causing high-volume TCP DNS connections to fail. `prefer_udp` uses UDP by default and falls back to TCP only on truncation, avoiding this issue.

### 4.3 `cache` Plugin [^plugin-cache]

```corefile
cache [TTL] [ZONES...] {
    success CAPACITY [TTL] [MINTTL]         # positive response cache settings
    denial  CAPACITY [TTL] [MINTTL]         # NXDOMAIN/NODATA cache settings
    prefetch AMOUNT [DURATION] [PERCENTAGE] # proactive cache refresh
    serve_stale [DURATION] [REFRESH_MODE]   # serve expired entries on upstream failure
    disable [success|denial] [ZONES...]     # disable caching for specific type/zones
    keepttl                                 # preserve original upstream TTL
}

# Simple: cap TTL at 30s max (responses with TTL > 30s are stored as 30s; responses with TTL < 30s keep their TTL)
cache 30

# Advanced tuning
cache {
    success 9984 300 10   # 9984 entries, max TTL cap 300s, min TTL floor 10s
    denial  9984 5   1    # 9984 entries, max TTL cap 5s, min TTL floor 1s (fast NXDOMAIN re-check)
    prefetch 10 60s 10%   # prefetch when <10% TTL remains, within 60s window
    serve_stale 1h verify # serve stale for up to 1h; verify upstream is alive first
}

# Don't cache internal cluster records (they change frequently)
cache {
    success 9984 300
    disable success cluster.local  # skip positive cache for cluster.local
}
```

> **`serve_stale` — Enabled by Default from 1.12.1+:** When upstream DNS is temporarily unreachable, CoreDNS continues answering from cached entries. The `verify` mode (default) checks upstream before serving stale; `immediate` serves stale without checking. `DURATION` defaults to 1 hour.

> **Cache TTL Semantics:** The TTL parameter in `cache` is a **cap** (maximum), not a literal TTL. Responses with upstream TTL longer than the cap are stored with the cap value. Responses with shorter TTL keep their original value. The simple `cache 30` form sets a 30-second cap on both success and denial entries.

> **Cache CAPACITY:** Default is 9984 entries (a hash-map-friendly value close to 10000). Increase for large clusters with many unique service names. Each entry is ~100–200 bytes; 9984 entries ≈ 1–2 MB of memory.

### 4.4 `log` Plugin [^plugin-log]

```corefile
# Log all DNS queries (VERY verbose — use only for debugging)
log

# Log only specific classes
log {
    class denial error  # only log NXDOMAIN responses and errors
}

# Log only for specific zones
log cluster.local {
    class all
}
```

```bash
# View logs
kubectl logs -n kube-system -l k8s-app=kube-dns -f

# Log format (default):
# [INFO] <client_ip>:<port> - <id> "<name> <class> <type> <proto> <size> <do> <bufsize>" <rcode> <rflags> <rsize> <duration>
# Example:
# [INFO] 10.0.0.5:47832 - 12345 "kubernetes.default.svc.cluster.local. IN A udp 50 false 512" NOERROR qr,aa,rd 68 0.000234s
```

### 4.5 `errors` Plugin [^plugin-errors]

```corefile
# Always add errors as the FIRST plugin in every server block
# It catches panics, logs errors to stdout, and prevents crashes from propagating
errors

# Consolidate repeated identical errors [1.13.0+]
errors {
    consolidate 5m ".* i/o timeout .*"
    consolidate 30s ".* dns .* i/o timeout .*"
}
```

### 4.6 `health` & `ready` Plugins [^plugin-health][^plugin-ready]

```corefile
# health: HTTP health endpoint on port 8080 (liveness probe)
health {
    lameduck 5s   # wait 5s after SIGTERM before marking unhealthy
                  # allows existing connections to drain
}
# GET http://<pod-ip>:8080/health → "OK" when healthy

# ready: HTTP readiness endpoint on port 8181
ready
# GET http://<pod-ip>:8181/ready → 200 when all plugins are initialized
# Used by Kubernetes readinessProbe
```

```bash
# Test health/ready from inside cluster
kubectl exec -n kube-system <coredns-pod> -- wget -qO- http://127.0.0.1:8080/health
kubectl exec -n kube-system <coredns-pod> -- wget -qO- http://127.0.0.1:8181/ready
```

> **Readiness Probe in Deployment:**
> ```yaml
> readinessProbe:
>   httpGet:
>     path: /ready
>     port: 8181
>   initialDelaySeconds: 0
>   periodSeconds: 2
>   failureThreshold: 3
> ```

### 4.7 `prometheus` Plugin [^plugin-prometheus]

```corefile
# Enable Prometheus metrics scraping on port 9153
prometheus :9153
```

```bash
# Access metrics
kubectl port-forward -n kube-system svc/kube-dns 9153:9153 &
curl -s http://localhost:9153/metrics | grep coredns

# Key metrics:
# coredns_dns_request_duration_seconds{} — query latency histogram
# coredns_dns_requests_total{} — total queries by server/zone/type/proto
# coredns_dns_responses_total{rcode="NXDOMAIN"} — NXDOMAIN rate
# coredns_dns_responses_total{rcode="SERVFAIL"} — SERVFAIL rate
# coredns_cache_hits_total{} — cache hit count
# coredns_cache_misses_total{} — cache miss count
# coredns_forward_requests_total{} — forwarded queries
# coredns_forward_responses_total{} — upstream responses by rcode
# coredns_kubernetes_dns_programming_duration_seconds — EndpointSlice sync
# process_resident_memory_bytes — current memory usage
# go_goroutines — goroutine count (leak detection)
```

### 4.8 `rewrite` Plugin [^plugin-rewrite]

```corefile
# Rewrite a specific name
rewrite name old.example.com new.example.com

# Regex rewrite with answer rewriting (bidirectional)
rewrite stop {
    name regex (.*)\\.old\\.cluster\\.local {1}.new.cluster.local
    answer name (.*)\\.new\\.cluster\\.local {1}.old.cluster.local
}

# Rewrite TTL in responses
rewrite ttl answer 300

# EDNS0 manipulation
rewrite edns0 local set 0xffee 0x1234

# EDNS0 unset action [1.12.3+]
rewrite edns0 local unset 0xffee

# Practical: redirect legacy service name to new name
# Pods querying 'legacy-db' → routed to 'postgres'
rewrite name legacy-db.default.svc.cluster.local postgres.default.svc.cluster.local

# Important: 'stop' prevents further rewrite rules from matching
# Without 'stop', all matching rewrite rules are applied in sequence
```

### 4.9 `autopath` Plugin [^plugin-autopath]

```corefile
# Requires: pods verified in kubernetes plugin
# Enables server-side search path completion — reduces client DNS queries

cluster.local {
    autopath @kubernetes
    kubernetes cluster.local {
        pods verified      # REQUIRED for autopath
    }
}

# Without autopath (client-side, ndots:5):
# Pod queries 'redis' → 4-5 sequential queries with search domains
# Each takes a round trip to CoreDNS

# With autopath (server-side):
# Pod sends ONE query, CoreDNS tries all search domains internally
# Returns the match — dramatically reduces DNS traffic and latency
```

> **Memory Tradeoff:** `pods verified` requires CoreDNS to maintain a watch on all pods (for IP→pod mapping). This increases memory usage proportionally to the number of pods in the cluster.

### 4.10 `hosts` Plugin [^plugin-hosts]

```corefile
# Serve DNS from a hosts-file format (static mappings)
hosts {
    10.0.0.1  legacy.example.com
    10.0.0.2  old-api.example.com
    ttl 60
    reload 15s       # auto-reload the hosts file
    fallthrough      # pass to next plugin if name not found here
}

# Hosts file can also be mounted from a ConfigMap
# and referenced as: hosts /etc/coredns/hosts { ... }
```

### 4.11 `loop` Plugin [^plugin-loop]

```corefile
# Detect and halt on forwarding loops
loop

# If a loop is detected, CoreDNS logs:
# [FATAL] plugin/loop: Loop (127.0.0.1:12345 -> :53) detected for zone "."
# and halts — preventing infinite query storms
```

> **Always include `loop`!** A forwarding loop (CoreDNS forwarding to itself) causes exponential query amplification. The `loop` plugin detects this and crashes CoreDNS before it takes down the cluster's DNS.

### 4.12 `reload` Plugin [^plugin-reload]

```corefile
# Watch Corefile for changes and hot-reload automatically
reload

# Custom check interval (default: 30s)
reload 10s

# With jitter to prevent all pods reloading simultaneously
reload 30s 15s  # check every 30s with up to 15s random jitter
```

### 4.13 `loadbalance` Plugin [^plugin-loadbalance]

```corefile
# Round-robin randomization of A, AAAA, and MX records in responses
# Provides basic client-side load balancing across multiple pod IPs
loadbalance

# Only 'round_robin' policy is supported
loadbalance round_robin
```

### 4.14 Other Notable Plugins

| Plugin | Description |
|---|---|
| `dnssec` | Signs responses on-the-fly with DNSSEC. Requires a private key. |
| `file` | Serves zone data from a zone file. Supports DNSSEC (NSEC). SRV case-preserved per RFC 6763 [1.12.3+]. |
| `transfer` | Enable AXFR zone transfers — act as a primary DNS server. |
| `secondary` | Receive zone data from a primary via AXFR. Goroutine leak fix in [1.13.2]. |
| `etcd` | Use etcd as DNS backend (SkyDNS replacement). |
| `template` | Generate responses from Go templates — useful for wildcard patterns. |
| `metadata` | Provides per-query metadata (pod name, namespace, labels) to other plugins. |
| `pprof` | Go pprof profiling endpoint for performance debugging. |
| `whoami` | Returns server IP and port in DNS response. Good for testing. |
| `route53` | Use AWS Route53 as DNS backend. Updated to AWS Go SDK v2 [1.12.3+]. |
| `azure` | Use Azure DNS as backend. |
| `clouddns` | Use Google Cloud DNS as backend. |
| `nomad` | HashiCorp Nomad integration. GA in [1.13.0]. |

---

## 5. Deployment & Kubernetes Objects

### 5.1 Inspecting CoreDNS

```bash
# ── Pods ──────────────────────────────────────────────────────
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl get pods -n kube-system -l k8s-app=kube-dns -o wide
kubectl describe pod -n kube-system -l k8s-app=kube-dns

# ── Deployment ────────────────────────────────────────────────
kubectl get deployment coredns -n kube-system
kubectl describe deployment coredns -n kube-system

# ── Service ───────────────────────────────────────────────────
kubectl get svc kube-dns -n kube-system
kubectl get svc kube-dns -n kube-system -o yaml
# Get the ClusterIP (used as nameserver in pod's /etc/resolv.conf)
kubectl get svc kube-dns -n kube-system -o jsonpath='{.spec.clusterIP}'

# ── Endpoints ─────────────────────────────────────────────────
kubectl get endpoints kube-dns -n kube-system
# Should list the IP addresses of CoreDNS pods

# ── ConfigMap ─────────────────────────────────────────────────
kubectl get configmap coredns -n kube-system -o yaml
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}'

# ── RBAC ──────────────────────────────────────────────────────
kubectl get clusterrole system:coredns -o yaml
kubectl get clusterrolebinding system:coredns -o yaml
kubectl get serviceaccount coredns -n kube-system

# ── Version ───────────────────────────────────────────────────
kubectl get deployment coredns -n kube-system \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
# Example output: registry.k8s.io/coredns/coredns:v1.11.3

# ── PodDisruptionBudget ───────────────────────────────────────
kubectl get pdb -n kube-system
kubectl describe pdb coredns -n kube-system

# ── Recent Events ─────────────────────────────────────────────
kubectl get events -n kube-system --sort-by='.lastTimestamp' | grep -i dns
```

### 5.2 CoreDNS Deployment YAML (Complete Reference)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coredns
  namespace: kube-system
  labels:
    k8s-app: kube-dns
    kubernetes.io/name: CoreDNS
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 25%
  selector:
    matchLabels:
      k8s-app: kube-dns
  template:
    metadata:
      labels:
        k8s-app: kube-dns
    spec:
      # High priority — DNS is critical infrastructure
      priorityClassName: system-cluster-critical
      serviceAccountName: coredns
      # Allow scheduling on tainted nodes
      tolerations:
        - key: CriticalAddonsOnly
          operator: Exists
        - key: node-role.kubernetes.io/control-plane
          effect: NoSchedule
          # Note: older clusters used node-role.kubernetes.io/master
          # Both tolerations are present in CoreDNS 1.9.3+ for compatibility
      nodeSelector:
        kubernetes.io/os: linux
      # Prefer spreading across nodes (anti-affinity)
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: k8s-app
                      operator: In
                      values: ["kube-dns"]
                topologyKey: kubernetes.io/hostname
      containers:
        - name: coredns
          image: registry.k8s.io/coredns/coredns:v1.11.3
          imagePullPolicy: IfNotPresent
          resources:
            requests:
              cpu: 100m
              memory: 70Mi
            limits:
              # memory only — no CPU limit (CPU throttling causes latency)
              memory: 170Mi
          args: ["-conf", "/etc/coredns/Corefile"]
          volumeMounts:
            - name: config-volume
              mountPath: /etc/coredns
              readOnly: true
          ports:
            - containerPort: 53
              name: dns
              protocol: UDP
            - containerPort: 53
              name: dns-tcp
              protocol: TCP
            - containerPort: 9153
              name: metrics
              protocol: TCP
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
              scheme: HTTP
            initialDelaySeconds: 60
            timeoutSeconds: 5
            successThreshold: 1
            failureThreshold: 5
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8181
              scheme: HTTP
            initialDelaySeconds: 0
            timeoutSeconds: 1
            successThreshold: 1
            failureThreshold: 3
            periodSeconds: 2
          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              add:
                - NET_BIND_SERVICE  # required to bind port 53
              drop:
                - ALL               # drop all other capabilities
            readOnlyRootFilesystem: true  # container FS is read-only
      dnsPolicy: Default   # CoreDNS uses node DNS, not itself (avoids bootstrap loop)
      volumes:
        - name: config-volume
          configMap:
            name: coredns
            items:
              - key: Corefile
                path: Corefile
```

> **Accuracy Note — CPU Limits:** The official CoreDNS deployment does NOT set a CPU limit (only a request). CPU throttling on DNS pods causes latency spikes that are very hard to diagnose. Memory limits are set because OOM is a clean failure mode.

> **Accuracy Note — `dnsPolicy: Default`:** CoreDNS itself uses `dnsPolicy: Default` (node's DNS), NOT `ClusterFirst`. This is critical — if CoreDNS used its own service as nameserver, it would create a circular dependency at startup.

### 5.3 kube-dns Service YAML

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kube-dns
  namespace: kube-system
  annotations:
    prometheus.io/port: "9153"
    prometheus.io/scrape: "true"
  labels:
    k8s-app: kube-dns
    kubernetes.io/cluster-service: "true"
    kubernetes.io/name: CoreDNS
spec:
  selector:
    k8s-app: kube-dns
  # CRITICAL: This IP must match kubelet's --cluster-dns flag
  # Set during kubeadm init with --service-dns-domain and cluster CIDR
  clusterIP: 10.96.0.10
  ports:
    - name: dns
      port: 53
      targetPort: 53
      protocol: UDP
    - name: dns-tcp
      port: 53
      targetPort: 53
      protocol: TCP
    - name: metrics
      port: 9153
      targetPort: 9153
      protocol: TCP
```

### 5.4 CoreDNS ConfigMap YAML

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        errors
        health {
            lameduck 5s
        }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
            pods insecure
            fallthrough in-addr.arpa ip6.arpa
            ttl 30
        }
        prometheus :9153
        forward . /etc/resolv.conf {
            max_concurrent 1000
        }
        cache 30
        loop
        reload
        loadbalance
    }
```

### 5.5 Scaling CoreDNS

```bash
# Manual scale
kubectl scale deployment coredns -n kube-system --replicas=4

# Patch resource limits (for large clusters)
kubectl patch deployment coredns -n kube-system --type json -p '[
  {"op":"replace","path":"/spec/template/spec/containers/0/resources/limits/memory","value":"256Mi"},
  {"op":"replace","path":"/spec/template/spec/containers/0/resources/requests/memory","value":"128Mi"}
]'

# Deploy DNS Horizontal Autoscaler [^k8s-dns-autoscale]
# Formula: replicas = max(ceil(cores/coresPerReplica), ceil(nodes/nodesPerReplica))
kubectl apply -f https://k8s.io/examples/admin/dns/dns-horizontal-autoscaler.yaml

# Configure autoscaler thresholds
kubectl edit configmap dns-autoscaler -n kube-system
# Default ConfigMap data:
# {
#   "coresPerReplica": 256,  -- 1 replica per 256 CPU cores
#   "nodesPerReplica": 16,   -- 1 replica per 16 nodes
#   "min": 1,
#   "max": 20,
#   "preventSinglePointOfFailure": true  -- ensures min 2 replicas
# }

# Check current autoscaler status
kubectl get deployment dns-autoscaler -n kube-system
```

### 5.6 Pod DNS Configuration (dnsPolicy & dnsConfig) [^k8s-pod-dns-config]

```yaml
# dnsPolicy options:
# ClusterFirst (default) — use cluster DNS (CoreDNS)
# ClusterFirstWithHostNet — like ClusterFirst but for hostNetwork: true pods
# Default — inherit node's /etc/resolv.conf (bypasses CoreDNS entirely)
# None — fully custom DNS; MUST provide dnsConfig

# Example: Custom DNS config
apiVersion: v1
kind: Pod
metadata:
  name: custom-dns-pod
spec:
  dnsPolicy: None   # required when using custom dnsConfig as sole nameserver
  dnsConfig:
    nameservers:
      - 10.96.0.10         # CoreDNS service ClusterIP
    searches:
      - default.svc.cluster.local
      - svc.cluster.local
      - cluster.local
    options:
      - name: ndots
        value: "2"          # Reduce from default 5 to cut NXDOMAIN queries for external domains
      - name: timeout
        value: "1"
      - name: attempts
        value: "3"
  containers:
    - name: app
      image: nginx

# Example: Augment existing cluster DNS with extra options (dnsPolicy: ClusterFirst + dnsConfig)
apiVersion: v1
kind: Pod
metadata:
  name: augmented-dns-pod
spec:
  dnsPolicy: ClusterFirst   # still uses CoreDNS
  dnsConfig:
    options:
      - name: ndots
        value: "2"           # override ndots only
  containers:
    - name: app
      image: nginx
```

> **Accuracy Note:** When `dnsPolicy: ClusterFirst` is combined with `dnsConfig`, the dnsConfig **merges with** the cluster-generated resolv.conf (it doesn't replace it). The `nameservers` and `searches` from dnsConfig are **appended**. Only when `dnsPolicy: None` is set does dnsConfig **fully replace** the resolv.conf.

---

## 6. Advanced Configurations & Use Cases

### 6.1 Custom Stub Domains

```yaml
# Method 1: Additional forward directives in .:53 block
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        errors
        health { lameduck 5s }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
            pods insecure
            fallthrough in-addr.arpa ip6.arpa
            ttl 30
        }
        prometheus :9153
        # Stub domain: forward corp.internal to on-prem DNS servers
        forward corp.internal. 10.10.0.53 10.10.0.54 {
            max_concurrent 200
            max_fails 2
            health_check 5s
        }
        # Everything else to node DNS
        forward . /etc/resolv.conf {
            max_concurrent 1000
        }
        cache 30
        loop
        reload
        loadbalance
    }
```

```yaml
# Method 2: Separate server blocks (more isolated, own plugin chain)
data:
  Corefile: |
    .:53 {
        errors
        health { lameduck 5s }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
            pods insecure
            fallthrough in-addr.arpa ip6.arpa
            ttl 30
        }
        prometheus :9153
        forward . /etc/resolv.conf
        cache 30
        loop
        reload
        loadbalance
    }

    internal.example.com:53 {
        errors
        forward . 192.168.1.10 192.168.1.11
        cache 60
    }

    test.corp:53 {
        errors
        forward . 172.16.0.53
        cache 30
    }
```

### 6.2 ExternalName Services [^k8s-externalname]

```yaml
# ExternalName: CoreDNS returns a CNAME record
apiVersion: v1
kind: Service
metadata:
  name: external-db
  namespace: default
spec:
  type: ExternalName
  externalName: database.prod.example.com
  # No ports or selectors needed

# DNS result:
# external-db.default.svc.cluster.local
#   → CNAME → database.prod.example.com
#   → A → (whatever database.prod.example.com resolves to)
```

> **Important:** ExternalName services do NOT work transparently with TLS verification — the TLS certificate is for `database.prod.example.com` but the app may connect using the Kubernetes service name. Also, some HTTP clients follow the CNAME and bypass the service entirely. For production, consider using a headless service with manual EndpointSlices instead.

### 6.3 Headless Services & StatefulSets [^k8s-statefulset-dns]

```yaml
# Headless service: clusterIP: None
# CoreDNS returns ALL pod IPs, not a single VIP
apiVersion: v1
kind: Service
metadata:
  name: cassandra
  namespace: default
spec:
  clusterIP: None    # makes it headless
  selector:
    app: cassandra
  ports:
    - port: 9042
      name: cql
```

```bash
# DNS for headless service (returns multiple A records):
# cassandra.default.svc.cluster.local → 10.0.0.1, 10.0.0.2, 10.0.0.3

# StatefulSet pods get STABLE individual DNS names via headless service:
# <pod-name>.<headless-service>.<namespace>.svc.cluster.local
cassandra-0.cassandra.default.svc.cluster.local → 10.0.0.1
cassandra-1.cassandra.default.svc.cluster.local → 10.0.0.2
cassandra-2.cassandra.default.svc.cluster.local → 10.0.0.3

# These names persist across pod restarts (pod gets same name, new IP)
# This is the foundation of stable identity for stateful applications:
# Kafka, ZooKeeper, Cassandra, etcd, MongoDB ReplicaSets, etc.
```

### 6.4 NodeLocal DNSCache [^k8s-nodelocal]

NodeLocal DNSCache dramatically improves DNS performance by running a local cache on every node.[^k8s-nodelocal]

```bash
# Architecture:
# Pod → /etc/resolv.conf → 169.254.20.10 (link-local, node-local cache)
#                                  │
#         ┌─────────────────────────┴─────────────────────────┐
#    Cache HIT (microseconds)                  Cache MISS
#    Return cached answer              ┌────────────────────────┐
#                              cluster.local? → CoreDNS Pod
#                              external? → Upstream DNS directly

# Step 1: Get CoreDNS ClusterIP
CLUSTER_DNS=$(kubectl get svc kube-dns -n kube-system \
              -o jsonpath='{.spec.clusterIP}')
echo "CoreDNS IP: $CLUSTER_DNS"

# Step 2: Download manifest
wget https://raw.githubusercontent.com/kubernetes/kubernetes/master/\
cluster/addons/dns/nodelocaldns/nodelocaldns.yaml

# Step 3: Replace placeholders
LOCAL_DNS="169.254.20.10"
DNS_DOMAIN="cluster.local"
sed -i "s/__PILLAR__CLUSTER__DNS__/$CLUSTER_DNS/g" nodelocaldns.yaml
sed -i "s/__PILLAR__LOCAL__DNS__/$LOCAL_DNS/g" nodelocaldns.yaml
sed -i "s/__PILLAR__DNS__DOMAIN__/$DNS_DOMAIN/g" nodelocaldns.yaml

# Step 4: Deploy
kubectl apply -f nodelocaldns.yaml

# Step 5: Verify
kubectl get daemonset -n kube-system node-local-dns
kubectl get pods -n kube-system -l k8s-app=node-local-dns -o wide
# Should see one pod per node, all Running

# Step 6: Test
kubectl run test-dns --image=nicolaka/netshoot -it --rm -- bash
# Inside pod:
cat /etc/resolv.conf
# Should show 169.254.20.10 as nameserver
dig @169.254.20.10 kubernetes.default.svc.cluster.local

# Step 7: Verify metrics
kubectl port-forward -n kube-system \
  $(kubectl get pod -n kube-system -l k8s-app=node-local-dns -o jsonpath='{.items[0].metadata.name}') \
  9253:9253
curl -s http://localhost:9253/metrics | grep coredns_cache
```

**Benefits of NodeLocal DNSCache:**
- DNS latency: ms → µs for cached entries
- CoreDNS load: reduced 70–90%
- Conntrack exhaustion: eliminated for node-local DNS (uses link-local address, bypasses iptables)
- NXDOMAIN caching: ndots:5 repeated failures cached instead of hitting CoreDNS repeatedly

### 6.5 The ndots:5 Problem & Solutions [^k8s-dns-concepts][^k8s-custom-dns]

```bash
# ndots:5 means: if a name has fewer than 5 dots, try search domains first
# For api.stripe.com (2 dots < 5), these queries fire in sequence:
# 1. api.stripe.com.default.svc.cluster.local → NXDOMAIN (5ms wasted)
# 2. api.stripe.com.svc.cluster.local          → NXDOMAIN (5ms wasted)
# 3. api.stripe.com.cluster.local              → NXDOMAIN (5ms wasted)
# 4. api.stripe.com.                           → SUCCESS! (actual answer)
# Total overhead: 15-60ms per unique external hostname on first lookup

# SOLUTION 1: Trailing dot in application code (FQDN)
# curl https://api.stripe.com.  (trailing dot = absolute, skip search)

# SOLUTION 2: Lower ndots per pod
spec:
  dnsConfig:
    options:
      - name: ndots
        value: "2"
# Now 'api.stripe.com' (2 dots, NOT less than 2) → goes direct

# SOLUTION 3: NodeLocal DNSCache
# NXDOMAIN responses are cached locally
# First lookup still slow, but repeats are instant (µs, not ms)

# SOLUTION 4: Tune CoreDNS cache denial TTL
# cache {
#     denial 9984 30 5  # cache NXDOMAINs for up to 30s
# }

# MEASURE: Check your NXDOMAIN rate
kubectl port-forward -n kube-system svc/kube-dns 9153:9153 &
curl -s http://localhost:9153/metrics | grep 'coredns_dns_responses_total.*NXDOMAIN'
# High ratio? You're paying the ndots tax heavily.
```

---

## 7. Troubleshooting — Systematic Diagnosis [^k8s-dns-debug]

### 7.1 Diagnostic Methodology

```
STEP 1: Are CoreDNS pods Running?
    kubectl get pods -n kube-system -l k8s-app=kube-dns
    If not → check events, logs, describe pods

STEP 2: Does the kube-dns Service have Endpoints?
    kubectl get ep kube-dns -n kube-system
    If empty → pods not ready, label mismatch, or service selector wrong

STEP 3: Test DNS from inside the cluster (debug pod)
    kubectl run dns-debug --image=nicolaka/netshoot -it --rm -- bash
    ├── Internal resolution ok (kubernetes.default)?
    │   YES → kubernetes plugin is fine → check forward/external
    │   NO  → kubernetes plugin / API issue / network policy to pods
    ├── External resolution ok (google.com)?
    │   YES → external DNS fine → narrow to specific service/namespace
    │   NO  → forward plugin / upstream DNS / node DNS issue
    └── BOTH fail → CoreDNS down / network policy blocking / kube-dns service issue

STEP 4: Check CoreDNS logs
    kubectl logs -n kube-system -l k8s-app=kube-dns --tail=100

STEP 5: Check Corefile for misconfigurations
    kubectl get cm coredns -n kube-system -o jsonpath='{.data.Corefile}'

STEP 6: Check pod's /etc/resolv.conf and dnsPolicy
    kubectl exec <pod> -- cat /etc/resolv.conf

STEP 7: Check network policies, node DNS, conntrack
```

### 7.2 Debug Pod Commands

```bash
# Launch a debug pod with full network tools
kubectl run dns-debug \
  --image=nicolaka/netshoot \
  --restart=Never \
  -it --rm \
  -- bash

# Or minimal busybox (available on air-gapped clusters)
kubectl run dns-debug \
  --image=busybox:1.28 \
  --restart=Never \
  -it --rm \
  -- sh

# --- Inside debug pod ---

# 1. Check pod's DNS configuration
cat /etc/resolv.conf
# Expected output:
# nameserver 10.96.0.10
# search default.svc.cluster.local svc.cluster.local cluster.local
# options ndots:5

# 2. Test internal Kubernetes service
nslookup kubernetes.default
nslookup kubernetes.default.svc.cluster.local
dig kubernetes.default.svc.cluster.local A
dig kubernetes.default.svc.cluster.local ANY

# 3. Test a specific service in any namespace
nslookup my-service.production.svc.cluster.local

# 4. Test external DNS
nslookup google.com
dig google.com A

# 5. Query CoreDNS directly (bypass resolv.conf search domains)
dig @10.96.0.10 kubernetes.default.svc.cluster.local A

# 6. PTR (reverse lookup)
dig -x 10.96.0.1

# 7. SRV record
dig _https._tcp.kubernetes.default.svc.cluster.local SRV

# 8. Trace the full resolution
dig +trace google.com

# 9. Time a DNS query
time nslookup google.com

# 10. Test headless service (expect multiple A records)
dig my-headless-svc.default.svc.cluster.local A
```

### 7.3 Common Issues & Solutions

#### Issue 1: DNS Loop Detected

```bash
# Symptom in CoreDNS logs:
# [FATAL] plugin/loop: Loop (127.0.0.1:54142 -> :53) detected for zone "."
# CoreDNS exits repeatedly

# Root cause: node's /etc/resolv.conf points to 127.0.0.1 or 127.0.0.53
# (systemd-resolved stub resolver) which CoreDNS then forwards back to itself

# Diagnose: on the node
cat /etc/resolv.conf
# If it shows: nameserver 127.0.0.53 or nameserver 127.0.0.1 → loop!

# Fix 1: Point forward at explicit upstream DNS (not /etc/resolv.conf)
kubectl edit configmap coredns -n kube-system
# Change: forward . /etc/resolv.conf
# To:     forward . 8.8.8.8 8.8.4.4

# Fix 2: Point forward at systemd-resolved's real config
# Change: forward . /etc/resolv.conf
# To:     forward . /run/systemd/resolve/resolv.conf

# Fix 3 (on systemd-resolved nodes): Use the real upstream, not the stub
# On node: cat /run/systemd/resolve/resolv.conf
# This contains the actual upstream DNS IPs
```

#### Issue 2: CoreDNS OOMKilled / CrashLoopBackOff

```bash
# Diagnose
kubectl describe pod -n kube-system -l k8s-app=kube-dns
# Look for: Last State: Terminated / Reason: OOMKilled

# Check memory usage
kubectl top pods -n kube-system -l k8s-app=kube-dns

# Fix 1: Increase memory limits
kubectl patch deployment coredns -n kube-system --type json -p '[
  {"op":"replace",
   "path":"/spec/template/spec/containers/0/resources/limits/memory",
   "value":"256Mi"},
  {"op":"replace",
   "path":"/spec/template/spec/containers/0/resources/requests/memory",
   "value":"128Mi"}
]'

# Fix 2: Scale out (distribute load)
kubectl scale deployment coredns -n kube-system --replicas=4

# Fix 3: Reduce cache size (if memory-constrained)
kubectl edit configmap coredns -n kube-system
# Change: cache 30
# To: cache {
#       success 4096 30
#       denial  4096 5
#     }

# Fix 4: Deploy NodeLocal DNSCache to reduce load on CoreDNS pods
```

#### Issue 3: SERVFAIL / Intermittent Failures

```bash
# Diagnose: check for conntrack exhaustion (most common cause at scale)
# On affected node:
sudo sysctl net.netfilter.nf_conntrack_count
sudo sysctl net.netfilter.nf_conntrack_max
# If count is >80% of max → conntrack exhaustion!

# Also check:
dmesg | grep -i conntrack | tail -20
# Look for: nf_conntrack: table full, dropping packet

# Fix 1: Increase conntrack max
sudo sysctl -w net.netfilter.nf_conntrack_max=524288
# Persist:
echo 'net.netfilter.nf_conntrack_max=524288' | sudo tee -a /etc/sysctl.conf

# Fix 2: Deploy NodeLocal DNSCache
# DNS from node-local cache → link-local IP → bypasses conntrack entirely

# Fix 3: Enable failfast for faster SERVFAIL when upstreams are down
kubectl edit configmap coredns -n kube-system
# forward . /etc/resolv.conf {
#     max_concurrent 1000
#     failfast_all_unhealthy_upstreams  # [requires CoreDNS 1.12.1+]
# }

# Fix 4: Cloud-specific — VPC DNS throttling (AWS)
# AWS VPC DNS (169.254.169.253) has per-ENI rate limits
# Scale up CoreDNS replicas (more pods = more ENIs = more quota)
# Or deploy NodeLocal DNSCache
```

#### Issue 4: Slow External DNS (ndots:5 Latency Tax)

```bash
# Diagnose: measure NXDOMAIN rate
kubectl port-forward -n kube-system svc/kube-dns 9153:9153 &
curl -s http://localhost:9153/metrics | grep 'rcode="NXDOMAIN"'

# Also time a resolution:
kubectl run time-test --image=busybox:1.28 -it --rm -- sh
time nslookup api.github.com  # how long does this take?

# Fix: ndots:2 for specific deployments
spec:
  template:
    spec:
      dnsConfig:
        options:
          - name: ndots
            value: "2"

# Fix: Increase denial cache TTL
# cache {
#   denial 9984 30 5  # NXDOMAINs cached for 30s max, 5s min
# }
```

#### Issue 5: Service Not Resolving (NXDOMAIN for Existing Service)

```bash
# Diagnose
kubectl get svc my-service -n my-namespace
kubectl get ep my-service -n my-namespace
# Check: does the service exist? Does it have endpoints?

# Test DNS directly against CoreDNS pod
COREDNS_POD=$(kubectl get pods -n kube-system -l k8s-app=kube-dns \
  -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n kube-system $COREDNS_POD -- \
  nslookup my-service.my-namespace.svc.cluster.local 127.0.0.1

# Check if the kubernetes plugin can reach the API
kubectl logs -n kube-system $COREDNS_POD | grep -i "kubernetes\|apiserver\|timeout"

# Check RBAC — can CoreDNS list services?
kubectl auth can-i list services \
  --as=system:serviceaccount:kube-system:coredns

# Check if namespace is labeled (if you use namespace_labels filter)
kubectl get namespace my-namespace --show-labels

# Check if the service has the right labels (if using labels filter)
kubectl get svc my-service -n my-namespace --show-labels
```

#### Issue 6: Pod's /etc/resolv.conf is Wrong

```bash
# Symptom: pod's resolv.conf doesn't have cluster search domains
kubectl exec <pod> -- cat /etc/resolv.conf

# Expected:
# nameserver 10.96.0.10
# search default.svc.cluster.local svc.cluster.local cluster.local
# options ndots:5

# Cause A: dnsPolicy is "Default" (uses node DNS, not CoreDNS)
kubectl get pod <pod> -o jsonpath='{.spec.dnsPolicy}'
# Should be ClusterFirst (or empty = ClusterFirst)

# Cause B: kubelet --cluster-dns flag doesn't match kube-dns Service IP
kubectl get svc kube-dns -n kube-system -o jsonpath='{.spec.clusterIP}'
# On node: ps aux | grep kubelet | grep -o '\-\-cluster-dns=[^ ]*'
# These MUST match

# Cause C: hostNetwork: true pod needs ClusterFirstWithHostNet
kubectl get pod <pod> -o jsonpath='{.spec.hostNetwork}'
# If true and dnsPolicy is ClusterFirst → set ClusterFirstWithHostNet
```

#### Issue 7: NetworkPolicy Blocking DNS [^k8s-netpol]

```bash
# Symptom: DNS fails only for pods with NetworkPolicies applied
# All DNS traffic is UDP/TCP port 53

# Add egress rule to allow DNS:
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-egress
  namespace: my-namespace
spec:
  podSelector: {}        # applies to all pods in namespace
  policyTypes:
    - Egress
  egress:
    # Allow DNS to CoreDNS service on port 53 (standard case)
    - ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
    # If using NodeLocal DNSCache (169.254.20.10), also allow to link-local range:
    - to:
        - ipBlock:
            cidr: 169.254.20.10/32  # NodeLocal DNS link-local IP
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
```

### 7.4 Enabling Debug Logging

```bash
# Temporarily add 'log' plugin to CoreDNS
kubectl edit configmap coredns -n kube-system
# Add 'log' after 'errors' in the .:53 block

# Wait for reload (~30s) or force restart:
kubectl rollout restart deployment coredns -n kube-system

# Watch query logs
kubectl logs -n kube-system -l k8s-app=kube-dns -f

# IMPORTANT: Remove 'log' after debugging!
# Every DNS query is logged — in a busy cluster this is
# millions of log entries per minute, impacting CoreDNS performance
```

---

## 8. Performance Tuning & Monitoring

### 8.1 Key Metrics

| Metric | Alert Threshold | Action |
|---|---|---|
| `coredns_dns_request_duration_seconds` P99 | > 100ms | Scale CoreDNS, add NodeLocal DNS |
| `coredns_dns_responses_total{rcode="NXDOMAIN"}` / total | > 30% | Reduce ndots, add denial cache |
| `coredns_dns_responses_total{rcode="SERVFAIL"}` | Any spike | Check upstream DNS, conntrack |
| `coredns_cache_hits_total` / (hits+misses) | < 70% | Increase cache TTL or capacity |
| `process_resident_memory_bytes` | > 80% of limit | Increase memory limit |
| `coredns_forward_requests_total` | Steadily rising | Scale CoreDNS, add NodeLocal DNS |
| `coredns_kubernetes_dns_programming_duration_seconds` | > 5s | API server performance issue |

### 8.2 Prometheus Alert Rules

```yaml
groups:
  - name: coredns.rules
    interval: 30s
    rules:
      # CoreDNS pods down
      - alert: CoreDNSDown
        expr: absent(up{job="coredns"} == 1) or kube_deployment_status_replicas_ready{deployment="coredns", namespace="kube-system"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "CoreDNS is down — cluster DNS is broken"

      # High latency
      - alert: CoreDNSHighLatency
        expr: histogram_quantile(0.99, rate(coredns_dns_request_duration_seconds_bucket[5m])) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CoreDNS P99 latency > 100ms"

      # High SERVFAIL rate
      - alert: CoreDNSHighSERVFAIL
        expr: rate(coredns_dns_responses_total{rcode="SERVFAIL"}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "CoreDNS returning too many SERVFAILs — upstream DNS issue?"

      # High NXDOMAIN rate (ndots tax indicator)
      - alert: CoreDNSHighNXDOMAIN
        expr: |
          (rate(coredns_dns_responses_total{rcode="NXDOMAIN"}[5m]) /
           rate(coredns_dns_requests_total[5m])) > 0.3
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "High NXDOMAIN rate (>30%) — consider reducing ndots or adding cache"

      # OOM risk
      - alert: CoreDNSOOMRisk
        expr: |
          (process_resident_memory_bytes{job="coredns"} /
           container_spec_memory_limit_bytes{container="coredns"}) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CoreDNS using >80% of memory limit — OOM risk"
```

### 8.3 Performance Optimization Checklist

| Priority | Optimization | Impact | Effort |
|---|---|---|---|
| 🔴 High | Deploy NodeLocal DNSCache | 70-90% load reduction, µs latency | Medium |
| 🔴 High | Scale CoreDNS replicas (autoscaler) | Handles load spikes | Low |
| 🔴 High | Increase conntrack max on nodes | Prevents SERVFAIL storms | Low |
| 🟡 Medium | Reduce ndots for external-facing pods | Cuts NXDOMAIN queries 75% | Low |
| 🟡 Medium | Tune cache TTLs (success 300s+) | Reduces upstream load | Low |
| 🟡 Medium | Enable serve_stale (default 1.12.1+) | Resilience during outages | None |
| 🟡 Medium | Pod anti-affinity across nodes/zones | HA for DNS | Low |
| 🟢 Low | Set max_concurrent on forward | Prevents upstream overload | Low |
| 🟢 Low | Enable prefetch in cache | Reduces cache misses | Low |
| 🟢 Low | Use prefer_udp in forward (cloud) | Avoids TCP issues | Low |

---

## 9. CKA 2026 Quick Reference

### 9.1 Most Tested Topics

| Topic | Must Know |
|---|---|
| DNS record format | `<svc>.<ns>.svc.cluster.local` |
| Pod record format | `<pod-ip-dashes>.<ns>.pod.cluster.local` |
| StatefulSet pod DNS | `<pod>.<headless-svc>.<ns>.svc.cluster.local` |
| Default ndots | `5` |
| CoreDNS namespace | `kube-system` |
| CoreDNS service | `kube-dns` |
| Corefile location | ConfigMap `coredns` in `kube-system` |
| dnsPolicy default | `ClusterFirst` |
| dnsPolicy for hostNetwork pods | `ClusterFirstWithHostNet` |
| CoreDNS uses itself for DNS? | NO — `dnsPolicy: Default` (node DNS) |
| Hot reload mechanism | `reload` plugin watches ConfigMap |

### 9.2 Must-Know Commands

```bash
# ── INSPECT ──────────────────────────────────────────────────
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl get svc kube-dns -n kube-system
kubectl get ep kube-dns -n kube-system
kubectl get cm coredns -n kube-system -o yaml
kubectl logs -n kube-system -l k8s-app=kube-dns

# ── GET COREFILE ──────────────────────────────────────────────
kubectl get cm coredns -n kube-system -o jsonpath='{.data.Corefile}'

# ── EDIT COREFILE ─────────────────────────────────────────────
kubectl edit cm coredns -n kube-system
# OR: kubectl get cm coredns -n kube-system -o yaml > coredns-cm.yaml
#     vim coredns-cm.yaml
#     kubectl apply -f coredns-cm.yaml

# ── RESTART ───────────────────────────────────────────────────
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# ── DNS TEST POD ──────────────────────────────────────────────
kubectl run dns-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup kubernetes
kubectl run dns-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup kubernetes.default.svc.cluster.local
kubectl run dns-test --image=nicolaka/netshoot --restart=Never -it --rm -- dig @10.96.0.10 kubernetes.default.svc.cluster.local

# ── SCALE ─────────────────────────────────────────────────────
kubectl scale deployment coredns -n kube-system --replicas=3

# ── GET VERSION ───────────────────────────────────────────────
kubectl get deploy coredns -n kube-system -o jsonpath='{.spec.template.spec.containers[0].image}'

# ── RBAC CHECK ────────────────────────────────────────────────
kubectl auth can-i list endpointslices --as=system:serviceaccount:kube-system:coredns
kubectl auth can-i list services --as=system:serviceaccount:kube-system:coredns
```

### 9.3 DNS Naming Cheat Sheet

```bash
# From any pod in namespace "default":

# Short name (same namespace):
my-service                    → resolves via search domain expansion

# Cross-namespace (recommended FQDN):
my-service.other-ns.svc.cluster.local

# Kubernetes API server:
kubernetes.default.svc.cluster.local

# Headless service (returns ALL pod IPs):
headless-svc.default.svc.cluster.local

# StatefulSet individual pod:
web-0.headless-svc.default.svc.cluster.local
web-1.headless-svc.default.svc.cluster.local

# Pod by IP (requires pods: insecure or verified):
10-0-0-5.default.pod.cluster.local   # pod with IP 10.0.0.5

# SRV record:
_http._tcp.my-service.default.svc.cluster.local

# Reverse lookup:
dig -x 10.96.0.10   # → kube-dns.kube-system.svc.cluster.local

# ExternalName service (CNAME):
ext-svc.default.svc.cluster.local → CNAME → external.example.com
```

---

## 10. Security Hardening

### 10.1 CoreDNS Security Context

```yaml
# Default (secure) security context — do not weaken these:
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    add:
      - NET_BIND_SERVICE   # bind port 53 (privileged port, requires this cap)
    drop:
      - ALL                # no other capabilities
  readOnlyRootFilesystem: true
  # runAsNonRoot: true   # Note: CoreDNS image runs as root by default
  #                      # Some hardened deployments add runAsUser: 1000
```

### 10.2 Security Improvements in 1.12.x–1.13.x

| Version | Feature | Benefit |
|---|---|---|
| 1.13.2 | Regex length limit (core) | Prevents ReDoS resource exhaustion |
| 1.13.2 | Kubernetes API rate limiting | Prevents API server overload from CoreDNS |
| 1.13.0 | `show_first` error consolidation | Reduces log spam, improves observability |
| 1.12.4+ | Regular Go CVE updates | Addresses stdlib security vulnerabilities |
| 1.12.3 | EDNS0 unset action | Fine-grained EDNS0 manipulation for security policies |

### 10.3 DNS Security Best Practices

| Practice | Implementation |
|---|---|
| Encrypt upstream queries | `forward . tls://8.8.8.8` with `tls_servername dns.google` |
| Restrict namespace visibility | `namespace_labels` or `namespaces` in kubernetes plugin |
| Remove query logging in prod | Don't include `log` plugin in production Corefile |
| NetworkPolicy for DNS | Only allow necessary pods to reach kube-dns :53 |
| Avoid `pods insecure` | Use `pods disabled` unless you specifically need pod IP records |
| RBAC audit | `kubectl get clusterrole system:coredns -o yaml` — verify minimal permissions |
| PodDisruptionBudget | Keep PDB — ensures DNS HA during node maintenance |
| Signed zones with DNSSEC | Use `dnssec` plugin for zones you control |

---

## 11. Complete Reference Tables

### 11.1 CoreDNS ↔ Kubernetes Version Map

| Kubernetes Version | CoreDNS (kubeadm default) | Latest Compatible |
|---|---|---|
| 1.32 | 1.11.3 | 1.13.2 |
| 1.31 | 1.11.3 | 1.13.2 |
| 1.29–1.30 | 1.11.1 | 1.13.2 |
| 1.27–1.28 | 1.10.1 | 1.12.x |
| 1.25–1.26 | 1.9.3 | 1.11.x |
| 1.23–1.24 | 1.8.6 | 1.9.x |

> **Note:** The kubeadm default is conservative. You can safely run newer CoreDNS versions with older Kubernetes by following the CoreDNS deployment guide.[^coredns-deployment] See also the official kubeadm CoreDNS customization docs.[^kubeadm-coredns]

### 11.2 forward Plugin — All Options

| Option | Default | Description |
|---|---|---|
| `except NAMES` | — | Don't forward these names to this upstream |
| `force_tcp` | false | Always use TCP |
| `prefer_udp` | false | Prefer UDP, fall back to TCP on truncation |
| `expire DURATION` | 10s | Connection expiry to upstream |
| `max_fails N` | 2 | Mark unhealthy after N consecutive failures |
| `health_check DURATION` | 0.5s | Health check interval |
| `max_concurrent N` | 0 (unlimited) | Max simultaneous upstream queries |
| `tls CERT KEY CA` | — | TLS certs for DoT |
| `tls_servername NAME` | — | SNI for DoT |
| `policy random\|round_robin\|sequential` | random | Upstream selection policy |
| `failfast_all_unhealthy_upstreams` | false | SERVFAIL immediately if all down [1.12.1+] |

### 11.3 cache Plugin — All Options

| Option | Default | Description |
|---|---|---|
| `success CAPACITY TTL MINTTL` | 9984 3600 0 | Positive cache: max entries, **TTL cap** (clamps upstream TTL to this max), min TTL floor |
| `denial CAPACITY TTL MINTTL` | 9984 3600 0 | Negative cache: max entries, **TTL cap** (clamps upstream TTL to this max), min TTL floor |
| `prefetch AMOUNT DURATION PERCENTAGE` | disabled | Prefetch cache entries before expiry |
| `serve_stale DURATION MODE` | 1h verify [1.12.1+] | Serve stale on upstream failure |
| `disable success\|denial [ZONES]` | — | Disable cache for specific type/zones |
| `keepttl` | false | Preserve upstream TTL instead of capping |

### 11.4 dnsPolicy Values

| Value | Nameserver | Search Domains | Use Case |
|---|---|---|---|
| `ClusterFirst` (default) | kube-dns ClusterIP | cluster.local + node domains | Most pods |
| `ClusterFirstWithHostNet` | kube-dns ClusterIP | cluster.local + node domains | Pods with `hostNetwork: true` |
| `Default` | Node's DNS | Node's search domains | Pods that must use node DNS |
| `None` | Must provide in `dnsConfig` | Must provide in `dnsConfig` | Fully custom DNS |

### 11.5 kubernetes Plugin — All Options

| Option | Default | Description |
|---|---|---|
| `ZONES` | cluster.local | Zones the plugin is authoritative for |
| `resyncperiod` | 0 (watch only) | Full resync interval |
| `endpoint URL` | in-cluster | Kubernetes API server URL |
| `namespaces NS...` | all | Only serve these namespaces |
| `namespace_labels EXPR` | — | Label selector for namespaces |
| `labels EXPR` | — | Label selector for objects |
| `pods MODE` | disabled | Pod IP record handling: disabled/insecure/verified |
| `endpoint_pod_names` | false | Use pod name as endpoint label in A records |
| `ttl TTL` | 5s | Response TTL (max 3600) |
| `noendpoints` | false | Disable serving endpoint records |
| `fallthrough [ZONES]` | — | Pass to next plugin on NXDOMAIN |
| `ignore empty_service` | — | NXDOMAIN for services with no ready endpoints |
| `multicluster ZONES` | — | Cross-cluster DNS via ServiceImport CRDs [1.12.2+] |
| `startup_timeout DURATION` | 5s | Max wait for initial API sync [1.12.3+] |

---

## 12. Multi-Cluster DNS & Advanced Topics

### 12.1 Multi-Cluster DNS via the `multicluster` Plugin — CoreDNS 1.12.2+ [^plugin-multicluster][^mcs-api-spec]

The `multicluster` plugin (shipped in CoreDNS 1.12.2) enables cross-cluster DNS resolution using the `ServiceImport` and `ServiceExport` CRDs defined by the [kubernetes-sigs/mcs-api](https://github.com/kubernetes-sigs/mcs-api) project. This is independent functionality implemented in CoreDNS itself — it requires a compatible multi-cluster control plane (Submariner, Liqo, or Admiral) to manage the `ServiceImport`/`ServiceExport` objects across clusters.

> **Maturity note:** `ServiceImport`/`ServiceExport` CRDs live in `kubernetes-sigs/mcs-api`, which is a Kubernetes SIG project — not yet part of the core Kubernetes API. The CoreDNS `multicluster` plugin is stable (GA) as of CoreDNS 1.12.2, but you must install the CRDs and a supporting multi-cluster controller separately.

```corefile
# Requires:
#   1. kubernetes-sigs/mcs-api CRDs installed (ServiceImport, ServiceExport)
#   2. A multi-cluster controller (e.g., Submariner, Liqo, Admiral) running
#      to create ServiceImport objects from exported services

clusterset.local:53 {
    multicluster clusterset.local        # answer for <svc>.<ns>.svc.clusterset.local
    kubernetes cluster.local {
        pods insecure
        fallthrough
    }
    cache 30
}

cluster.local:53 {
    kubernetes cluster.local {
        pods insecure
        fallthrough in-addr.arpa ip6.arpa
    }
    prometheus :9153
    cache 30
    loop
    reload
}

.:53 {
    forward . /etc/resolv.conf
    cache 300
}
```

How it works: services exported via a `ServiceExport` object become resolvable across all clusters through their `ServiceImport` record under the `clusterset.local` zone:

```bash
# Within a single cluster:
my-svc.default.svc.cluster.local     → pod IPs in the local cluster only

# Across the clusterset (requires ServiceImport to exist):
my-svc.default.svc.clusterset.local  → pod IPs across all participating clusters
```

The CoreDNS `multicluster` plugin watches `ServiceImport` objects (not `Service` objects) via the Kubernetes API and synthesizes DNS records for the `clusterset.local` zone. The plugin source and full option reference are at: https://coredns.io/plugins/multicluster/

### 12.2 CoreDNS with Service Meshes

```
# Istio:
# - DNS resolution still goes through CoreDNS
# - Istio intercepts traffic AFTER DNS → no CoreDNS changes needed for most cases
# - Exception: Istio DNS Proxying (1.8+) can intercept DNS for ServiceEntry names
#   Set: meshConfig.dnsProxyingEnabled: true
#   Then Istio resolves ServiceEntry names (not CoreDNS)

# Linkerd:
# - No CoreDNS changes needed
# - Linkerd intercepts at the network level, DNS is standard

# Cilium (with Hubble):
# - Cilium can enforce NetworkPolicies that affect DNS
# - Use 'toFQDNs' rules in CiliumNetworkPolicy for FQDN-based egress policies
# - CoreDNS responses are intercepted by Cilium to populate FQDN → IP mappings
```

### 12.3 Building CoreDNS with Custom Plugins

```bash
# CoreDNS plugins are Go packages implementing plugin.Handler interface:
# type Handler interface {
#     ServeDNS(ctx context.Context, w dns.ResponseWriter, r *dns.Msg) (int, error)
#     Name() string
# }

# Build steps:
git clone https://github.com/coredns/coredns
cd coredns

# 1. Add plugin to plugin.cfg (order = chain order)
echo "myplugin:github.com/myorg/coredns-myplugin" >> plugin.cfg

# 2. Build
make

# 3. Containerize
docker build -t my-coredns:v1.13.2-custom .
docker push myregistry/my-coredns:v1.13.2-custom

# 4. Update deployment
kubectl set image deployment/coredns coredns=myregistry/my-coredns:v1.13.2-custom -n kube-system

# 5. Use in Corefile
# .:53 {
#     myplugin config-value
#     kubernetes cluster.local
#     forward . /etc/resolv.conf
# }
```

---

*CoreDNS Expert Reference Guide — v1.1 — Based on CoreDNS 1.13.2 / Kubernetes 1.31+ — February 2026*

---

## References

### CoreDNS Official

[^coredns-repo]: CoreDNS Source Repository — https://github.com/coredns/coredns  
[^coredns-website]: CoreDNS Official Website — https://coredns.io/  
[^coredns-manual]: CoreDNS Manual (full plugin reference) — https://coredns.io/manual/toc/  
[^coredns-releases]: CoreDNS GitHub Releases & Changelogs — https://github.com/coredns/coredns/releases  
[^coredns-deployment]: CoreDNS Deployment Repository (upgrade & migration guides) — https://github.com/coredns/deployment  
[^cncf-coredns]: CNCF CoreDNS Project Page — https://www.cncf.io/projects/coredns/  

### CoreDNS Plugin Documentation

[^plugin-kubernetes]: `kubernetes` plugin — https://coredns.io/plugins/kubernetes/  
[^plugin-forward]: `forward` plugin — https://coredns.io/plugins/forward/  
[^plugin-cache]: `cache` plugin — https://coredns.io/plugins/cache/  
[^plugin-log]: `log` plugin — https://coredns.io/plugins/log/  
[^plugin-errors]: `errors` plugin — https://coredns.io/plugins/errors/  
[^plugin-health]: `health` plugin — https://coredns.io/plugins/health/  
[^plugin-ready]: `ready` plugin — https://coredns.io/plugins/ready/  
[^plugin-prometheus]: `prometheus` (metrics) plugin — https://coredns.io/plugins/metrics/  
[^plugin-rewrite]: `rewrite` plugin — https://coredns.io/plugins/rewrite/  
[^plugin-autopath]: `autopath` plugin — https://coredns.io/plugins/autopath/  
[^plugin-hosts]: `hosts` plugin — https://coredns.io/plugins/hosts/  
[^plugin-loop]: `loop` plugin — https://coredns.io/plugins/loop/  
[^plugin-reload]: `reload` plugin — https://coredns.io/plugins/reload/  
[^plugin-loadbalance]: `loadbalance` plugin — https://coredns.io/plugins/loadbalance/  
[^plugin-dnssec]: `dnssec` plugin — https://coredns.io/plugins/dnssec/  
[^plugin-file]: `file` plugin — https://coredns.io/plugins/file/  
[^plugin-template]: `template` plugin — https://coredns.io/plugins/template/  
[^plugin-import]: `import` plugin — https://coredns.io/plugins/import/  

### Kubernetes Official Documentation

[^k8s-dns-concepts]: DNS for Services and Pods — https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/  
[^k8s-custom-dns]: Customizing DNS Service — https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/  
[^k8s-dns-debug]: Debugging DNS Resolution — https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/  
[^k8s-coredns-migration]: Using CoreDNS for Service Discovery (migrating from kube-dns) — https://kubernetes.io/docs/tasks/administer-cluster/coredns/  
[^k8s-nodelocal]: Using NodeLocal DNSCache in Kubernetes Clusters — https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/  
[^k8s-dns-autoscale]: Autoscaling the DNS Service in a Cluster — https://kubernetes.io/docs/tasks/administer-cluster/dns-horizontal-autoscaling/  
[^k8s-pod-dns-config]: Pod's DNS Config — https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-s-dns-config  
[^k8s-endpointslices]: EndpointSlices — https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/  
[^k8s-statefulset-dns]: StatefulSet: Stable Network ID — https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id  
[^k8s-externalname]: Service Type ExternalName — https://kubernetes.io/docs/concepts/services-networking/service/#externalname  
[^k8s-netpol]: Network Policies — https://kubernetes.io/docs/concepts/services-networking/network-policies/  
[^kubeadm-coredns]: kubeadm — Using CoreDNS as DNS add-on — https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/#config-file  
[^k8s-pdb]: PodDisruptionBudget — https://kubernetes.io/docs/tasks/run-application/configure-pdb/  

### Internet Standards (RFCs)

[^rfc1035]: RFC 1035 — Domain Names: Implementation and Specification — https://www.rfc-editor.org/rfc/rfc1035  
[^rfc7858]: RFC 7858 — Specification for DNS over Transport Layer Security (DoT) — https://www.rfc-editor.org/rfc/rfc7858  
[^rfc8484]: RFC 8484 — DNS Queries over HTTPS (DoH) — https://www.rfc-editor.org/rfc/rfc8484  
[^rfc9250]: RFC 9250 — DNS over Dedicated QUIC Connections (DoQ) — https://www.rfc-editor.org/rfc/rfc9250  
[^rfc6763]: RFC 6763 — DNS-Based Service Discovery (DNS-SD / SRV records) — https://www.rfc-editor.org/rfc/rfc6763  
[^rfc4592]: RFC 4592 — The Role of Wildcards in the Domain Name System — https://www.rfc-editor.org/rfc/rfc4592  

### Multi-Cluster DNS

[^plugin-multicluster]: CoreDNS `multicluster` plugin documentation — https://coredns.io/plugins/multicluster/  
[^mcs-api-spec]: kubernetes-sigs/mcs-api — ServiceImport & ServiceExport CRD definitions (the stable API spec used by the multicluster plugin) — https://github.com/kubernetes-sigs/mcs-api  

### Monitoring & Observability

[^prometheus-docs]: Prometheus Documentation — https://prometheus.io/docs/  
[^coredns-metrics]: CoreDNS Metrics Reference (prometheus plugin) — https://coredns.io/plugins/metrics/  

### CKA Certification

[^cka-curriculum]: CNCF Curriculum — Certified Kubernetes Administrator — https://github.com/cncf/curriculum  
[^cka-exam-info]: CKA Exam Overview — The Linux Foundation — https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/  

### Debugging Tools

[^netshoot]: nicolaka/netshoot — Network Troubleshooting Swiss-Army Knife Container — https://github.com/nicolaka/netshoot  
[^busybox]: BusyBox — The Swiss Army Knife of Embedded Linux — https://busybox.net/  

### Further Reading

[^coredns-blog]: CoreDNS Blog (plugin announcements, release notes commentary) — https://coredns.io/blog/  
[^kubernetes-sig-network]: Kubernetes SIG Network (DNS proposals & KEPs) — https://github.com/kubernetes/community/tree/master/sig-network  
[^coredns-community]: CoreDNS Community (GitHub discussions, community meetings) — https://github.com/coredns/coredns/blob/master/COMMUNITY.md  

