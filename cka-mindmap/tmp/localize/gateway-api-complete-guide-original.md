# Kubernetes Gateway API: Complete Guide

> **Version:** v1.0 — February 2026  
> **Based on:** Gateway API v1.4.1 (Standard Channel) / Kubernetes 1.32+  
> **Install:** `kubectl apply --server-side -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.1/standard-install.yaml`

---

## Table of Contents

1. [What Is Gateway API?](#1-what-is-gateway-api)
2. [Design Philosophy and Role Model](#2-design-philosophy-and-role-model)
3. [Resource Overview](#3-resource-overview)
4. [Standard vs Experimental Channels](#4-standard-vs-experimental-channels)
5. [Installation](#5-installation)
6. [GatewayClass](#6-gatewayclass)
7. [Gateway](#7-gateway)
8. [HTTPRoute](#8-httproute)
9. [GRPCRoute](#9-grpcroute)
10. [ReferenceGrant](#10-referencegrant)
11. [BackendTLSPolicy](#11-backendtlspolicy)
12. [TLS Configuration Patterns](#12-tls-configuration-patterns)
13. [Traffic Management](#13-traffic-management)
14. [Cross-Namespace Routing](#14-cross-namespace-routing)
15. [Service Mesh (GAMMA)](#15-service-mesh-gamma)
16. [Implementations](#16-implementations)
17. [Policy Attachment](#17-policy-attachment)
18. [Migration from Ingress](#18-migration-from-ingress)
19. [Troubleshooting](#19-troubleshooting)
20. [References](#20-references)

---

## 1. What Is Gateway API?

**Gateway API** is an official Kubernetes project (`kubernetes-sigs/gateway-api`) focused on
L4 and L7 routing. It is the successor to the Ingress API, designed from the ground up to solve
Ingress's fundamental limitations.[^gateway-api-intro]

### Problems with Ingress

The Ingress API has been in production since Kubernetes 1.1. Despite wide adoption, it has
accumulated significant technical debt:

**Limited expressiveness:** Core routing features like traffic weighting, header-based routing,
request mirroring, and timeouts are not part of the spec. All controllers implement them via
vendor-specific annotations — and these annotations are not portable.

**No role separation:** Ingress conflates infrastructure concerns (which load balancer handles
this?) with application concerns (which service does this path reach?). A developer creating an
Ingress needs cluster-level permissions to reference IngressClasses.

**L7 HTTP only:** Ingress has no concept of gRPC, TCP, TLS passthrough, or UDP routing.

**Shared configuration problem:** An Ingress object cannot share configuration fragments with
other Ingress objects. Every team must duplicate TLS, auth, and timeout settings.

### Gateway API Improvements

Gateway API addresses all of the above with a new resource model that is:

**Role-oriented:** Three distinct resources map to three organizational personas: infrastructure
providers manage GatewayClass, cluster operators manage Gateway, and application developers
manage Routes. Each persona controls only their layer.

**Expressive:** Traffic weighting, header matching and modification, URL rewrite, request
redirect, mirroring, and gRPC routing are first-class spec fields — not annotations.

**Portable:** Any conformant implementation supports the same Standard channel resources.
Extension points exist for vendor-specific features, but core behavior is consistent.

**Protocol-aware:** HTTPRoute for HTTP/HTTPS, GRPCRoute for gRPC, TLSRoute for TLS passthrough
(experimental), TCPRoute and UDPRoute for L4 (experimental).

**Dual-purpose:** The same API models both North-South (ingress) and East-West (service mesh)
traffic. The GAMMA initiative extends Gateway API to service mesh use cases.

### Version and Stability

Gateway API is **not** built into Kubernetes. It is installed as CRDs from the
`kubernetes-sigs/gateway-api` project. As of February 2026:

| Release | Date | Standard Channel Additions |
|---|---|---|
| v1.0 | Oct 2023 | GatewayClass, Gateway, HTTPRoute → GA (v1) |
| v1.1 | May 2024 | GRPCRoute → GA; service mesh (GAMMA) |
| v1.2 | Nov 2024 | WebSockets, Timeouts, Retries (HTTPRoute) |
| v1.3 | Apr 2025 | RequestMirror filter (request mirroring) |
| **v1.4** | **Oct 2025** | **BackendTLSPolicy → Standard; GRPCRoute spec.required; rule names** |
| v1.4.1 | Latest patch | Minor fixes (use this install URL) |

**Minimum Kubernetes version:** 1.26 for any v1.x Gateway API release.[^gateway-api-versioning]

---

## 2. Design Philosophy and Role Model

Gateway API is built around three organizational personas:[^gateway-api-overview]

```
┌─────────────────────────────────────────────────────────────────┐
│ PERSONA: Infrastructure Provider (Ian)                          │
│ Resource: GatewayClass                                          │
│ Scope: Cluster-wide                                             │
│ Task: Define available load balancer implementations            │
└─────────────────────────┬───────────────────────────────────────┘
                          │ references
┌─────────────────────────▼───────────────────────────────────────┐
│ PERSONA: Cluster Operator (Chihiro)                             │
│ Resource: Gateway                                               │
│ Scope: Usually one namespace per gateway (e.g., "infra")        │
│ Task: Create and configure gateway instances; set TLS; control  │
│       which namespaces can attach routes                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │ attaches via parentRefs
┌─────────────────────────▼───────────────────────────────────────┐
│ PERSONA: Application Developer (Ana)                            │
│ Resources: HTTPRoute, GRPCRoute, ReferenceGrant, etc.           │
│ Scope: Their own application namespace(s)                       │
│ Task: Define routing rules for their services                   │
│       No cluster-level permissions needed                       │
└─────────────────────────────────────────────────────────────────┘
```

This separation has practical consequences:

- Application teams can create and modify Routes without touching Gateways.
- The cluster operator controls which namespaces can attach Routes to a Gateway.
- Multiple teams can share a single Gateway (single cloud load balancer) without coordination.
- Infrastructure changes (swapping from NGINX to Envoy) do not require application teams to
  touch their HTTPRoutes.

---

## 3. Resource Overview

### Standard Channel Resources (GA — v1.4.1)

| Resource | API Version | Scope | Purpose |
|---|---|---|---|
| `GatewayClass` | `gateway.networking.k8s.io/v1` | Cluster | Defines a LB implementation |
| `Gateway` | `gateway.networking.k8s.io/v1` | Namespace | Requests an LB instance |
| `HTTPRoute` | `gateway.networking.k8s.io/v1` | Namespace | HTTP/HTTPS routing rules |
| `GRPCRoute` | `gateway.networking.k8s.io/v1` | Namespace | gRPC routing rules |
| `ReferenceGrant` | `gateway.networking.k8s.io/v1beta1` | Namespace | Cross-namespace trust |
| `BackendTLSPolicy` | `gateway.networking.k8s.io/v1` | Namespace | TLS to backends |

### Experimental Channel Resources

| Resource | API Version | Purpose |
|---|---|---|
| `TCPRoute` | `v1alpha2` | Raw TCP routing |
| `TLSRoute` | `v1alpha2` | TLS passthrough |
| `UDPRoute` | `v1alpha2` | UDP routing |
| `XListenerSet` | `v1alpha2` | Shared listener sets (v1.3+) |
| `Mesh` resource | `v1alpha2` | Mesh-wide config (v1.4+) |

Experimental resources have **no backwards compatibility guarantees** and may change or be removed
between releases. Do not use them in production without verifying your implementation's support
and commitment to the version you need.[^gateway-api-versioning]

---

## 4. Standard vs Experimental Channels

Gateway API uses a two-channel stability model:

**Standard Channel:** Contains only GA (`v1`) and beta (`v1beta1`) resources. Fully backwards
compatible within a channel version. Safe for production. This is what the standard-install.yaml
installs.

**Experimental Channel:** Contains everything in Standard plus experimental resources and fields.
New features enter here first. Breaking changes can occur at any time. Use in non-production for
evaluation.

```bash
# Standard Channel install (recommended for production)
kubectl apply --server-side -f \
  https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.1/standard-install.yaml

# Experimental Channel install (for testing experimental features)
kubectl apply --server-side -f \
  https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.1/experimental-install.yaml
# Note: experimental CRDs may be too large for regular kubectl apply.
# Use --server-side to avoid "metadata.annotations: Too long" errors.
```

### Guardrails VAP (v1.4+)

Gateway API v1.4 introduced Validating Admission Policies that enforce channel boundaries:

- **Upgrade VAP:** Prevents accidentally applying experimental CRDs over standard CRDs.
- **Guardrails VAP:** Prevents setting experimental fields on a resource unless the
  `gateway.networking.k8s.io/unsafe-enable-cors-api: "true"` (or similar) annotation is present.

This means you can install Standard channel CRDs and safely trust that experimental fields are
rejected by the API server rather than silently ignored.[^gateway-api-versioning]

---

## 5. Installation

### Prerequisites

- Kubernetes 1.26+ cluster
- `kubectl` with cluster-admin access (needed to apply CRDs)
- A Gateway API implementation (controller) installed — see Section 16

### Install CRDs

```bash
# Standard Channel (production-safe)
kubectl apply --server-side -f \
  https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.1/standard-install.yaml

# Verify CRDs are installed
kubectl get crd | grep gateway.networking.k8s.io
# NAME                                        ESTABLISHED
# backendtlspolicies.gateway.networking.k8s.io    True
# gatewayclasses.gateway.networking.k8s.io         True
# gateways.gateway.networking.k8s.io               True
# grpcroutes.gateway.networking.k8s.io             True
# httproutes.gateway.networking.k8s.io             True
# referencegrants.gateway.networking.k8s.io        True
```

### Install a Controller

The CRDs alone do nothing. You need a Gateway API implementation (controller). Choose based on
your environment:

```bash
# Cilium (eBPF-based; GA for v1.4 as of Cilium 1.19)
helm repo add cilium https://helm.cilium.io/
helm install cilium cilium/cilium --namespace kube-system \
  --set gatewayAPI.enabled=true

# Envoy Gateway (CNCF reference implementation)
helm install eg oci://docker.io/envoyproxy/gateway-helm \
  --version v1.2.1 \
  -n envoy-gateway-system --create-namespace

# NGINX Gateway Fabric
helm install ngf oci://ghcr.io/nginx/charts/nginx-gateway-fabric \
  -n nginx-gateway --create-namespace

# Traefik (v3.x supports both Ingress and Gateway API)
helm repo add traefik https://traefik.github.io/charts
helm install traefik traefik/traefik -n traefik --create-namespace
```

After installing a controller, a `GatewayClass` object is typically created automatically.
Verify:

```bash
kubectl get gatewayclass
# NAME      CONTROLLER                      ACCEPTED
# cilium    io.cilium/gateway-controller    True
```

---

## 6. GatewayClass

`GatewayClass` is a cluster-scoped resource that defines a type of Gateway implementation.
It is analogous to `StorageClass` for PersistentVolumes and `IngressClass` for Ingress.[^gateway-api-gatewayclass]

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: cilium
spec:
  controllerName: io.cilium/gateway-controller    # must match the installed controller
  description: "Cilium Gateway — eBPF-based L7 proxy"

  # Optional: Reference vendor-specific parameters
  parametersRef:
    group: cilium.io
    kind: CiliumGatewayConfiguration
    name: default-config
    namespace: kube-system
```

### GatewayClass Status

The controller sets `.status.conditions` to indicate whether the GatewayClass is accepted:

```bash
kubectl get gatewayclass cilium -o yaml | grep -A 10 "conditions:"
# conditions:
# - lastTransitionTime: "2026-01-10T..."
#   message: Accepted GatewayClass
#   observedGeneration: 1
#   reason: Accepted
#   status: "True"
#   type: Accepted
```

A GatewayClass with `Accepted: False` means the controller is either not running or does not
recognize the `controllerName`.

### SupportedFeatures (v1.4 Standard)

Since v1.4, GatewayClass status includes a `supportedFeatures` field listing which Standard
and Extended features the implementation supports:

```bash
kubectl get gatewayclass cilium -o jsonpath='{.status.supportedFeatures}'
```

This replaces the need for conformance test flags and lets users programmatically determine
what their implementation supports.

---

## 7. Gateway

A `Gateway` resource requests a concrete load balancer instance. It is namespaced and is
typically created by a cluster operator. It defines one or more **Listeners** that specify
port, protocol, and TLS configuration.[^gateway-api-gateway]

### Basic Gateway

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: prod-gateway
  namespace: infra
spec:
  gatewayClassName: cilium          # references the GatewayClass

  listeners:
  # ── HTTP Listener ────────────────────────────────────────────────────────
  - name: http
    protocol: HTTP
    port: 80
    allowedRoutes:
      namespaces:
        from: All                   # routes in any namespace can attach here

  # ── HTTPS Listener (TLS terminated at Gateway) ───────────────────────────
  - name: https
    protocol: HTTPS
    port: 443
    tls:
      mode: Terminate               # Gateway decrypts TLS
      certificateRefs:
      - kind: Secret
        group: ""
        name: prod-tls-secret
        namespace: infra            # Secret must be in same namespace as Gateway
                                    # (or permitted via ReferenceGrant — see Section 10)
    allowedRoutes:
      namespaces:
        from: Selector
        selector:
          matchLabels:
            gateway-access: allowed
```

### Listener Protocols

| Protocol | Port | TLS | Usage |
|---|---|---|---|
| `HTTP` | Any | No | Plain HTTP; usually 80 |
| `HTTPS` | Any | Terminate | TLS terminated at Gateway |
| `TLS` | Any | Passthrough or Terminate | TLS routing (Experimental for passthrough) |
| `TCP` | Any | Optional | L4 TCP (Experimental channel) |
| `UDP` | Any | No | L4 UDP (Experimental channel) |

### Controlling Which Routes Can Attach

```yaml
# Allow routes from all namespaces (open for multi-tenant clusters)
allowedRoutes:
  namespaces:
    from: All

# Allow routes only from the same namespace as the Gateway
allowedRoutes:
  namespaces:
    from: Same

# Allow routes from namespaces matching a label selector
allowedRoutes:
  namespaces:
    from: Selector
    selector:
      matchLabels:
        team: backend
        env: production

# Also restrict by Route kind (allow HTTPRoute only, not GRPCRoute)
allowedRoutes:
  kinds:
  - kind: HTTPRoute
  namespaces:
    from: All
```

### Gateway Status

```bash
kubectl get gateway prod-gateway -n infra
# NAME           CLASS    ADDRESS         PROGRAMMED   AGE
# prod-gateway   cilium   203.0.113.10    True         10m

kubectl describe gateway prod-gateway -n infra
# Conditions:
#   Accepted: True
#   Programmed: True
# Listeners:
#   http (port 80): ResolvedRefs: True
#   https (port 443): ResolvedRefs: True
```

`Programmed: True` means the controller has successfully reconciled the Gateway and the
underlying load balancer is ready. `Accepted: True` means the GatewayClass controller has
accepted the resource.

### Infrastructure Labels

```yaml
metadata:
  labels:
    gateway.networking.k8s.io/gateway-name: prod-gateway
spec:
  infrastructure:
    labels:
      environment: production
      billing: team-a
    annotations:
      cloud.example.com/lb-type: internal
```

The `infrastructure` field (Standard since v1.1) allows operators to pass labels and annotations
to the underlying cloud load balancer resources that the controller provisions.

---

## 8. HTTPRoute

`HTTPRoute` is the primary routing resource in Gateway API. It is namespaced, created by
application developers, and attaches to one or more Gateway Listeners via `parentRefs`.[^gateway-api-httproute]

### Full Annotated HTTPRoute

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-app-route
  namespace: production
spec:
  # ── Parent reference: attach to specific Gateway ──────────────────────────
  parentRefs:
  - name: prod-gateway
    namespace: infra                  # cross-namespace — requires ReferenceGrant if Gateway
                                      # doesn't allow it explicitly
    sectionName: https                # attach only to the "https" listener (not "http")
    port: 443                         # attach only to port 443 (Extended feature)

  # ── Hostname matching ─────────────────────────────────────────────────────
  # If omitted, route matches all hostnames on the listener
  hostnames:
  - myapp.example.com
  - "*.api.example.com"               # wildcard: matches one label only

  # ── Routing rules ─────────────────────────────────────────────────────────
  rules:

  # ── Rule 1: Path + header matching ───────────────────────────────────────
  - name: api-v2-rule                 # GEP-995: named rules (GA in v1.4)
    matches:
    - path:
        type: PathPrefix
        value: /api/v2
      headers:
      - name: X-API-Version
        value: "2"
        type: Exact                   # Exact (default) or RegularExpression
      method: GET                     # optional method match
    backendRefs:
    - name: api-v2-svc
      namespace: production
      port: 8080
      weight: 100

  # ── Rule 2: Traffic splitting (weighted canary) ────────────────────────────
  - name: canary-rule
    matches:
    - path:
        type: PathPrefix
        value: /api/v1
    backendRefs:
    - name: api-v1-stable
      port: 8080
      weight: 90                      # 90% of matching traffic
    - name: api-v1-canary
      port: 8080
      weight: 10                      # 10% of matching traffic

  # ── Rule 3: Filters (header modification, redirect, rewrite) ──────────────
  - name: filter-rule
    matches:
    - path:
        type: PathPrefix
        value: /old
    filters:
    - type: URLRewrite                # modify the URL before forwarding
      urlRewrite:
        hostname: backend.internal
        path:
          type: ReplacePrefixMatch
          replacePrefixMatch: /new
    - type: RequestHeaderModifier     # add/remove/set request headers
      requestHeaderModifier:
        set:
        - name: X-Forwarded-Host
          value: "myapp.example.com"
        add:
        - name: X-Request-ID
          value: "{{request.id}}"
        remove:
        - X-Internal-Token            # remove sensitive header before forwarding
    - type: ResponseHeaderModifier    # modify response headers
      responseHeaderModifier:
        set:
        - name: X-Frame-Options
          value: DENY
        - name: X-Content-Type-Options
          value: nosniff
    backendRefs:
    - name: backend-svc
      port: 80

  # ── Rule 4: Redirect (HTTP → HTTPS) ────────────────────────────────────────
  - name: http-redirect
    matches:
    - path:
        type: PathPrefix
        value: /
    filters:
    - type: RequestRedirect
      requestRedirect:
        scheme: https
        statusCode: 301               # 301 Permanent or 302 Temporary
        # hostname: new.example.com   # optional: change hostname
        # port: 8443                  # optional: change port
    # No backendRefs needed for redirect rules

  # ── Rule 5: Request mirroring (send copy of traffic to another backend) ─────
  - name: mirror-rule
    matches:
    - path:
        type: PathPrefix
        value: /v3
    filters:
    - type: RequestMirror
      requestMirror:
        backendRef:
          name: logging-svc           # receives copy but response is ignored
          port: 9090
        percent: 10                   # mirror 10% of requests (Standard since v1.3)
    backendRefs:
    - name: v3-svc
      port: 8080

  # ── Rule 6: Timeouts (Standard since v1.2) ────────────────────────────────
  - name: timeout-rule
    matches:
    - path:
        type: PathPrefix
        value: /slow
    timeouts:
      request: 30s                    # total request timeout (RFC 3339 duration)
      backendRequest: 10s             # per-attempt timeout to backend
    backendRefs:
    - name: slow-svc
      port: 8080
```

### HTTPRoute Matches

Matches are ANDed within a single match object, and ORed between multiple match objects:

```yaml
matches:
# Match 1: path AND header (both must be true)
- path:
    type: PathPrefix
    value: /api
  headers:
  - name: Content-Type
    value: application/json

# Match 2: query parameter
- queryParams:
  - name: version
    value: "2"
    type: Exact

# Match 3: path with regex (Extended feature — not all implementations support it)
- path:
    type: RegularExpression
    value: /users/[0-9]+
```

### HTTPRoute Filters

| Filter Type | Channel | Description |
|---|---|---|
| `RequestHeaderModifier` | Core | Set/add/remove request headers |
| `ResponseHeaderModifier` | Extended | Set/add/remove response headers |
| `RequestRedirect` | Core | HTTP redirect (301/302/307/308) |
| `URLRewrite` | Extended | Rewrite URL path or hostname |
| `RequestMirror` | Extended | Copy traffic to mirror backend |
| `ExtensionRef` | Extension | Vendor-specific CRD filters |

**Core** filters must be supported by all conformant implementations. **Extended** filters are
optional. **ExtensionRef** is for vendor-specific extensions.

### Parent Reference Attach Logic

```yaml
parentRefs:
- name: my-gateway
  namespace: infra     # omit if Route is in same namespace as Gateway
  sectionName: https   # attach to specific listener by name
  port: 443            # attach to specific port (Extended feature)
```

If `sectionName` is omitted, the Route attaches to all compatible listeners. A route attaches
to a listener if the Route's `hostnames` are compatible with the listener's `hostname` (if set),
and the listener's `allowedRoutes` permits it.

---

## 9. GRPCRoute

`GRPCRoute` is GA (v1) in the Standard channel since v1.1, and the `spec` field became required
in v1.4.[^gateway-api-grpcroute] It routes gRPC traffic idiomatically — matching by gRPC service
and method names rather than URI paths.

### When to Use GRPCRoute vs HTTPRoute

Use `GRPCRoute` when you need gRPC-specific matching (service/method names), gRPC status code
conditions, or gRPC-aware observability. gRPC can be routed via `HTTPRoute` using path matching
(gRPC encodes method as `/<service>/<method>`), but loses gRPC-specific semantics and tooling.

Implementations that support `GRPCRoute` must enforce hostname uniqueness between `GRPCRoute`
and `HTTPRoute` objects attached to the same listener.

### GRPCRoute Example

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: grpc-gateway
  namespace: infra
spec:
  gatewayClassName: cilium
  listeners:
  - name: grpc
    protocol: HTTPS               # gRPC requires HTTP/2; TLS strongly recommended
    port: 50051
    tls:
      mode: Terminate
      certificateRefs:
      - name: grpc-tls-secret
---
apiVersion: gateway.networking.k8s.io/v1
kind: GRPCRoute
metadata:
  name: user-service-route
  namespace: production
spec:
  parentRefs:
  - name: grpc-gateway
    namespace: infra
    sectionName: grpc
  hostnames:
  - grpc.example.com
  rules:
  # ── Match by service and method ───────────────────────────────────────────
  - name: login-rule
    matches:
    - method:
        type: Exact                   # Exact or RegularExpression
        service: com.example.UserService
        method: Login
    backendRefs:
    - name: user-service
      port: 50051

  # ── Match all methods of a service ────────────────────────────────────────
  - name: order-service-rule
    matches:
    - method:
        service: com.example.OrderService
        # omit method: matches all methods of the service
    backendRefs:
    - name: order-service
      port: 50051

  # ── Header-based routing ──────────────────────────────────────────────────
  - name: beta-users-rule
    matches:
    - method:
        service: com.example.UserService
      headers:
      - name: x-beta-user
        value: "true"
    backendRefs:
    - name: user-service-beta
      port: 50051

  # ── Catch-all for this host ───────────────────────────────────────────────
  - name: catchall
    backendRefs:
    - name: grpc-default-service
      port: 50051
```

### Filters in GRPCRoute

GRPCRoute supports `RequestHeaderModifier`, `ResponseHeaderModifier`, `RequestMirror`, and
`ExtensionRef` filters — the same types as HTTPRoute (except URLRewrite and RequestRedirect,
which are not applicable to gRPC).

---

## 10. ReferenceGrant

`ReferenceGrant` (`gateway.networking.k8s.io/v1beta1`) is the mechanism for allowing
cross-namespace references in Gateway API. All cross-namespace object references require a
`ReferenceGrant` in the **target namespace**.[^gateway-api-referencegrant]

### Why Cross-Namespace References Need Grants

Without ReferenceGrant, a malicious user in namespace `evil` could create an HTTPRoute that
references a Service in namespace `bank` — potentially hijacking traffic. ReferenceGrant requires
the target namespace's owner to explicitly approve inbound references.

### ReferenceGrant Anatomy

```yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-prod-to-access-infra-gateway
  namespace: infra                   # the namespace that OWNS the target object
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: HTTPRoute
    namespace: production            # only HTTPRoutes from this namespace are trusted
  to:
  - group: gateway.networking.k8s.io
    kind: Gateway
    # name: prod-gateway             # optionally restrict to a specific Gateway name
```

### Common ReferenceGrant Patterns

**Pattern 1: HTTPRoute in namespace A references a Gateway in namespace B**

```yaml
# ReferenceGrant must be in namespace B (the Gateway's namespace)
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-app-routes
  namespace: infra                   # Gateway is here
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: HTTPRoute
    namespace: apps                  # HTTPRoute is here
  to:
  - group: gateway.networking.k8s.io
    kind: Gateway
```

**Pattern 2: Gateway in namespace A references a TLS Secret in namespace B**

```yaml
# ReferenceGrant in the Secret's namespace
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-gateway-to-use-secrets
  namespace: cert-store              # Secret is here
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: Gateway
    namespace: infra                 # Gateway is here
  to:
  - group: ""
    kind: Secret
```

**Pattern 3: HTTPRoute references a Service in another namespace**

```yaml
# ReferenceGrant in the Service's namespace
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-route-to-backend
  namespace: backend-ns              # Service is here
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: HTTPRoute
    namespace: frontend-ns           # HTTPRoute is here
  to:
  - group: ""
    kind: Service
```

### What Does NOT Require ReferenceGrant

Route-to-Gateway attachment (where a Route in namespace A attaches to a Gateway in namespace B)
does NOT require a ReferenceGrant — it is controlled by the Gateway's `allowedRoutes` field.
ReferenceGrant is only required when a Route (or Gateway) references an actual object
(like a Service or Secret) in another namespace as a data reference.[^gateway-api-referencegrant]

---

## 11. BackendTLSPolicy

`BackendTLSPolicy` (`gateway.networking.k8s.io/v1`) graduated to the Standard channel in
**Gateway API v1.4**. It enables TLS encryption on the hop from the Gateway to the backend
pods.[^gateway-api-v14]

Before BackendTLSPolicy, Gateway API had no standard way to encrypt traffic between the Gateway
and backend Services. All encryption was focused on the client-to-Gateway leg.

### BackendTLSPolicy Example

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: BackendTLSPolicy
metadata:
  name: auth-backend-tls
  namespace: production
spec:
  targetRefs:
  - group: ""
    kind: Service
    name: auth-svc                   # the backend Service to apply TLS to
    # port: 8443                     # optional: restrict to specific port

  validation:
    hostname: auth.internal          # SNI hostname for backend certificate validation
    caCertificateRefs:
    - group: ""
      kind: ConfigMap                # CA cert in a ConfigMap
      name: backend-ca-cert
      # key: ca.crt                  # default key is "ca.crt"
    # OR: use system trust bundle
    # wellKnownCACertificates: System
```

### TLS Policy Attachment

BackendTLSPolicy uses the **policy attachment** mechanism (see Section 17). The policy attaches
to a Service and applies to all Routes that use that Service as a backendRef. When multiple
Gateways route to the same Service, each may have independent BackendTLSPolicy resolution.

### Client Certificate Support (v1.4+)

v1.4 also added Standard channel support for client certificate validation at the Gateway
(mTLS termination) and for defining a client certificate when the Gateway originates a TLS
connection to backends.

---

## 12. TLS Configuration Patterns

### Pattern 1: TLS Termination at Gateway (Most Common)

```
Client ──HTTPS──► Gateway (terminates TLS) ──HTTP──► Service/Pod
```

```yaml
spec:
  listeners:
  - name: https
    protocol: HTTPS
    port: 443
    tls:
      mode: Terminate
      certificateRefs:
      - name: my-tls-secret
        kind: Secret
        group: ""
```

### Pattern 2: TLS Passthrough (Experimental)

```
Client ──TLS──► Gateway (passes through encrypted) ──TLS──► Service/Pod
```

Requires the Experimental channel and a `TLSRoute`. The Gateway does not inspect or modify
the TLS stream.

```yaml
spec:
  listeners:
  - name: tls-passthrough
    protocol: TLS                    # not HTTPS
    port: 443
    tls:
      mode: Passthrough              # no certificateRefs needed
---
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: TLSRoute
metadata:
  name: passthrough-route
spec:
  parentRefs:
  - name: my-gateway
    sectionName: tls-passthrough
  hostnames:
  - db.example.com
  rules:
  - backendRefs:
    - name: postgres-svc
      port: 5432
```

### Pattern 3: Full TLS (mTLS with BackendTLSPolicy)

```
Client ──HTTPS──► Gateway ──TLS──► Service/Pod
```

Combine Listener TLS Termination with BackendTLSPolicy for end-to-end encryption.

### Pattern 4: HTTP → HTTPS Redirect

```yaml
# Gateway with both HTTP and HTTPS listeners
spec:
  listeners:
  - name: http
    protocol: HTTP
    port: 80
    allowedRoutes:
      namespaces: { from: All }
  - name: https
    protocol: HTTPS
    port: 443
    tls:
      mode: Terminate
      certificateRefs:
      - name: my-tls-secret
---
# HTTPRoute on port 80: redirect to HTTPS
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: redirect-to-https
spec:
  parentRefs:
  - name: my-gateway
    sectionName: http             # attach to HTTP listener only
  rules:
  - filters:
    - type: RequestRedirect
      requestRedirect:
        scheme: https
        statusCode: 301
---
# HTTPRoute on port 443: actual routing
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-app-https
spec:
  parentRefs:
  - name: my-gateway
    sectionName: https            # attach to HTTPS listener only
  hostnames: [myapp.example.com]
  rules:
  - backendRefs:
    - name: my-app-svc
      port: 80
```

---

## 13. Traffic Management

### Weighted Traffic Splitting (Blue/Green, Canary)

```yaml
rules:
- backendRefs:
  - name: app-stable
    port: 80
    weight: 95       # 95% to stable
  - name: app-canary
    port: 80
    weight: 5        # 5% to canary
  # Weights are relative: total does not need to equal 100
```

To complete a rollout (move 100% to canary), update weights:

```bash
kubectl patch httproute my-route --type='json' \
  -p='[{"op":"replace","path":"/spec/rules/0/backendRefs/0/weight","value":0},
       {"op":"replace","path":"/spec/rules/0/backendRefs/1/weight","value":100}]'
```

### Header-Based Routing

```yaml
rules:
# New users (with header) go to v2
- matches:
  - headers:
    - name: X-App-Version
      value: "v2"
  backendRefs:
  - name: app-v2-svc
    port: 80

# Everyone else goes to v1
- backendRefs:
  - name: app-v1-svc
    port: 80
```

### URL Rewrite

```yaml
filters:
- type: URLRewrite
  urlRewrite:
    # Change hostname
    hostname: internal-backend.svc.cluster.local

    # Replace prefix: /api/v1/users → /users
    path:
      type: ReplacePrefixMatch
      replacePrefixMatch: /

    # OR replace full path
    # path:
    #   type: ReplaceFullPath
    #   replaceFullPath: /new-path
```

### Request Redirect

```yaml
filters:
- type: RequestRedirect
  requestRedirect:
    scheme: https                  # change http to https
    hostname: new.example.com      # change hostname
    port: 8443                     # change port
    path:
      type: ReplacePrefixMatch
      replacePrefixMatch: /v2
    statusCode: 301                # 301, 302, 307, or 308
                                   # 307/308 added in v1.4[^gateway-api-v14]
```

### Timeout Configuration (Standard since v1.2)[^gateway-api-v12]

```yaml
rules:
- timeouts:
    request: 30s          # max time from client request to response (RFC 3339)
    backendRequest: 10s   # per-attempt timeout for connection to backend
                          # backendRequest must be <= request
  backendRefs:
  - name: slow-svc
    port: 80
```

---

## 14. Cross-Namespace Routing

One of Gateway API's most powerful features is the ability for Routes in one namespace to attach
to a Gateway in another, and for Routes to reference Services in other namespaces.

### Shared Gateway Pattern

```
Namespace: infra
  └─ Gateway: prod-gateway (managed by ops team)

Namespace: team-a
  └─ HTTPRoute: app-a-route → attaches to prod-gateway, references app-a-svc

Namespace: team-b
  └─ HTTPRoute: app-b-route → attaches to prod-gateway, references app-b-svc
```

Both teams share a single cloud load balancer (Gateway) without needing to coordinate with
each other or the ops team (beyond the initial setup of `allowedRoutes`).

```yaml
# Gateway (in infra namespace) allows routes from ALL namespaces
spec:
  listeners:
  - name: https
    allowedRoutes:
      namespaces:
        from: All          # or: Selector with specific labels
```

```yaml
# HTTPRoute in team-a namespace
spec:
  parentRefs:
  - name: prod-gateway
    namespace: infra       # cross-namespace Gateway reference
    sectionName: https
  hostnames: [app-a.example.com]
  ...
```

### Cross-Namespace Backend Reference

An HTTPRoute can reference a Service in a different namespace, but requires a ReferenceGrant
in the Service's namespace (see Section 10).

```yaml
# HTTPRoute in frontend-ns referencing a Service in backend-ns
spec:
  rules:
  - backendRefs:
    - name: api-svc
      namespace: backend-ns    # cross-namespace Service reference
      port: 8080
---
# Required: ReferenceGrant in backend-ns
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  namespace: backend-ns
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: HTTPRoute
    namespace: frontend-ns
  to:
  - group: ""
    kind: Service
```

---

## 15. Service Mesh (GAMMA)

Gateway API version 1.1 introduced GAMMA (Gateway API for Mesh Management and Administration)
for service mesh (East-West) traffic. This allows the same HTTPRoute resource to configure both
ingress (North-South) and service-to-service (East-West) routing.

### GAMMA Routing

In mesh mode, an HTTPRoute attaches to a Service (not a Gateway):

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: payments-mesh-route
  namespace: payments
spec:
  parentRefs:
  - group: ""
    kind: Service              # attaches to a Service, not a Gateway
    name: payments-svc
    port: 8080
  rules:
  - matches:
    - headers:
      - name: x-canary
        value: "true"
    backendRefs:
    - name: payments-canary
      port: 8080
  - backendRefs:
    - name: payments-stable
      port: 8080
```

GAMMA is supported by service mesh implementations like Istio, Linkerd, and Cilium Service Mesh.
The Experimental `Mesh` resource (added in v1.4) provides mesh-wide configuration.[^gateway-api-v14]

---

## 16. Implementations

As of February 2026, the following implementations support Gateway API v1.4.x Standard
channel:[^gateway-api-implementations]

| Implementation | Type | Notes |
|---|---|---|
| Cilium 1.19+ | CNI + Gateway | eBPF-based; GA for v1.4 |
| Envoy Gateway 1.x | Ingress | CNCF; Envoy-based reference impl |
| NGINX Gateway Fabric | Ingress | F5; uses NGINX Plus or OSS |
| Traefik v3.x | Ingress + Mesh | Supports both Ingress and Gateway API |
| Istio | Mesh + Ingress | Full service mesh; GAMMA-compliant |
| Linkerd | Mesh | Lightweight mesh; GAMMA-compliant |
| Contour | Ingress | Envoy-based; CNCF project |
| HAProxy Ingress | Ingress | High-performance L7 |
| AWS Load Balancer Controller | Ingress | Provisions ALB/NLB |
| GKE | Managed | Built-in GKE Gateway |
| Azure AG for Containers | Managed | AKS integration |
| kgateway (formerly Gloo) | Ingress + Mesh | Envoy-based; AI-focused |

### Checking Conformance

Implementations submit conformance reports to the Gateway API repository. You can check
exactly which features a given implementation supports:

```bash
kubectl get gatewayclass <name> -o jsonpath='{.status.supportedFeatures}'
```

Or view the published reports at: https://gateway-api.sigs.k8s.io/implementations/

---

## 17. Policy Attachment

Gateway API defines a policy attachment pattern that allows vendor-specific and user-defined
policies to be attached to Gateway API resources without modifying the core spec.

### Inheritance Model

Policies follow a hierarchy. A policy on a Gateway applies to all Routes attached to it,
unless overridden by a more specific policy on a Route or Service.

```
GatewayClass-level policy
    └── Gateway-level policy         (overrides GatewayClass)
        └── HTTPRoute-level policy   (overrides Gateway)
            └── Service-level policy (overrides HTTPRoute, e.g., BackendTLSPolicy)
```

### Policy Status

Policies surface their status using a standard `PolicyAncestorStatus` structure. The ancestor
(typically the Gateway) shows whether the policy was accepted and applied.

```bash
kubectl describe backendtlspolicy my-backend-tls
# Status:
#   Ancestors:
#   - AncestorRef: prod-gateway (infra/Gateway)
#     Conditions:
#     - type: Accepted
#       status: "True"
```

---

## 18. Migration from Ingress

### Why Migrate?

- ingress-nginx community controller retires March 2026.
- Gateway API provides all Ingress features with better expressiveness and portability.
- Traffic management features (weighting, rewrites, header manipulation) require no annotations.
- Role separation improves security and multi-team operations.

### Migration Checklist

1. **Install Gateway API CRDs and a controller.** Most controllers support both Ingress and
   Gateway API simultaneously — you can migrate incrementally.

2. **Identify your Ingress objects and their annotations.** Each annotation maps to a Gateway
   API spec field.

3. **Determine the role model.** Decide which namespaces will hold Gateways vs Routes.

4. **Create Gateways** for each Ingress Controller configuration (one per IngressClass,
   typically).

5. **Create HTTPRoutes** for each Ingress object. Use the mapping table below.

6. **Set up ReferenceGrants** if Routes and Gateways are in different namespaces.

7. **Test with both Ingress and HTTPRoute active** before removing old Ingress objects.

8. **Remove old Ingress objects** and eventually the Ingress controller.

### Annotation to HTTPRoute Filter Mapping

| Ingress Annotation | HTTPRoute equivalent |
|---|---|
| `rewrite-target: /foo` | `URLRewrite.path.ReplacePrefixMatch: /foo` |
| `ssl-redirect: true` | `RequestRedirect.scheme: https` |
| `permanent-redirect: https://x` | `RequestRedirect.statusCode: 301` |
| `canary-weight: 20` | `backendRefs[].weight: 20` |
| `canary-by-header: X-Canary` | `rules[].matches[].headers[].name: X-Canary` |
| `proxy-read-timeout: 60` | `rules[].timeouts.backendRequest: 60s` |
| `auth-type: basic` | External Auth (ExtensionRef or policy) |
| `cors-allow-origin: x` | HTTPRoute CORS filter (Experimental v1.3+) |

### Side-by-Side Migration Example

```yaml
# BEFORE: Single Ingress with complex annotations
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: default
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "20"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts: [api.example.com]
    secretName: api-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service: { name: api-stable, port: { number: 8080 } }
```

```yaml
# AFTER: Gateway API equivalent (no annotations needed)
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: api-redirect           # handles HTTP→HTTPS redirect
  namespace: default
spec:
  parentRefs:
  - name: my-gateway
    sectionName: http
  hostnames: [api.example.com]
  rules:
  - filters:
    - type: RequestRedirect
      requestRedirect: { scheme: https, statusCode: 301 }
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: api-route              # handles actual HTTPS routing with canary
  namespace: default
spec:
  parentRefs:
  - name: my-gateway
    sectionName: https
  hostnames: [api.example.com]
  rules:
  - timeouts:
      backendRequest: 60s
    backendRefs:
    - name: api-stable
      port: 8080
      weight: 80
    - name: api-canary
      port: 8080
      weight: 20
```

---

## 19. Troubleshooting

### Diagnostic Order

```
Problem: Route not working
    │
    ▼
1. Is the GatewayClass accepted?
   kubectl get gatewayclass
   → Accepted: True? → continue
   → Accepted: False? → controller not running

2. Is the Gateway programmed?
   kubectl describe gateway <n> -n <ns>
   → Programmed: True? → continue
   → Programmed: False? → TLS Secret missing? listener config error?

3. Does the HTTPRoute have a valid parent status?
   kubectl describe httproute <n> -n <ns>
   → status.parents[].conditions.Accepted: True? → continue
   → Accepted: False, reason NoMatchingParent? → namespace not allowed, sectionName mismatch

4. Are backends resolved?
   → status.parents[].conditions.ResolvedRefs: True? → continue
   → ResolvedRefs: False, reason BackendNotFound? → Service name/namespace wrong
   → ResolvedRefs: False, reason RefNotPermitted? → missing ReferenceGrant

5. Test with direct HTTP call:
   kubectl run test --rm -it --image=nicolaka/netshoot -- bash
   curl -H "Host: myapp.example.com" http://<gateway-ip>/path
```

### Key Status Conditions

**Gateway conditions:**

| Condition | Meaning |
|---|---|
| `Accepted: True` | GatewayClass controller accepted this Gateway |
| `Programmed: True` | Controller has configured the underlying LB |
| `ResolvedRefs: True` | All TLS Secrets and other references resolved |

**HTTPRoute/GRPCRoute parent conditions:**

| Condition | Meaning |
|---|---|
| `Accepted: True` | Route attached to the listener successfully |
| `ResolvedRefs: True` | All backend Services and cross-namespace refs resolved |
| `NoMatchingParent` | No Gateway with matching name/namespace/sectionName |
| `NotAllowedByListeners` | Listener's `allowedRoutes` rejected this Route |
| `HostnameConflict` | Another Route claims the same hostname |
| `RefNotPermitted` | Cross-namespace reference missing ReferenceGrant |

### Common Fixes

```bash
# Fix 1: ReferenceGrant missing
kubectl get referencegrant -n <target-namespace>
# Create ReferenceGrant as shown in Section 10

# Fix 2: Gateway listener not programmed (TLS Secret missing)
kubectl describe gateway <n> -n <ns>
# Look for: "spec.listeners[0].tls.certificateRefs[0].name not found"
kubectl get secret <secretname> -n <gateway-namespace>

# Fix 3: HTTPRoute not attaching to Gateway
kubectl describe httproute <n> | grep -A 10 "Parents:"
# Check reason in Conditions; common: NoMatchingParent or NotAllowedByListeners

# Fix 4: Controller-specific debugging
# Envoy Gateway:
kubectl logs -n envoy-gateway-system deploy/envoy-gateway
# Cilium:
kubectl -n kube-system exec -it ds/cilium -- cilium envoy dump
# NGINX Gateway Fabric:
kubectl logs -n nginx-gateway deploy/ngf-nginx-gateway-fabric
```

---

## 20. References

### Gateway API Official

[^gateway-api-intro]: Kubernetes Gateway API — Introduction.
  https://gateway-api.sigs.k8s.io/

[^gateway-api-versioning]: Kubernetes Gateway API — Versioning Policy.
  https://gateway-api.sigs.k8s.io/concepts/versioning/

[^gateway-api-overview]: Kubernetes Gateway API — API Overview and Personas.
  https://gateway-api.sigs.k8s.io/concepts/api-overview/

[^gateway-api-v14]: Kubernetes Blog — Gateway API v1.4: New Features (October 2025).
  https://kubernetes.io/blog/2025/11/06/gateway-api-v1-4/

[^gateway-api-v12]: Kubernetes Blog — Gateway API v1.2: WebSockets, Timeouts, Retries.
  https://kubernetes.io/blog/2024/10/03/gateway-api-v1-2/

### Resource Type Documentation

[^gateway-api-gatewayclass]: Kubernetes Gateway API — GatewayClass.
  https://gateway-api.sigs.k8s.io/api-types/gatewayclass/

[^gateway-api-gateway]: Kubernetes Gateway API — Gateway.
  https://gateway-api.sigs.k8s.io/api-types/gateway/

[^gateway-api-httproute]: Kubernetes Gateway API — HTTPRoute.
  https://gateway-api.sigs.k8s.io/api-types/httproute/

[^gateway-api-grpcroute]: Kubernetes Gateway API — GRPCRoute.
  https://gateway-api.sigs.k8s.io/api-types/grpcroute/

[^gateway-api-referencegrant]: Kubernetes Gateway API — ReferenceGrant.
  https://gateway-api.sigs.k8s.io/api-types/referencegrant/

[^gateway-api-tlsroute]: Kubernetes Gateway API — TLSRoute (Experimental).
  https://gateway-api.sigs.k8s.io/reference/spec/#gateway.networking.k8s.io/v1alpha2.TLSRoute

### Installation and Implementations

[^gateway-api-install]: Kubernetes Gateway API — Getting Started.
  https://gateway-api.sigs.k8s.io/guides/

[^gateway-api-implementations]: Kubernetes Gateway API — Conformant Implementations.
  https://gateway-api.sigs.k8s.io/implementations/

### GitHub Repository

[^gateway-api-github]: kubernetes-sigs/gateway-api GitHub Repository.
  https://github.com/kubernetes-sigs/gateway-api

[^gateway-api-releases]: Gateway API Releases.
  https://github.com/kubernetes-sigs/gateway-api/releases

### Ingress Reference

[^k8s-ingress]: Kubernetes — Ingress Concepts.
  https://kubernetes.io/docs/concepts/services-networking/ingress/

---

*Kubernetes Gateway API Complete Guide — v1.0 — February 2026 — Gateway API v1.4.1 Standard Channel / Kubernetes 1.32+*
