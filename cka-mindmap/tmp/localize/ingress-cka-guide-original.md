# Kubernetes Ingress: CKA Step-by-Step Practice Guide

> **Version:** v1.0 — February 2026 — Based on Kubernetes 1.32 / CKA Curriculum v1.31+
>
> ⚠️ **Exam Note:** The CKA exam environment uses Kubernetes 1.31/1.32. The `networking.k8s.io/v1`
> Ingress API is the only valid version. Old beta API (`extensions/v1beta1`) is removed and will
> cause errors. All answers in this guide use `networking.k8s.io/v1`.

---

## Table of Contents

1. [CKA Exam Coverage](#1-cka-exam-coverage)
2. [Quick Reference Card](#2-quick-reference-card)
3. [Task 1: Create a Basic Ingress](#task-1-create-a-basic-ingress)
4. [Task 2: Multi-Path Fan-Out Ingress](#task-2-multi-path-fan-out-ingress)
5. [Task 3: Name-Based Virtual Hosting](#task-3-name-based-virtual-hosting)
6. [Task 4: TLS/HTTPS Ingress](#task-4-tlshttps-ingress)
7. [Task 5: Default Backend](#task-5-default-backend)
8. [Task 6: IngressClass — Default and Non-Default](#task-6-ingressclass--default-and-non-default)
9. [Task 7: Debug a Broken Ingress](#task-7-debug-a-broken-ingress)
10. [Task 8: Ingress with Rewrite Annotation](#task-8-ingress-with-rewrite-annotation)
11. [Exam Tips and Traps](#exam-tips-and-traps)
12. [References](#references)

---

## 1. CKA Exam Coverage

The CKA exam (v1.31 curriculum) covers Ingress under the **Services & Networking** domain
(~20% of the exam). You are expected to be able to:[^cka-curriculum]

- Demonstrate knowledge of network policies
- Use `Ingress` controllers and `Ingress` resources
- Know how to configure `IngressClass`
- Use `kubectl` to create, describe, and troubleshoot Ingress objects

You will have access to the Kubernetes documentation at https://kubernetes.io/docs during
the exam. The fastest path is `docs → search "ingress"` → copy YAML and edit.

### Exam Environment Notes

- The exam uses a live Kubernetes cluster (not kind/minikube, but kubeadm-based).
- An Ingress controller is already installed in most tasks; you just create Ingress resources.
- `kubectl` autocomplete is enabled. Use it.
- `kubectl create ingress --help` generates scaffolding imperative commands.

---

## 2. Quick Reference Card

```
╔══════════════════════════════════════════════════════════════════════╗
║                  INGRESS QUICK REFERENCE                             ║
╠══════════════════════════════════════════════════════════════════════╣
║  API Version:  networking.k8s.io/v1                                  ║
║  Kind:         Ingress   (namespaced)                                ║
║  Also:         IngressClass  (cluster-scoped)                        ║
╠══════════════════════════════════════════════════════════════════════╣
║  IMPERATIVE CREATION                                                 ║
║  kubectl create ingress <name>                                       ║
║    --class=<classname>                                               ║
║    --rule="host/path=svc:port"                                       ║
║    --rule="host/path=svc:port,tls=secretname"                        ║
╠══════════════════════════════════════════════════════════════════════╣
║  PATH TYPES                                                          ║
║  Prefix          /foo matches /foo and /foo/bar                      ║
║  Exact           /foo matches ONLY /foo                              ║
║  ImplementationSpecific  (controller-defined; avoid if portable)     ║
╠══════════════════════════════════════════════════════════════════════╣
║  TLS                                                                 ║
║  Secret type:  kubernetes.io/tls                                     ║
║  Fields:       tls.crt  tls.key                                      ║
║  Secret must be in SAME namespace as Ingress                         ║
╠══════════════════════════════════════════════════════════════════════╣
║  INGRESSCLASS DEFAULT ANNOTATION                                     ║
║  ingressclass.kubernetes.io/is-default-class: "true"                 ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## Task 1: Create a Basic Ingress

**Scenario:** An application `web-app` is running as a Deployment with a Service `web-svc` on
port 80 in namespace `default`. Create an Ingress named `web-ingress` that routes
`GET myapp.example.com/` to the service. The cluster has an Ingress controller with
IngressClass `nginx`.

### Step 1 — Verify prerequisites

```bash
# Confirm the Service exists
kubectl get svc web-svc
# NAME      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
# web-svc   ClusterIP   10.96.150.200   <none>        80/TCP    3m

# Confirm IngressClass exists
kubectl get ingressclass
# NAME    CONTROLLER             PARAMETERS   AGE
# nginx   k8s.io/ingress-nginx   <none>       20m
```

### Step 2 — Create Ingress imperatively

```bash
kubectl create ingress web-ingress \
  --class=nginx \
  --rule="myapp.example.com/=web-svc:80"
```

This generates the YAML and applies it. The `--rule` format is `host/path=service:port`.

### Step 3 — Verify

```bash
kubectl get ingress web-ingress
# NAME          CLASS   HOSTS               ADDRESS         PORTS   AGE
# web-ingress   nginx   myapp.example.com   203.0.113.10    80      30s

kubectl describe ingress web-ingress
# Rules:
#   Host               Path  Backends
#   ----               ----  --------
#   myapp.example.com
#                      /     web-svc:80 (10.244.1.5:80)
```

### Step 4 — Declarative version (equivalent)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  namespace: default
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix             # always specify pathType explicitly
        backend:
          service:
            name: web-svc
            port:
              number: 80
```

> **Exam trap:** Omitting `pathType` causes a validation error. It is a required field in
> `networking.k8s.io/v1`. The imperative command adds it automatically; the declarative YAML must
> include it explicitly.[^k8s-ingress-pathtypes]

---

## Task 2: Multi-Path Fan-Out Ingress

**Scenario:** Create an Ingress named `fanout-ingress` in namespace `apps` that routes all traffic
from `store.example.com` to different backends based on path:
- `/frontend` → `frontend-svc:80`
- `/api` → `api-svc:8080`
- `/admin` → `admin-svc:9000`

### Step 1 — Create declaratively

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fanout-ingress
  namespace: apps
spec:
  ingressClassName: nginx
  rules:
  - host: store.example.com
    http:
      paths:
      - path: /frontend
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
      - path: /admin
        pathType: Prefix
        backend:
          service:
            name: admin-svc
            port:
              number: 9000
EOF
```

### Step 2 — Verify routing rules

```bash
kubectl describe ingress fanout-ingress -n apps
# Rules:
#   Host                Path       Backends
#   ----                ----       --------
#   store.example.com
#                       /frontend  frontend-svc:80 (...)
#                       /api       api-svc:8080 (...)
#                       /admin     admin-svc:9000 (...)
```

### Step 3 — Test from inside the cluster

```bash
# Get the controller's cluster IP
kubectl get svc -n ingress-nginx ingress-nginx-controller
# NAME                       TYPE       CLUSTER-IP     PORT(S)
# ingress-nginx-controller   NodePort   10.96.55.123   80:31080/TCP,443:31443/TCP

# Test each path
kubectl run test --rm -it --image=nicolaka/netshoot -- bash
# Inside:
curl -H "Host: store.example.com" http://10.96.55.123/frontend
curl -H "Host: store.example.com" http://10.96.55.123/api/users
curl -H "Host: store.example.com" http://10.96.55.123/admin
```

> **Exam tip:** On the CKA exam, you can often test with `curl -H "Host: <hostname>"` against
> the controller's IP rather than needing real DNS.

---

## Task 3: Name-Based Virtual Hosting

**Scenario:** Create an Ingress `vhost-ingress` in namespace `web` that routes traffic to two
different backends based on hostname:
- `blog.example.com` → `blog-svc:80`
- `shop.example.com` → `shop-svc:80`

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: vhost-ingress
  namespace: web
spec:
  ingressClassName: nginx
  rules:
  - host: blog.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: blog-svc
            port:
              number: 80
  - host: shop.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: shop-svc
            port:
              number: 80
EOF
```

```bash
kubectl get ingress vhost-ingress -n web
# NAME             CLASS   HOSTS                                 ADDRESS         PORTS
# vhost-ingress    nginx   blog.example.com,shop.example.com    203.0.113.10    80
```

> **Exam tip:** An Ingress object can have multiple rules with different hostnames. All rules
> share the same external IP/hostname (shown in the ADDRESS field). Routing is done by HTTP
> Host header matching, not by different IPs.

---

## Task 4: TLS/HTTPS Ingress

**Scenario:** Create a TLS-enabled Ingress named `secure-ingress` in namespace `production`.
A TLS certificate and key are already available. Route `secure.example.com` to `secure-svc:443`.

### Step 1 — Create the TLS Secret

```bash
# On the exam, you may be given certificate files, or you can generate self-signed:
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key \
  -out tls.crt \
  -subj "/CN=secure.example.com/O=example"

kubectl create secret tls secure-tls \
  --cert=tls.crt \
  --key=tls.key \
  --namespace=production
```

Verify the Secret was created with the correct type:

```bash
kubectl get secret secure-tls -n production
# NAME          TYPE                DATA   AGE
# secure-tls    kubernetes.io/tls   2      10s

kubectl describe secret secure-tls -n production
# Data
# ====
# tls.crt:  1090 bytes
# tls.key:  1704 bytes
```

### Step 2 — Create the Ingress with TLS

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-ingress
  namespace: production
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - secure.example.com           # must match a host in rules below
    secretName: secure-tls         # must be in namespace: production
  rules:
  - host: secure.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: secure-svc
            port:
              number: 443
EOF
```

### Step 3 — Verify

```bash
kubectl get ingress secure-ingress -n production
# NAME             CLASS   HOSTS                 ADDRESS         PORTS     AGE
# secure-ingress   nginx   secure.example.com    203.0.113.10    80, 443   30s
# Note: PORTS shows 443 because TLS is configured

kubectl describe ingress secure-ingress -n production
# TLS:
#   secure-tls terminates secure.example.com
```

### Step 4 — Test HTTPS

```bash
kubectl run test --rm -it --image=nicolaka/netshoot -- bash
# Inside:
curl -k -H "Host: secure.example.com" https://203.0.113.10/
# -k skips certificate verification (needed with self-signed certs)
```

> **Exam traps:**
> 1. The TLS Secret must be in the **same namespace** as the Ingress object.[^k8s-ingress-tls]
> 2. The hostname under `tls[].hosts` must **exactly match** a hostname in `rules[].host`.
>    Mismatches cause the controller to use its default certificate instead.
> 3. The Secret type must be `kubernetes.io/tls`. Wrong types are silently ignored by some
>    controllers and cause certificate errors.

---

## Task 5: Default Backend

**Scenario:** Create an Ingress `catch-all` in namespace `default` that routes `app.example.com/`
to `main-svc:80`, and falls back to `error-page-svc:8080` for anything that does not match.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: catch-all
  namespace: default
spec:
  ingressClassName: nginx
  defaultBackend:                     # handles all unmatched requests
    service:
      name: error-page-svc
      port:
        number: 8080
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: main-svc
            port:
              number: 80
EOF
```

> **Exam tip:** The `defaultBackend` at the Ingress level handles requests that:
> - Match no host in any rule, **or**
> - Match a host but no path within that host's rules.
>
> It does NOT require a host or path. It is a bare service reference.

---

## Task 6: IngressClass — Default and Non-Default

**Scenario A:** Set an existing IngressClass named `nginx` as the default class.

```bash
# Patch the annotation onto the IngressClass
kubectl annotate ingressclass nginx \
  "ingressclass.kubernetes.io/is-default-class=true"

# Verify
kubectl get ingressclass nginx -o yaml | grep -A2 annotations
# annotations:
#   ingressclass.kubernetes.io/is-default-class: "true"
```

**Scenario B:** Create a new IngressClass `internal-nginx` pointing to the same controller
but without making it the default.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: internal-nginx
spec:
  controller: k8s.io/ingress-nginx
EOF
```

**Scenario C:** An Ingress has no `ingressClassName` set. How does it get handled?

```bash
# Check: is there a default IngressClass?
kubectl get ingressclass
# If exactly one has is-default-class=true → that class claims the Ingress
# If none or multiple → the Ingress is unhandled (no controller picks it up)

# Assign a class explicitly without editing the full manifest:
kubectl patch ingress my-ingress \
  -p '{"spec":{"ingressClassName":"nginx"}}'
```

> **Exam trap:** The annotation `ingressclass.kubernetes.io/is-default-class` is on the
> **IngressClass object**, not on the Ingress resource itself. A common mistake is putting
> it on the Ingress.

---

## Task 7: Debug a Broken Ingress

**Scenario:** An Ingress `broken-ingress` was created but returns `404` for all requests.
Find and fix the problem.

### Systematic Debugging Steps

```bash
# Step 1: Check the Ingress object itself
kubectl describe ingress broken-ingress
# Look for:
# - "No port defined for service": port name/number mismatch
# - "Service does not exist": wrong service name or wrong namespace
# - Events section for controller errors

# Step 2: Check if the Ingress has an IP
kubectl get ingress broken-ingress
# If ADDRESS is empty → IngressClass mismatch or controller is down

# Step 3: Verify IngressClass
kubectl get ingress broken-ingress -o jsonpath='{.spec.ingressClassName}'
kubectl get ingressclass
# Class name in Ingress must match an existing IngressClass

# Step 4: Check the backend Service
kubectl get svc <backend-service> -n <namespace>
kubectl get endpoints <backend-service> -n <namespace>
# Endpoints must NOT be empty. If empty, check pod labels vs service selector.

# Step 5: Check if Service port matches
kubectl get svc <backend-service> -o yaml | grep -A5 "ports:"
# Port number in Ingress backend must match a port exposed by the Service

# Step 6: Check controller logs
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller | grep "broken-ingress"

# Step 7: Test routing directly against the controller
kubectl get svc -n ingress-nginx
INGRESS_IP=$(kubectl get ingress broken-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl -H "Host: broken.example.com" http://$INGRESS_IP/

# Step 8: Check if host in curl request matches rule host EXACTLY
kubectl get ingress broken-ingress -o jsonpath='{.spec.rules[*].host}'
```

### Common Fixes

```bash
# Fix 1: Wrong service port number
kubectl edit ingress broken-ingress
# Change: port.number: 8000 → port.number: 8080

# Fix 2: Service in wrong namespace (Ingress and Service MUST be in same namespace)
kubectl get svc --all-namespaces | grep my-svc
# Move Ingress to correct namespace or recreate Service in correct namespace

# Fix 3: Missing IngressClass
kubectl patch ingress broken-ingress \
  -p '{"spec":{"ingressClassName":"nginx"}}'

# Fix 4: Empty endpoints (pod not running)
kubectl get pods -l app=my-app
kubectl describe pod <pod> | tail -20
```

---

## Task 8: Ingress with Rewrite Annotation

**Scenario:** Create an Ingress that serves requests at `/old-path` and rewrites them to `/new-path`
before forwarding to `app-svc:80`. Use NGINX Ingress Controller.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rewrite-ingress
  namespace: default
  annotations:
    # Rewrite the captured path to the backend
    nginx.ingress.kubernetes.io/rewrite-target: /new-path$2
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /old-path(/|$)(.*)        # capture remainder in $2
        pathType: ImplementationSpecific
        backend:
          service:
            name: app-svc
            port:
              number: 80
EOF
```

```bash
# Test: request to /old-path/foo should reach backend as /new-path/foo
curl -H "Host: myapp.example.com" http://<ingress-ip>/old-path/foo
```

> **Exam tip:** The `rewrite-target` annotation is NGINX-specific. It will not work on other
> controllers. On the exam, if the task says to use annotations, a NGINX controller is present.
> If asked to "rewrite" without specifying a mechanism, this annotation is the expected answer.

---

## Exam Tips and Traps

### ✅ Do These

**Use imperative commands for speed:**
```bash
# Create basic Ingress quickly
kubectl create ingress my-ingress \
  --class=nginx \
  --rule="example.com/=svc:80"

# Add TLS in imperative command
kubectl create ingress my-ingress \
  --class=nginx \
  --rule="example.com/*=svc:80,tls=my-tls-secret"
```

**Use `kubectl explain` for field reference:**
```bash
kubectl explain ingress.spec.rules.http.paths.pathType
kubectl explain ingress.spec.tls
```

**Copy from docs:** On the exam, go to https://kubernetes.io/docs/concepts/services-networking/ingress/
and copy the example YAML — edit the hostnames, service names, and ports.

### ❌ Avoid These Traps

1. **Wrong `pathType`:** Always include it. `Prefix` is the most common on the exam.

2. **Wrong API version in YAML:** Always use `apiVersion: networking.k8s.io/v1`. The old
   `extensions/v1beta1` will cause an error.[^k8s-deprecated-apis]

3. **TLS Secret in wrong namespace:** The Secret must be in the **same namespace** as the
   Ingress, not in `default` or `kube-system`.

4. **Port mismatch:** The `port.number` in the Ingress backend must match the port exposed by
   the Service (the Service port, not the targetPort).

5. **`ingressClassName` vs annotation:** Use `spec.ingressClassName` field, not the deprecated
   `kubernetes.io/ingress.class` annotation. The field takes precedence over the annotation.

6. **Forgetting `ingressClassName`:** If the Ingress has no class and no default IngressClass
   exists, no controller will handle it. Always set `ingressClassName`.

7. **Host header testing:** When testing with `curl`, you must set the Host header manually
   unless DNS is configured:
   ```bash
   curl -H "Host: myapp.example.com" http://<ingress-ip>/
   # NOT: curl http://myapp.example.com/  (unless DNS is set up)
   ```

8. **Exact vs Prefix for `/` path:** `pathType: Exact` with `path: /` matches ONLY the root.
   `pathType: Prefix` with `path: /` matches everything — which is usually what you want
   for a default route.

### Time-Saving Patterns

```bash
# Quick YAML scaffold — then edit
kubectl create ingress test \
  --class=nginx \
  --rule="host.com/=svc:80" \
  --dry-run=client -o yaml > ingress.yaml
# Edit ingress.yaml, then:
kubectl apply -f ingress.yaml

# Confirm Ingress is picked up (watch for ADDRESS to appear)
kubectl get ingress -w

# One-liner to get the IP
kubectl get ingress my-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

---

## References

[^k8s-ingress-pathtypes]: Kubernetes — Ingress Path Types.
  https://kubernetes.io/docs/concepts/services-networking/ingress/#path-types

[^k8s-ingress-tls]: Kubernetes — Ingress TLS.
  https://kubernetes.io/docs/concepts/services-networking/ingress/#tls

[^k8s-deprecated-apis]: Kubernetes — Deprecated API Migration Guide.
  https://kubernetes.io/docs/reference/using-api/deprecation-guide/

[^k8s-ingressclass]: Kubernetes — IngressClass.
  https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-class

[^cka-curriculum]: CNCF — CKA Curriculum.
  https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.31.pdf

[^nginx-ingress-annotations]: NGINX Ingress Controller — Annotations reference.
  https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/

---

*CKA Ingress Practice Guide — v1.0 — February 2026 — Based on Kubernetes 1.32 / CKA Curriculum v1.31+*
