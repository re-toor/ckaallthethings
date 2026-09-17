<a id="kubernetes-gateway-api-complete-guide"></a>
<a id="heading-0-kubernetes-gateway-api-complete-guide"></a>

# Kubernetes Gateway API: Hướng dẫn đầy đủ

> **Bản tiếng Việt · CKA Kubernetes 1.35 · cập nhật 17/09/2026.** Đọc [các thay đổi cho phiên bản thi](kubernetes-1.35-update.md).


> **Phiên bản:** v1.0 — Tháng 2 năm 2026
> **Dựa trên:** Gateway API v1.4.1 (Kênh chuẩn) / Kubernetes 1.35
> **Cài đặt:** `kubectl apply --server-side -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.1/standard-install.yaml`

---

<a id="table-of-contents"></a>
<a id="heading-1-table-of-contents"></a>

## Mục lục

1. [Gateway API là gì?](#1-what-is-gateway-api)
2. [Triết lý thiết kế và Role Model](#2-design-philosophy-and-role-model)
3. [Tổng quan về tài nguyên](#3-resource-overview)
4. [Kênh tiêu chuẩn và kênh thử nghiệm](#4-standard-vs-experimental-channels)
5. [Cài đặt](#5-installation)
6. [GatewayClass](#6-gatewayclass)
7. [Gateway](#7-gateway)
8. [HTTPRoute](#8-httproute)
9. [GRPCRoute](#9-grpcroute)
10. [ReferenceGrant](#10-referencegrant)
11. [Phần cuốiTLSPolicy](#11-backendtlspolicy)
12. [Mẫu cấu hình TLS](#12-tls-configuration-patterns)
13. [Quản lý giao thông](#13-traffic-management)
14. [Định tuyến namespace chéo](#14-cross-namespace-routing)
15. [Service Lưới (GAMMA)](#15-service-mesh-gamma)
16. [Triển khai](#16-implementations)
17. [Đính kèm chính sách](#17-policy-attachment)
18. [Di chuyển từ Ingress](#18-migration-from-ingress)
19. [Khắc phục sự cố](#19-troubleshooting)
20. [Tài liệu tham khảo](#20-references)

---

<a id="1-what-is-gateway-api"></a>
<a id="heading-2-1-what-is-gateway-api"></a>

## 1. Gateway API là gì?

**Gateway API** là dự án Kubernetes chính thức (`kubernetes-sigs/gateway-api`) tập trung vào định tuyến L4 và L7. Nó là sản phẩm kế thừa của Ingress API, được thiết kế hoàn toàn mới để giải quyết các hạn chế cơ bản của Ingress.[^gateway-api-intro]

<a id="problems-with-ingress"></a>
<a id="heading-3-problems-with-ingress"></a>

### Sự cố với Ingress

Ingress API đã được sản xuất kể từ Kubernetes 1.1. Mặc dù được áp dụng rộng rãi nhưng nó đã tích lũy được khoản nợ kỹ thuật đáng kể:

**Khả năng biểu đạt hạn chế:** Các tính năng định tuyến cốt lõi như tính trọng số lưu lượng, định tuyến dựa trên tiêu đề, phản chiếu yêu cầu và thời gian chờ không phải là một phần của thông số kỹ thuật. Tất cả các bộ điều khiển đều triển khai chúng thông qua các chú thích dành riêng cho nhà cung cấp — và những chú thích này không thể mang theo được.

**Không phân tách vai trò:** Ingress kết hợp các mối quan tâm về cơ sở hạ tầng (bộ cân bằng tải nào xử lý việc này?) với các mối quan tâm về ứng dụng (đường dẫn này tiếp cận dịch vụ nào?). Nhà phát triển tạo Ingress cần có quyền cấp cụm để tham chiếu IngressClasses.

**Chỉ L7 HTTP:** Ingress không có khái niệm về chuyển tiếp gRPC, TCP, TLS hoặc định tuyến UDP.

**Sự cố cấu hình được chia sẻ:** Đối tượng Ingress không thể chia sẻ các đoạn cấu hình với các đối tượng Ingress khác. Mỗi đội phải sao chép cài đặt TLS, xác thực và thời gian chờ.

<a id="gateway-api-improvements"></a>
<a id="heading-4-gateway-api-improvements"></a>

### Những cải tiến của Gateway API

Gateway API giải quyết tất cả những vấn đề trên bằng mô hình tài nguyên mới đó là:

**Định hướng Role:** Ba tài nguyên riêng biệt ánh xạ tới ba đặc điểm tổ chức: nhà cung cấp cơ sở hạ tầng quản lý GatewayClass, nhà điều hành cụm quản lý Gateway và nhà phát triển ứng dụng quản lý Tuyến đường. Mỗi nhân vật chỉ kiểm soát lớp của họ.

**Biểu cảm:** Trọng số lưu lượng truy cập, khớp và sửa đổi tiêu đề, viết lại URL, chuyển hướng yêu cầu, sao chép và định tuyến gRPC là các trường thông số kỹ thuật hạng nhất — không phải chú thích.

**Di động:** Mọi hoạt động triển khai tuân thủ đều hỗ trợ các tài nguyên kênh Tiêu chuẩn giống nhau. Các điểm mở rộng tồn tại cho các tính năng dành riêng cho nhà cung cấp, nhưng hành vi cốt lõi là nhất quán.

**Nhận biết giao thức:** HTTPRoute dành cho HTTP/HTTPS, GRPCRoute dành cho gRPC, TLSRoute dành cho chuyển qua TLS (thử nghiệm), TCPRoute và UDPRoute dành cho L4 (thử nghiệm).

**Mục đích kép:** API tương tự mô hình lưu lượng truy cập Bắc-Nam (vào) và Đông-Tây (lưới dịch vụ). Sáng kiến ​​GAMMA mở rộng Gateway API sang các trường hợp sử dụng lưới dịch vụ.

<a id="version-and-stability"></a>
<a id="heading-5-version-and-stability"></a>

### Phiên bản và tính ổn định

Gateway API **không** được tích hợp trong Kubernetes. Nó được cài đặt dưới dạng CRDs từ dự án `kubernetes-sigs/gateway-api`. Tính đến tháng 2 năm 2026:

| Phát hành | Ngày | Bổ sung kênh tiêu chuẩn |
|---|---|---|
| v1.0 | Tháng 10 năm 2023 | GatewayClass, Gateway, HTTPRoute → GA (v1) |
| v1.1 | tháng 5 năm 2024 | GRPCRoute → GA; lưới dịch vụ (GAMMA) |
| v1.2 | Tháng 11 năm 2024 | WebSockets, Hết giờ, Thử lại (HTTPRoute) |
| v1.3 | tháng 4 năm 2025 | Bộ lọc requestMirror (sao chép yêu cầu) |
| **v1.4** | **Tháng 10 năm 2025** | **Chính sách TLS phụ trợ → Tiêu chuẩn; GRPCRoute spec.required; tên quy tắc** |
| v1.4.1 | Bản vá của nhánh 1.4 | Sửa lỗi nhỏ (sử dụng URL cài đặt này) |

**Phiên bản Kubernetes tối thiểu:** 1.26 cho mọi bản phát hành v1.x Gateway API.[^gateway-api-versioning]

---

<a id="2-design-philosophy-and-role-model"></a>
<a id="heading-6-2-design-philosophy-and-role-model"></a>

## 2. Triết lý thiết kế và Model Role

Gateway API được xây dựng dựa trên ba đặc tính tổ chức:[^gateway-api-overview]

```
┌─────────────────────────────────────────────────────────────────┐
│ PERSONA: Nhà cung cấp cơ sở hạ tầng (Ian)                          │
│ Tài nguyên: GatewayClass                                          │
│ Phạm vi: Toàn cụm                                             │
│ Nhiệm vụ: Xác định cách triển khai cân bằng tải có sẵn            │
└─────────────────────────┬───────────────────────────────────────┘
                          │ tài liệu tham khảo
┌─────────────────────────▼───────────────────────────────────────┐
│ NGƯỜI: Người điều hành cụm (Chihiro)                             │
│ Tài nguyên: Gateway                                               │
│ Phạm vi: Thường là một namespace trên mỗi cổng (e.g., "infra")        │
│ Nhiệm vụ: Tạo và cấu hình các phiên bản cổng; đặt TLS; kiểm soát  │
│       namespaces có thể đính kèm các tuyến đường                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │ đính kèm thông qua parentRefs
┌─────────────────────────▼───────────────────────────────────────┐
│ NGƯỜI: Nhà phát triển ứng dụng (Ana)                            │
│ Tài nguyên: HTTPRoute, GRPCRoute, ReferenceGrant, v.v.           │
│ Phạm vi: Ứng dụng riêng của họ namespace(s)                       │
│ Nhiệm vụ: Xác định quy tắc định tuyến cho các dịch vụ của họ                   │
│       Không cần quyền cấp cụm                       │
└─────────────────────────────────────────────────────────────────┘
```

Sự tách biệt này có những hậu quả thực tế:

- Nhóm ứng dụng có thể tạo và sửa đổi Tuyến đường mà không cần chạm vào Cổng.
- Người vận hành cụm kiểm soát namespaces nào có thể đính kèm các Tuyến đường vào Gateway.
- Nhiều nhóm có thể chia sẻ một Gateway (bộ cân bằng tải đám mây đơn) mà không cần phối hợp.
- Những thay đổi về cơ sở hạ tầng (hoán đổi từ NGINX sang Envoy) không yêu cầu các nhóm ứng dụng phải
chạm vào HTTPRoutes của họ.

---

<a id="3-resource-overview"></a>
<a id="heading-7-3-resource-overview"></a>

## 3. Tổng quan về tài nguyên

<a id="standard-channel-resources-ga--v141"></a>
<a id="heading-8-standard-channel-resources-ga-v141"></a>

### Tài nguyên kênh tiêu chuẩn (GA — v1.4.1)

| Tài nguyên | Phiên bản API | Phạm vi | Mục đích |
|---|---|---|---|
| `GatewayClass` | `gateway.networking.k8s.io/v1` | Cụm | Xác định việc triển khai LB |
| `Gateway` | `gateway.networking.k8s.io/v1` | Namespace | Yêu cầu một phiên bản LB |
| `HTTPRoute` | `gateway.networking.k8s.io/v1` | Namespace | Quy tắc định tuyến HTTP/HTTPS |
| `GRPCRoute` | `gateway.networking.k8s.io/v1` | Namespace | quy tắc định tuyến gRPC |
| `ReferenceGrant` | `gateway.networking.k8s.io/v1beta1` | Namespace | Cấp quyền tham chiếu chéo namespace |
| `BackendTLSPolicy` | `gateway.networking.k8s.io/v1` | Namespace | TLS cho phần phụ trợ |

<a id="experimental-channel-resources"></a>
<a id="heading-9-experimental-channel-resources"></a>

### Tài nguyên kênh thử nghiệm

| Tài nguyên | Phiên bản API | Mục đích |
|---|---|---|
| `TCPRoute` | `v1alpha2` | Định tuyến TCP thô |
| `TLSRoute` | `v1alpha2` | Thông qua TLS |
| `UDPRoute` | `v1alpha2` | Định tuyến UDP |
| `XListenerSet` | `v1alpha2` | Bộ nghe được chia sẻ (v1.3+) |
| Tài nguyên `Mesh` | `v1alpha2` | Cấu hình toàn lưới (v1.4+) |

Tài nguyên thử nghiệm **không đảm bảo khả năng tương thích ngược** và có thể thay đổi hoặc bị xóa giữa các bản phát hành. Không sử dụng chúng trong sản xuất mà không xác minh sự hỗ trợ và cam kết triển khai của bạn đối với phiên bản bạn cần.[^gateway-api-versioning]

---

<a id="4-standard-vs-experimental-channels"></a>
<a id="heading-10-4-standard-vs-experimental-channels"></a>

## 4. Kênh tiêu chuẩn và kênh thử nghiệm

Gateway API sử dụng mô hình ổn định hai kênh:

**Kênh tiêu chuẩn:** Chỉ chứa tài nguyên GA (`v1`) và beta (`v1beta1`). Hoàn toàn tương thích ngược trong một phiên bản kênh. An toàn cho sản xuất. Đây là những gì install.yaml tiêu chuẩn cài đặt.

**Kênh thử nghiệm:** Chứa mọi thứ trong các trường và tài nguyên Tiêu chuẩn cộng với thử nghiệm. Các tính năng mới nhập vào đây đầu tiên. Những thay đổi đột phá có thể xảy ra bất cứ lúc nào. Sử dụng trong phi sản xuất để đánh giá.

```bash
# Cài đặt Kênh tiêu chuẩn (được khuyến nghị cho sản xuất)
kubectl apply --server-side -f \
  https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.1/standard-install.yaml

# Cài đặt Kênh thử nghiệm (để thử nghiệm các tính năng thử nghiệm)
kubectl apply --server-side -f \
  https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.1/experimental-install.yaml
# Lưu ý: CRDs thử nghiệm có thể quá lớn để áp dụng kubectl thông thường.
# Sử dụng --server-side để tránh lỗi "metadata.annotations: Too long".
```

<a id="guardrails-vap-v14"></a>
<a id="heading-11-guardrails-vap-v14"></a>

### Lan can VAP (v1.4+)

Gateway API v1.4 đã giới thiệu Chính sách tuyển sinh xác thực nhằm thực thi các ranh giới kênh:

- **Nâng cấp VAP:** Ngăn chặn việc vô tình áp dụng CRDs thử nghiệm so với CRDs tiêu chuẩn.
- **Guardrails VAP:** Ngăn chặn việc thiết lập các trường thử nghiệm trên một tài nguyên trừ khi
Có chú thích `gateway.networking.k8s.io/unsafe-enable-cors-api: "true"` (hoặc tương tự).

Điều này có nghĩa là bạn có thể cài đặt kênh Tiêu chuẩn CRDs và tin tưởng một cách an toàn rằng các trường thử nghiệm bị máy chủ API từ chối thay vì âm thầm bỏ qua.[^gateway-api-versioning]

---

<a id="5-installation"></a>
<a id="heading-12-5-installation"></a>

## 5. Cài đặt

<a id="prerequisites"></a>
<a id="heading-13-prerequisites"></a>

### Điều kiện tiên quyết

- Cụm Kubernetes 1.26+
- `kubectl` với quyền truy cập quản trị viên cụm (cần thiết để áp dụng CRDs)
- Đã cài đặt (bộ điều khiển) Gateway API - xem Phần 16

<a id="install-crds"></a>
<a id="heading-14-install-crds"></a>

### Cài đặt CRDs

```bash
# Kênh tiêu chuẩn (an toàn sản xuất)
kubectl apply --server-side -f \
  https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.1/standard-install.yaml

# Xác minh CRDs đã được cài đặt
kubectl get crd | grep gateway.networking.k8s.io
# NAME                                        ESTABLISHED
# backendtlspolicies.gateway.networking.k8s.io Đúng
# gatewayclasses.gateway.networking.k8s.io Đúng
# gateways.gateway.networking.k8s.io Đúng
# grpcroutes.gateway.networking.k8s.io Đúng
# httproutes.gateway.networking.k8s.io Đúng
# referencegrants.gateway.networking.k8s.io Đúng
```

<a id="install-a-controller"></a>
<a id="heading-15-install-a-controller"></a>

### Cài đặt bộ điều khiển

Riêng CRDs không làm được gì cả. Bạn cần triển khai (bộ điều khiển) Gateway API. Chọn dựa trên môi trường của bạn:

```bash
# Cilium (dựa trên eBPF; GA cho v1.4 kể từ Cilium 1.19)
helm repo add cilium https://helm.cilium.io/
helm install cilium cilium/cilium --namespace kube-system \
  --set gatewayAPI.enabled=true

# Envoy Gateway 1.8.x hỗ trợ Kubernetes 1.35 và Gateway API 1.5.1.
# Cập nhật CRD lên cùng phiên bản trước khi cài controller này.
kubectl apply --server-side -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.5.1/standard-install.yaml
helm install eg oci://docker.io/envoyproxy/gateway-helm \
  --version v1.8.4 \
  -n envoy-gateway-system --create-namespace

# NGINX Gateway Fabric
helm install ngf oci://ghcr.io/nginx/charts/nginx-gateway-fabric \
  -n nginx-gateway --create-namespace

# Traefik (v3.x hỗ trợ cả Ingress và Gateway API)
helm repo add traefik https://traefik.github.io/charts
helm install traefik traefik/traefik -n traefik --create-namespace
```

Việc tạo `GatewayClass` phụ thuộc cách cài controller. Xác minh và tạo GatewayClass với `controllerName` đúng nếu chưa có. Không dùng GatewayClass của Cilium cho Envoy Gateway:

```bash
kubectl get gatewayclass
# NAME      CONTROLLER                      ACCEPTED
# cilium io.cilium/gateway-controller Đúng
```

---

<a id="6-gatewayclass"></a>
<a id="heading-16-6-gatewayclass"></a>

## 6. GatewayClass

`GatewayClass` là tài nguyên ở phạm vi cụm xác định kiểu triển khai Gateway. Nó tương tự như `StorageClass` cho PersistentVolumes và `IngressClass` cho Ingress.[^gateway-api-gatewayclass]

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: cilium
spec:
  controllerName: io.cilium/gateway-controller    # phải phù hợp với bộ điều khiển được cài đặt
  description: "Cilium Gateway — eBPF-based L7 proxy"

  # Tùy chọn: Tham khảo các thông số cụ thể của nhà cung cấp
  parametersRef:
    group: cilium.io
    kind: CiliumGatewayConfiguration
    name: default-config
    namespace: kube-system
```

<a id="gatewayclass-status"></a>
<a id="heading-17-gatewayclass-status"></a>

### Trạng thái GatewayClass

Bộ điều khiển đặt `.status.conditions` để cho biết GatewayClass có được chấp nhận hay không:

```bash
kubectl get gatewayclass cilium -o yaml | grep -A 10 "conditions:"
# điều kiện:
# - LastTransitionTime: "2026-01-10T..."
#   tin nhắn: Đã chấp nhận GatewayClass
#   quan sátThế hệ: 1
#   lý do: Đã chấp nhận
#   trạng thái: "Đúng"
#   Kiểu: Được chấp nhận
```

GatewayClass có `Accepted: False` có nghĩa là bộ điều khiển không chạy hoặc không nhận dạng `controllerName`.

<a id="supportedfeatures-v14-standard"></a>
<a id="heading-18-supportedfeatures-v14-standard"></a>

### Các tính năng được hỗ trợ (Tiêu chuẩn v1.4)

Vì v1.4, trạng thái GatewayClass bao gồm danh sách trường `supportedFeatures` có các tính năng Tiêu chuẩn và Mở rộng mà việc triển khai hỗ trợ:

```bash
kubectl get gatewayclass cilium -o jsonpath='{.status.supportedFeatures}'
```

Điều này thay thế nhu cầu về cờ kiểm tra sự phù hợp và cho phép người dùng xác định theo chương trình những gì việc triển khai của họ hỗ trợ.

---

<a id="7-gateway"></a>
<a id="heading-19-7-gateway"></a>

## 7. Gateway

Tài nguyên `Gateway` requests một phiên bản cân bằng tải cụ thể. Nó được đặt tên và thường được tạo bởi toán tử cụm. Nó xác định một hoặc nhiều **Trình nghe** chỉ định cổng, giao thức và cấu hình TLS.[^gateway-api-gateway]

<a id="basic-gateway"></a>
<a id="heading-20-basic-gateway"></a>

### Gateway cơ bản

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: prod-gateway
  namespace: infra
spec:
  gatewayClassName: cilium          # tham khảo GatewayClass

  listeners:
  # ── Máy nghe HTTP ──────────────────────────── ────────────────────────────
  - name: http
    protocol: HTTP
    port: 80
    allowedRoutes:
      namespaces:
        from: All                   # các tuyến đường trong bất kỳ namespace nào cũng có thể đính kèm ở đây

  # ── Trình nghe HTTPS (TLS chấm dứt tại Gateway) ───────────────────────────
  - name: https
    protocol: HTTPS
    port: 443
    tls:
      mode: Terminate               # Gateway giải mã TLS
      certificateRefs:
      - kind: Secret
        group: ""
        name: prod-tls-secret
        namespace: infra            # Secret phải giống namespace với Gateway
                                    # (hoặc được phép qua ReferenceGrant - xem Phần 10)
    allowedRoutes:
      namespaces:
        from: Selector
        selector:
          matchLabels:
            gateway-access: allowed
```

<a id="listener-protocols"></a>
<a id="heading-21-listener-protocols"></a>

### Giao thức nghe

| Giao thức | Cảng | TLS | Cách sử dụng |
|---|---|---|---|
| `HTTP` | bất kỳ | Không | Đồng bằng HTTP; thường là 80 |
| `HTTPS` | bất kỳ | Chấm dứt | TLS chấm dứt tại Gateway |
| `TLS` | bất kỳ | Vượt qua hoặc chấm dứt | Định tuyến TLS (Thử nghiệm chuyển tiếp) |
| `TCP` | bất kỳ | Tùy chọn | L4 TCP (Kênh thử nghiệm) |
| `UDP` | bất kỳ | Không | L4 UDP (Kênh thử nghiệm) |

<a id="controlling-which-routes-can-attach"></a>
<a id="heading-22-controlling-which-routes-can-attach"></a>

### Kiểm soát những tuyến đường có thể đính kèm

```yaml
# Cho phép các tuyến từ tất cả namespaces (mở cho cụm nhiều người thuê)
allowedRoutes:
  namespaces:
    from: All

# Chỉ cho phép các tuyến từ cùng namespace với Gateway
allowedRoutes:
  namespaces:
    from: Same

# Cho phép các tuyến đường từ namespaces khớp với bộ chọn nhãn
allowedRoutes:
  namespaces:
    from: Selector
    selector:
      matchLabels:
        team: backend
        env: production

# Đồng thời hạn chế theo loại Tuyến đường (chỉ cho phép HTTPRoute, không cho phép GRPCRoute)
allowedRoutes:
  kinds:
  - kind: HTTPRoute
  namespaces:
    from: All
```

<a id="gateway-status"></a>
<a id="heading-23-gateway-status"></a>

### Trạng thái Gateway

```bash
kubectl get gateway prod-gateway -n infra
# NAME           CLASS    ADDRESS         PROGRAMMED   AGE
# prod-gateway cilium 203.0.113.10 True 10m

kubectl describe gateway prod-gateway -n infra
# Điều kiện:
#   Đã chấp nhận: Đúng
#   Đã lập trình: Đúng
# Người nghe:
#   http (cổng 80): Đã giải quyếtRefs: Đúng
#   https (cổng 443): Đã giải quyếtRefs: Đúng
```

`Programmed: True` có nghĩa là bộ điều khiển đã đối chiếu thành công Gateway và bộ cân bằng tải cơ bản đã sẵn sàng. `Accepted: True` có nghĩa là bộ điều khiển GatewayClass đã chấp nhận tài nguyên.

<a id="infrastructure-labels"></a>
<a id="heading-24-infrastructure-labels"></a>

### Nhãn cơ sở hạ tầng

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

Trường `infrastructure` (Tiêu chuẩn kể từ v1.1) cho phép người vận hành chuyển nhãn và chú thích tới tài nguyên cân bằng tải đám mây cơ bản mà bộ điều khiển cung cấp.

---

<a id="8-httproute"></a>
<a id="heading-25-8-httproute"></a>

## 8. HTTPRoute

`HTTPRoute` là tài nguyên định tuyến chính trong Gateway API. Nó được đặt tên, được tạo bởi các nhà phát triển ứng dụng và gắn vào một hoặc nhiều Trình nghe Gateway thông qua `parentRefs`.[^gateway-api-httproute]

<a id="full-annotated-httproute"></a>
<a id="heading-26-full-annotated-httproute"></a>

### HTTPRoute được chú thích đầy đủ

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-app-route
  namespace: production
spec:
  # ── Tham chiếu của phụ huynh: gắn vào Gateway cụ thể ──────────────────────────
  parentRefs:
  - name: prod-gateway
    namespace: infra                  # chéo namespace - yêu cầu ReferenceGrant nếu Gateway
                                      # không cho phép nó một cách rõ ràng
    sectionName: https                # chỉ đính kèm vào trình nghe "https" (không phải "http")
    port: 443                         # chỉ gắn vào cổng 443 (Tính năng mở rộng)

  # ── Khớp tên máy chủ ────────────────────────── ───────────────────────────
  # Nếu bị bỏ qua, tuyến đường khớp với tất cả tên máy chủ trên trình nghe
  hostnames:
  - myapp.example.com
  - "*.api.example.com"               # ký tự đại diện: chỉ khớp với một nhãn

  # ── Quy tắc định tuyến ──────────────────────────── ─────────────────────────────
  rules:

  # ── Quy tắc 1: So khớp đường dẫn + tiêu đề ───────────────────────────────────────
  - name: api-v2-rule                 # GEP-995: quy tắc được đặt tên (GA trong v1.4)
    matches:
    - path:
        type: PathPrefix
        value: /api/v2
      headers:
      - name: X-API-Version
        value: "2"
        type: Exact                   # Chính xác (mặc định) hoặc RegularExpression
      method: GET                     # phương pháp tùy chọn phù hợp
    backendRefs:
    - name: api-v2-svc
      namespace: production
      port: 8080
      weight: 100

  # ── Quy tắc 2: Phân chia lưu lượng truy cập (canary có trọng số) ────────────────────────────
  - name: canary-rule
    matches:
    - path:
        type: PathPrefix
        value: /api/v1
    backendRefs:
    - name: api-v1-stable
      port: 8080
      weight: 90                      # 90% lưu lượng truy cập phù hợp
    - name: api-v1-canary
      port: 8080
      weight: 10                      # 10% lưu lượng truy cập phù hợp

  # ── Quy tắc 3: Bộ lọc (sửa đổi tiêu đề, chuyển hướng, viết lại) ──────────────
  - name: filter-rule
    matches:
    - path:
        type: PathPrefix
        value: /old
    filters:
    - type: URLRewrite                # sửa đổi URL trước khi chuyển tiếp
      urlRewrite:
        hostname: backend.internal
        path:
          type: ReplacePrefixMatch
          replacePrefixMatch: /new
    - type: RequestHeaderModifier     # Tiêu đề yêu cầu add/remove/set
      requestHeaderModifier:
        set:
        - name: X-Forwarded-Host
          value: "myapp.example.com"
        add:
        - name: X-Request-ID
          value: "{{request.id}}"
        remove:
        - X-Internal-Token            # xóa tiêu đề nhạy cảm trước khi chuyển tiếp
    - type: ResponseHeaderModifier    # sửa đổi tiêu đề phản hồi
      responseHeaderModifier:
        set:
        - name: X-Frame-Options
          value: DENY
        - name: X-Content-Type-Options
          value: nosniff
    backendRefs:
    - name: backend-svc
      port: 80

  # ── Quy tắc 4: Chuyển hướng (HTTP → HTTPS) ──────────────────── ────────────────────
  - name: http-redirect
    matches:
    - path:
        type: PathPrefix
        value: /
    filters:
    - type: RequestRedirect
      requestRedirect:
        scheme: https
        statusCode: 301               # 301 Thường trực hoặc 302 Tạm thời
        # tên máy chủ: new.example.com # tùy chọn: thay đổi tên máy chủ
        # cổng: 8443 # tùy chọn: thay đổi cổng
    # Không cần phụ trợ cho quy tắc chuyển hướng

  # ── Quy tắc 5: Yêu cầu sao chép (gửi bản sao lưu lượng truy cập đến một chương trình phụ trợ khác) ─────
  - name: mirror-rule
    matches:
    - path:
        type: PathPrefix
        value: /v3
    filters:
    - type: RequestMirror
      requestMirror:
        backendRef:
          name: logging-svc           # nhận được bản sao nhưng phản hồi bị bỏ qua
          port: 9090
        percent: 10                   # phản chiếu 10% requests (Tiêu chuẩn kể từ v1.3)
    backendRefs:
    - name: v3-svc
      port: 8080

  # ── Quy tắc 6: Thời gian chờ (Tiêu chuẩn kể từ v1.2) ────────────────────────────────
  - name: timeout-rule
    matches:
    - path:
        type: PathPrefix
        value: /slow
    timeouts:
      request: 30s                    # tổng thời gian chờ yêu cầu (thời lượng RFC 3339)
      backendRequest: 10s             # hết thời gian chờ cho mỗi lần thử để phụ trợ
    backendRefs:
    - name: slow-svc
      port: 8080
```

<a id="httproute-matches"></a>
<a id="heading-27-httproute-matches"></a>

### Trận đấu HTTPRoute

Các kết quả khớp được AND trong một đối tượng khớp duy nhất và được ORed giữa nhiều đối tượng khớp:

```yaml
matches:
# Trận đấu 1: đường dẫn VÀ tiêu đề (cả hai đều phải đúng)
- path:
    type: PathPrefix
    value: /api
  headers:
  - name: Content-Type
    value: application/json

# Trận đấu 2: tham số truy vấn
- queryParams:
  - name: version
    value: "2"
    type: Exact

# Kết hợp 3: đường dẫn có biểu thức chính quy (Tính năng mở rộng — không phải tất cả các triển khai đều hỗ trợ nó)
- path:
    type: RegularExpression
    value: /users/[0-9]+
```

<a id="httproute-filters"></a>
<a id="heading-28-httproute-filters"></a>

### Bộ lọc HTTPRoute

| Loại bộ lọc | Kênh | Mô tả |
|---|---|---|
| `RequestHeaderModifier` | Cốt lõi | Tiêu đề yêu cầu Set/add/remove |
| `ResponseHeaderModifier` | mở rộng | Tiêu đề phản hồi Set/add/remove |
| `RequestRedirect` | Cốt lõi | Chuyển hướng HTTP (301/302/307/308) |
| `URLRewrite` | mở rộng | Viết lại đường dẫn URL hoặc tên máy chủ |
| `RequestMirror` | mở rộng | Sao chép lưu lượng truy cập vào chương trình phụ trợ nhân bản |
| `ExtensionRef` | Tiện ích mở rộng | Bộ lọc CRD dành riêng cho nhà cung cấp |

Bộ lọc **Lõi** phải được hỗ trợ bởi tất cả các hoạt động triển khai tuân thủ. Bộ lọc **Mở rộng** là tùy chọn. **ExtensionRef** dành cho các tiện ích mở rộng dành riêng cho nhà cung cấp.

<a id="parent-reference-attach-logic"></a>
<a id="heading-29-parent-reference-attach-logic"></a>

### Logic đính kèm tham chiếu gốc

```yaml
parentRefs:
- name: my-gateway
  namespace: infra     # bỏ qua nếu Tuyến đường nằm trong cùng namespace với Gateway
  sectionName: https   # đính kèm với người nghe cụ thể theo tên
  port: 443            # gắn vào cổng cụ thể (Tính năng mở rộng)
```

Nếu `sectionName` bị bỏ qua, Tuyến sẽ gắn với tất cả các trình nghe tương thích. Một tuyến sẽ gắn với người nghe nếu `hostnames` của Tuyến tương thích với `hostname` của người nghe (nếu được đặt) và `allowedRoutes` của người nghe cho phép điều đó.

---

<a id="9-grpcroute"></a>
<a id="heading-30-9-grpcroute"></a>

## 9. GRPCRoute

`GRPCRoute` là GA (v1) trong Kênh Tiêu chuẩn kể từ v1.1 và trường `spec` trở thành bắt buộc trong v1.4.[^gateway-api-grpcroute]. Nó định tuyến lưu lượng gRPC một cách tự nhiên — khớp với tên phương thức và dịch vụ gRPC thay vì đường dẫn URI.

<a id="when-to-use-grpcroute-vs-httproute"></a>
<a id="heading-31-when-to-use-grpcroute-vs-httproute"></a>

### Khi nào nên sử dụng GRPCRoute so với HTTPRoute

Sử dụng `GRPCRoute` khi bạn cần kết hợp gRPC cụ thể (tên service/method), điều kiện mã trạng thái gRPC hoặc khả năng quan sát nhận biết gRPC. gRPC có thể được định tuyến qua `HTTPRoute` bằng cách sử dụng đối sánh đường dẫn (phương thức mã hóa gRPC là `/<service>/<method>`), nhưng mất ngữ nghĩa và công cụ dành riêng cho gRPC.

Việc triển khai hỗ trợ `GRPCRoute` phải thực thi tính duy nhất của tên máy chủ giữa các đối tượng `GRPCRoute` và `HTTPRoute` được gắn vào cùng một trình nghe.

<a id="grpcroute-example"></a>
<a id="heading-32-grpcroute-example"></a>

### Ví dụ về GRPCRoute

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
    protocol: HTTPS               # gRPC yêu cầu HTTP/2; Khuyến khích sử dụng TLS
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
  # ── So khớp theo dịch vụ và phương thức ───────────────────── ──────────────────────
  - name: login-rule
    matches:
    - method:
        type: Exact                   # Biểu thức chính xác hoặc thông thường
        service: com.example.UserService
        method: Login
    backendRefs:
    - name: user-service
      port: 50051

  # ── Phù hợp với tất cả các phương thức của một dịch vụ ──────────────────── ────────────────────
  - name: order-service-rule
    matches:
    - method:
        service: com.example.OrderService
        # phương thức bỏ qua: khớp với tất cả các phương thức của dịch vụ
    backendRefs:
    - name: order-service
      port: 50051

  # ── Định tuyến dựa trên tiêu đề ───────────────────────── ─────────────────────────
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

  # ── Tổng hợp cho chủ nhà này ─────────────────────── ────────────────────────
  - name: catchall
    backendRefs:
    - name: grpc-default-service
      port: 50051
```

<a id="filters-in-grpcroute"></a>
<a id="heading-33-filters-in-grpcroute"></a>

### Bộ lọc trong GRPCRoute

GRPCRoute hỗ trợ các bộ lọc `RequestHeaderModifier`, `ResponseHeaderModifier`, `RequestMirror` và `ExtensionRef` - cùng loại với HTTPRoute (ngoại trừ URLRewrite vàRequestRedirect, không áp dụng cho gRPC).

---

<a id="10-referencegrant"></a>
<a id="heading-34-10-referencegrant"></a>

## 10. ReferenceGrant

`ReferenceGrant` (`gateway.networking.k8s.io/v1beta1`) là cơ chế cho phép tham chiếu chéo namespace trong Gateway API. Tất cả các tham chiếu đối tượng chéo namespace đều yêu cầu `ReferenceGrant` trong **đích namespace**.[^gateway-api-referencegrant]

<a id="why-cross-namespace-references-need-grants"></a>
<a id="heading-35-why-cross-namespace-references-need-grants"></a>

### Tại sao tài liệu tham khảo namespace chéo cần tài trợ

Nếu không có ReferenceGrant, người dùng độc hại trong namespace `evil` có thể tạo HTTPRoute tham chiếu Service trong namespace `bank` — có khả năng chiếm đoạt lưu lượng truy cập. ReferenceGrant yêu cầu chủ sở hữu namespace mục tiêu phê duyệt rõ ràng các tài liệu tham khảo gửi đến.

<a id="referencegrant-anatomy"></a>
<a id="heading-36-referencegrant-anatomy"></a>

### Giải phẫu ReferenceGrant

```yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-prod-to-access-infra-gateway
  namespace: infra                   # namespace SỞ HỮU đối tượng mục tiêu
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: HTTPRoute
    namespace: production            # chỉ HTTPRoutes từ namespace này mới được tin cậy
  to:
  - group: gateway.networking.k8s.io
    kind: Gateway
    # tên: prod-gateway # tùy chọn giới hạn ở một tên Gateway cụ thể
```

<a id="common-referencegrant-patterns"></a>
<a id="heading-37-common-referencegrant-patterns"></a>

### Các mẫu ReferenceGrant phổ biến

**Mẫu 1: HTTPRoute trong namespace A tham chiếu Gateway trong namespace B**

```yaml
# ReferenceGrant phải nằm trong namespace B (namespace của Gateway)
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-app-routes
  namespace: infra                   # Gateway có mặt
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: HTTPRoute
    namespace: apps                  # HTTPRoute có mặt
  to:
  - group: gateway.networking.k8s.io
    kind: Gateway
```

**Mẫu 2: Gateway trong namespace A tham chiếu TLS Secret trong namespace B**

```yaml
# ReferenceGrant trong namespace của Secret
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-gateway-to-use-secrets
  namespace: cert-store              # Secret có mặt
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: Gateway
    namespace: infra                 # Gateway có mặt
  to:
  - group: ""
    kind: Secret
```

**Mẫu 3: HTTPRoute tham chiếu Service trong một namespace khác**

```yaml
# ReferenceGrant trong namespace của Service
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: allow-route-to-backend
  namespace: backend-ns              # Service có mặt
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: HTTPRoute
    namespace: frontend-ns           # HTTPRoute có mặt
  to:
  - group: ""
    kind: Service
```

<a id="what-does-not-require-referencegrant"></a>
<a id="heading-38-what-does-not-require-referencegrant"></a>

### Điều gì KHÔNG yêu cầu ReferenceGrant

Tệp đính kèm Định tuyến tới Gateway (trong đó Tuyến trong namespace A gắn với Gateway trong namespace B) KHÔNG yêu cầu ReferenceGrant — nó được điều khiển bởi trường `allowedRoutes` của Gateway. ReferenceGrant chỉ được yêu cầu khi Tuyến (hoặc Gateway) tham chiếu một đối tượng thực tế (như Service hoặc Secret) trong một namespace khác làm tham chiếu dữ liệu.[^gateway-api-referencegrant]

---

<a id="11-backendtlspolicy"></a>
<a id="heading-39-11-backendtlspolicy"></a>

## 11. Chính sách TLS phụ trợ

`BackendTLSPolicy` (`gateway.networking.k8s.io/v1`) đã chuyển sang kênh Tiêu chuẩn trong **Gateway API v1.4**. Nó cho phép mã hóa TLS trên đường truyền từ Gateway đến phần phụ trợ pods.[^gateway-api-v14]

Trước BackendTLSPolicy, Gateway API không có cách tiêu chuẩn nào để mã hóa lưu lượng giữa Gateway và Services phụ trợ. Tất cả mã hóa được tập trung vào nhánh từ máy khách đến Gateway.

<a id="backendtlspolicy-example"></a>
<a id="heading-40-backendtlspolicy-example"></a>

### Ví dụ về chính sách TLS cuối cùng

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
    name: auth-svc                   # phần phụ trợ Service để áp dụng TLS cho
    # cổng: 8443 # tùy chọn: giới hạn ở cổng cụ thể

  validation:
    hostname: auth.internal          # Tên máy chủ SNI để xác thực chứng chỉ phụ trợ
    caCertificateRefs:
    - group: ""
      kind: ConfigMap                # Chứng chỉ CA trong ConfigMap
      name: backend-ca-cert
      # khóa: ca.crt # khóa mặc định là "ca.crt"
    # HOẶC: sử dụng gói tin cậy hệ thống
    # wellKnownCAChứng chỉ: Hệ thống
```

<a id="tls-policy-attachment"></a>
<a id="heading-41-tls-policy-attachment"></a>

### Tệp đính kèm chính sách TLS

BackendTLSPolicy sử dụng cơ chế **đính kèm chính sách** (xem Phần 17). Chính sách này gắn với Service và áp dụng cho tất cả các Tuyến sử dụng Service đó làm tham chiếu phụ trợ. Khi nhiều Cổng định tuyến đến cùng một Service, mỗi Cổng có thể có độ phân giải BackendTLSPolicy độc lập.

<a id="client-certificate-support-v14"></a>
<a id="heading-42-client-certificate-support-v14"></a>

### Hỗ trợ chứng chỉ ứng dụng khách (v1.4+)

v1.4 cũng đã thêm hỗ trợ kênh Tiêu chuẩn để xác thực chứng chỉ ứng dụng khách tại Gateway (chấm dứt mTLS) và để xác định chứng chỉ ứng dụng khách khi Gateway tạo kết nối TLS với các chương trình phụ trợ.

---

<a id="12-tls-configuration-patterns"></a>
<a id="heading-43-12-tls-configuration-patterns"></a>

## 12. Các mẫu cấu hình TLS

<a id="pattern-1-tls-termination-at-gateway-most-common"></a>
<a id="heading-44-pattern-1-tls-termination-at-gateway-most-common"></a>

### Mẫu 1: Chấm dứt TLS tại Gateway (Phổ biến nhất)

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

<a id="pattern-2-tls-passthrough-experimental"></a>
<a id="heading-45-pattern-2-tls-passthrough-experimental"></a>

### Mẫu 2: Truyền qua TLS (Thử nghiệm)

```
Client ──TLS──► Gateway (passes through encrypted) ──TLS──► Service/Pod
```

Yêu cầu kênh Thử nghiệm và `TLSRoute`. Gateway không kiểm tra hoặc sửa đổi luồng TLS.

```yaml
spec:
  listeners:
  - name: tls-passthrough
    protocol: TLS                    # không phải HTTPS
    port: 443
    tls:
      mode: Passthrough              # không cần chứng chỉ
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

<a id="pattern-3-full-tls-mtls-with-backendtlspolicy"></a>
<a id="heading-46-pattern-3-full-tls-mtls-with-backendtlspolicy"></a>

### Mẫu 3: TLS đầy đủ (mTLS có BackendTLSPolicy)

```
Client ──HTTPS──► Gateway ──TLS──► Service/Pod
```

Kết hợp Chấm dứt Listener TLS với BackendTLSPolicy để mã hóa đầu cuối.

<a id="pattern-4-http--https-redirect"></a>
<a id="heading-47-pattern-4-http-https-redirect"></a>

### Mẫu 4: Chuyển hướng HTTP → HTTPS

```yaml
# Gateway với cả trình nghe HTTP và HTTPS
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
# HTTPRoute trên cổng 80: chuyển hướng đến HTTPS
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: redirect-to-https
spec:
  parentRefs:
  - name: my-gateway
    sectionName: http             # chỉ đính kèm với trình nghe HTTP
  rules:
  - filters:
    - type: RequestRedirect
      requestRedirect:
        scheme: https
        statusCode: 301
---
# HTTPRoute trên cổng 443: định tuyến thực tế
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: my-app-https
spec:
  parentRefs:
  - name: my-gateway
    sectionName: https            # chỉ đính kèm với trình nghe HTTPS
  hostnames: [myapp.example.com]
  rules:
  - backendRefs:
    - name: my-app-svc
      port: 80
```

---

<a id="13-traffic-management"></a>
<a id="heading-48-13-traffic-management"></a>

## 13. Quản lý giao thông

<a id="weighted-traffic-splitting-bluegreen-canary"></a>
<a id="heading-49-weighted-traffic-splitting-bluegreen-canary"></a>

### Phân chia lưu lượng truy cập có trọng số (Blue/Green, Canary)

```yaml
rules:
- backendRefs:
  - name: app-stable
    port: 80
    weight: 95       # 95% đến ổn định
  - name: app-canary
    port: 80
    weight: 5        # 5% đến hoàng yến
  # Trọng số mang tính tương đối: tổng không cần bằng 100
```

Để hoàn tất quá trình triển khai (chuyển 100% sang canary), hãy cập nhật trọng số:

```bash
kubectl patch httproute my-route --type='json' \
  -p='[{"op":"replace","path":"/spec/rules/0/backendRefs/0/weight","value":0},
       {"op":"replace","path":"/spec/rules/0/backendRefs/1/weight","value":100}]'
```

<a id="header-based-routing"></a>
<a id="heading-50-header-based-routing"></a>

### Định tuyến dựa trên tiêu đề

```yaml
rules:
# Người dùng mới (có tiêu đề) đi tới v2
- matches:
  - headers:
    - name: X-App-Version
      value: "v2"
  backendRefs:
  - name: app-v2-svc
    port: 80

# Mọi người khác đi đến v1
- backendRefs:
  - name: app-v1-svc
    port: 80
```

<a id="url-rewrite"></a>
<a id="heading-51-url-rewrite"></a>

### Viết lại URL

```yaml
filters:
- type: URLRewrite
  urlRewrite:
    # Thay đổi tên máy chủ
    hostname: internal-backend.svc.cluster.local

    # Thay thế tiền tố: /api/v1/users → /users
    path:
      type: ReplacePrefixMatch
      replacePrefixMatch: /

    # HOẶC thay thế đường dẫn đầy đủ
    # đường dẫn:
    #   loại: Thay thếFullPath
    #   thay thếFullPath: /đường dẫn mới
```

<a id="request-redirect"></a>
<a id="heading-52-request-redirect"></a>

### Yêu cầu chuyển hướng

```yaml
filters:
- type: RequestRedirect
  requestRedirect:
    scheme: https                  # đổi http thành https
    hostname: new.example.com      # thay đổi tên máy chủ
    port: 8443                     # thay đổi cổng
    path:
      type: ReplacePrefixMatch
      replacePrefixMatch: /v2
    statusCode: 301                # 301, 302, 307, or 308
                                   # 307/308 được thêm vào v1.4[^gateway-api-v14]
```

<a id="timeout-configuration-standard-since-v12gateway-api-v12"></a>
<a id="heading-53-timeout-configuration-standard-since-v12gatew"></a>

### Cấu hình thời gian chờ (Tiêu chuẩn kể từ v1.2)[^gateway-api-v12]

```yaml
rules:
- timeouts:
    request: 30s          # thời gian tối đa từ yêu cầu của khách hàng đến phản hồi (RFC 3339)
    backendRequest: 10s   # hết thời gian chờ cho mỗi lần thử để kết nối với chương trình phụ trợ
                          # yêu cầu phụ trợ phải là <= yêu cầu
  backendRefs:
  - name: slow-svc
    port: 80
```

---

<a id="14-cross-namespace-routing"></a>
<a id="heading-54-14-cross-namespace-routing"></a>

## 14. Định tuyến namespace chéo

Một trongGateway APITính năng mạnh mẽ nhất của nó là khả năng định tuyến trong mộtnamespaceđể gắn vào mộtGatewaytrong một cái khác và để các Tuyến đường tham chiếuServicesở nơi khácnamespaces.

<a id="shared-gateway-pattern"></a>
<a id="heading-55-shared-gateway-pattern"></a>

### Mẫu Gateway được chia sẻ

```
Namespace: infra
  └─ Gateway: prod-gateway (managed by ops team)

Namespace: team-a
  └─ HTTPRoute: app-a-route → attaches to prod-gateway, references app-a-svc

Namespace: team-b
  └─ HTTPRoute: app-b-route → attaches to prod-gateway, references app-b-svc
```

Cả hai nhóm đều dùng chung một bộ cân bằng tải đám mây duy nhất (Gateway) mà không cần phối hợp với nhau hoặc nhóm vận hành (ngoài thiết lập ban đầu của `allowedRoutes`).

```yaml
# Gateway (trong vùng namespace) cho phép các tuyến đường từ TẤT CẢ namespaces
spec:
  listeners:
  - name: https
    allowedRoutes:
      namespaces:
        from: All          # hoặc: Bộ chọn có nhãn cụ thể
```

```yaml
# HTTPRoute trong đội-a namespace
spec:
  parentRefs:
  - name: prod-gateway
    namespace: infra       # tham chiếu chéo namespace Gateway
    sectionName: https
  hostnames: [app-a.example.com]
  ...
```

<a id="cross-namespace-backend-reference"></a>
<a id="heading-56-cross-namespace-backend-reference"></a>

### Tham chiếu phụ trợ namespace chéo

HTTPRoute có thể tham chiếu Service trong namespace khác, nhưng yêu cầu ReferenceGrant trong namespace của Service (xem Phần 10).

```yaml
# HTTPRoute trong frontend-ns tham chiếu Service trong backend-ns
spec:
  rules:
  - backendRefs:
    - name: api-svc
      namespace: backend-ns    # tham chiếu chéo namespace Service
      port: 8080
---
# Bắt buộc: ReferenceGrant trong backend-ns
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

<a id="15-service-mesh-gamma"></a>
<a id="heading-57-15-service-mesh-gamma"></a>

## 15. Lưới Service (GAMMA)

Phiên bản Gateway API 1.1 đã giới thiệu GAMMA (Gateway API dành cho Quản lý và Quản lý Lưới) cho lưu lượng lưới dịch vụ (Đông-Tây). Điều này cho phép cùng một tài nguyên HTTPRoute định cấu hình cả định tuyến xâm nhập (Bắc-Nam) và định tuyến dịch vụ đến dịch vụ (Đông-Tây).

<a id="gamma-routing"></a>
<a id="heading-58-gamma-routing"></a>

### Định tuyến GAMMA

Ở chế độ lưới, HTTPRoute gắn vào Service (không phải Gateway):

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: payments-mesh-route
  namespace: payments
spec:
  parentRefs:
  - group: ""
    kind: Service              # gắn vào Service, không phải Gateway
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

GAMMA được hỗ trợ bởi các triển khai lưới dịch vụ như Istio, Linkerd và Cilium Service Mesh. Tài nguyên `Mesh` thử nghiệm (được thêm vào v1.4) cung cấp cấu hình trên toàn lưới.[^gateway-api-v14]

---

<a id="16-implementations"></a>
<a id="heading-59-16-implementations"></a>

## 16. Triển khai

Kể từ tháng 2 năm 2026, các triển khai sau hỗ trợ Gateway API v1.4.x Kênh tiêu chuẩn:[^gateway-api-implementations]

| Thực hiện | Loại | Ghi chú |
|---|---|---|
| Cilium 1.19+ | CNI + Gateway | dựa trên eBPF; GA cho v1.4 |
| Envoy Gateway 1.x | Ingress | CNCF; Impl tham chiếu dựa trên Envoy |
| NGINX Gateway Fabric | Ingress | F5; sử dụng NGINX Plus hoặc OSS |
| Traefik v3.x | Ingress + Lưới | Hỗ trợ cả Ingress và Gateway API |
| Istio | Lưới + Ingress | Lưới dịch vụ đầy đủ; Tuân thủ GAMMA |
| Linkerd | Lưới | Lưới nhẹ; Tuân thủ GAMMA |
| đường viền | Ingress | Dựa trên Envoy; Dự án CNCF |
| HAProxy Ingress | Ingress | L7 hiệu suất cao |
| Bộ điều khiển cân bằng tải AWS | Ingress | Quy định ALB/NLB |
| GKE | Được quản lý | Tích hợp GKE Gateway |
| Azure AG cho container | Được quản lý | Tích hợp AKS |
| kgateway (trước đây là Gloo) | Ingress + Lưới | Dựa trên Envoy; Tập trung vào AI |

<a id="checking-conformance"></a>
<a id="heading-60-checking-conformance"></a>

### Kiểm tra sự phù hợp

Việc triển khai gửi báo cáo tuân thủ tới kho lưu trữ Gateway API. Bạn có thể kiểm tra chính xác những tính năng nào được triển khai nhất định hỗ trợ:

```bash
kubectl get gatewayclass <name> -o jsonpath='{.status.supportedFeatures}'
```

Hoặc xem các báo cáo đã công bố tại: https://gateway-api.sigs.k8s.io/implementations/

---

<a id="17-policy-attachment"></a>
<a id="heading-61-17-policy-attachment"></a>

## 17. Đính kèm chính sách

Gateway API xác định mẫu đính kèm chính sách cho phép các chính sách do nhà cung cấp cụ thể và do người dùng xác định được đính kèm vào tài nguyên Gateway API mà không sửa đổi thông số kỹ thuật cốt lõi.

<a id="inheritance-model"></a>
<a id="heading-62-inheritance-model"></a>

### Mô hình kế thừa

Các chính sách tuân theo một hệ thống phân cấp. Chính sách trên Gateway áp dụng cho tất cả các Tuyến đi kèm với nó, trừ khi bị ghi đè bởi chính sách cụ thể hơn trên Tuyến hoặc Service.

```
GatewayClass-level policy
    └── Gateway-level policy         (overrides GatewayClass)
        └── HTTPRoute-level policy   (overrides Gateway)
            └── Service-level policy (overrides HTTPRoute, e.g., BackendTLSPolicy)
```

<a id="policy-status"></a>
<a id="heading-63-policy-status"></a>

### Trạng thái chính sách

Các chính sách hiển thị trạng thái của chúng bằng cấu trúc `PolicyAncestorStatus` tiêu chuẩn. Tổ tiên (thường là Gateway) cho biết chính sách có được chấp nhận và áp dụng hay không.

```bash
kubectl describe backendtlspolicy my-backend-tls
# Tình trạng:
#   Tổ tiên:
#   - AncestorRef: prod-gateway (infra/Gateway)
#     Điều kiện:
#     - Loại: Chấp nhận
#       trạng thái: "Đúng"
```

---

<a id="18-migration-from-ingress"></a>
<a id="heading-64-18-migration-from-ingress"></a>

## 18. Di chuyển từ Ingress

<a id="why-migrate"></a>
<a id="heading-65-why-migrate"></a>

### Tại sao phải di cư?

- Bộ điều khiển cộng đồng ingress-nginx sẽ ngừng hoạt động vào tháng 3 năm 2026.
- Gateway API cung cấp tất cả các tính năng Ingress với tính biểu cảm và tính di động tốt hơn.
- Các tính năng quản lý lưu lượng truy cập (đánh trọng số, viết lại, thao tác tiêu đề) không yêu cầu chú thích.
- Tính năng tách Role cải thiện tính bảo mật và hoạt động của nhiều nhóm.

<a id="migration-checklist"></a>
<a id="heading-66-migration-checklist"></a>

### Danh sách kiểm tra di chuyển

1. **Cài đặt Gateway API CRDs và bộ điều khiển.** Hầu hết các bộ điều khiển đều hỗ trợ cả Ingress và
Gateway API đồng thời — bạn có thể di chuyển tăng dần.

2. **Xác định các đối tượng Ingress của bạn và các chú thích của chúng.** Mỗi chú thích ánh xạ tới một Gateway
Trường thông số API.

3. **Xác định hình mẫu.** Quyết định namespaces nào sẽ giữ Cổng và Tuyến.

4. **Tạo Cổng** cho mỗi cấu hình Bộ điều khiển Ingress (một cổng cho mỗi IngressClass,
thông thường).

5. **Tạo HTTPRoutes** cho từng đối tượng Ingress. Sử dụng bảng ánh xạ bên dưới.

6. **Thiết lập ReferenceGrants** nếu Tuyến và Cổng ở namespaces khác nhau.

7. **Kiểm tra với cả Ingress và HTTPRoute đang hoạt động** trước khi xóa các đối tượng Ingress cũ.

8. **Xóa các đối tượng Ingress cũ** và cuối cùng là bộ điều khiển Ingress.

<a id="annotation-to-httproute-filter-mapping"></a>
<a id="heading-67-annotation-to-httproute-filter-mapping"></a>

### Chú thích cho Ánh xạ bộ lọc HTTPRoute

| Chú thích Ingress | Tương đương HTTPRoute |
|---|---|
| `rewrite-target: /foo` | `URLRewrite.path.ReplacePrefixMatch: /foo` |
| `ssl-redirect: true` | `RequestRedirect.scheme: https` |
| `permanent-redirect: https://x` | `RequestRedirect.statusCode: 301` |
| `canary-weight: 20` | `backendRefs[].weight: 20` |
| `canary-by-header: X-Canary` | `rules[].matches[].headers[].name: X-Canary` |
| `proxy-read-timeout: 60` | `rules[].timeouts.backendRequest: 60s` |
| `auth-type: basic` | Xác thực bên ngoài (ExtensionRef hoặc chính sách) |
| `cors-allow-origin: x` | Bộ lọc CORS HTTPRoute (v1.3+ thử nghiệm) |

<a id="side-by-side-migration-example"></a>
<a id="heading-68-side-by-side-migration-example"></a>

### Ví dụ di chuyển song song

```yaml
# TRƯỚC: Ingress đơn lẻ với các chú thích phức tạp
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
# SAU: Tương đương Gateway API (không cần chú thích)
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: api-redirect           # xử lý chuyển hướng HTTP→HTTPS
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
  name: api-route              # xử lý định tuyến HTTPS thực tế bằng canary
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

<a id="19-troubleshooting"></a>
<a id="heading-69-19-troubleshooting"></a>

## 19. Khắc phục sự cố

<a id="diagnostic-order"></a>
<a id="heading-70-diagnostic-order"></a>

### Thứ tự chẩn đoán

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

<a id="key-status-conditions"></a>
<a id="heading-71-key-status-conditions"></a>

### Điều kiện trạng thái chính

**Điều kiện Gateway:**

| tình trạng | Ý nghĩa |
|---|---|
| `Accepted: True` | Bộ điều khiển GatewayClass đã chấp nhận Gateway này |
| `Programmed: True` | Bộ điều khiển đã cấu hình LB cơ bản |
| `ResolvedRefs: True` | Tất cả TLS Secrets và các tài liệu tham khảo khác đã được giải quyết |

**Điều kiện gốc của HTTPRoute/GRPCRoute:**

| tình trạng | Ý nghĩa |
|---|---|
| `Accepted: True` | Định tuyến được gắn vào người nghe thành công |
| `ResolvedRefs: True` | Tất cả các tham chiếu Services phụ trợ và namespace phụ trợ đã được giải quyết |
| `NoMatchingParent` | Không có Gateway phù hợp với name/namespace/sectionName |
| `NotAllowedByListeners` | `allowedRoutes` của người nghe đã từ chối Tuyến đường này |
| `HostnameConflict` | Tuyến khác yêu cầu cùng tên máy chủ |
| `RefNotPermitted` | Thiếu tham chiếu chéo namespace ReferenceGrant |

<a id="common-fixes"></a>
<a id="heading-72-common-fixes"></a>

### Các bản sửa lỗi phổ biến

```bash
# Cách khắc phục 1: Thiếu ReferenceGrant
kubectl get referencegrant -n <target-namespace>
# Tạo ReferenceGrant như ở Mục 10

# Khắc phục 2: Trình nghe Gateway không được lập trình (thiếu TLS Secret)
kubectl describe gateway <n> -n <ns>
# Tìm kiếm: "spec.listeners[0].tls.certificateRefs[0].không tìm thấy tên"
kubectl get secret <secretname> -n <gateway-namespace>

# Cách 3: HTTPRoute không gắn vào Gateway
kubectl describe httproute <n> | grep -A 10 "Parents:"
# Kiểm tra lý do trong Điều kiện; phổ biến: NoMatchingParent hoặc NotAllowedByListeners

# Cách khắc phục 4: Gỡ lỗi dành riêng cho bộ điều khiển
# Envoy Gateway:
kubectl logs -n envoy-gateway-system deploy/envoy-gateway
# Cilium:
kubectl -n kube-system exec -it ds/cilium -- cilium envoy dump
# NGINX Gateway Fabric:
kubectl logs -n nginx-gateway deploy/ngf-nginx-gateway-fabric
```

---

<a id="20-references"></a>
<a id="heading-73-20-references"></a>

## 20. Tài liệu tham khảo

<a id="gateway-api-official"></a>
<a id="heading-74-gateway-api-official"></a>

### Gateway API chính thức






<a id="resource-type-documentation"></a>
<a id="heading-75-resource-type-documentation"></a>

### Tài liệu loại tài nguyên







<a id="installation-and-implementations"></a>
<a id="heading-76-installation-and-implementations"></a>

### Cài đặt và triển khai



<a id="github-repository"></a>
<a id="heading-77-github-repository"></a>

### Kho lưu trữ GitHub



<a id="ingress-reference"></a>
<a id="heading-78-ingress-reference"></a>

### Tham khảo Ingress


---

*Hướng dẫn đầy đủ về Kubernetes Gateway API — v1.0 — Tháng 2 năm 2026 — Gateway API v1.4.1 Kênh tiêu chuẩn / Kubernetes 1.35*

[^gateway-api-intro]: Kubernetes Gateway API — Giới thiệu.
[^gateway-api-versioning]: Kubernetes Gateway API — Chính sách lập phiên bản.
[^gateway-api-overview]: Kubernetes Gateway API — API Tổng quan và Personas.
[^gateway-api-v14]: Blog Kubernetes — Gateway API v1.4: Các tính năng mới (Tháng 10 năm 2025).
[^gateway-api-v12]: Blog Kubernetes - Gateway API v1.2: WebSockets, Hết giờ, Thử lại.
[^gateway-api-gatewayclass]: Kubernetes Gateway API — GatewayClass.
[^gateway-api-gateway]: Kubernetes Gateway API — Gateway.
[^gateway-api-httproute]: Kubernetes Gateway API — HTTPRoute.
[^gateway-api-grpcroute]: Kubernetes Gateway API — GRPCRoute.
[^gateway-api-referencegrant]: Kubernetes Gateway API — ReferenceGrant.
[^gateway-api-tlsroute]: Kubernetes Gateway API — TLSRoute (Thử nghiệm).
[^gateway-api-install]: Kubernetes Gateway API — Bắt đầu.
[^gateway-api-implementations]: Kubernetes Gateway API — Triển khai tuân thủ.
[^gateway-api-github]: Kho lưu trữ GitHub kubernetes-sigs/gateway-api.
[^gateway-api-releases]: Gateway API phát hành.
[^k8s-ingress]: Kubernetes — Các khái niệm Ingress.
