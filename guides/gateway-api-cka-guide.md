<a id="kubernetes-gateway-api-cka-step-by-step-practice-guide"></a>
<a id="heading-0-kubernetes-gateway-api-cka-step-by-step-practice-"></a>

# Kubernetes Gateway API: Hướng dẫn thực hành từng bước của CKA

> **Bản tiếng Việt · CKA Kubernetes 1.35 · cập nhật 17/09/2026.** Đọc [các thay đổi cho phiên bản thi](kubernetes-1.35-update.md).


> **Phiên bản:** v1.0 — Tháng 2 năm 2026
> **Dựa trên:** Gateway API v1.4.1 (Kênh tiêu chuẩn) / đề cương CKA / Kubernetes 1.35
>
> **Ôn thi CKA 1.35:** Gateway API và Ingress đều có trong đề cương. Kiểm tra CRD, GatewayClass và controller mà đề bài cung cấp; không tự cài hoặc thay thế thành phần nếu không được yêu cầu. Các ví dụ API dùng bộ CRD 1.4.1; phiên bản CRD không phải phiên bản Kubernetes.

---

<a id="table-of-contents"></a>
<a id="heading-1-table-of-contents"></a>

## Mục lục

1. [Phạm vi kỳ thi CKA](#1-cka-exam-coverage)
2. [Thẻ tham khảo nhanh](#2-quick-reference-card)
3. [Nhiệm vụ 1: Cài đặt Gateway API CRDs](#task-1-install-gateway-api-crds)
4. [Nhiệm vụ 2: Xác minh GatewayClass](#task-2-verify-a-gatewayclass)
5. [Nhiệm vụ 3: Tạo Gateway với HTTP và HTTPS Listeners](#task-3-create-a-gateway-with-http-and-https-listeners)
6. [Nhiệm vụ 4: Tạo HTTPRoute](#task-4-create-a-basic-httproute) cơ bản
7. [Nhiệm vụ 5: Phân chia lưu lượng truy cập (Canary Deployment)](#task-5-traffic-splitting-canary-deployment)
8. [Nhiệm vụ 6: HTTP → HTTPS Chuyển hướng](#task-6-http--https-redirect)
9. [Nhiệm vụ 7: Viết lại URL và sửa đổi tiêu đề](#task-7-url-rewrite-and-header-modification)
10. [Nhiệm vụ 8: Định tuyến namespace chéo với ReferenceGrant](#task-8-cross-namespace-routing-with-referencegrant)
11. [Nhiệm vụ 9: GRPCRoute](#task-9-grpcroute)
12. [Nhiệm vụ 10: Gỡ lỗi HTTPRoute](#task-10-debug-a-broken-httproute) bị hỏng
13. [Mẹo và bẫy thi ](#exam-tips-and-traps)
14. [Tài liệu tham khảo](#references)

---

<a id="1-cka-exam-coverage"></a>
<a id="heading-2-1-cka-exam-coverage"></a>

## 1. Bảo hiểm kỳ thi CKA

Gateway API thuộc miền **Services & Mạng** (~20% bài kiểm tra CKA). Cụ thể, bạn sẽ có thể:[^cka-curriculum]

- Giải thích mô hình tài nguyên Gateway API (GatewayClass → Gateway → Route)
- Tạo và định cấu hình tài nguyên Gateway với trình nghe
- Tạo tài nguyên HTTPRoute gắn vào Cổng
- Định cấu hình TLS trên trình nghe Gateway
- Thiết lập định tuyến chéo namespace bằng ReferenceGrant
- Chẩn đoán và sửa cấu hình Gateway API bị hỏng bằng cách sử dụng các điều kiện trạng thái

<a id="what-you-need-to-know"></a>
<a id="heading-3-what-you-need-to-know"></a>

### Những điều bạn cần biết

Bài kiểm tra có thể hiển thị GatewayClass đang hoạt động (bộ điều khiển đã được cài đặt). Sau đó, bạn tạo Cổng và Tuyến đường. Các nguồn tài nguyên chính cần biết là:

1. **GatewayClass** — trong phạm vi cụm; read/inspect nhưng hiếm khi tạo bài thi
2. **Gateway** — được đặt tên; bạn sẽ tạo và cấu hình những thứ này
3. **HTTPRoute** — được đặt tên; nhiệm vụ phổ biến nhất
4. **ReferenceGrant** — được đặt tên; cần thiết cho các mẫu namespace chéo
5. **Điều kiện trạng thái** — quan trọng để gỡ lỗi

---

<a id="2-quick-reference-card"></a>
<a id="heading-4-2-quick-reference-card"></a>

## 2. Thẻ tham khảo nhanh

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                  GATEWAY API QUICK REFERENCE                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Nhóm API: gateway.networking.k8s.io                                  ║
║  Install CRDs: kubectl apply --server-side -f <standard-install.yaml>     ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  RESOURCE HIERARCHY                                                       ║
║  GatewayClass (cụm) → Gateway (ns) → HTTPRoute (ns)                   ║
║                                                                           ║
║  Lập bản đồ cá nhân:                                                         ║
║  Nhà cung cấp cơ sở hạ tầng → GatewayClass                                   ║
║  Người vận hành cụm → Gateway                                        ║
║  Nhà phát triển ứng dụng → HTTPRoute / GRPCRoute                          ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  LISTENER PROTOCOLS                                                       ║
║  HTTP  80    No TLS                                                       ║
║  HTTPS 443 Chấm dứt (yêu cầu tls.certificateRefs)                    ║
║  TLS bất kỳ Thông qua nào (thử nghiệm; không cần chứng chỉ)                   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  HTTPROUTE MATCH TYPES                                                    ║
║  PathPrefix/Chính xác/RegularExpression                                   ║
║  tiêu đề, phương thức, queryParams                                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  HTTPROUTE FILTER TYPES (CORE)                                            ║
║  Tiêu đề yêu cầu requestHeaderModifier add/set/remove                   ║
║  Tiêu đề phản hồi ResponseHeaderModifier add/set/remove                  ║
║  Yêu cầu chuyển hướng chuyển hướng HTTP (scheme/host/path/status)          ║
║  URLRewrite viết lại URL trước khi chuyển tiếp (Mở rộng)         ║
║  Yêu cầu sao chép lưu lượng truy cập vào chương trình phụ trợ phản chiếu (Mở rộng)        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  STATUS CONDITIONS TO KNOW                                                ║
║  Gateway: Đã chấp nhận | Được lập trình | Đã giải quyếtTham chiếu                          ║
║  HTTPRoute: Đã chấp nhận | Đã giải quyếtRefs (mỗi phụ huynh)                          ║
║  Lý do: NoMatchingParent | NotAllowedByListeners | Giới thiệuKhông được phép    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  REFERENCEGRANT RULE                                                      ║
║  Cấp phải nằm trong MỤC TIÊU namespace (nơi đối tượng được tham chiếu tồn tại)║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

<a id="task-1-install-gateway-api-crds"></a>
<a id="heading-5-task-1-install-gateway-api-crds"></a>

## Nhiệm vụ 1: Cài đặt Gateway API CRDs

**Kịch bản:** Một cụm mới đang chạy nhưng Gateway API CRDs chưa được cài đặt. Cài đặt kênh tiêu chuẩn CRDs.

<a id="step-1--check-if-already-installed"></a>
<a id="heading-6-step-1-check-if-already-installed"></a>

### Bước 1 - Kiểm tra xem đã được cài đặt chưa

```bash
kubectl get crd | grep gateway.networking.k8s.io
# Nếu không có đầu ra → CRDs chưa được cài đặt
# Nếu bạn thấy gatewayclasses.gateway.networking.k8s.io → đã được cài đặt
```

<a id="step-2--install"></a>
<a id="heading-7-step-2-install"></a>

### Bước 2 - Cài đặt

```bash
# Kênh tiêu chuẩn - sử dụng --server-side để tránh kích thước chú thích limits
kubectl apply --server-side -f \
  https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.1/standard-install.yaml
```

<a id="step-3--verify"></a>
<a id="heading-8-step-3-verify"></a>

### Bước 3 - Xác minh

```bash
kubectl get crd | grep gateway
# backendtlspolicies.gateway.networking.k8s.io Đúng
# gatewayclasses.gateway.networking.k8s.io Đúng
# gateways.gateway.networking.k8s.io Đúng
# grpcroutes.gateway.networking.k8s.io Đúng
# httproutes.gateway.networking.k8s.io Đúng
# referencegrants.gateway.networking.k8s.io Đúng
```

> **Mẹo thi:** Trong bài thi, hãy sử dụng `--server-side` với `kubectl apply` cho Gateway API CRDs.
> Nếu không có nó, bạn có thể gặp lỗi "metadata.annotations: Quá dài" đối với các lược đồ CRD lớn.[^gateway-api-install]

---

<a id="task-2-verify-a-gatewayclass"></a>
<a id="heading-9-task-2-verify-a-gatewayclass"></a>

## Nhiệm vụ 2: Xác minh GatewayClass

**Tình huống:** Bộ điều khiển đã được cài đặt. Tìm tên GatewayClass và xác nhận nó được chấp nhận.

```bash
# Liệt kê tất cả các lớp Gateway
kubectl get gatewayclass
# NAME      CONTROLLER                       ACCEPTED   AGE
# cilium io.cilium/gateway-controller Đúng 20m

# Kiểm tra tình trạng
kubectl describe gatewayclass cilium
# Tình trạng:
#   Điều kiện:
#     Kiểu: Được chấp nhận
#     Trạng thái: Đúng
#     Lý do: Đã chấp nhận
#     Tin nhắn: Đã chấp nhận GatewayClass

# Lấy tên bộ điều khiển (bạn cần tên này để tạo Cổng)
kubectl get gatewayclass cilium -o jsonpath='{.spec.controllerName}'
# io.cilium/gateway-controller
```

> **Mẹo thi:** Nếu `Accepted: False`, bộ điều khiển không chạy hoặc `controllerName` đang hoạt động
> GatewayClass không khớp với những gì bộ điều khiển đã cài đặt mong đợi. Kiểm tra bộ điều khiển pods:
> `kubectl get pods -A | grep -i gateway`

---

<a id="task-3-create-a-gateway-with-http-and-https-listeners"></a>
<a id="heading-10-task-3-create-a-gateway-with-http-and-https-liste"></a>

## Nhiệm vụ 3: Tạo Gateway với HTTP và HTTPS Listener

**Kịch bản:** Tạo Gateway có tên `prod-gw` trong namespace `infra` bằng GatewayClass `cilium`. Định cấu hình hai trình nghe: HTTP trên cổng 80 và HTTPS trên cổng 443. TLS Secret `prod-tls-secret` đã tồn tại trong namespace `infra`. Cho phép các tuyến đường từ bất kỳ namespace nào.

<a id="step-1--create-the-gateway"></a>
<a id="heading-11-step-1-create-the-gateway"></a>

### Bước 1 - Tạo Gateway

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

<a id="step-2--wait-for-the-gateway-to-be-programmed"></a>
<a id="heading-12-step-2-wait-for-the-gateway-to-be-programmed"></a>

### Bước 2 - Đợi Gateway được lập trình

```bash
kubectl get gateway prod-gw -n infra -w
# NAME      CLASS    ADDRESS         PROGRAMMED   AGE
# prod-gw cilium 203.0.113.10 Đúng 45s
```

<a id="step-3--inspect-status-for-issues"></a>
<a id="heading-13-step-3-inspect-status-for-issues"></a>

### Bước 3 - Kiểm tra trạng thái của sự cố

```bash
kubectl describe gateway prod-gw -n infra
# Hãy tìm:
# Điều kiện:
#   Đã chấp nhận: Đúng → Gateway hợp lệ
#   Đã lập trình: Đúng → LB đã sẵn sàng
#   Đã giải quyếtRefs: Đúng → TLS Secret được tìm thấy và hợp lệ
#
# Người nghe:
#   http (cổng 80): Đã lập trình: Đúng
#   https (cổng 443): Đã lập trình: Đúng

# Nếu Đã giải quyếtTham chiếu: Sai, hãy kiểm tra Secret:
kubectl get secret prod-tls-secret -n infra
```

> **Bẫy thi cử:**
> 1. TLS Secret phải ở trong **namespace giống như Gateway** (hoặc được phép thông qua
>    ReferenceGrant trong namespace của Secret).
> 2. Trường `certificateRefs[].group` phải là `""` (chuỗi trống) cho lõi Kubernetes
>    Secrets. Việc bỏ qua `group` khác với việc đặt nó thành `""`.
> 3. `listener.name` được sử dụng trong `parentRefs[].sectionName` của HTTPRoute để gắn vào một thiết bị cụ thể
>    người nghe. Tên phải là duy nhất trong Gateway.

---

<a id="task-4-create-a-basic-httproute"></a>
<a id="heading-14-task-4-create-a-basic-httproute"></a>

## Nhiệm vụ 4: Tạo HTTPRoute cơ bản

**Kịch bản:** Tạo HTTPRoute có tên `app-route` trong namespace `production`. Định tuyến lưu lượng truy cập từ `myapp.example.com` (tất cả các đường dẫn) đến Service `app-svc` trên cổng 80. Gắn vào trình nghe `https` của `prod-gw` Gateway trong `infra` namespace.

<a id="step-1--create-the-httproute"></a>
<a id="heading-15-step-1-create-the-httproute"></a>

### Bước 1 - Tạo HTTPRoute

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
    namespace: infra             # Gateway nằm trong một namespace khác
    sectionName: https           # đính kèm cụ thể vào trình nghe "https"
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

<a id="step-2--verify-the-route-is-accepted"></a>
<a id="heading-16-step-2-verify-the-route-is-accepted"></a>

### Bước 2 - Xác minh tuyến đường được chấp nhận

```bash
kubectl describe httproute app-route -n production
# Tình trạng:
#   Cha mẹ:
#   - ParentRef: prod-gw (infra/Gateway)
#     Điều kiện:
#     - Loại: Chấp nhận
#       Trạng thái: "Đúng"
#       Lý do: Đã chấp nhận
#     - Loại: Đã giải quyếtRefs
#       Trạng thái: "Đúng"
#       Lý do: Đã giải quyếtRefs
```

<a id="step-3--test-connectivity"></a>
<a id="heading-17-step-3-test-connectivity"></a>

### Bước 3 - Kiểm tra kết nối

```bash
# Nhận IP Gateway
GW_IP=$(kubectl get gateway prod-gw -n infra -o jsonpath='{.status.addresses[0].value}')
echo $GW_IP

# Kiểm tra từ bên trong cụm
kubectl run test --rm -it --image=nicolaka/netshoot -- bash
# Bên trong:
curl -k -H "Host: myapp.example.com" https://$GW_IP/
```

> **Mẹo thi:** Trường `parentRefs[].namespace` là bắt buộc khi HTTPRoute và Gateway
> có namespaces khác nhau. Nếu bị bỏ qua, nó sẽ mặc định là namespace của Tuyến. Một sự mất tích
> namespace ở đây là nguồn phổ biến gây ra lỗi `NoMatchingParent`.

---

<a id="task-5-traffic-splitting-canary-deployment"></a>
<a id="heading-18-task-5-traffic-splitting-canary-deployment"></a>

## Nhiệm vụ 5: Phân chia lưu lượng (Canary Deployment)

**Tình huống:** Bạn có hai phiên bản dịch vụ đang chạy: `app-stable-svc:80` (trọng lượng 90%) và `app-canary-svc:80` (trọng lượng 10%). Tạo HTTPRoute để phân chia lưu lượng giữa chúng.

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
      weight: 90                 # 90% phù hợp với requests
    - name: app-canary-svc
      port: 80
      weight: 10                 # 10% phù hợp requests
EOF
```

<a id="verify-traffic-weights"></a>
<a id="heading-19-verify-traffic-weights"></a>

### Xác minh trọng số lưu lượng truy cập

```bash
kubectl describe httproute canary-route -n production | grep -A 20 "Rules:"
# Quy tắc:
#   Tham khảo phụ trợ:
#     Trọng lượng: 90 Tên: app-stable-svc Cổng: 80
#     Trọng lượng: 10 Tên: app-canary-svc Cổng: 80
```

<a id="gradually-shift-traffic-complete-rollout"></a>
<a id="heading-20-gradually-shift-traffic-complete-rollout"></a>

### Thay đổi dần lưu lượng truy cập (triển khai hoàn chỉnh)

```bash
# Cập nhật lên phần chia 50/50
kubectl patch httproute canary-route -n production --type='json' \
  -p='[
    {"op":"replace","path":"/spec/rules/0/backendRefs/0/weight","value":50},
    {"op":"replace","path":"/spec/rules/0/backendRefs/1/weight","value":50}
  ]'

# Chuyển 100% sang canary (hoàn tất quá trình triển khai)
kubectl patch httproute canary-route -n production --type='json' \
  -p='[
    {"op":"replace","path":"/spec/rules/0/backendRefs/0/weight","value":0},
    {"op":"replace","path":"/spec/rules/0/backendRefs/1/weight","value":100}
  ]'
```

> **Mẹo thi:** Trọng số mang tính tương đối (không phải tỷ lệ phần trăm). `weight: 1` và `weight: 1` có nghĩa là 50/50
> — chúng không cần tổng bằng 100. `weight: 0` có nghĩa là phần phụ trợ không nhận được lưu lượng truy cập nhưng vẫn
> vẫn được liệt kê trong tài nguyên.

---

<a id="task-6-http--https-redirect"></a>
<a id="heading-21-task-6-http-https-redirect"></a>

## Nhiệm vụ 6: Chuyển hướng HTTP → HTTPS

**Kịch bản:** Tạo HTTPRoute chuyển hướng tất cả lưu lượng truy cập HTTP trên `www.example.com` sang HTTPS bằng chuyển hướng 301. Gateway `prod-gw` trong `infra` có cả trình nghe HTTP (cổng 80) và HTTPS (cổng 443).

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
    sectionName: http            # chỉ đính kèm với trình nghe HTTP
  hostnames:
  - www.example.com
  rules:
  - filters:
    - type: RequestRedirect
      requestRedirect:
        scheme: https
        statusCode: 301          # 301 Thường trực, 302 Tạm thời, 307, 308
    # Lưu ý: KHÔNG có phần phụ trợ - quy tắc chuyển hướng không chuyển tiếp đến phần phụ trợ
EOF
```

<a id="test-the-redirect"></a>
<a id="heading-22-test-the-redirect"></a>

### Kiểm tra chuyển hướng

```bash
GW_IP=$(kubectl get gateway prod-gw -n infra -o jsonpath='{.status.addresses[0].value}')

# Nên trả về 301 với Vị trí: https://www.example.com/
curl -v -H "Host: www.example.com" http://$GW_IP/some/path
# < HTTP/1.1 301 Đã di chuyển vĩnh viễn
# < Vị trí: https://www.example.com/some/path
```

> **Bẫy thi cử:**
> 1. Chuyển hướng HTTPRoute phải đính kèm với **HTTP trình nghe** (`sectionName: http`), chứ không phải
>    thiết bị nghe HTTPS. Việc gắn vào trình nghe HTTPS để chuyển hướng có nghĩa là chuyển hướng sẽ kích hoạt
>    sau khi chấm dứt TLS — không phải là hành vi dự định dành cho HTTP→HTTPS.
> 2. Quy tắc chuyển hướng **không** sử dụng `backendRefs`. Bao gồm `backendRef` trong quy tắc chuyển hướng
>    là một lỗi trong hầu hết các triển khai.

---

<a id="task-7-url-rewrite-and-header-modification"></a>
<a id="heading-23-task-7-url-rewrite-and-header-modification"></a>

## Nhiệm vụ 7: Viết lại URL và sửa đổi tiêu đề

**Kịch bản:** Tạo một HTTPRoute:
1. Viết lại requests thành `/app/v1/*` nên tiền tố `/app/v1` được thay thế bằng `/v1` trước đó
chuyển tiếp tới `app-svc:8080`.
2. Thêm tiêu đề yêu cầu `X-Forwarded-By: gateway` trước khi chuyển tiếp.
3. Thêm tiêu đề phản hồi `X-Frame-Options: DENY`.

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
    # URLRewrite (Tính năng mở rộng): viết lại tiền tố đường dẫn
    - type: URLRewrite
      urlRewrite:
        path:
          type: ReplacePrefixMatch
          replacePrefixMatch: /v1    # /app/v1/users → /v1/users
    # requestHeaderModifier (Core): thêm tiêu đề trước khi chuyển tiếp sang backend
    - type: RequestHeaderModifier
      requestHeaderModifier:
        add:
        - name: X-Forwarded-By
          value: gateway
    # ResponseHeaderModifier (Mở rộng): thêm tiêu đề vào phản hồi phụ trợ
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

<a id="test-the-rewrite"></a>
<a id="heading-24-test-the-rewrite"></a>

### Kiểm tra việc viết lại

```bash
GW_IP=$(kubectl get gateway prod-gw -n infra -o jsonpath='{.status.addresses[0].value}')

# Yêu cầu tới /app/v1/users phải đạt đến phần phụ trợ dưới dạng /v1/users
curl -k -v -H "Host: myapp.example.com" https://$GW_IP/app/v1/users
# Tùy chọn khung X: DENY sẽ xuất hiện trong tiêu đề phản hồi
```

> **Mẹo thi:** `URLRewrite` và `ResponseHeaderModifier` là các tính năng **Mở rộng** — chúng là
> tùy chọn để triển khai hỗ trợ. Trong kỳ thi, nếu nhiệm vụ liên quan đến những điều này, cụm
> sẽ có một triển khai hỗ trợ chúng. Sử dụng `kubectl describe httproute` để kiểm tra xem
> bộ lọc không được hỗ trợ:
> ``` bash
> # Tìm các điều kiện liên quan đến bộ lọc trong trạng thái Tuyến đường
> kubectl mô tả httproute rewrite-route -n production | grep -i "bộ lọc\|không được hỗ trợ"
> ```

---

<a id="task-8-cross-namespace-routing-with-referencegrant"></a>
<a id="heading-25-task-8-cross-namespace-routing-with-referencegran"></a>

## Nhiệm vụ 8: Định tuyến namespace chéo với ReferenceGrant

**Kịch bản:** HTTPRoute trong namespace `frontend` cần tham chiếu Gateway trong namespace `infra` VÀ Service trong namespace `backend`. Thiết lập ReferenceGrant cần thiết và tạo HTTPRoute.

<a id="step-1--understand-what-grants-are-needed"></a>
<a id="heading-26-step-1-understand-what-grants-are-needed"></a>

### Bước 1 - Hiểu những khoản tài trợ nào là cần thiết

- HTTPRoute (trong `frontend`) → Gateway (trong `infra`): **Không cần thiết** — được điều khiển bởi Gateway
`allowedRoutes`. Gateway phải có `from: All` hoặc bộ chọn bao gồm `frontend`.

- HTTPRoute (trong `frontend`) → Service (trong `backend`): **ReferenceGrant bắt buộc** — phải có
được tạo trong `backend` namespace.

<a id="step-2--create-the-referencegrant-in-the-backend-namespace"></a>
<a id="heading-27-step-2-create-the-referencegrant-in-the-backend-"></a>

### Bước 2 - Tạo ReferenceGrant trong phần phụ trợ namespace

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-frontend-to-backend
  namespace: backend               # ← namespace SỞ HỮU Service
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: HTTPRoute
    namespace: frontend            # ← cho phép HTTPRoutes từ namespace này
  to:
  - group: ""
    kind: Service                  # ← cho phép tham chiếu tới Services
    # tên: api-svc # tùy chọn giới hạn ở một tên Service cụ thể
EOF
```

<a id="step-3--create-the-httproute"></a>
<a id="heading-28-step-3-create-the-httproute"></a>

### Bước 3 - Tạo HTTPRoute

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
    namespace: infra               # tham chiếu chéo namespace Gateway (được phépRoutes cho phép)
    sectionName: https
  hostnames:
  - shop.example.com
  rules:
  - backendRefs:
    - name: api-svc
      namespace: backend           # tham chiếu chéo namespace Service (yêu cầu ReferenceGrant)
      port: 8080
EOF
```

<a id="step-4--verify"></a>
<a id="heading-29-step-4-verify"></a>

### Bước 4 - Xác minh

```bash
kubectl describe httproute cross-ns-route -n frontend
# Status.Parents[].Điều kiện:
# - Loại: Chấp nhận
#   Trạng thái: "Đúng"
# - Loại: Đã giải quyếtRefs
#   Trạng thái: "Đúng" ← Nếu điều này là Sai với lý do "RefNotPerfused",
#                        ReferenceGrant bị thiếu hoặc bị định cấu hình sai

# Đồng thời xác minh ReferenceGrant tồn tại:
kubectl get referencegrant -n backend
```

> **Bẫy thi cử:**
> 1. ReferenceGrant phải nằm trong **đích namespace** (namespace của đối tượng đang được
>    được tham chiếu), không phải nguồn namespace. Một lỗi thi phổ biến là tạo khoản trợ cấp trong
>    namespace của HTTPRoute.
> 2. Trường `spec.to[].group` cho Kubernetes Services phải là `""` (chuỗi trống) —
>    Services nằm trong nhóm API cốt lõi, không phải `apps` hay bất kỳ nhóm nào khác.
> 3. Tệp đính kèm Gateway-to-Route sử dụng `allowedRoutes`, không phải ReferenceGrant. Chỉ cấp đối tượng
>    tài liệu tham khảo (Service, Secret) cần ReferenceGrant.

---

<a id="task-9-grpcroute"></a>
<a id="heading-30-task-9-grpcroute"></a>

## Nhiệm vụ 9: GRPCRoute

**Kịch bản:** Tạo GRPCRoute có tên `user-grpc-route` trong namespace `grpc-apps` định tuyến các cuộc gọi đến phương thức `com.example.UserService.GetUser` tới `user-svc:50051` và tất cả các phương thức khác của `com.example.UserService` đến `user-svc-default:50051`. Gateway `grpc-gw` trong namespace `infra` có một trình nghe có tên `grpc` trên cổng 50051 với giao thức HTTPS.

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
  # ── Phương pháp cụ thể phù hợp (mức độ ưu tiên cao hơn) ──────────────────────────────
  - matches:
    - method:
        type: Exact
        service: com.example.UserService
        method: GetUser
    backendRefs:
    - name: user-svc
      port: 50051

  # ── Tất cả các phương thức của dịch vụ (mức độ ưu tiên thấp hơn) ─────────────────────────
  - matches:
    - method:
        type: Exact
        service: com.example.UserService
        # không có phương thức: trường → khớp với TẤT CẢ các phương thức của dịch vụ này
    backendRefs:
    - name: user-svc-default
      port: 50051
EOF
```

<a id="verify"></a>
<a id="heading-31-verify"></a>

### Xác minh

```bash
kubectl describe grpcroute user-grpc-route -n grpc-apps
# Tình trạng:
#   Cha mẹ:
#   - ParentRef: grpc-gw (infra/Gateway)
#     Điều kiện:
#     - Loại: Đã chấp nhận, Trạng thái: "Đúng"
#     - Loại: Đã giải quyếtRefs, Trạng thái: "Đúng"
```

> **Mẹo làm bài thi:**
> 1. GRPCRoute là tài nguyên `gateway.networking.k8s.io/v1` (cùng nhóm với HTTPRoute, không phải
>    alpha). Trường `spec` là bắt buộc (không thể bỏ qua, ngay cả khi trống).[^grpcroute-spec]
> 2. gRPC yêu cầu HTTP/2. Trình nghe Gateway phải sử dụng `protocol: HTTPS` hoặc `protocol: HTTP`
>    với sự hỗ trợ HTTP/2. Hầu hết các triển khai đều yêu cầu HTTPS cho gRPC.
> 3. GRPCRoute và HTTPRoute không thể chia sẻ cùng một tên máy chủ trên cùng một trình nghe.

---

<a id="task-10-debug-a-broken-httproute"></a>
<a id="heading-32-task-10-debug-a-broken-httproute"></a>

## Nhiệm vụ 10: Gỡ lỗi HTTPRoute bị hỏng

**Kịch bản:** HTTPRoute `my-route` trong namespace `apps` đã được định cấu hình nhưng lưu lượng không được định tuyến. Chẩn đoán và khắc phục sự cố.

<a id="systematic-debugging"></a>
<a id="heading-33-systematic-debugging"></a>

### Gỡ lỗi hệ thống

```bash
# Bước 1: Kiểm tra trạng thái HTTPRoute - đây là điểm bắt đầu QUAN TRỌNG NHẤT
kubectl describe httproute my-route -n apps
# Hãy xem kỹ phần "Trạng thái":
# - Phụ huynh: nên liệt kê Gateway mà bạn đang mong đợi
# - Nếu trống: Tuyến đường chưa được gắn vào bất kỳ Gateway nào
# - Điều kiện về cha mẹ:
#   * Đã chấp nhận: True/False → tuyến đường có hợp lệ và được đính kèm không?
#   * Đã giải quyếtRefs: True/False → Services phụ trợ và các ref khác có hợp lệ không?
#   * Lý do: đưa ra lỗi cụ thể

# Bước 2: Giải thích các điều kiện chung
# ── NoMatchingParent ──
# ParentRef name/namespace/sectionName không khớp với bất kỳ trình nghe Gateway nào.
# Khắc phục: kiểm tra parentRefs.name, parentRefs.namespace và parentRefs.sectionName
kubectl get gateway -A | grep <name>

# ── NotAllowedByListeners ──
# Các đường được phép của Gateway không cho phép các tuyến đường từ namespace này.
# Khắc phục: kiểm tra spec.listeners[].allowedRoutes của Gateway
kubectl get gateway <n> -n <ns> -o jsonpath='{.spec.listeners[*].allowedRoutes}'

# ── Không được phép ──
# Tham chiếu chéo namespace (Service hoặc Secret) thiếu ReferenceGrant.
# Khắc phục: tạo ReferenceGrant trong namespace mục tiêu
kubectl get referencegrant -A

# ── Không tìm thấy phần cuối ──
# Service có tên trong backendRef không tồn tại trong namespace của Tuyến (hoặc namespace được chỉ định).
# Khắc phục: kiểm tra Service tồn tại với tên và cổng chính xác
kubectl get svc <name> -n <namespace>

# ── Xung đột tên máy chủ ──
# Một Tuyến khác đã xác nhận cùng tên máy chủ trên cùng một trình nghe.
kubectl get httproute -A | grep <hostname>
```

<a id="quick-fix-patterns"></a>
<a id="heading-34-quick-fix-patterns"></a>

### Mẫu sửa nhanh

```bash
# Cách khắc phục 1: Tên phần sai
kubectl edit httproute my-route -n apps
# Thay đổi: tên phần: tên sai → tên phần: https
# Nhận tên người nghe có sẵn:
kubectl get gateway prod-gw -n infra -o jsonpath='{.spec.listeners[*].name}'

# Khắc phục 2: Thiếu Gateway namespace trong parentRef
kubectl patch httproute my-route -n apps --type='json' \
  -p='[{"op":"add","path":"/spec/parentRefs/0/namespace","value":"infra"}]'

# Khắc phục 3: Không tìm thấy Service - kiểm tra tên chính xác và namespace
kubectl get svc -n apps | grep app
kubectl edit httproute my-route -n apps
# Sửa backendRef.name hoặc thêm namespace chính xác bằng ReferenceGrant

# Cách 4: Sai cổng
kubectl get svc app-svc -n apps -o jsonpath='{.spec.ports[*].port}'
kubectl edit httproute my-route -n apps
# Sửa số cổng trong backendRef

# Khắc phục 5: Gateway được lập trình: Sai (sự cố TLS Secret)
kubectl describe gateway prod-gw -n infra | grep -A5 "Programmed"
kubectl get secret <tls-secret-name> -n infra
```

<a id="verification-after-fix"></a>
<a id="heading-35-verification-after-fix"></a>

### Xác minh sau khi sửa

```bash
# Theo dõi trạng thái cập nhật (có thể mất vài giây)
kubectl get httproute my-route -n apps -w

# Kiểm tra xác nhận cuối cùng
GW_IP=$(kubectl get gateway prod-gw -n infra -o jsonpath='{.status.addresses[0].value}')
kubectl run test --rm -it --image=nicolaka/netshoot -- \
  curl -sk -H "Host: myapp.example.com" https://$GW_IP/
```

---

<a id="exam-tips-and-traps"></a>
<a id="heading-36-exam-tips-and-traps"></a>

## Mẹo và bẫy thi

<a id="-do-these"></a>
<a id="heading-37--do-these"></a>

### ✅ Hãy làm những điều này

**Học thuộc lòng các điều kiện trạng thái.** Bài kiểm tra sẽ kiểm tra khả năng đọc đầu ra `kubectl describe` của bạn và xác định vấn đề từ các điều kiện. Bảng dưới đây rất quan trọng:

| tình trạng | Ý nghĩa | Sửa lỗi chung |
|---|---|---|
| `NoMatchingParent` | parentRef không khớp với người nghe | Sửa name/namespace/sectionName |
| `NotAllowedByListeners` | Các tuyến được phép của Gateway từ chối namespace này | Cập nhật Gateway được phépTuyến đường |
| `RefNotPermitted` | Thiếu ReferenceGrant cho tham chiếu chéo ns | Tạo ReferenceGrant trong mục tiêu ns |
| `BackendNotFound` | Service không tồn tại | Kiểm tra tên Service và namespace |
| `HostnameConflict` | Một tuyến khác sở hữu tên máy chủ này | Tên máy chủ khác hoặc xóa xung đột |

**Sử dụng `kubectl explain` để khám phá hiện trường:**
```bash
kubectl explain httproute.spec.rules.filters
kubectl explain httproute.spec.parentRefs
kubectl explain gateway.spec.listeners.tls
kubectl explain referencegrant.spec
```

**Sử dụng tài liệu Kubernetes trong bài kiểm tra.** Tìm kiếm "gateway api" để tìm YAML mẫu. Sao chép và chỉnh sửa thay vì ghi từ bộ nhớ. Các tài liệu chính thức tại https://kubernetes.io/docs/ bao gồm nội dung Gateway API.

<a id="-avoid-these-traps"></a>
<a id="heading-38--avoid-these-traps"></a>

### ❌ Tránh những cái bẫy này

1. **ReferenceGrant sai namespace.** Nó phải nằm trong **đích** namespace (trong đó
được tham chiếu trực tiếp Service hoặc Secret), không có trong namespace.[^gateway-api-referencegrant] của HTTPRoute

2. **Thiếu `namespace` trong `parentRefs`.** Nếu HTTPRoute và Gateway khác nhau
namespaces, bạn PHẢI chỉ định `parentRefs[].namespace`. Việc bỏ qua nó mặc định là namespace của Tuyến, gây ra `NoMatchingParent`.

3. **`group` sai trong `certificateRefs` hoặc ReferenceGrant `to`.** Đối với đối tượng cốt lõi Kubernetes
(Secret, Service), nhóm phải là `""` (chuỗi trống), không phải `"v1"` hoặc `"core"`.

4. **Đính kèm trình nghe `HTTP` bằng sơ đồ HTTPS trong parentRef.** Các tuyến cho lưu lượng truy cập HTTPS
phải đính kèm với trình nghe `HTTPS`. Tuyến được gắn với trình nghe `HTTP` không thể phục vụ TLS.

5. **GRPCRoute với trường `spec` bị bỏ qua.** Vì v1.4, trường `spec` là bắt buộc và sẽ
xác thực không thành công nếu vắng mặt.[^grpcroute-spec]

6. **Quy tắc chuyển hướng với các tham chiếu phụ trợ.** Bộ lọc chuyển hướng không chuyển tiếp đến phần phụ trợ. Bao gồm
`backendRefs` trong quy tắc chuyển hướng được cho phép về mặt kỹ thuật nhưng gây nhầm lẫn — chuyển hướng kích hoạt trước khi liên hệ với phần phụ trợ.

7. **Quên rằng `allowedRoutes` trên Gateway sẽ kiểm soát phần đính kèm Tuyến đường** (không phải ReferenceGrant).
Luôn kiểm tra `allowedRoutes.namespaces` nếu Tuyến không được đính kèm.

<a id="time-saving-patterns"></a>
<a id="heading-39-time-saving-patterns"></a>

### Mô hình tiết kiệm thời gian

```bash
# Kiểm tra trạng thái nhanh cho tất cả các tuyến trong namespace
kubectl get httproute -n apps
kubectl describe httproute -n apps | grep -E "(Name:|Accepted|ResolvedRefs|Reason)"

# Tìm nhanh IP Gateway
kubectl get gateway -A

# Nhận tất cả tên người nghe cho Gateway
kubectl get gateway prod-gw -n infra -o jsonpath='{range .spec.listeners[*]}{.name}{"\n"}{end}'

# Kiểm tra nhanh xem có cần ReferenceGrant không (tìm RefNotPermit)
kubectl describe httproute <n> -n <ns> | grep "RefNotPermitted"

# Skeleton HTTPRoute để sao chép-chỉnh sửa
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

<a id="references"></a>
<a id="heading-40-references"></a>

## Tài liệu tham khảo








---

*Hướng dẫn thực hành CKA Gateway API — v1.0 — Tháng 2 năm 2026 — Gateway API v1.4.1 Kênh tiêu chuẩn / đề cương CKA / Kubernetes 1.35*

[^cka-curriculum]: CNCF — Đề cương CKA; xem bản hiện hành.
[^gateway-api-install]: Kubernetes Gateway API — Bắt đầu.
[^gateway-api-referencegrant]: Kubernetes Gateway API — ReferenceGrant.
[^grpcroute-spec]: Kubernetes Gateway API v1.4 — Trường thông số GRPCRoute hiện bắt buộc.
[^gateway-api-versioning]: Kubernetes Gateway API - Phiên bản và kênh.
[^gateway-api-overview]: Kubernetes Gateway API — API Tổng quan.
[^k8s-ingress]: Kubernetes — Các khái niệm Ingress.
