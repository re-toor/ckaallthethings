# Kubernetes Gateway API: CKA Step-by-Step Practice Guide

> **Version:** v1.0 — February 2026  
> **Based on:** Gateway API v1.4.1 (Standard Channel) / CKA Curriculum v1.31+
>
> ⚠️ **Exam Note:** Gateway API is appearing in CKA exams as Kubernetes clusters running 1.31+
> ship with Gateway API CRDs installed in many environments. The CKA curriculum explicitly
> includes "Use Ingress controllers and Ingress resources" — and Gateway API is the next
> generation of Ingress. Know both. This guide focuses on the exam-relevant standard channel
> resources.

---

## Table of Contents

1. [CKA Exam Coverage](#1-cka-exam-coverage)
2. [Quick Reference Card](#2-quick-reference-card)
3. [Task 1: Install Gateway API CRDs](#task-1-install-gateway-api-crds)
4. [Task 2: Verify a GatewayClass](#task-2-verify-a-gatewayclass)
5. [Task 3: Create a Gateway with HTTP and HTTPS Listeners](#task-3-create-a-gateway-with-http-and-https-listeners)
6. [Task 4: Create a Basic HTTPRoute](#task-4-create-a-basic-httproute)
7. [Task 5: Traffic Splitting (Canary Deployment)](#task-5-traffic-splitting-canary-deployment)
8. [Task 6: HTTP → HTTPS Redirect](#task-6-http--https-redirect)
9. [Task 7: URL Rewrite and Header Modification](#task-7-url-rewrite-and-header-modification)
10. [Task 8: Cross-Namespace Routing with ReferenceGrant](#task-8-cross-namespace-routing-with-referencegrant)
11. [Task 9: GRPCRoute](#task-9-grpcroute)
12. [Task 10: Debug a Broken HTTPRoute](#task-10-debug-a-broken-httproute)
13. [Exam Tips and Traps](#exam-tips-and-traps)
14. [References](#references)

---

## 1. CKA Exam Coverage

Gateway API is covered under the **Services & Networking** domain (~20% of the CKA exam).
Specifically, you should be able to:[^cka-curriculum]

- Explain the Gateway API resource model (GatewayClass → Gateway → Route)
- Create and configure Gateway resources with listeners
- Create HTTPRoute resources that attach to Gateways
- Configure TLS on Gateway listeners
- Set up cross-namespace routing using ReferenceGrant
- Diagnose and fix broken Gateway API configurations using status conditions

### What You Need to Know

The exam may present a working GatewayClass (the controller is already installed). You then
create Gateways and Routes. The main resources to know are:

1. **GatewayClass** — cluster-scoped; read/inspect but rarely create on exam
2. **Gateway** — namespaced; you will create and configure these
3. **HTTPRoute** — namespaced; most common task
4. **ReferenceGrant** — namespaced; needed for cross-namespace patterns
5. **Status conditions** — critical for debugging

---

## 2. Quick Reference Card

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                  GATEWAY API QUICK REFERENCE                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  API Group:    gateway.networking.k8s.io                                  ║
║  Install CRDs: kubectl apply --server-side -f <standard-install.yaml>     ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  RESOURCE HIERARCHY                                                       ║
║  GatewayClass (cluster) → Gateway (ns) → HTTPRoute (ns)                   ║
║                                                                           ║
║  Persona mapping:                                                         ║
║  Infrastructure provider → GatewayClass                                   ║
║  Cluster operator        → Gateway                                        ║
║  App developer           → HTTPRoute / GRPCRoute                          ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  LISTENER PROTOCOLS                                                       ║
║  HTTP  80    No TLS                                                       ║
║  HTTPS 443   Terminate  (requires tls.certificateRefs)                    ║
║  TLS   any   Passthrough (experimental; no cert needed)                   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  HTTPROUTE MATCH TYPES                                                    ║
║  PathPrefix / Exact / RegularExpression                                   ║
║  headers, method, queryParams                                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  HTTPROUTE FILTER TYPES (CORE)                                            ║
║  RequestHeaderModifier   add/set/remove request headers                   ║
║  ResponseHeaderModifier  add/set/remove response headers                  ║
║  RequestRedirect         HTTP redirect (scheme/host/path/status)          ║
║  URLRewrite              rewrite URL before forwarding (Extended)         ║
║  RequestMirror           copy traffic to mirror backend (Extended)        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  STATUS CONDITIONS TO KNOW                                                ║
║  Gateway:   Accepted | Programmed | ResolvedRefs                          ║
║  HTTPRoute: Accepted | ResolvedRefs (per parent)                          ║
║  Reasons:   NoMatchingParent | NotAllowedByListeners | RefNotPermitted    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  REFERENCEGRANT RULE                                                      ║
║  Grant must be in the TARGET namespace (where the referenced object lives)║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## Task 1: Install Gateway API CRDs

**Scenario:** A fresh cluster is running but Gateway API CRDs are not installed. Install the
Standard channel CRDs.

### Step 1 — Check if already installed

```bash
kubectl get crd | grep gateway.networking.k8s.io
# If no output → CRDs are not installed
# If you see gatewayclasses.gateway.networking.k8s.io → already installed
```

### Step 2 — Install

```bash
# Standard channel — use --server-side to avoid annotation size limits
kubectl apply --server-side -f \
  https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.1/standard-install.yaml
```

### Step 3 — Verify

```bash
kubectl get crd | grep gateway
# backendtlspolicies.gateway.networking.k8s.io   True
# gatewayclasses.gateway.networking.k8s.io        True
# gateways.gateway.networking.k8s.io              True
# grpcroutes.gateway.networking.k8s.io            True
# httproutes.gateway.networking.k8s.io            True
# referencegrants.gateway.networking.k8s.io       True
```

> **Exam tip:** On the exam, use `--server-side` with `kubectl apply` for Gateway API CRDs.
> Without it you may hit "metadata.annotations: Too long" errors for large CRD schemas.[^gateway-api-install]

---

## Task 2: Verify a GatewayClass

**Scenario:** A controller has been installed. Find the GatewayClass name and confirm it is
accepted.

```bash
# List all GatewayClasses
kubectl get gatewayclass
# NAME      CONTROLLER                       ACCEPTED   AGE
# cilium    io.cilium/gateway-controller     True       20m

# Inspect the status
kubectl describe gatewayclass cilium
# Status:
#   Conditions:
#     Type: Accepted
#     Status: True
#     Reason: Accepted
#     Message: Accepted GatewayClass

# Get the controller name (you need this to create Gateways)
kubectl get gatewayclass cilium -o jsonpath='{.spec.controllerName}'
# io.cilium/gateway-controller
```

> **Exam tip:** If `Accepted: False`, the controller is not running or the `controllerName` in
> the GatewayClass does not match what the installed controller expects. Check controller pods:
> `kubectl get pods -A | grep -i gateway`

---

## Task 3: Create a Gateway with HTTP and HTTPS Listeners

**Scenario:** Create a Gateway named `prod-gw` in namespace `infra` using GatewayClass `cilium`.
Configure two listeners: HTTP on port 80 and HTTPS on port 443. A TLS Secret `prod-tls-secret`
already exists in namespace `infra`. Allow routes from any namespace.

### Step 1 — Create the Gateway

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: prod-gw
  namespace: infra
spec:
  gatewayClassName: cilium
  listeners:
  - name: http
    protocol: HTTP
    port: 80
    allowedRoutes:
      namespaces:
        from: All
  - name: https
    protocol: HTTPS
    port: 443
    tls:
      mode: Terminate
      certificateRefs:
      - kind: Secret
        group: ""
        name: prod-tls-secret
    allowedRoutes:
      namespaces:
        from: All
EOF
```

### Step 2 — Wait for the Gateway to be programmed

```bash
kubectl get gateway prod-gw -n infra -w
# NAME      CLASS    ADDRESS         PROGRAMMED   AGE
# prod-gw   cilium   203.0.113.10    True         45s
```

### Step 3 — Inspect status for issues

```bash
kubectl describe gateway prod-gw -n infra
# Look for:
# Conditions:
#   Accepted: True → Gateway is valid
#   Programmed: True → LB is ready
#   ResolvedRefs: True → TLS Secret found and valid
#
# Listeners:
#   http (port 80):  Programmed: True
#   https (port 443): Programmed: True

# If ResolvedRefs: False, check Secret:
kubectl get secret prod-tls-secret -n infra
```

> **Exam traps:**
> 1. TLS Secret must be in the **same namespace as the Gateway** (or permitted via
>    ReferenceGrant in the Secret's namespace).
> 2. The `certificateRefs[].group` field must be `""` (empty string) for core Kubernetes
>    Secrets. Omitting `group` is different from setting it to `""`.
> 3. `listener.name` is used in HTTPRoute's `parentRefs[].sectionName` to attach to a specific
>    listener. Names must be unique within a Gateway.

---

## Task 4: Create a Basic HTTPRoute

**Scenario:** Create an HTTPRoute named `app-route` in namespace `production`. Route traffic
from `myapp.example.com` (all paths) to Service `app-svc` on port 80. Attach to the `https`
listener of the `prod-gw` Gateway in the `infra` namespace.

### Step 1 — Create the HTTPRoute

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: app-route
  namespace: production
spec:
  parentRefs:
  - name: prod-gw
    namespace: infra             # Gateway is in a different namespace
    sectionName: https           # attach to the "https" listener specifically
  hostnames:
  - myapp.example.com
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: app-svc
      port: 80
EOF
```

### Step 2 — Verify the route is accepted

```bash
kubectl describe httproute app-route -n production
# Status:
#   Parents:
#   - ParentRef: prod-gw (infra/Gateway)
#     Conditions:
#     - Type: Accepted
#       Status: "True"
#       Reason: Accepted
#     - Type: ResolvedRefs
#       Status: "True"
#       Reason: ResolvedRefs
```

### Step 3 — Test connectivity

```bash
# Get Gateway IP
GW_IP=$(kubectl get gateway prod-gw -n infra -o jsonpath='{.status.addresses[0].value}')
echo $GW_IP

# Test from inside the cluster
kubectl run test --rm -it --image=nicolaka/netshoot -- bash
# Inside:
curl -k -H "Host: myapp.example.com" https://$GW_IP/
```

> **Exam tip:** The `parentRefs[].namespace` field is required when the HTTPRoute and Gateway
> are in different namespaces. If omitted, it defaults to the Route's own namespace. A missing
> namespace here is a common source of `NoMatchingParent` errors.

---

## Task 5: Traffic Splitting (Canary Deployment)

**Scenario:** You have two versions of a service running: `app-stable-svc:80` (90% weight) and
`app-canary-svc:80` (10% weight). Create an HTTPRoute that splits traffic between them.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: canary-route
  namespace: production
spec:
  parentRefs:
  - name: prod-gw
    namespace: infra
    sectionName: https
  hostnames:
  - api.example.com
  rules:
  - backendRefs:
    - name: app-stable-svc
      port: 80
      weight: 90                 # 90% of matching requests
    - name: app-canary-svc
      port: 80
      weight: 10                 # 10% of matching requests
EOF
```

### Verify traffic weights

```bash
kubectl describe httproute canary-route -n production | grep -A 20 "Rules:"
# Rules:
#   Backend Refs:
#     Weight: 90  Name: app-stable-svc Port: 80
#     Weight: 10  Name: app-canary-svc Port: 80
```

### Gradually shift traffic (complete rollout)

```bash
# Update to 50/50 split
kubectl patch httproute canary-route -n production --type='json' \
  -p='[
    {"op":"replace","path":"/spec/rules/0/backendRefs/0/weight","value":50},
    {"op":"replace","path":"/spec/rules/0/backendRefs/1/weight","value":50}
  ]'

# Move 100% to canary (complete the rollout)
kubectl patch httproute canary-route -n production --type='json' \
  -p='[
    {"op":"replace","path":"/spec/rules/0/backendRefs/0/weight","value":0},
    {"op":"replace","path":"/spec/rules/0/backendRefs/1/weight","value":100}
  ]'
```

> **Exam tip:** Weights are relative (not percentages). `weight: 1` and `weight: 1` means 50/50
> — they don't need to sum to 100. `weight: 0` means the backend receives no traffic but is
> still listed in the resource.

---

## Task 6: HTTP → HTTPS Redirect

**Scenario:** Create an HTTPRoute that redirects all HTTP traffic on `www.example.com` to HTTPS
with a 301 redirect. A Gateway `prod-gw` in `infra` has both HTTP (port 80) and HTTPS (port 443)
listeners.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: https-redirect
  namespace: production
spec:
  parentRefs:
  - name: prod-gw
    namespace: infra
    sectionName: http            # attach to HTTP listener only
  hostnames:
  - www.example.com
  rules:
  - filters:
    - type: RequestRedirect
      requestRedirect:
        scheme: https
        statusCode: 301          # 301 Permanent, 302 Temporary, 307, 308
    # Note: NO backendRefs — redirect rules don't forward to a backend
EOF
```

### Test the redirect

```bash
GW_IP=$(kubectl get gateway prod-gw -n infra -o jsonpath='{.status.addresses[0].value}')

# Should return 301 with Location: https://www.example.com/
curl -v -H "Host: www.example.com" http://$GW_IP/some/path
# < HTTP/1.1 301 Moved Permanently
# < Location: https://www.example.com/some/path
```

> **Exam traps:**
> 1. The redirect HTTPRoute should attach to the **HTTP listener** (`sectionName: http`), not
>    the HTTPS listener. Attaching to the HTTPS listener for a redirect means the redirect fires
>    after TLS termination — not the intended behavior for HTTP→HTTPS.
> 2. Redirect rules do **not** use `backendRefs`. Including a `backendRef` in a redirect rule
>    is an error in most implementations.

---

## Task 7: URL Rewrite and Header Modification

**Scenario:** Create an HTTPRoute that:
1. Rewrites requests to `/app/v1/*` so the prefix `/app/v1` is replaced with `/v1` before
   forwarding to `app-svc:8080`.
2. Adds a request header `X-Forwarded-By: gateway` before forwarding.
3. Adds a response header `X-Frame-Options: DENY`.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: rewrite-route
  namespace: production
spec:
  parentRefs:
  - name: prod-gw
    namespace: infra
    sectionName: https
  hostnames:
  - myapp.example.com
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /app/v1
    filters:
    # URLRewrite (Extended feature): rewrite the path prefix
    - type: URLRewrite
      urlRewrite:
        path:
          type: ReplacePrefixMatch
          replacePrefixMatch: /v1    # /app/v1/users → /v1/users
    # RequestHeaderModifier (Core): add header before forwarding to backend
    - type: RequestHeaderModifier
      requestHeaderModifier:
        add:
        - name: X-Forwarded-By
          value: gateway
    # ResponseHeaderModifier (Extended): add header to backend response
    - type: ResponseHeaderModifier
      responseHeaderModifier:
        set:
        - name: X-Frame-Options
          value: DENY
    backendRefs:
    - name: app-svc
      port: 8080
EOF
```

### Test the rewrite

```bash
GW_IP=$(kubectl get gateway prod-gw -n infra -o jsonpath='{.status.addresses[0].value}')

# Request to /app/v1/users should reach backend as /v1/users
curl -k -v -H "Host: myapp.example.com" https://$GW_IP/app/v1/users
# X-Frame-Options: DENY should appear in the response headers
```

> **Exam tip:** `URLRewrite` and `ResponseHeaderModifier` are **Extended** features — they are
> optional for implementations to support. On the exam, if the task involves these, the cluster
> will have an implementation that supports them. Use `kubectl describe httproute` to check if
> the filter is unsupported:
> ```bash
> # Look for filter-related conditions in Route status
> kubectl describe httproute rewrite-route -n production | grep -i "filter\|unsupported"
> ```

---

## Task 8: Cross-Namespace Routing with ReferenceGrant

**Scenario:** An HTTPRoute in namespace `frontend` needs to reference a Gateway in namespace
`infra` AND a Service in namespace `backend`. Set up the required ReferenceGrants and
create the HTTPRoute.

### Step 1 — Understand what grants are needed

- HTTPRoute (in `frontend`) → Gateway (in `infra`): **Not needed** — controlled by Gateway's
  `allowedRoutes`. The Gateway must have `from: All` or a selector that includes `frontend`.

- HTTPRoute (in `frontend`) → Service (in `backend`): **ReferenceGrant required** — must be
  created in `backend` namespace.

### Step 2 — Create the ReferenceGrant in the backend namespace

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-frontend-to-backend
  namespace: backend               # ← the namespace that OWNS the Service
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: HTTPRoute
    namespace: frontend            # ← allow HTTPRoutes from this namespace
  to:
  - group: ""
    kind: Service                  # ← allow references to Services
    # name: api-svc               # optionally restrict to a specific Service name
EOF
```

### Step 3 — Create the HTTPRoute

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: cross-ns-route
  namespace: frontend
spec:
  parentRefs:
  - name: prod-gw
    namespace: infra               # cross-namespace Gateway ref (allowed by allowedRoutes)
    sectionName: https
  hostnames:
  - shop.example.com
  rules:
  - backendRefs:
    - name: api-svc
      namespace: backend           # cross-namespace Service ref (requires ReferenceGrant)
      port: 8080
EOF
```

### Step 4 — Verify

```bash
kubectl describe httproute cross-ns-route -n frontend
# Status.Parents[].Conditions:
# - Type: Accepted
#   Status: "True"
# - Type: ResolvedRefs
#   Status: "True"    ← If this is False with reason "RefNotPermitted",
#                        the ReferenceGrant is missing or misconfigured

# Also verify the ReferenceGrant exists:
kubectl get referencegrant -n backend
```

> **Exam traps:**
> 1. ReferenceGrant must be in the **target namespace** (the namespace of the object being
>    referenced), not the source namespace. A common exam mistake is creating the grant in
>    the HTTPRoute's namespace.
> 2. The `spec.to[].group` field for Kubernetes Services must be `""` (empty string) —
>    Services are in the core API group, not `apps` or any other group.
> 3. Gateway-to-Route attachment uses `allowedRoutes`, not ReferenceGrant. Only object-level
>    references (Service, Secret) need a ReferenceGrant.

---

## Task 9: GRPCRoute

**Scenario:** Create a GRPCRoute named `user-grpc-route` in namespace `grpc-apps` that routes
calls to the `com.example.UserService.GetUser` method to `user-svc:50051`, and all other methods
of `com.example.UserService` to `user-svc-default:50051`. The Gateway `grpc-gw` in namespace
`infra` has a listener named `grpc` on port 50051 with HTTPS protocol.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1
kind: GRPCRoute
metadata:
  name: user-grpc-route
  namespace: grpc-apps
spec:
  parentRefs:
  - name: grpc-gw
    namespace: infra
    sectionName: grpc
  hostnames:
  - grpc.example.com
  rules:
  # ── Specific method match (higher precedence) ──────────────────────────────
  - matches:
    - method:
        type: Exact
        service: com.example.UserService
        method: GetUser
    backendRefs:
    - name: user-svc
      port: 50051

  # ── All methods of the service (lower precedence) ─────────────────────────
  - matches:
    - method:
        type: Exact
        service: com.example.UserService
        # no method: field → matches ALL methods of this service
    backendRefs:
    - name: user-svc-default
      port: 50051
EOF
```

### Verify

```bash
kubectl describe grpcroute user-grpc-route -n grpc-apps
# Status:
#   Parents:
#   - ParentRef: grpc-gw (infra/Gateway)
#     Conditions:
#     - Type: Accepted, Status: "True"
#     - Type: ResolvedRefs, Status: "True"
```

> **Exam tips:**
> 1. GRPCRoute is a `gateway.networking.k8s.io/v1` resource (same group as HTTPRoute, not
>    alpha). The `spec` field is required (it cannot be omitted, even if empty).[^grpcroute-spec]
> 2. gRPC requires HTTP/2. The Gateway listener must use `protocol: HTTPS` or `protocol: HTTP`
>    with HTTP/2 support. Most implementations require HTTPS for gRPC.
> 3. GRPCRoute and HTTPRoute cannot share the same hostname on the same listener.

---

## Task 10: Debug a Broken HTTPRoute

**Scenario:** An HTTPRoute `my-route` in namespace `apps` is configured but traffic is not
being routed. Diagnose and fix the issue.

### Systematic Debugging

```bash
# Step 1: Check the HTTPRoute status — this is the MOST IMPORTANT starting point
kubectl describe httproute my-route -n apps
# Look at the "Status" section carefully:
# - Parents: should list the Gateway you're expecting
# - If empty: Route hasn't attached to any Gateway
# - Conditions on the parent:
#   * Accepted: True/False → is route valid and attached?
#   * ResolvedRefs: True/False → are backend Services and other refs valid?
#   * Reason: gives specific error

# Step 2: Interpret common conditions
# ── NoMatchingParent ──
# The parentRef name/namespace/sectionName doesn't match any Gateway listener.
# Fix: check parentRefs.name, parentRefs.namespace, and parentRefs.sectionName
kubectl get gateway -A | grep <name>

# ── NotAllowedByListeners ──
# The Gateway's allowedRoutes doesn't permit routes from this namespace.
# Fix: check Gateway's spec.listeners[].allowedRoutes
kubectl get gateway <n> -n <ns> -o jsonpath='{.spec.listeners[*].allowedRoutes}'

# ── RefNotPermitted ──
# A cross-namespace reference (Service or Secret) is missing a ReferenceGrant.
# Fix: create ReferenceGrant in the target namespace
kubectl get referencegrant -A

# ── BackendNotFound ──
# The Service named in backendRef doesn't exist in the Route's namespace (or specified namespace).
# Fix: check Service exists with correct name and port
kubectl get svc <name> -n <namespace>

# ── HostnameConflict ──
# Another Route has already claimed the same hostname on the same listener.
kubectl get httproute -A | grep <hostname>
```

### Quick Fix Patterns

```bash
# Fix 1: Wrong sectionName
kubectl edit httproute my-route -n apps
# Change: sectionName: wrong-name → sectionName: https
# Get available listener names:
kubectl get gateway prod-gw -n infra -o jsonpath='{.spec.listeners[*].name}'

# Fix 2: Gateway namespace missing in parentRef
kubectl patch httproute my-route -n apps --type='json' \
  -p='[{"op":"add","path":"/spec/parentRefs/0/namespace","value":"infra"}]'

# Fix 3: Service not found — check correct name and namespace
kubectl get svc -n apps | grep app
kubectl edit httproute my-route -n apps
# Fix the backendRef.name or add the correct namespace with a ReferenceGrant

# Fix 4: Wrong port
kubectl get svc app-svc -n apps -o jsonpath='{.spec.ports[*].port}'
kubectl edit httproute my-route -n apps
# Fix port number in backendRef

# Fix 5: Gateway Programmed: False (TLS Secret issue)
kubectl describe gateway prod-gw -n infra | grep -A5 "Programmed"
kubectl get secret <tls-secret-name> -n infra
```

### Verification After Fix

```bash
# Watch for status to update (may take a few seconds)
kubectl get httproute my-route -n apps -w

# Final confirmation test
GW_IP=$(kubectl get gateway prod-gw -n infra -o jsonpath='{.status.addresses[0].value}')
kubectl run test --rm -it --image=nicolaka/netshoot -- \
  curl -sk -H "Host: myapp.example.com" https://$GW_IP/
```

---

## Exam Tips and Traps

### ✅ Do These

**Learn the status conditions by heart.** The exam will test your ability to read `kubectl describe`
output and identify the problem from the conditions. The table below is critical:

| Condition | Meaning | Common Fix |
|---|---|---|
| `NoMatchingParent` | parentRef doesn't match a listener | Fix name/namespace/sectionName |
| `NotAllowedByListeners` | Gateway's allowedRoutes rejects this namespace | Update Gateway allowedRoutes |
| `RefNotPermitted` | Missing ReferenceGrant for cross-ns ref | Create ReferenceGrant in target ns |
| `BackendNotFound` | Service doesn't exist | Check Service name and namespace |
| `HostnameConflict` | Another Route owns this hostname | Different hostname or remove conflict |

**Use `kubectl explain` for field discovery:**
```bash
kubectl explain httproute.spec.rules.filters
kubectl explain httproute.spec.parentRefs
kubectl explain gateway.spec.listeners.tls
kubectl explain referencegrant.spec
```

**Use the Kubernetes docs on the exam.** Search for "gateway api" to find example YAMLs.
Copy and edit rather than writing from memory. The official docs at
https://kubernetes.io/docs/ include Gateway API content.

### ❌ Avoid These Traps

1. **ReferenceGrant in the wrong namespace.** It must be in the **target** namespace (where the
   referenced Service or Secret lives), not in the HTTPRoute's namespace.[^gateway-api-referencegrant]

2. **Missing `namespace` in `parentRefs`.** If the HTTPRoute and Gateway are in different
   namespaces, you MUST specify `parentRefs[].namespace`. Omitting it defaults to the Route's
   own namespace, causing `NoMatchingParent`.

3. **Wrong `group` in `certificateRefs` or ReferenceGrant `to`.** For Kubernetes core objects
   (Secret, Service), the group must be `""` (empty string), not `"v1"` or `"core"`.

4. **Attaching to `HTTP` listener with HTTPS scheme in parentRef.** Routes for HTTPS traffic
   must attach to an `HTTPS` listener. A Route attached to an `HTTP` listener cannot serve TLS.

5. **GRPCRoute with omitted `spec` field.** Since v1.4, the `spec` field is required and will
   fail validation if absent.[^grpcroute-spec]

6. **Redirect rule with backendRefs.** A redirect filter does not forward to a backend. Including
   `backendRefs` in a redirect rule is technically allowed but confusing — the redirect fires
   before the backend is contacted.

7. **Forgetting that `allowedRoutes` on Gateway controls Route attachment** (not ReferenceGrant).
   Always check `allowedRoutes.namespaces` if a Route isn't attaching.

### Time-Saving Patterns

```bash
# Quick status check for all routes in a namespace
kubectl get httproute -n apps
kubectl describe httproute -n apps | grep -E "(Name:|Accepted|ResolvedRefs|Reason)"

# Find the Gateway IP quickly
kubectl get gateway -A

# Get all listener names for a Gateway
kubectl get gateway prod-gw -n infra -o jsonpath='{range .spec.listeners[*]}{.name}{"\n"}{end}'

# Quickly check if a ReferenceGrant is needed (look for RefNotPermitted)
kubectl describe httproute <n> -n <ns> | grep "RefNotPermitted"

# Skeleton HTTPRoute to copy-edit
cat <<'EOF'
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: CHANGEME
  namespace: CHANGEME
spec:
  parentRefs:
  - name: CHANGEME
    namespace: CHANGEME
    sectionName: CHANGEME
  hostnames:
  - CHANGEME.example.com
  rules:
  - backendRefs:
    - name: CHANGEME
      port: 80
EOF
```

---

## References

[^cka-curriculum]: CNCF — CKA Curriculum v1.31.
  https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.31.pdf

[^gateway-api-install]: Kubernetes Gateway API — Getting Started.
  https://gateway-api.sigs.k8s.io/guides/

[^gateway-api-referencegrant]: Kubernetes Gateway API — ReferenceGrant.
  https://gateway-api.sigs.k8s.io/api-types/referencegrant/

[^grpcroute-spec]: Kubernetes Gateway API v1.4 — GRPCRoute spec field now required.
  https://kubernetes.io/blog/2025/11/06/gateway-api-v1-4/

[^gateway-api-versioning]: Kubernetes Gateway API — Versioning and Channels.
  https://gateway-api.sigs.k8s.io/concepts/versioning/

[^gateway-api-overview]: Kubernetes Gateway API — API Overview.
  https://gateway-api.sigs.k8s.io/concepts/api-overview/

[^k8s-ingress]: Kubernetes — Ingress Concepts.
  https://kubernetes.io/docs/concepts/services-networking/ingress/

---

*CKA Gateway API Practice Guide — v1.0 — February 2026 — Gateway API v1.4.1 Standard Channel / CKA Curriculum v1.31+*
