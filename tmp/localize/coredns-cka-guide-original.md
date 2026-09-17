# CoreDNS — CKA 2026 Exam: Complete Step-by-Step Practice Guide

> **Exam Relevance:** CoreDNS appears in the "Cluster Architecture, Installation & Configuration" and "Services & Networking" domains (~23% combined weight).[^cka-curriculum]  
> **Time Budget:** Know how to complete any CoreDNS task in under 5 minutes  
> **Tools available in exam:** `kubectl`, `vim`/`nano`, `nslookup`, `dig`, `curl`, `crictl`  


---

## Table of Contents

1. [Foundation Knowledge (Must Memorize)](#1-foundation-knowledge)
2. [Task 01 — Inspect & Verify CoreDNS](#task-01--inspect--verify-coredns)
3. [Task 02 — Test DNS Resolution from Inside a Pod](#task-02--test-dns-resolution-from-inside-a-pod)
4. [Task 03 — Add a Custom Stub Domain](#task-03--add-a-custom-stub-domain)
5. [Task 04 — Add Static Host Entries](#task-04--add-static-host-entries)
6. [Task 05 — Configure Pod DNS with Custom Settings](#task-05--configure-pod-dns-with-custom-settings)
7. [Task 06 — Debug: CoreDNS Pods Crashing](#task-06--debug-coredns-pods-crashing)
8. [Task 07 — Debug: Service Not Resolving](#task-07--debug-service-not-resolving)
9. [Task 08 — Debug: DNS Loop Detected](#task-08--debug-dns-loop-detected)
10. [Task 09 — Scale CoreDNS](#task-09--scale-coredns)
11. [Task 10 — Upgrade CoreDNS Image](#task-10--upgrade-coredns-image)
12. [Task 11 — Restore Broken Corefile](#task-11--restore-broken-corefile)
13. [Task 12 — Configure ExternalName Service](#task-12--configure-externalname-service)
14. [Task 13 — Verify Headless Service DNS](#task-13--verify-headless-service-dns)
15. [Task 14 — Fix a Pod with Wrong dnsPolicy](#task-14--fix-a-pod-with-wrong-dnspolicy)
16. [Task 15 — Enable Temporary Query Logging](#task-15--enable-temporary-query-logging)
17. [Full Exam Simulation (Timed)](#full-exam-simulation-timed)
18. [Quick Reference Card](#quick-reference-card)

---

## 1. Foundation Knowledge

Before attempting any task, burn these facts into memory.

### CoreDNS Object Locations [^k8s-coredns-migration]

```
Namespace:      kube-system
Deployment:     coredns
Service:        kube-dns
ConfigMap:      coredns  (contains the Corefile)
Labels on pods: k8s-app=kube-dns
```

### DNS Naming Pattern (THE most tested thing) [^k8s-dns-concepts]

```
<service-name>.<namespace>.svc.<cluster-domain>
      │              │              └── cluster.local (default)
      │              └──────────────── namespace name
      └─────────────────────────────── service name

Examples:
  kubernetes.default.svc.cluster.local           ← Kubernetes API service
  my-app.production.svc.cluster.local            ← cross-namespace
  cassandra-0.cassandra.default.svc.cluster.local ← StatefulSet pod
  10-0-0-5.default.pod.cluster.local             ← pod by IP (if enabled)
```

### Pod's /etc/resolv.conf (Know This by Heart)

```
nameserver 10.96.0.10            ← kube-dns Service ClusterIP
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

### Default Corefile (Memorize the Structure)

```corefile
.:53 {
    errors                              # 1st: catch errors
    health {                            # 2nd: liveness endpoint :8080/health
        lameduck 5s
    }
    ready                               # 3rd: readiness endpoint :8181/ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {   # 4th: internal DNS
        pods insecure
        fallthrough in-addr.arpa ip6.arpa
        ttl 30
    }
    prometheus :9153                    # 5th: metrics
    forward . /etc/resolv.conf {        # 6th: external DNS
        max_concurrent 1000
    }
    cache 30                            # 7th: cache responses
    loop                                # 8th: loop detection
    reload                              # 9th: hot reload
    loadbalance                         # 10th: round-robin
}
```

### dnsPolicy Values [^k8s-pod-dns-config]

| Value | Nameserver Used |
|---|---|
| `ClusterFirst` (default) | CoreDNS (kube-dns ClusterIP) |
| `ClusterFirstWithHostNet` | CoreDNS (for `hostNetwork: true` pods) |
| `Default` | Node's own DNS (NOT CoreDNS) |
| `None` | Must specify in `dnsConfig` |

---

## Task 01 — Inspect & Verify CoreDNS

**Exam Question Style:** *"Verify that CoreDNS is functioning correctly in the cluster. List the running pods, service details, and current Corefile configuration."*

### Step-by-Step

```bash
# STEP 1: Check pods are Running and Ready
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

**Expected output:**
```
NAME                       READY   STATUS    RESTARTS   AGE
coredns-5d78c9869d-abc12   1/1     Running   0          5d
coredns-5d78c9869d-def34   1/1     Running   0          5d
```

```bash
# STEP 2: Check the Service
kubectl get svc kube-dns -n kube-system
```

**Expected output:**
```
NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
kube-dns   ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   5d
```

```bash
# STEP 3: Confirm Service has Endpoints (pods are reachable)
kubectl get endpoints kube-dns -n kube-system
```

**Expected output:**
```
NAME       ENDPOINTS                                              AGE
kube-dns   10.0.0.12:53,10.0.0.13:53   5d
# Should list IP:53 for each CoreDNS pod
```

```bash
# STEP 4: View the current Corefile
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}'
# OR view full ConfigMap with metadata:
kubectl get configmap coredns -n kube-system -o yaml
```

```bash
# STEP 5: Check the deployment details
kubectl describe deployment coredns -n kube-system

# STEP 6: Check what version of CoreDNS is running
kubectl get deployment coredns -n kube-system \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
```

**Verification:** All pods Running + 1/1 Ready, kube-dns service has endpoints. ✓

---

## Task 02 — Test DNS Resolution from Inside a Pod

**Exam Question Style:** *"Verify that DNS resolution is working inside the cluster. Confirm that both internal service names and external domains can be resolved."*

### Step-by-Step

```bash
# STEP 1: Launch a debug pod (use busybox:1.28 — has nslookup and sh)
kubectl run dns-test \
  --image=busybox:1.28 \
  --restart=Never \
  -it \
  --rm \
  -- sh
```

> **CKA Tip:** `busybox:1.28` is the standard DNS debugging image in the exam.[^netshoot] Newer busybox versions have broken `nslookup`. If not available, use `nicolaka/netshoot`.[^netshoot]

```bash
# Inside the pod — run all of these:

# STEP 2: Verify /etc/resolv.conf is correct
cat /etc/resolv.conf
# Should show:
# nameserver 10.96.0.10
# search default.svc.cluster.local svc.cluster.local cluster.local
# options ndots:5

# STEP 3: Test internal Kubernetes DNS
nslookup kubernetes
# Expected: resolves kubernetes.default.svc.cluster.local → ClusterIP

nslookup kubernetes.default.svc.cluster.local
# Direct FQDN — should return the same IP

# STEP 4: Test cross-namespace (kube-dns service is in kube-system)
nslookup kube-dns.kube-system.svc.cluster.local

# STEP 5: Test external DNS
nslookup google.com
# Should return Google's IPs

# STEP 6: Test with dig (more verbose)
# Exit busybox first, use netshoot for dig:
exit
```

```bash
# For dig-based testing:
kubectl run dns-test \
  --image=nicolaka/netshoot \
  --restart=Never \
  -it \
  --rm \
  -- bash

# Inside netshoot:
dig kubernetes.default.svc.cluster.local A
dig @10.96.0.10 kubernetes.default.svc.cluster.local   # query CoreDNS directly
dig google.com A
dig -x 10.96.0.1    # reverse lookup
exit
```

### What to Look For in Exam Answers

- Internal DNS works (kubernetes.default resolves) → `kubernetes` plugin OK
- External DNS works (google.com resolves) → `forward` plugin OK
- resolv.conf has correct nameserver and search domains → kubelet configured correctly

---

## Task 03 — Add a Custom Stub Domain

**Exam Question Style:** *"Configure CoreDNS to forward all DNS queries for the domain `db.local` to the DNS server at `10.96.100.10`. All other queries should continue to use the current upstream DNS configuration."*

### Step-by-Step

```bash
# STEP 1: Back up the current ConfigMap
kubectl get configmap coredns -n kube-system -o yaml > /tmp/coredns-backup.yaml
echo "Backup saved to /tmp/coredns-backup.yaml"

# STEP 2: Edit the ConfigMap
kubectl edit configmap coredns -n kube-system
```

In the editor, add the stub domain **INSIDE** the `.:53 { }` block, **before** the main `forward . /etc/resolv.conf` line:

```corefile
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
    forward db.local. 10.96.100.10          # ← ADD THIS LINE (stub domain)
    forward . /etc/resolv.conf {            # ← This stays, handles everything else
        max_concurrent 1000
    }
    cache 30
    loop
    reload
    loadbalance
}
```

Save and exit (`:wq` in vim).

```bash
# STEP 3: Verify ConfigMap was saved
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}'
# Confirm you see: forward db.local. 10.96.100.10

# STEP 4: Wait for hot reload OR force restart
# Option A: Wait ~30 seconds (reload plugin will pick up changes)
sleep 35

# Option B: Force restart immediately
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# STEP 5: Verify no errors in CoreDNS logs
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=20
# Look for: [INFO] plugin/reload: Running configuration MD5 = ...
# No [ERROR] or [FATAL] lines

# STEP 6: Test the stub domain (simulate from a pod)
kubectl run stub-test --image=busybox:1.28 --restart=Never -it --rm -- sh
# Inside pod:
nslookup anyname.db.local
# Should forward to 10.96.100.10 (may return NXDOMAIN if no such server,
# but it should NOT return immediately with no forwarding attempt)
# The absence of a "connection timed out" toward the wrong server is the key
exit
```

> **CKA Tip:** The exam grader will verify the ConfigMap content AND that CoreDNS reloaded without errors. Always check logs after editing.

> **ORDER MATTERS:** In a `.:53` block, CoreDNS matches `forward` directives from **most specific to least specific**. Put `forward db.local. 10.x.x.x` **before** `forward . /etc/resolv.conf`, otherwise the catch-all `forward .` handles `db.local` first.

---

## Task 04 — Add Static Host Entries

**Exam Question Style:** *"Configure CoreDNS so that the hostname `legacy-app.internal` resolves to IP `192.168.50.100` for all pods in the cluster."*

### Step-by-Step

```bash
# STEP 1: Back up
kubectl get configmap coredns -n kube-system -o yaml > /tmp/coredns-backup.yaml

# STEP 2: Edit ConfigMap
kubectl edit configmap coredns -n kube-system
```

Add a `hosts` plugin block **before** `prometheus` and **after** `kubernetes` in the .:53 block:

```corefile
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
    hosts {                             # ← ADD THIS BLOCK
        192.168.50.100 legacy-app.internal
        ttl 60
        fallthrough                     # ← IMPORTANT: needed to pass to forward
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

```bash
# STEP 3: Verify saved
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}'

# STEP 4: Reload
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# STEP 5: Check logs for errors
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=20

# STEP 6: Test resolution
kubectl run hosts-test --image=busybox:1.28 --restart=Never -it --rm -- sh
# Inside:
nslookup legacy-app.internal
# Expected: 
# Server: 10.96.0.10
# Address: 10.96.0.10:53
# Name: legacy-app.internal
# Address: 192.168.50.100
exit
```

> **Common Mistake:** Forgetting `fallthrough` in the `hosts` block. Without `fallthrough`, any name NOT in the hosts block returns NXDOMAIN from the hosts plugin without trying the `forward` plugin. This breaks external DNS resolution.

---

## Task 05 — Configure Pod DNS with Custom Settings

**Exam Question Style:** *"Create a Pod named `custom-dns-pod` in the `default` namespace with image `nginx:alpine`. Configure it to use the DNS server at `8.8.8.8` as primary nameserver and `8.8.4.4` as secondary, with `ndots` set to `2`. The pod should NOT use cluster DNS."*

### Step-by-Step

```bash
# STEP 1: Create pod manifest
cat << 'EOF' > /tmp/custom-dns-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: custom-dns-pod
  namespace: default
spec:
  dnsPolicy: None       # REQUIRED when fully replacing DNS config
  dnsConfig:
    nameservers:
      - 8.8.8.8
      - 8.8.4.4
    options:
      - name: ndots
        value: "2"
  containers:
    - name: nginx
      image: nginx:alpine
EOF

# STEP 2: Apply
kubectl apply -f /tmp/custom-dns-pod.yaml

# STEP 3: Wait for pod to be Running
kubectl get pod custom-dns-pod -w
# Ctrl+C once Running

# STEP 4: Verify /etc/resolv.conf inside pod
kubectl exec custom-dns-pod -- cat /etc/resolv.conf
# Expected:
# nameserver 8.8.8.8
# nameserver 8.8.4.4
# options ndots:2

# STEP 5: Verify DNS works
kubectl exec custom-dns-pod -- nslookup google.com
# Should work through 8.8.8.8

# Note: cluster internal names won't resolve (dnsPolicy: None, no cluster DNS)
kubectl exec custom-dns-pod -- nslookup kubernetes
# This will FAIL — expected behavior with external-only DNS
```

**Variant: Augment cluster DNS with extra options (keep ClusterFirst)**

```bash
# Exam Question: "Keep ClusterFirst DNS but reduce ndots to 2 for a pod"
cat << 'EOF' > /tmp/augmented-dns-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: augmented-dns-pod
  namespace: default
spec:
  dnsPolicy: ClusterFirst    # keep cluster DNS
  dnsConfig:
    options:
      - name: ndots
        value: "2"           # override ndots only
  containers:
    - name: nginx
      image: nginx:alpine
EOF

kubectl apply -f /tmp/augmented-dns-pod.yaml
kubectl exec augmented-dns-pod -- cat /etc/resolv.conf
# Expected:
# nameserver 10.96.0.10       ← cluster DNS (from ClusterFirst)
# search default.svc.cluster.local svc.cluster.local cluster.local
# options ndots:2             ← from dnsConfig (overrides default ndots:5)
```

---

## Task 06 — Debug: CoreDNS Pods Crashing

**Exam Question Style:** *"CoreDNS pods are in CrashLoopBackOff. Diagnose and fix the issue."*

### Step-by-Step

```bash
# STEP 1: Confirm the problem
kubectl get pods -n kube-system -l k8s-app=kube-dns
# NAME                        READY   STATUS             RESTARTS   AGE
# coredns-xxx-yyy             0/1     CrashLoopBackOff   5          3m

# STEP 2: Read the crash logs
kubectl logs -n kube-system -l k8s-app=kube-dns
# Also get previous crash logs:
kubectl logs -n kube-system -l k8s-app=kube-dns --previous

# STEP 3: Look for the specific error message
# Common crash messages:

# A) Syntax error in Corefile:
# [ERROR] Failed to initialize server(s): unable to compile Corefile: ...
# [ERROR] Unable to start server(s): invalid zone

# B) Loop detected:
# [FATAL] plugin/loop: Loop (127.0.0.1:xxx -> :53) detected for zone "."

# C) Plugin not found (typo or wrong plugin name):
# [ERROR] Unable to start server(s): unknown directive 'forwards'

# D) OOMKilled (from describe):
# Last State: Terminated / Reason: OOMKilled

# STEP 4A: Fix Corefile syntax error
kubectl edit configmap coredns -n kube-system
# Fix the syntax error — common ones:
# - Typo: 'forwards' should be 'forward'
# - Missing brace
# - Wrong indentation (Corefile uses tabs OR spaces but not mixed)
# - Invalid directive name

# STEP 4B: Fix loop
kubectl edit configmap coredns -n kube-system
# Change: forward . /etc/resolv.conf
# To:     forward . 8.8.8.8 8.8.4.4

# STEP 4C: Fix OOM
kubectl patch deployment coredns -n kube-system --type json -p '[
  {"op":"replace",
   "path":"/spec/template/spec/containers/0/resources/limits/memory",
   "value":"256Mi"}
]'

# STEP 5: Restart after fix
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# STEP 6: Verify pods are now Running
kubectl get pods -n kube-system -l k8s-app=kube-dns
# NAME                        READY   STATUS    RESTARTS   AGE
# coredns-xxx-yyy             1/1     Running   0          30s

# STEP 7: Verify DNS works
kubectl run verify-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup kubernetes
```

---

## Task 07 — Debug: Service Not Resolving

**Exam Question Style:** *"A pod in the `app` namespace cannot resolve the service `database.data.svc.cluster.local`. Diagnose and fix the issue."*

### Step-by-Step

```bash
# STEP 1: Verify the service exists
kubectl get svc database -n data
# If not found: the service name or namespace is wrong!

# STEP 2: Check service endpoints
kubectl get endpoints database -n data
# If endpoints are empty: no pods match the selector (pods not ready/wrong labels)

# STEP 3: Test DNS resolution from a pod in the 'app' namespace
kubectl run dns-diag -n app --image=busybox:1.28 --restart=Never -it --rm -- sh
# Inside:
cat /etc/resolv.conf
# Should include: search app.svc.cluster.local svc.cluster.local cluster.local

nslookup database.data.svc.cluster.local
# If NXDOMAIN → DNS level problem
# If Server can't find → network to CoreDNS blocked

nslookup database.data
# Shorter form (uses search domains)
exit

# STEP 4: Test DNS directly against CoreDNS pod
COREDNS_POD=$(kubectl get pods -n kube-system -l k8s-app=kube-dns \
  -o jsonpath='{.items[0].metadata.name}')

kubectl exec -n kube-system $COREDNS_POD -- \
  nslookup database.data.svc.cluster.local 127.0.0.1
# If this works but Step 3 doesn't → network policy blocking pod→CoreDNS

# STEP 5: Check if NetworkPolicy is blocking DNS
kubectl get networkpolicies -n app
# Look for egress rules — do they allow UDP/TCP port 53?

# STEP 6: Check if CoreDNS can reach the k8s API (if kubernetes plugin failing)
kubectl logs -n kube-system $COREDNS_POD | grep -i "error\|timeout\|refused"

# STEP 7: Check CoreDNS RBAC (must be able to watch services and endpointslices)
kubectl auth can-i list services \
  --as=system:serviceaccount:kube-system:coredns
kubectl auth can-i list endpointslices \
  --as=system:serviceaccount:kube-system:coredns
# Should both be 'yes' — if 'no', RBAC is broken (restore system:coredns ClusterRole)

# STEP 8: Verify dnsPolicy of the affected pod
kubectl get pod <affected-pod-name> -n app -o jsonpath='{.spec.dnsPolicy}'
# Should be 'ClusterFirst' or empty (default = ClusterFirst)
```

---

## Task 08 — Debug: DNS Loop Detected

**Exam Question Style:** *"CoreDNS pods are crashing with a loop detection error. Fix the issue."*

### Step-by-Step

```bash
# STEP 1: Confirm the loop error in logs
kubectl logs -n kube-system -l k8s-app=kube-dns --previous
# Expected error:
# [FATAL] plugin/loop: Loop (127.0.0.1:54321 -> :53) detected for zone "."

# STEP 2: Check what /etc/resolv.conf on the node says
# (CoreDNS uses Default dnsPolicy = node's DNS)
# To check: exec into a CoreDNS pod or check on node directly
kubectl exec -n kube-system \
  $(kubectl get pods -n kube-system -l k8s-app=kube-dns -o jsonpath='{.items[0].metadata.name}') \
  -- cat /etc/resolv.conf
# If it shows: nameserver 127.0.0.53 or 127.0.0.1 → loop confirmed

# STEP 3: Fix the Corefile — use explicit upstream DNS
kubectl edit configmap coredns -n kube-system
```

Change this:
```corefile
forward . /etc/resolv.conf {
    max_concurrent 1000
}
```

To this:
```corefile
forward . 8.8.8.8 8.8.4.4 {
    max_concurrent 1000
}
```

```bash
# OR if you know the actual upstream DNS IP of the cluster:
# forward . <node-upstream-dns-ip>

# STEP 4: Restart CoreDNS
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# STEP 5: Verify no more loop errors
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=20
# Should see: [INFO] plugin/reload: Running configuration MD5 = ...
# NO [FATAL] lines

# STEP 6: Verify DNS works
kubectl run loop-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup google.com
```

---

## Task 09 — Scale CoreDNS

**Exam Question Style:** *"The cluster is experiencing DNS performance issues. Scale the CoreDNS deployment to 4 replicas and ensure the pods are spread across different nodes."*

### Step-by-Step

```bash
# STEP 1: Check current replicas
kubectl get deployment coredns -n kube-system
# DESIRED=2, CURRENT=2, READY=2 (initial state)

# STEP 2: Scale to 4 replicas
kubectl scale deployment coredns -n kube-system --replicas=4

# STEP 3: Verify scaling
kubectl get deployment coredns -n kube-system
# Should show DESIRED=4

kubectl get pods -n kube-system -l k8s-app=kube-dns -o wide
# Should show 4 pods — check NODE column to see distribution

# STEP 4: Add hard anti-affinity (ensure pods on different nodes)
kubectl patch deployment coredns -n kube-system --type merge -p '{
  "spec": {
    "template": {
      "spec": {
        "affinity": {
          "podAntiAffinity": {
            "requiredDuringSchedulingIgnoredDuringExecution": [
              {
                "labelSelector": {
                  "matchExpressions": [
                    {"key": "k8s-app", "operator": "In", "values": ["kube-dns"]}
                  ]
                },
                "topologyKey": "kubernetes.io/hostname"
              }
            ]
          }
        }
      }
    }
  }
}'

# STEP 5: Wait for rollout
kubectl rollout status deployment coredns -n kube-system

# STEP 6: Verify pods are on different nodes
kubectl get pods -n kube-system -l k8s-app=kube-dns -o wide
# NODE column should show 4 different node names

# STEP 7: Verify DNS still works after scaling
kubectl run scale-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup kubernetes
```

---

## Task 10 — Upgrade CoreDNS Image

**Exam Question Style:** *"Upgrade CoreDNS from its current version to `registry.k8s.io/coredns/coredns:v1.11.3`."*

### Step-by-Step

```bash
# STEP 1: Check current version
kubectl get deployment coredns -n kube-system \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
# Output: registry.k8s.io/coredns/coredns:v1.11.1

# STEP 2: Save current deployment as backup
kubectl get deployment coredns -n kube-system -o yaml > /tmp/coredns-deployment-backup.yaml

# STEP 3: Update the image
kubectl set image deployment/coredns \
  coredns=registry.k8s.io/coredns/coredns:v1.11.3 \
  -n kube-system

# STEP 4: Monitor the rolling update
kubectl rollout status deployment coredns -n kube-system
# Waiting for deployment "coredns" rollout to finish: 1 out of 2 new replicas have been updated...
# Waiting for deployment "coredns" rollout to finish: 1 old replicas are pending termination...
# deployment "coredns" successfully rolled out

# STEP 5: Verify new version
kubectl get deployment coredns -n kube-system \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
# Should show: registry.k8s.io/coredns/coredns:v1.11.3

kubectl get pods -n kube-system -l k8s-app=kube-dns
# Both pods should be Running 1/1

# STEP 6: Test DNS still works
kubectl run upgrade-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup kubernetes

# STEP 7: If something went wrong — rollback
kubectl rollout undo deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system
```

---

## Task 11 — Restore Broken Corefile

**Exam Question Style:** *"CoreDNS is not functioning. The Corefile in the ConfigMap has been corrupted. Restore it to a working state."*

### Step-by-Step

```bash
# STEP 1: Check pod status and logs
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns

# STEP 2: View the current (broken) Corefile
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}'
# Will contain errors/garbage

# STEP 3: Replace with a known-good Corefile
# Get the kube-dns ClusterIP first:
CLUSTER_DNS=$(kubectl get svc kube-dns -n kube-system -o jsonpath='{.spec.clusterIP}')
echo "DNS Service IP: $CLUSTER_DNS"

# Write the ConfigMap with correct Corefile:
cat << 'EOF' > /tmp/coredns-fix.yaml
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
EOF

# STEP 4: Apply the fix
kubectl apply -f /tmp/coredns-fix.yaml

# STEP 5: Restart CoreDNS to pick up the fix immediately
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# STEP 6: Verify pods are running
kubectl get pods -n kube-system -l k8s-app=kube-dns
# Both pods: Running 1/1

# STEP 7: Check logs for success
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=10
# Look for: plugin/reload: Running configuration MD5 = ...

# STEP 8: Full DNS verification
kubectl run fix-test --image=busybox:1.28 --restart=Never -it --rm -- sh
# Inside:
nslookup kubernetes
nslookup google.com
exit
```

---

## Task 12 — Configure ExternalName Service [^k8s-externalname]

**Exam Question Style:** *"Create a Service named `external-api` in the `default` namespace of type ExternalName that points to `api.example.com`."*

### Step-by-Step

```bash
# STEP 1: Create the ExternalName service
cat << 'EOF' > /tmp/external-name-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: external-api
  namespace: default
spec:
  type: ExternalName
  externalName: api.example.com
EOF

kubectl apply -f /tmp/external-name-svc.yaml

# STEP 2: Verify service was created
kubectl get svc external-api -n default
# Should show: TYPE=ExternalName, EXTERNAL-IP=api.example.com

kubectl describe svc external-api -n default

# STEP 3: Verify DNS resolution from inside a pod
kubectl run ext-test --image=busybox:1.28 --restart=Never -it --rm -- sh
# Inside:
nslookup external-api.default.svc.cluster.local
# Expected response: canonical name = api.example.com.
# (CNAME response pointing to the external hostname)
exit

# STEP 4: Understand what happened
# CoreDNS creates:
# external-api.default.svc.cluster.local → CNAME → api.example.com
# The client then resolves api.example.com via external DNS
```

---

## Task 13 — Verify Headless Service DNS [^k8s-statefulset-dns]

**Exam Question Style:** *"A StatefulSet named `web` with 3 replicas exists in the `default` namespace with headless service `web-headless`. Verify that individual pod DNS names resolve correctly."*

### Step-by-Step

```bash
# STEP 1: Verify the headless service exists
kubectl get svc web-headless -n default
# Expected: CLUSTER-IP=None (headless)

kubectl get svc web-headless -n default -o jsonpath='{.spec.clusterIP}'
# Should output: None

# STEP 2: Check the pods
kubectl get pods -n default -l app=web -o wide
# Should show: web-0, web-1, web-2 with their IPs

# STEP 3: Get pod IPs
kubectl get pods -n default -l app=web \
  -o custom-columns='NAME:.metadata.name,IP:.status.podIP'

# STEP 4: Test individual pod DNS resolution
kubectl run headless-test --image=busybox:1.28 --restart=Never -it --rm -- sh
# Inside:

# Test headless service (should return ALL pod IPs)
nslookup web-headless.default.svc.cluster.local
# Expected: multiple A records, one per pod

# Test individual pods
nslookup web-0.web-headless.default.svc.cluster.local
nslookup web-1.web-headless.default.svc.cluster.local
nslookup web-2.web-headless.default.svc.cluster.local
# Each should return that pod's IP

exit

# STEP 5: Understand the DNS naming pattern
# StatefulSet pods: <pod-name>.<headless-svc>.<namespace>.svc.cluster.local
# web-0.web-headless.default.svc.cluster.local → Pod web-0's IP
```

---

## Task 14 — Fix a Pod with Wrong dnsPolicy

**Exam Question Style:** *"A pod named `broken-pod` in the `prod` namespace cannot resolve cluster-internal service names. It can resolve external domains. Fix the pod's DNS configuration without deleting and recreating it."*

### Step-by-Step

```bash
# STEP 1: Investigate the pod
kubectl get pod broken-pod -n prod -o jsonpath='{.spec.dnsPolicy}'
# Output: Default
# "Default" = uses node DNS, NOT cluster DNS — explains why internal fails!

# STEP 2: Check resolv.conf inside the pod
kubectl exec broken-pod -n prod -- cat /etc/resolv.conf
# Shows node's DNS (e.g., nameserver 192.168.1.1) — no cluster.local search domains

# STEP 3: Since dnsPolicy is in pod spec, you MUST recreate the pod
# (Pod spec is immutable for dnsPolicy)
# Get the pod manifest first
kubectl get pod broken-pod -n prod -o yaml > /tmp/broken-pod.yaml

# STEP 4: Edit the manifest
vim /tmp/broken-pod.yaml
# Change: dnsPolicy: Default
# To:     dnsPolicy: ClusterFirst
# Also remove: resourceVersion, uid, creationTimestamp, status block

# STEP 5: Delete and recreate
kubectl delete pod broken-pod -n prod
kubectl apply -f /tmp/broken-pod.yaml

# STEP 6: Wait for pod to be Running
kubectl get pod broken-pod -n prod -w

# STEP 7: Verify fix
kubectl exec broken-pod -n prod -- cat /etc/resolv.conf
# Should now show: nameserver 10.96.0.10

kubectl exec broken-pod -n prod -- nslookup kubernetes.default.svc.cluster.local
# Should resolve now!
```

> **Note:** If the pod is managed by a Deployment, edit the Deployment instead:
> ```bash
> kubectl edit deployment <name> -n prod
> # Change spec.template.spec.dnsPolicy: Default → ClusterFirst
> # Deployment will rolling-update the pods automatically
> ```

---

## Task 15 — Enable Temporary Query Logging

**Exam Question Style:** *"Enable DNS query logging in CoreDNS to debug intermittent resolution failures. After enabling, show the log output."*

### Step-by-Step

```bash
# STEP 1: Edit CoreDNS ConfigMap to add 'log' plugin
kubectl edit configmap coredns -n kube-system
```

Add `log` as the **second line** (after `errors`, before `health`):

```corefile
.:53 {
    errors
    log           # ← ADD THIS LINE
    health {
        lameduck 5s
    }
    ...
```

```bash
# STEP 2: Save and verify ConfigMap
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}' | grep log

# STEP 3: Wait for hot reload (~30s) OR force restart
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# STEP 4: Generate some DNS traffic
kubectl run dns-traffic --image=busybox:1.28 --restart=Never -- \
  sh -c "for i in $(seq 1 10); do nslookup kubernetes.default; done"

# STEP 5: View the query logs
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30
# Should see lines like:
# [INFO] 10.0.0.5:45678 - 1234 "kubernetes.default. IN A udp 37 false 512" NOERROR qr,aa,rd 90 0.0001s

# STEP 6: Clean up — IMPORTANT! Remove 'log' after debugging
kubectl edit configmap coredns -n kube-system
# Remove the 'log' line

kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# STEP 7: Verify log is disabled
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=10
# Should NOT see per-query log lines anymore
```

---

## Full Exam Simulation (Timed)

> **Instructions:** Complete all tasks below in 25 minutes. This simulates a real CKA exam cluster scenario. Time yourself.

### Scenario Setup

Assume a fresh cluster with a deliberately broken CoreDNS state.

---

### [Q1 — 4 min] Investigate and report CoreDNS health

1. List all CoreDNS pods and their status
2. Show the kube-dns Service ClusterIP
3. Output the current Corefile

```bash
# Your commands here:
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl get svc kube-dns -n kube-system -o jsonpath='{.spec.clusterIP}'
kubectl get cm coredns -n kube-system -o jsonpath='{.data.Corefile}'
```

---

### [Q2 — 4 min] Add stub domain

Configure CoreDNS to forward all queries for `legacy.company.com` to the DNS server at `10.100.0.1`.

```bash
# Solution:
kubectl get cm coredns -n kube-system -o yaml > /tmp/coredns-bak.yaml
kubectl edit cm coredns -n kube-system
# Add before the main forward . line:
# forward legacy.company.com. 10.100.0.1
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=5
```

---

### [Q3 — 3 min] Test DNS

Run a pod and confirm that `kubernetes.default.svc.cluster.local` resolves.

```bash
# Solution:
kubectl run q3-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup kubernetes.default.svc.cluster.local
```

---

### [Q4 — 5 min] Create pod with custom DNS

Create a pod `dns-custom` in namespace `dev` (create namespace if needed) with image `busybox:1.28` that:
- Uses `ClusterFirst` DNS
- Has `ndots` set to `1`

```bash
# Solution:
kubectl create namespace dev 2>/dev/null || true

cat << 'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: dns-custom
  namespace: dev
spec:
  dnsPolicy: ClusterFirst
  dnsConfig:
    options:
      - name: ndots
        value: "1"
  containers:
    - name: busybox
      image: busybox:1.28
      command: ["sleep", "3600"]
EOF

kubectl get pod dns-custom -n dev
kubectl exec dns-custom -n dev -- cat /etc/resolv.conf
# Verify: options ndots:1 is present
```

---

### [Q5 — 3 min] Fix CoreDNS OOM

CoreDNS pods are being OOMKilled. Increase memory limit to 200Mi.

```bash
# Solution:
kubectl patch deployment coredns -n kube-system --type json -p '[
  {"op":"replace",
   "path":"/spec/template/spec/containers/0/resources/limits/memory",
   "value":"200Mi"}
]'
kubectl rollout status deployment coredns -n kube-system
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

---

### [Q6 — 3 min] ExternalName Service

Create a Service `ext-db` in `default` namespace of type `ExternalName` pointing to `db.legacy.example.com`.

```bash
# Solution:
cat << 'EOF' | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: ext-db
  namespace: default
spec:
  type: ExternalName
  externalName: db.legacy.example.com
EOF

kubectl get svc ext-db
kubectl describe svc ext-db | grep ExternalName
```

---

### [Q7 — 3 min] Scale CoreDNS

Scale CoreDNS to 3 replicas.

```bash
# Solution:
kubectl scale deployment coredns -n kube-system --replicas=3
kubectl rollout status deployment coredns -n kube-system
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

---

### Scoring

| Task | Max Points | Your Score |
|---|---|---|
| Q1: Inspect CoreDNS | 4 | |
| Q2: Stub domain | 6 | |
| Q3: DNS test | 3 | |
| Q4: Custom pod DNS | 7 | |
| Q5: Fix OOM | 4 | |
| Q6: ExternalName | 5 | |
| Q7: Scale | 3 | |
| **Total** | **32** | |

---

## Quick Reference Card

```
╔═════════════════════════════════════════════════════════════════════════╗
║          COREDNS CKA QUICK REFERENCE CARD                               ║
╠═════════════════════════════════════════════════════════════════════════╣
║ LOCATION                                                                ║
║   Namespace:   kube-system                                              ║
║   Deployment:  coredns                                                  ║
║   Service:     kube-dns  (port 53 UDP+TCP, 9153 metrics)                ║
║   ConfigMap:   coredns   (contains the Corefile)                        ║
║   Pod labels:  k8s-app=kube-dns                                         ║
╠═════════════════════════════════════════════════════════════════════════╣
║ ESSENTIAL COMMANDS                                                      ║
║   Get pods:    kubectl get pods -n kube-system -l k8s-app=kube-dns.     ║
║   Get svc IP:  kubectl get svc kube-dns -n kube-system                  ║
║   Get Corefile: kubectl get cm coredns -n kube-system -o yaml           ║
║   Edit config: kubectl edit cm coredns -n kube-system                   ║
║   Restart:     kubectl rollout restart deploy coredns -n kube-system    ║
║   Status:      kubectl rollout status deploy coredns -n kube-system     ║
║   Logs:        kubectl logs -n kube-system -l k8s-app=kube-dns          ║
║   Scale:       kubectl scale deploy coredns -n kube-system --replicas=N ║
║   DNS test:                                                             ║
║	kubectl run t --image=busybox:1.28 -it --rm -- nslookup kubernetes    ║
╠═════════════════════════════════════════════════════════════════════════╣
║ DNS NAMING                                                              ║
║   Service:     <svc>.<ns>.svc.cluster.local                             ║
║   Pod IP:      <ip-dashes>.<ns>.pod.cluster.local                       ║
║   StatefulSet: <pod>.<headless-svc>.<ns>.svc.cluster.local              ║
║   K8s API:     kubernetes.default.svc.cluster.local                     ║
╠═════════════════════════════════════════════════════════════════════════╣
║ DNS POLICIES                                                            ║
║   ClusterFirst (default) → CoreDNS                                      ║
║   ClusterFirstWithHostNet → CoreDNS (for hostNetwork pods)              ║
║   Default → Node's DNS (bypasses CoreDNS)                               ║
║   None → Must provide dnsConfig                                         ║
╠═════════════════════════════════════════════════════════════════════════╣
║ STUB DOMAIN (add inside .:53 block, BEFORE forward .)                   ║
║   forward stub.domain. <dns-server-ip>                                  ║ 
╠═════════════════════════════════════════════════════════════════════════╣
║ STATIC HOSTS (add inside .:53 block)                                    ║
║   hosts { 1.2.3.4 hostname.domain; fallthrough }                        ║
╠═════════════════════════════════════════════════════════════════════════╣
║ RESOLVE.CONF EXPECTED                                                   ║
║   nameserver 10.96.0.10  (kube-dns ClusterIP)                           ║
║   search <ns>.svc.cluster.local svc.cluster.local cluster.local         ║
╠═════════════════════════════════════════════════════════════════════════╣
---

*CKA CoreDNS Practice Guide — v1.1 — February 2026 — Based on CoreDNS 1.13.x / Kubernetes 1.31+*

---

## References

### CoreDNS Official

[^coredns-repo]: CoreDNS Source Repository — https://github.com/coredns/coredns  
[^coredns-website]: CoreDNS Official Website — https://coredns.io/  
[^coredns-manual]: CoreDNS Manual (complete plugin reference & Corefile syntax) — https://coredns.io/manual/toc/  
[^coredns-releases]: CoreDNS GitHub Releases & Changelogs — https://github.com/coredns/coredns/releases  
[^coredns-deployment]: CoreDNS Deployment Repository (upgrade guides) — https://github.com/coredns/deployment  

### CoreDNS Plugin Documentation

[^plugin-kubernetes]: `kubernetes` plugin reference — https://coredns.io/plugins/kubernetes/  
[^plugin-forward]: `forward` plugin reference — https://coredns.io/plugins/forward/  
[^plugin-cache]: `cache` plugin reference — https://coredns.io/plugins/cache/  
[^plugin-log]: `log` plugin reference — https://coredns.io/plugins/log/  
[^plugin-errors]: `errors` plugin reference — https://coredns.io/plugins/errors/  
[^plugin-health]: `health` plugin reference — https://coredns.io/plugins/health/  
[^plugin-ready]: `ready` plugin reference — https://coredns.io/plugins/ready/  
[^plugin-hosts]: `hosts` plugin reference — https://coredns.io/plugins/hosts/  
[^plugin-loop]: `loop` plugin reference — https://coredns.io/plugins/loop/  
[^plugin-reload]: `reload` plugin reference — https://coredns.io/plugins/reload/  

### Kubernetes Official Documentation

[^k8s-dns-concepts]: DNS for Services and Pods — https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/  
[^k8s-custom-dns]: Customizing DNS Service — https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/  
[^k8s-dns-debug]: Debugging DNS Resolution — https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/  
[^k8s-coredns-migration]: Using CoreDNS for Service Discovery — https://kubernetes.io/docs/tasks/administer-cluster/coredns/  
[^k8s-nodelocal]: Using NodeLocal DNSCache in Kubernetes Clusters — https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/  
[^k8s-dns-autoscale]: Autoscaling the DNS Service in a Cluster — https://kubernetes.io/docs/tasks/administer-cluster/dns-horizontal-autoscaling/  
[^k8s-pod-dns-config]: Pod DNS Config (dnsPolicy & dnsConfig reference) — https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-s-dns-config  
[^k8s-endpointslices]: EndpointSlices — https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/  
[^k8s-statefulset-dns]: StatefulSet: Stable Network ID — https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id  
[^k8s-externalname]: Service Type ExternalName — https://kubernetes.io/docs/concepts/services-networking/service/#externalname  
[^k8s-netpol]: Network Policies — https://kubernetes.io/docs/concepts/services-networking/network-policies/  
[^kubeadm-coredns]: kubeadm — CoreDNS configuration — https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/#config-file  

### CKA Certification

[^cka-curriculum]: CNCF Curriculum for Certified Kubernetes Administrator — https://github.com/cncf/curriculum  
[^cka-exam-info]: CKA Exam Overview — The Linux Foundation — https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/  
[^cka-handbook]: CKA Candidate Handbook — https://docs.linuxfoundation.org/tc-docs/certification/lf-handbook2  
[^cka-allowed-resources]: CKA Important Instructions (resources allowed during exam) — https://docs.linuxfoundation.org/tc-docs/certification/certification-resources-allowed  

### Debugging Tools

[^netshoot]: nicolaka/netshoot — Container with full network debugging toolkit — https://github.com/nicolaka/netshoot  
[^busybox]: BusyBox — Minimal Linux utilities (use v1.28 for working nslookup) — https://busybox.net/  

### Further Reading

[^coredns-blog]: CoreDNS Blog — https://coredns.io/blog/  
[^k8s-concepts-services]: Kubernetes Service Concepts — https://kubernetes.io/docs/concepts/services-networking/service/  
[^k8s-pdb]: Configure PodDisruptionBudget — https://kubernetes.io/docs/tasks/run-application/configure-pdb/  
