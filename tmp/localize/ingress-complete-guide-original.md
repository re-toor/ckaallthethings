# Kubernetes Ingress: Complete Guide

> **Version:** v1.0 — February 2026 — Based on Kubernetes 1.32 / `networking.k8s.io/v1`
>
> ⚠️ **Migration Notice:** The community-maintained `ingress-nginx` controller is retiring in
> March 2026. Kubernetes SIG Network officially recommends migrating to Gateway API for new
> deployments. This guide covers Ingress thoroughly and includes a dedicated migration section.

---

## Table of Contents

1. [What Is Ingress?](#1-what-is-ingress)
2. [Architecture Overview](#2-architecture-overview)
3. [IngressClass](#3-ingressclass)
4. [Ingress Resource Deep Dive](#4-ingress-resource-deep-dive)
5. [Path Types](#5-path-types)
6. [TLS / HTTPS](#6-tls--https)
7. [Default Backend](#7-default-backend)
8. [Annotations](#8-annotations)
9. [Popular Ingress Controllers](#9-popular-ingress-controllers)
10. [Advanced Patterns](#10-advanced-patterns)
11. [RBAC for Ingress](#11-rbac-for-ingress)
12. [Troubleshooting](#12-troubleshooting)
13. [Migration: Ingress → Gateway API](#13-migration-ingress--gateway-api)
14. [References](#14-references)

---

## 1. What Is Ingress?

An **Ingress** is a Kubernetes API object (`networking.k8s.io/v1`) that manages external HTTP and
HTTPS access to Services in a cluster. It acts as a Layer-7 (application-layer) load balancer and
reverse proxy, routing traffic based on hostnames and URL paths.

Ingress is fundamentally different from a Service of type `LoadBalancer` or `NodePort`:

| Feature | Service (L4) | Ingress (L7) |
|---|---|---|
| Protocol awareness | TCP/UDP only | HTTP/HTTPS |
| Virtual hosting | No | Yes (hostname-based) |
| Path routing | No | Yes |
| TLS termination | No | Yes |
| Cloud LB per service | Yes (expensive) | Shared LB |
| Custom headers/rewrites | No | Yes (controller-dependent) |

Ingress requires an **Ingress Controller** to be running in the cluster. The Ingress resource itself
is only a configuration object — without a controller, nothing happens. The controller watches
Ingress objects and configures an underlying proxy (NGINX, Envoy, HAProxy, etc.).[^k8s-ingress]

### API Version History

| API Version | Kubernetes | Status |
|---|---|---|
| `extensions/v1beta1` | ≤1.13 | Removed in 1.22 |
| `networking.k8s.io/v1beta1` | 1.14–1.21 | Removed in 1.22 |
| `networking.k8s.io/v1` | 1.19+ | **Stable (GA)** |

All Ingress objects must use `networking.k8s.io/v1` on any cluster running Kubernetes 1.22 or
later.[^k8s-deprecated-apis]

---

## 2. Architecture Overview

```
Internet
    │
    ▼
[ Cloud LB / NodePort / HostNetwork ]
    │
    ▼
[ Ingress Controller Pod(s) ]          ← watches Ingress + IngressClass objects
  (NGINX / Envoy / Traefik / etc.)
    │
    ├── hostname: app1.example.com  ──► Service: app1-svc:80
    ├── hostname: app2.example.com  ──► Service: app2-svc:8080
    └── path: /api/*               ──► Service: api-svc:3000
```

The controller is typically deployed as a Deployment inside the cluster with a corresponding
Service of type `LoadBalancer` or `NodePort` that accepts external traffic. The controller
continuously reconciles Ingress resources and programs its proxy configuration accordingly.

### Controller Responsibilities

When an Ingress is created or updated, the controller:

1. Reads all Ingress objects that reference its IngressClass.
2. Generates proxy configuration (e.g., NGINX `server` and `location` blocks).
3. Reloads or hot-reloads the proxy — some controllers support zero-downtime config reloads,
   others require a full process restart.
4. Updates the `status.loadBalancer` field with the IP/hostname of the ingress endpoint.

---

## 3. IngressClass

`IngressClass` is a cluster-scoped resource introduced in Kubernetes 1.18 and made stable in 1.19.
It replaces the older `kubernetes.io/ingress.class` annotation.[^k8s-ingressclass]

### Why IngressClass Exists

Multiple ingress controllers can run in the same cluster — for example, one NGINX controller for
internal traffic and one for external traffic. IngressClass allows each Ingress resource to
explicitly declare which controller should handle it.

### IngressClass Object

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx-external
  # Make this the default class — claims Ingress objects with no ingressClassName set:
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: k8s.io/ingress-nginx   # must match the controller's --ingress-class flag value
  parameters:                         # optional: vendor-specific config object
    apiGroup: k8s.example.net
    kind: IngressParameters
    name: external-lb-params
```

### Referencing a Class from an Ingress

```yaml
spec:
  ingressClassName: nginx-external   # preferred approach (field)
```

The old annotation `kubernetes.io/ingress.class: nginx-external` still works in most controllers
but is officially deprecated since Kubernetes 1.18. New manifests should always use the
`ingressClassName` field.[^k8s-ingress-deprecated-annotation]

### Default IngressClass

If exactly one IngressClass has the annotation `ingressclass.kubernetes.io/is-default-class: "true"`,
then Ingress objects that omit `ingressClassName` are automatically assigned that class.
If zero or more than one IngressClass claims to be default, Ingress objects without
`ingressClassName` remain unlinked (no controller picks them up, and you will see a warning
in the Ingress status).

```bash
# Check which class is default
kubectl get ingressclass
# NAME             CONTROLLER                      PARAMETERS   AGE
# nginx            k8s.io/ingress-nginx            <none>       10d
# nginx (default)  k8s.io/ingress-nginx            <none>       10d   ← annotation set
```

---

## 4. Ingress Resource Deep Dive

### Minimal Example

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  namespace: production
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 80
```

### Full Annotated Spec

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: full-example
  namespace: production
  # Annotations are controller-specific — see Section 8
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx            # which controller handles this

  defaultBackend:                    # fallback if no rule matches
    service:
      name: default-page-svc
      port:
        number: 80

  tls:                               # see Section 6
  - hosts:
    - myapp.example.com
    - api.example.com
    secretName: example-tls-secret   # kubernetes.io/tls Secret

  rules:

  # ── Rule 1: Host + Path routing ───────────────────────────────────────────
  - host: myapp.example.com          # exact hostname match (no wildcard by default)
    http:
      paths:
      - path: /                      # root path
        pathType: Prefix
        backend:
          service:
            name: frontend-svc
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-svc
            port:
              number: 8080

  # ── Rule 2: Wildcard hostname ─────────────────────────────────────────────
  - host: "*.example.com"            # wildcard: matches one DNS label
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: wildcard-svc
            port:
              number: 80

  # ── Rule 3: No host specified ─────────────────────────────────────────────
  # Matches all hostnames not matched by a more specific rule
  - http:
      paths:
      - path: /health
        pathType: Exact
        backend:
          service:
            name: health-svc
            port:
              number: 8080
```

### Wildcard Hosts

A wildcard hostname like `*.example.com` matches exactly one DNS label. It matches
`foo.example.com` but does NOT match `foo.bar.example.com` or `example.com`. The wildcard
must be the leftmost label; `foo.*.example.com` is not valid.[^k8s-ingress-wildcards]

### Ingress Status

After creation, check the status to find the assigned IP or hostname:

```bash
kubectl get ingress my-ingress -n production
# NAME         CLASS   HOSTS               ADDRESS          PORTS     AGE
# my-ingress   nginx   myapp.example.com   203.0.113.10     80, 443   5m

kubectl describe ingress my-ingress -n production
# Events:
#   Normal  Sync  3m  nginx-ingress-controller  Scheduled for sync
```

---

## 5. Path Types

Path type is a **required** field since `networking.k8s.io/v1`. It controls how the path in the
rule is matched against incoming request URIs.[^k8s-ingress-pathtypes]

### Exact

```yaml
path: /foo
pathType: Exact
```

Matches `/foo` only. Does **not** match `/foo/`, `/foo/bar`, or `/FOO`.

### Prefix

```yaml
path: /foo
pathType: Prefix
```

Matches any path where each path element (slash-delimited component) is a prefix of the request
path. Specifically:

- `/foo` matches `/foo` and `/foo/bar`
- `/foo` does NOT match `/foobar` (the next character must be `/` or end of string)
- `/foo/` matches `/foo/` and `/foo/bar` but NOT `/foo`

The distinction between `/foo` (Prefix, no trailing slash) and `/foo/` (Prefix, trailing slash)
is subtle but significant. When in doubt, use `/foo` without a trailing slash — most controllers
match this correctly.

### ImplementationSpecific

```yaml
path: /foo.*
pathType: ImplementationSpecific
```

Interpretation is left entirely to the IngressClass implementation. This might mean regex, glob,
or any other pattern. Because this type is not portable across controllers, avoid it in new
deployments unless you specifically need controller-specific matching.

### Precedence Rules

When multiple paths could match a request, the most specific match wins:

1. **Exact** paths take precedence over Prefix and ImplementationSpecific.
2. **Longer Prefix** paths take precedence over shorter Prefix paths.
3. If a tie exists between rules in the same Ingress, the first listed rule wins (for most
   controllers).
4. Rules in the same host block are evaluated together.

Example of precedence:

```yaml
# Request: GET /foo/bar
# Winner: second rule (longer prefix)
- path: /foo
  pathType: Prefix    # matches, but shorter
- path: /foo/bar
  pathType: Prefix    # matches AND longer — wins
- path: /foo/bar
  pathType: Exact     # would win if it were an exact match, but /foo/bar/ would not match
```

---

## 6. TLS / HTTPS

### TLS Termination at the Ingress Controller

The most common pattern is TLS termination at the ingress controller. The controller decrypts
HTTPS and forwards plain HTTP to the backend Service.[^k8s-ingress-tls]

```yaml
# Step 1: Create the TLS Secret
# The Secret must be of type kubernetes.io/tls with tls.crt and tls.key
kubectl create secret tls my-tls-secret \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  --namespace=production

# Or declaratively:
apiVersion: v1
kind: Secret
metadata:
  name: my-tls-secret
  namespace: production
type: kubernetes.io/tls
data:
  tls.crt: <base64-encoded-certificate-chain>   # must include intermediate certs
  tls.key: <base64-encoded-private-key>
```

```yaml
# Step 2: Reference the Secret in the Ingress
spec:
  tls:
  - hosts:
    - myapp.example.com          # must match a host in .spec.rules
    secretName: my-tls-secret    # must be in the SAME namespace as the Ingress
```

Key constraints:

- The Secret must be in the **same namespace** as the Ingress object.
- The `tls.crt` must include the full certificate chain (leaf + intermediates), not just the leaf.
- The hosts listed under `tls` must match exactly the hosts in the corresponding rules.
- Kubernetes Ingress only supports TLS on port 443. Multi-port TLS is not part of the Ingress spec.

### SNI (Multiple TLS Hosts)

You can have multiple `tls` entries in a single Ingress, each with different hosts and Secrets.
The controller uses SNI to select the correct certificate per host.

```yaml
spec:
  tls:
  - hosts: [app1.example.com]
    secretName: app1-tls
  - hosts: [app2.example.com]
    secretName: app2-tls
  rules:
  - host: app1.example.com
    ...
  - host: app2.example.com
    ...
```

### HTTPS Redirect (HTTP → HTTPS)

Forcing HTTP to HTTPS is controller-specific. With NGINX Ingress Controller:

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    # or: nginx.ingress.kubernetes.io/ssl-redirect: "true"  (only redirects when TLS is configured)
```

### cert-manager Integration

cert-manager automates TLS certificate issuance and renewal (e.g., from Let's Encrypt). It watches
for Ingress objects with specific annotations and creates TLS Secrets automatically.[^cert-manager]

```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts: [myapp.example.com]
    secretName: myapp-tls          # cert-manager creates this Secret
  rules:
  - host: myapp.example.com
    ...
```

### TLS Passthrough

TLS passthrough (forwarding encrypted traffic without decryption) is not part of the Ingress spec.
Some controllers support it through custom annotations, but it is not portable. For proper TLS
passthrough, use Gateway API's `TLSRoute` (experimental channel).[^gateway-api-tlsroute]

---

## 7. Default Backend

The `defaultBackend` in the Ingress spec defines where to route traffic when no rule matches.
This is separate from any rule with host or path.

```yaml
spec:
  defaultBackend:
    service:
      name: default-404-page
      port:
        number: 80
```

Many controllers also support a cluster-wide default backend configured on the controller itself
(e.g., `--default-backend-service` flag in ingress-nginx). The Ingress-level `defaultBackend`
overrides the controller's default for that specific Ingress.

If no defaultBackend is configured at any level and no rule matches, the controller typically
returns a `404` or `503` response from its own built-in handler.

---

## 8. Annotations

The core Ingress spec is intentionally minimal. Annotations are the primary mechanism for
controller-specific configuration. This creates a portability problem: annotations from one
controller do not work with another. This is one of the key motivations for Gateway API.[^gateway-api-intro]

### Why Annotations Are Problematic

- They are stringly typed (no schema validation).
- They are not portable across controllers.
- They can grow to hundreds of key-value pairs for complex use cases.
- There is no way to share configuration across multiple Ingress objects.

### Common NGINX Ingress Annotations

These apply to the NGINX Ingress Controller (`k8s.io/ingress-nginx`).[^nginx-ingress-annotations]
Note: ingress-nginx is retiring in March 2026.

```yaml
metadata:
  annotations:
    # ── Rewriting ────────────────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/rewrite-target: /           # rewrite path to /
    nginx.ingress.kubernetes.io/use-regex: "true"           # enable regex in paths

    # ── Redirects ────────────────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/permanent-redirect: https://new.example.com
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"

    # ── TLS ──────────────────────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/ssl-passthrough: "true"

    # ── Authentication ────────────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: basic-auth-secret
    nginx.ingress.kubernetes.io/auth-realm: "Authentication Required"
    # For OAuth/OIDC with external auth service:
    nginx.ingress.kubernetes.io/auth-url: "https://auth.example.com/verify"
    nginx.ingress.kubernetes.io/auth-signin: "https://auth.example.com/login"

    # ── Rate limiting ────────────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/limit-rps: "10"             # 10 req/s per IP
    nginx.ingress.kubernetes.io/limit-connections: "5"

    # ── Upstream configuration ────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "30"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"      # max request body

    # ── CORS ─────────────────────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://app.example.com"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, OPTIONS"

    # ── WebSocket ────────────────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"  # keep WS alive
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"

    # ── Session affinity ─────────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/affinity: cookie
    nginx.ingress.kubernetes.io/session-cookie-name: INGRESSCOOKIE
    nginx.ingress.kubernetes.io/session-cookie-expires: "172800"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "172800"
    nginx.ingress.kubernetes.io/session-cookie-path: /

    # ── Custom headers ────────────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/configuration-snippet: |
      more_set_headers "X-Frame-Options: DENY";
      more_set_headers "X-Content-Type-Options: nosniff";
```

### ConfigMap-Level NGINX Configuration

Global NGINX settings are placed in a ConfigMap referenced by the controller:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-configuration
  namespace: ingress-nginx
data:
  use-gzip: "true"
  gzip-level: "5"
  keep-alive: "75"
  keep-alive-requests: "1000"
  proxy-buffer-size: "16k"
  large-client-header-buffers: "4 16k"
  log-format-upstream: '{"time": "$time_iso8601", "remote_addr": "$proxy_protocol_addr",
    "status": $status, "request": "$request", "upstream": "$upstream_addr"}'
```

---

## 9. Popular Ingress Controllers

### Status Summary (February 2026)

| Controller | Status | Notes |
|---|---|---|
| ingress-nginx (community) | **Retiring March 2026** | Migrate away — no future patches |
| F5 NGINX Ingress Controller | Active | Commercial; k8s 1.25–1.32 tested |
| Traefik | Active v3.x | Supports Ingress + Gateway API |
| HAProxy Ingress | Active | High-performance L7 |
| Contour (Envoy) | Active | CNCF; also supports Gateway API |
| Istio | Active | Full service mesh; Ingress is legacy mode |
| AWS ALB Controller | Active | Provisions AWS Application Load Balancers |
| GKE Managed Ingress | Active | Built into GKE clusters |
| Azure Application Gateway | Active | AKS integration |

### ingress-nginx (Community) — RETIRING March 2026[^ingress-nginx-retirement]

The community-maintained `ingress-nginx` controller at `kubernetes/ingress-nginx` is being
retired in March 2026. This was officially announced by the Kubernetes project. After retirement:
- No new releases for bug fixes or security patches.
- Existing deployments continue to work but are unpatched.
- SIG Network recommends migrating to Gateway API or another actively maintained controller.

This is distinct from **F5 NGINX Ingress Controller** (`nginx/kubernetes-ingress`), which is
separately maintained and actively supported.

### F5 NGINX Ingress Controller[^nginx-ingress-controller]

```bash
# Install via Helm (v4.x — supports k8s 1.25-1.32)
helm repo add nginx-stable https://helm.nginx.com/stable
helm install nginx-ingress nginx-stable/nginx-ingress \
  --namespace nginx-ingress --create-namespace \
  --set controller.watchIngressWithoutClass=true
```

```yaml
# IngressClass for F5 NGINX
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: nginx.org/ingress-controller
```

### Traefik[^traefik]

Traefik is a cloud-native reverse proxy that natively supports Kubernetes Ingress and Gateway API.

```bash
# Install Traefik via Helm
helm repo add traefik https://traefik.github.io/charts
helm install traefik traefik/traefik \
  --namespace traefik --create-namespace
```

```yaml
# IngressClass for Traefik
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: traefik
spec:
  controller: traefik.io/ingress-controller
```

Traefik also provides its own CRDs (`IngressRoute`, `Middleware`) for richer configuration that
goes beyond what Ingress annotations can express.

### Contour (Envoy-based)[^contour]

Contour is a CNCF project that uses Envoy as the data plane. It supports Kubernetes Ingress and
Gateway API natively.

```bash
kubectl apply -f https://projectcontour.io/quickstart/contour.yaml
```

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: contour
spec:
  controller: projectcontour.io/contour
```

---

## 10. Advanced Patterns

### Path-Based Routing (Fan-Out)

Route different URL paths to different backend services — a common microservices pattern.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fan-out
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /web
        pathType: Prefix
        backend:
          service: { name: frontend, port: { number: 80 } }
      - path: /api/v1
        pathType: Prefix
        backend:
          service: { name: api-v1, port: { number: 8080 } }
      - path: /api/v2
        pathType: Prefix
        backend:
          service: { name: api-v2, port: { number: 8080 } }
      - path: /static
        pathType: Prefix
        backend:
          service: { name: cdn-proxy, port: { number: 80 } }
```

### Name-Based Virtual Hosting

Route different hostnames to different backends — analogous to Apache/NGINX virtual hosting.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: virtual-hosting
spec:
  ingressClassName: nginx
  rules:
  - host: app1.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service: { name: app1, port: { number: 80 } }
  - host: app2.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service: { name: app2, port: { number: 80 } }
```

### URL Rewriting (NGINX)

Rewrite `/app/foo` to `/foo` before forwarding to the backend:

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /app(/|$)(.*)          # regex capture group $2 = rest of path
        pathType: ImplementationSpecific
        backend:
          service: { name: my-app, port: { number: 80 } }
```

### Canary Deployments (NGINX)

Split traffic between stable and canary versions using NGINX Ingress annotations:

```yaml
# --- Stable version (base Ingress)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-stable
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service: { name: my-app-stable, port: { number: 80 } }
---
# --- Canary version (receives 20% of traffic)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "20"     # 20% to canary
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service: { name: my-app-canary, port: { number: 80 } }
```

Canary by header (always send users with a specific header to canary):

```yaml
annotations:
  nginx.ingress.kubernetes.io/canary: "true"
  nginx.ingress.kubernetes.io/canary-by-header: "X-Canary"
  nginx.ingress.kubernetes.io/canary-by-header-value: "always"
```

### Basic Authentication

```bash
# Create htpasswd file
htpasswd -c auth admin
# Creates: admin:$apr1$...

kubectl create secret generic basic-auth \
  --from-file=auth \
  --namespace=production
```

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: basic-auth
    nginx.ingress.kubernetes.io/auth-realm: "Protected Area"
```

### External Authentication (OAuth2 Proxy)

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/auth-url: "https://oauth2-proxy.example.com/oauth2/auth"
    nginx.ingress.kubernetes.io/auth-signin: "https://oauth2-proxy.example.com/oauth2/start?rd=$escaped_request_uri"
    nginx.ingress.kubernetes.io/auth-response-headers: "X-Auth-Request-User,X-Auth-Request-Email"
```

### Rate Limiting

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/limit-rps: "10"        # requests per second per IP
    nginx.ingress.kubernetes.io/limit-rpm: "100"       # requests per minute per IP
    nginx.ingress.kubernetes.io/limit-connections: "5" # concurrent connections per IP
    # Whitelist (no rate limit for these IPs):
    nginx.ingress.kubernetes.io/limit-whitelist: "10.0.0.0/8,192.168.0.0/16"
```

---

## 11. RBAC for Ingress

Ingress resources are namespaced. To create, update, or view Ingress objects, a ServiceAccount
or user needs appropriate RBAC permissions.[^k8s-rbac]

```yaml
# Role to manage Ingress objects in a namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ingress-manager
  namespace: production
rules:
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses/status"]
  verbs: ["update"]
---
# ClusterRole to read IngressClass (cluster-scoped)
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: ingressclass-reader
rules:
- apiGroups: ["networking.k8s.io"]
  resources: ["ingressclasses"]
  verbs: ["get", "list", "watch"]
```

The Ingress Controller itself typically needs a ClusterRole to watch Ingress, Services,
Endpoints (or EndpointSlices), Secrets, and ConfigMaps across all namespaces:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: ingress-controller
rules:
- apiGroups: [""]
  resources: ["configmaps", "endpoints", "nodes", "pods", "secrets", "namespaces"]
  verbs: ["list", "watch"]
- apiGroups: ["discovery.k8s.io"]
  resources: ["endpointslices"]      # since Kubernetes 1.21
  verbs: ["list", "watch"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses", "ingressclasses"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses/status"]
  verbs: ["update"]
- apiGroups: ["coordination.k8s.io"]
  resources: ["leases"]              # for leader election
  verbs: ["get", "list", "watch", "create", "update"]
```

---

## 12. Troubleshooting

### Checklist

When an Ingress is not working, follow this diagnostic order:

1. **Does the Ingress Controller exist and is it running?**
   ```bash
   kubectl get pods -n ingress-nginx
   kubectl logs -n ingress-nginx deploy/ingress-nginx-controller | tail -50
   ```

2. **Does the Ingress exist and have an IP?**
   ```bash
   kubectl get ingress -A
   # If ADDRESS is empty, the controller has not picked it up.
   ```

3. **Is the IngressClass correct?**
   ```bash
   kubectl get ingressclass
   kubectl describe ingress <name> | grep "Ingress Class"
   ```

4. **Is the backend Service available?**
   ```bash
   kubectl get svc,endpoints -n <namespace>
   # Endpoints must not be empty
   ```

5. **Does DNS resolve to the Ingress IP?**
   ```bash
   nslookup myapp.example.com
   # Should return the Ingress IP from step 2
   ```

6. **Is TLS Secret in the correct namespace?**
   ```bash
   kubectl get secret <secretname> -n <ingress-namespace>
   ```

### Common Issues

**Issue: `ADDRESS` field is empty after creating Ingress**

Causes: no matching IngressClass; controller not running; controller cannot reach the API server.

```bash
# Check controller logs for errors
kubectl logs deploy/ingress-nginx-controller -n ingress-nginx
# Look for: "Error obtaining Endpoints for Service"
```

**Issue: `404 Not Found` from the controller**

No matching rule. Check that `host` exactly matches the HTTP `Host` header (case-sensitive).
Check that `path` and `pathType` are correct. Remember: `Exact /foo` does not match `/foo/`.

**Issue: `502 Bad Gateway`**

The controller cannot reach the backend. Check:
```bash
kubectl get endpoints <service-name> -n <namespace>
# ENDPOINTS must not show "<none>"
kubectl exec -n ingress-nginx deploy/ingress-nginx-controller -- \
  curl -s http://<pod-ip>:<port>/
```

**Issue: TLS certificate shows as incorrect or self-signed**

The Secret may not match the hostname, or the Secret contains only the leaf cert (missing
intermediates). Verify:
```bash
kubectl get secret my-tls-secret -n production -o jsonpath='{.data.tls\.crt}' | \
  base64 -d | openssl x509 -text -noout | grep -E "Subject:|Issuer:|DNS:"
```

**Issue: Annotation not being applied**

Check the controller logs. Many controllers require the Ingress object to be re-synced. Also
verify the annotation key is spelled exactly right (controllers silently ignore unknown annotations).

```bash
kubectl describe ingress <name>
# Annotations section shows what is set
```

### Debugging Commands

```bash
# Test connectivity from inside the cluster
kubectl run test-pod --rm -it --image=nicolaka/netshoot -- bash
# Inside pod:
curl -H "Host: myapp.example.com" http://<ingress-controller-service-ip>/path
curl -k -H "Host: myapp.example.com" https://<ingress-controller-service-ip>/path

# Check NGINX config generated by controller
kubectl exec -n ingress-nginx deploy/ingress-nginx-controller -- cat /etc/nginx/nginx.conf

# Watch controller logs in real time
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -f

# Check events on the Ingress
kubectl describe ingress <name> -n <namespace>
```

---

## 13. Migration: Ingress → Gateway API

### Why Migrate?

- **ingress-nginx retiring March 2026**: No future security or bug fixes.
- **Expressiveness**: Gateway API supports features that require complex annotations with Ingress
  (traffic weighting, header-based routing, gRPC, TLS passthrough) natively in the spec.
- **Role-based model**: Gateway API separates infrastructure (Gateway) from application routing
  (HTTPRoute), enabling better multi-team cluster sharing.
- **No annotations**: All configuration is typed and validated by the API server.
- **Broader adoption**: Gateway API is implemented by 20+ controllers including Cilium, Envoy
  Gateway, Istio, Linkerd, Traefik, NGINX Gateway Fabric, and cloud providers.[^gateway-api-impls]

### Conceptual Mapping

| Ingress concept | Gateway API equivalent |
|---|---|
| `IngressClass` | `GatewayClass` |
| `Ingress` | `Gateway` + `HTTPRoute` |
| `spec.rules[].host` | `HTTPRoute.spec.hostnames[]` |
| `spec.rules[].http.paths[]` | `HTTPRoute.spec.rules[].matches[]` |
| `spec.tls[]` | `Gateway.spec.listeners[].tls` |
| Annotation (rewrite) | `HTTPRoute.spec.rules[].filters[].urlRewrite` |
| Annotation (redirect) | `HTTPRoute.spec.rules[].filters[].requestRedirect` |
| Annotation (canary weight) | `HTTPRoute.spec.rules[].backendRefs[].weight` |
| `defaultBackend` | `HTTPRoute` catch-all rule |

### Simple Migration Example

**Before (Ingress):**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  tls:
  - hosts: [myapp.example.com]
    secretName: my-tls-secret
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /app
        pathType: Prefix
        backend:
          service: { name: my-app-svc, port: { number: 80 } }
```

**After (Gateway API):**

```yaml
# Infrastructure persona creates a Gateway (shared across teams)
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: prod-gateway
  namespace: infra
spec:
  gatewayClassName: cilium            # or envoy-gateway, istio, nginx, etc.
  listeners:
  - name: https
    protocol: HTTPS
    port: 443
    tls:
      mode: Terminate
      certificateRefs:
      - name: my-tls-secret
        namespace: production
    allowedRoutes:
      namespaces:
        from: All
---
# Application persona creates an HTTPRoute (in their own namespace)
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-app
  namespace: production
spec:
  parentRefs:
  - name: prod-gateway
    namespace: infra
    sectionName: https
  hostnames: [myapp.example.com]
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /app
    filters:
    - type: URLRewrite
      urlRewrite:
        path:
          type: ReplacePrefixMatch
          replacePrefixMatch: /
    backendRefs:
    - name: my-app-svc
      port: 80
```

For a complete Gateway API guide, see the companion document
`Kubernetes_GatewayAPI_Complete_Guide.md`.

---

## 14. References

### Kubernetes Official Documentation

[^k8s-ingress]: Kubernetes — Ingress Concepts.
  https://kubernetes.io/docs/concepts/services-networking/ingress/

[^k8s-ingressclass]: Kubernetes — IngressClass.
  https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-class

[^k8s-ingress-deprecated-annotation]: Kubernetes — Deprecated kubernetes.io/ingress.class annotation.
  https://kubernetes.io/docs/concepts/services-networking/ingress/#deprecated-annotation

[^k8s-ingress-pathtypes]: Kubernetes — Ingress Path Types.
  https://kubernetes.io/docs/concepts/services-networking/ingress/#path-types

[^k8s-ingress-tls]: Kubernetes — Ingress TLS.
  https://kubernetes.io/docs/concepts/services-networking/ingress/#tls

[^k8s-ingress-wildcards]: Kubernetes — Ingress Wildcard Hosts.
  https://kubernetes.io/docs/concepts/services-networking/ingress/#hostname-wildcards

[^k8s-deprecated-apis]: Kubernetes — Deprecated API Migration Guide.
  https://kubernetes.io/docs/reference/using-api/deprecation-guide/

[^k8s-rbac]: Kubernetes — Using RBAC Authorization.
  https://kubernetes.io/docs/reference/access-authn-authz/rbac/

### Ingress Controllers

[^ingress-nginx-retirement]: EKS Release Notes — ingress-nginx retirement notice, March 2026.
  https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions-standard.html
  See also: https://kubernetes.github.io/ingress-nginx/

[^nginx-ingress-controller]: F5 NGINX Ingress Controller Documentation (v4.x).
  https://docs.nginx.com/nginx-ingress-controller/

[^nginx-ingress-annotations]: NGINX Ingress Controller — Annotations reference.
  https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/

[^traefik]: Traefik — Kubernetes Ingress Documentation.
  https://doc.traefik.io/traefik/providers/kubernetes-ingress/

[^contour]: Project Contour — Kubernetes Ingress (CNCF).
  https://projectcontour.io/docs/

### Ecosystem

[^cert-manager]: cert-manager — Securing Ingress Resources.
  https://cert-manager.io/docs/usage/ingress/

[^gateway-api-intro]: Kubernetes Gateway API — Introduction.
  https://gateway-api.sigs.k8s.io/

[^gateway-api-tlsroute]: Kubernetes Gateway API — TLSRoute (Experimental).
  https://gateway-api.sigs.k8s.io/reference/spec/#gateway.networking.k8s.io/v1alpha2.TLSRoute

[^gateway-api-impls]: Kubernetes Gateway API — Implementations.
  https://gateway-api.sigs.k8s.io/implementations/

### Further Reading

- Kubernetes SIG Network: https://github.com/kubernetes/community/tree/master/sig-network
- Ingress NGINX GitHub (community, retiring): https://github.com/kubernetes/ingress-nginx
- Gateway API GitHub: https://github.com/kubernetes-sigs/gateway-api

---

*Kubernetes Ingress Complete Guide — v1.0 — February 2026 — Based on Kubernetes 1.32 / networking.k8s.io/v1*
