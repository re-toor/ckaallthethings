<a id="kubernetes-ingress-complete-guide"></a>
<a id="heading-0-kubernetes-ingress-complete-guide"></a>

# Kubernetes Ingress: Hướng dẫn đầy đủ

> **Controller cũ:** Ingress NGINX đã kết thúc bảo trì từ tháng 3/2026. Các ví dụ annotation NGINX bên dưới chỉ để thực hành với controller có sẵn trong lab hoặc đề bài. API Ingress vẫn tồn tại. Với cụm mới, chọn controller còn được bảo trì hoặc Gateway API. [Thông báo chính thức](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/).


> **Bản tiếng Việt · CKA Kubernetes 1.35 · cập nhật 17/09/2026.** Đọc [các thay đổi cho phiên bản thi](kubernetes-1.35-update.md).


> **Phiên bản:** v1.0 — Tháng 2 năm 2026 — Dựa trên Kubernetes 1.32 / `networking.k8s.io/v1`
>
> ⚠️ **Thông báo di chuyển:** Bộ điều khiển `ingress-nginx` do cộng đồng duy trì sẽ ngừng hoạt động sau
> Tháng 3 năm 2026. Kubernetes SIG Network chính thức khuyến nghị chuyển sang Gateway API cho phiên bản mới
> triển khai. Hướng dẫn này trình bày kỹ lưỡng về Ingress và bao gồm phần di chuyển dành riêng.

---

<a id="table-of-contents"></a>
<a id="heading-1-table-of-contents"></a>

## Mục lục

1. [Ingress là gì?](#1-what-is-ingress)
2. [Tổng quan về kiến trúc](#2-architecture-overview)
3. [IngressClass](#3-ingressclass)
4. [Ingress Tìm hiểu sâu về tài nguyên](#4-ingress-resource-deep-dive)
5. [Các loại đường dẫn](#5-path-types)
6. [TLS / HTTPS](#6-tls--https)
7. [Phần cuối mặc định](#7-default-backend)
8. [Chú thích](#8-annotations)
9. [Bộ điều khiển Ingress phổ biến](#9-popular-ingress-controllers)
10. [Mẫu nâng cao](#10-advanced-patterns)
11. [RBAC dành cho Ingress](#11-rbac-for-ingress)
12. [Khắc phục sự cố](#12-troubleshooting)
13. [Di chuyển: Ingress → Gateway API](#13-migration-ingress--gateway-api)
14. [Tài liệu tham khảo](#14-references)

---

<a id="1-what-is-ingress"></a>
<a id="heading-2-1-what-is-ingress"></a>

## 1. Ingress là gì?

**Ingress** là một đối tượng Kubernetes API (`networking.k8s.io/v1`) quản lý quyền truy cập HTTP và HTTPS bên ngoài vào Services trong một cụm. Nó hoạt động như một bộ cân bằng tải Lớp 7 (lớp ứng dụng) và proxy ngược, định tuyến lưu lượng truy cập dựa trên tên máy chủ và đường dẫn URL.

Ingress về cơ bản khác với Service thuộc loại `LoadBalancer` hoặc `NodePort`:

| tính năng | Service (L4) | Ingress (L7) |
|---|---|---|
| Nhận thức về giao thức | Chỉ TCP/UDP | HTTP/HTTPS |
| Lưu trữ ảo | Không | Có (dựa trên tên máy chủ) |
| Định tuyến đường dẫn | Không | Có |
| Chấm dứt TLS | Không | Có |
| Cloud LB trên mỗi dịch vụ | Có (đắt tiền) | LB được chia sẻ |
| headers/rewrites tùy chỉnh | Không | Có (phụ thuộc vào bộ điều khiển) |

Ingress yêu cầu **Bộ điều khiển Ingress** để chạy trong cụm. Bản thân tài nguyên Ingress chỉ là một đối tượng cấu hình - không có bộ điều khiển thì sẽ không có gì xảy ra. Bộ điều khiển theo dõi các đối tượng Ingress và định cấu hình proxy cơ bản (NGINX, Envoy, HAProxy, v.v.).[^k8s-ingress]

<a id="api-version-history"></a>
<a id="heading-3-api-version-history"></a>

### Lịch sử phiên bản API

| Phiên bản API | Kubernetes | Trạng thái |
|---|---|---|
| `extensions/v1beta1` | ≤1.13 | Đã xóa trong 1.22 |
| `networking.k8s.io/v1beta1` | 1.14–1.21 | Đã xóa trong 1.22 |
| `networking.k8s.io/v1` | 1.19+ | **Ổn định (GA)** |

Tất cả các đối tượng Ingress phải sử dụng `networking.k8s.io/v1` trên bất kỳ cụm nào chạy Kubernetes 1.22 trở lên.[^k8s-deprecated-apis]

---

<a id="2-architecture-overview"></a>
<a id="heading-4-2-architecture-overview"></a>

## 2. Tổng quan về kiến trúc

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

Bộ điều khiển thường được triển khai dưới dạng Deployment bên trong cụm với Service tương ứng thuộc loại `LoadBalancer` hoặc `NodePort` chấp nhận lưu lượng truy cập bên ngoài. Bộ điều khiển liên tục điều hòa các tài nguyên Ingress và lập trình cấu hình proxy của nó cho phù hợp.

<a id="controller-responsibilities"></a>
<a id="heading-5-controller-responsibilities"></a>

### Trách nhiệm của người kiểm soát

Khi Ingress được tạo hoặc cập nhật, bộ điều khiển:

1. Đọc tất cả các đối tượng Ingress tham chiếu IngressClass của nó.
2. Tạo cấu hình proxy (các khối e.g., NGINX `server` và `location`).
3. Tải lại hoặc tải lại nóng proxy — một số bộ điều khiển hỗ trợ tải lại cấu hình không có thời gian ngừng hoạt động,
những người khác yêu cầu khởi động lại toàn bộ quá trình.
4. Cập nhật trường `status.loadBalancer` với IP/hostname của điểm cuối đầu vào.

---

<a id="3-ingressclass"></a>
<a id="heading-6-3-ingressclass"></a>

## 3. IngressClass

`IngressClass` là tài nguyên có phạm vi cụm được giới thiệu trong Kubernetes 1.18 và được tạo ổn định trong 1.19. Nó thay thế chú thích `kubernetes.io/ingress.class` cũ hơn.[^k8s-ingressclass]

<a id="why-ingressclass-exists"></a>
<a id="heading-7-why-ingressclass-exists"></a>

### Tại sao IngressClass tồn tại

Nhiều bộ điều khiển xâm nhập có thể chạy trong cùng một cụm — ví dụ: một bộ điều khiển NGINX cho lưu lượng truy cập nội bộ và một bộ điều khiển cho lưu lượng bên ngoài. IngressClass cho phép mỗi tài nguyên Ingress khai báo rõ ràng bộ điều khiển nào sẽ xử lý nó.

<a id="ingressclass-object"></a>
<a id="heading-8-ingressclass-object"></a>

### Đối tượng IngressClass

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx-external
  # Đặt lớp này làm lớp mặc định - xác nhận các đối tượng Ingress chưa đặt ingressClassName:
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: k8s.io/ingress-nginx   # phải khớp với giá trị cờ --ingress-class của bộ điều khiển
  parameters:                         # tùy chọn: đối tượng cấu hình dành riêng cho nhà cung cấp
    apiGroup: k8s.example.net
    kind: IngressParameters
    name: external-lb-params
```

<a id="referencing-a-class-from-an-ingress"></a>
<a id="heading-9-referencing-a-class-from-an-ingress"></a>

### Tham chiếu một lớp từ Ingress

```yaml
spec:
  ingressClassName: nginx-external   # cách tiếp cận ưa thích (lĩnh vực)
```

Chú thích cũ `kubernetes.io/ingress.class: nginx-external` vẫn hoạt động trong hầu hết các bộ điều khiển nhưng chính thức không được dùng nữa kể từ Kubernetes 1.18. Tệp kê khai mới phải luôn sử dụng trường `ingressClassName`.[^k8s-ingress-deprecated-annotation]

<a id="default-ingressclass"></a>
<a id="heading-10-default-ingressclass"></a>

### IngressClass mặc định

Nếu chính xác một IngressClass có chú thích `ingressclass.kubernetes.io/is-default-class: "true"`, thì các đối tượng Ingress bỏ qua `ingressClassName` sẽ tự động được gán lớp đó. Nếu không hoặc nhiều hơn một IngressClass xác nhận là mặc định, các đối tượng Ingress không có `ingressClassName` vẫn không được liên kết (không có bộ điều khiển nào chọn chúng và bạn sẽ thấy cảnh báo ở trạng thái Ingress).

```bash
# Kiểm tra lớp nào là mặc định
kubectl get ingressclass
# NAME             CONTROLLER                      PARAMETERS   AGE
# nginx k8s.io/ingress-nginx <none> 10d
# nginx (mặc định) k8s.io/ingress-nginx <none> 10d ← bộ chú thích
```

---

<a id="4-ingress-resource-deep-dive"></a>
<a id="heading-11-4-ingress-resource-deep-dive"></a>

## 4. Tìm hiểu sâu về tài nguyên Ingress

<a id="minimal-example"></a>
<a id="heading-12-minimal-example"></a>

### Ví dụ tối thiểu

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

<a id="full-annotated-spec"></a>
<a id="heading-13-full-annotated-spec"></a>

### Thông số được chú thích đầy đủ

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: full-example
  namespace: production
  # Các chú thích dành riêng cho bộ điều khiển - xem Phần 8
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx            # bộ điều khiển nào xử lý việc này

  defaultBackend:                    # dự phòng nếu không có quy tắc nào phù hợp
    service:
      name: default-page-svc
      port:
        number: 80

  tls:                               # xem Phần 6
  - hosts:
    - myapp.example.com
    - api.example.com
    secretName: example-tls-secret   # kubernetes.io/tls Secret

  rules:

  # ── Quy tắc 1: Máy chủ + Định tuyến đường dẫn ───────────────────── ──────────────────────
  - host: myapp.example.com          # khớp tên máy chủ chính xác (không có ký tự đại diện theo mặc định)
    http:
      paths:
      - path: /                      # đường dẫn gốc
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

  # ── Quy tắc 2: Tên máy chủ ký tự đại diện ────────────────────── ───────────────────────
  - host: "*.example.com"            # ký tự đại diện: khớp với một nhãn DNS
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: wildcard-svc
            port:
              number: 80

  # ── Quy tắc 3: Không chỉ định máy chủ ────────────────────── ───────────────────────
  # Khớp tất cả các tên máy chủ không khớp với quy tắc cụ thể hơn
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

<a id="wildcard-hosts"></a>
<a id="heading-14-wildcard-hosts"></a>

### Máy chủ ký tự đại diện

Tên máy chủ ký tự đại diện như `*.example.com` khớp chính xác với một nhãn DNS. Nó khớp với `foo.example.com` nhưng KHÔNG khớp với `foo.bar.example.com` hoặc `example.com`. Ký tự đại diện phải là nhãn ngoài cùng bên trái; `foo.*.example.com` không hợp lệ.[^k8s-ingress-wildcards]

<a id="ingress-status"></a>
<a id="heading-15-ingress-status"></a>

### Trạng thái Ingress

Sau khi tạo xong, kiểm tra trạng thái để tìm IP hoặc tên máy chủ được chỉ định:

```bash
kubectl get ingress my-ingress -n production
# NAME         CLASS   HOSTS               ADDRESS          PORTS     AGE
# my-ingress nginx myapp.example.com 203.0.113.10 80, 443 5m

kubectl describe ingress my-ingress -n production
# Sự kiện:
#   Đồng bộ hóa bình thường Bộ điều khiển nginx-ingress 3 m được lên lịch để đồng bộ hóa
```

---

<a id="5-path-types"></a>
<a id="heading-16-5-path-types"></a>

## 5. Các loại đường dẫn

Loại đường dẫn là trường **bắt buộc** kể từ `networking.k8s.io/v1`. Nó kiểm soát cách khớp đường dẫn trong quy tắc với các URI yêu cầu đến.[^k8s-ingress-pathtypes]

<a id="exact"></a>
<a id="heading-17-exact"></a>

### Chính xác

```yaml
path: /foo
pathType: Exact
```

Chỉ phù hợp với `/foo`. **không** khớp với `/foo/`, `/foo/bar` hoặc `/FOO`.

<a id="prefix"></a>
<a id="heading-18-prefix"></a>

### Tiền tố

```yaml
path: /foo
pathType: Prefix
```

Khớp với bất kỳ đường dẫn nào trong đó mỗi phần tử đường dẫn (thành phần được phân cách bằng dấu gạch chéo) là tiền tố của đường dẫn yêu cầu. Cụ thể:

- `/foo` khớp với `/foo` và `/foo/bar`
- `/foo` KHÔNG khớp với `/foobar` (ký tự tiếp theo phải là `/` hoặc cuối chuỗi)
- `/foo/` khớp với `/foo/` và `/foo/bar` nhưng KHÔNG khớp với `/foo`

Sự khác biệt giữa `/foo` (Tiền tố, không có dấu gạch chéo ở cuối) và `/foo/` (Tiền tố, dấu gạch chéo ở cuối) là rất nhỏ nhưng rất quan trọng. Khi nghi ngờ, hãy sử dụng `/foo` không có dấu gạch chéo ở cuối — hầu hết các bộ điều khiển đều khớp chính xác với điều này.

<a id="implementationspecific"></a>
<a id="heading-19-implementationspecific"></a>

### Triển khai cụ thể

```yaml
path: /foo.*
pathType: ImplementationSpecific
```

Việc giải thích hoàn toàn được giao cho việc triển khai IngressClass. Điều này có thể có nghĩa là biểu thức chính quy, hình cầu hoặc bất kỳ mẫu nào khác. Vì loại này không khả dụng trên các bộ điều khiển nên hãy tránh sử dụng loại này trong các lần triển khai mới trừ khi bạn đặc biệt cần kết hợp cụ thể với bộ điều khiển.

<a id="precedence-rules"></a>
<a id="heading-20-precedence-rules"></a>

### Quy tắc ưu tiên

Khi nhiều đường dẫn có thể khớp với một yêu cầu, đường dẫn cụ thể nhất sẽ thắng:

1. Đường dẫn **Chính xác** được ưu tiên hơn Tiền tố và Triển khai cụ thể.
2. Đường dẫn **Tiền tố dài hơn** được ưu tiên hơn đường dẫn Tiền tố ngắn hơn.
3. Nếu tồn tại sự hòa giữa các quy tắc trong cùng một Ingress thì quy tắc được liệt kê đầu tiên sẽ thắng (đối với hầu hết
bộ điều khiển).
4. Các quy tắc trong cùng một khối máy chủ được đánh giá cùng nhau.

Ví dụ về quyền ưu tiên:

```yaml
# Yêu cầu: NHẬN /foo/bar
# Người chiến thắng: quy tắc thứ hai (tiền tố dài hơn)
- path: /foo
  pathType: Prefix    # khớp, nhưng ngắn hơn
- path: /foo/bar
  pathType: Prefix    # trận đấu VÀ lâu hơn - thắng
- path: /foo/bar
  pathType: Exact     # sẽ thắng nếu nó trùng khớp chính xác, nhưng /foo/bar/ sẽ không khớp
```

---

<a id="6-tls--https"></a>
<a id="heading-21-6-tls-https"></a>

## 6. TLS / HTTPS

<a id="tls-termination-at-the-ingress-controller"></a>
<a id="heading-22-tls-termination-at-the-ingress-controller"></a>

### Chấm dứt TLS tại Bộ điều khiển Ingress

Mẫu phổ biến nhất là chấm dứt TLS tại bộ điều khiển xâm nhập. Bộ điều khiển giải mã HTTPS và chuyển tiếp HTTP đơn giản tới Service.[^k8s-ingress-tls] phụ trợ

```yaml
# Bước 1: Tạo TLS Secret
# Secret phải thuộc loại kubernetes.io/tls với tls.crt và tls.key
kubectl create secret tls my-tls-secret \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  --namespace=production

# Hoặc tuyên bố:
apiVersion: v1
kind: Secret
metadata:
  name: my-tls-secret
  namespace: production
type: kubernetes.io/tls
data:
  tls.crt: <base64-encoded-certificate-chain>   # phải bao gồm các chứng chỉ trung cấp
  tls.key: <base64-encoded-private-key>
```

```yaml
# Bước 2: Tham khảo Secret trong Ingress
spec:
  tls:
  - hosts:
    - myapp.example.com          # phải khớp với máy chủ trong .spec.rules
    secretName: my-tls-secret    # phải ở cùng namespace giống như Ingress
```

Các hạn chế chính:

- Secret phải ở **cùng namespace** với đối tượng Ingress.
- `tls.crt` phải bao gồm chuỗi chứng chỉ đầy đủ (lá + trung gian), không chỉ lá.
- Các máy chủ được liệt kê trong `tls` phải khớp chính xác với các máy chủ trong quy tắc tương ứng.
- Kubernetes Ingress chỉ hỗ trợ TLS trên cổng 443. TLS đa cổng không phải là một phần của thông số Ingress.

<a id="sni-multiple-tls-hosts"></a>
<a id="heading-23-sni-multiple-tls-hosts"></a>

### SNI (Nhiều máy chủ TLS)

Bạn có thể có nhiều mục `tls` trong một Ingress, mỗi mục có các máy chủ và Secrets khác nhau. Bộ điều khiển sử dụng SNI để chọn chứng chỉ chính xác cho mỗi máy chủ.

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

<a id="https-redirect-http--https"></a>
<a id="heading-24-https-redirect-http-https"></a>

### Chuyển hướng HTTPS (HTTP → HTTPS)

Việc buộc HTTP thành HTTPS là dành riêng cho bộ điều khiển. Với Bộ điều khiển NGINX Ingress:

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    # hoặc: nginx.ingress.kubernetes.io/ssl-redirect: "true" (chỉ chuyển hướng khi TLS được định cấu hình)
```

<a id="cert-manager-integration"></a>
<a id="heading-25-cert-manager-integration"></a>

### Tích hợp trình quản lý chứng chỉ

cert-manager tự động hóa việc cấp và gia hạn chứng chỉ TLS (e.g., từ Let's Encrypt). Nó theo dõi các đối tượng Ingress với các chú thích cụ thể và tự động tạo TLS Secrets.[^cert-manager]

```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts: [myapp.example.com]
    secretName: myapp-tls          # người quản lý chứng chỉ tạo Secret này
  rules:
  - host: myapp.example.com
    ...
```

<a id="tls-passthrough"></a>
<a id="heading-26-tls-passthrough"></a>

### Truyền qua TLS

Truyền qua TLS (chuyển tiếp lưu lượng được mã hóa mà không cần giải mã) không phải là một phần của thông số Ingress. Một số bộ điều khiển hỗ trợ nó thông qua các chú thích tùy chỉnh, nhưng nó không thể mang theo được. Để truyền qua TLS thích hợp, hãy sử dụng `TLSRoute` của Gateway API (kênh thử nghiệm).[^gateway-api-tlsroute]

---

<a id="7-default-backend"></a>
<a id="heading-27-7-default-backend"></a>

## 7. Phần cuối mặc định

`defaultBackend` trong thông số Ingress xác định vị trí định tuyến lưu lượng truy cập khi không có quy tắc nào phù hợp. Điều này tách biệt với mọi quy tắc có máy chủ hoặc đường dẫn.

```yaml
spec:
  defaultBackend:
    service:
      name: default-404-page
      port:
        number: 80
```

Nhiều bộ điều khiển cũng hỗ trợ phần phụ trợ mặc định trên toàn cụm được định cấu hình trên chính bộ điều khiển (cờ e.g., `--default-backend-service` trong ingress-nginx). Ingress cấp `defaultBackend` ghi đè mặc định của bộ điều khiển cho Ingress cụ thể đó.

Nếu không có defaultBackend nào được định cấu hình ở bất kỳ cấp độ nào và không có quy tắc nào phù hợp, bộ điều khiển thường trả về phản hồi `404` hoặc `503` từ trình xử lý tích hợp sẵn của chính nó.

---

<a id="8-annotations"></a>
<a id="heading-28-8-annotations"></a>

## 8. Chú thích

Thông số cốt lõi của Ingress được cố ý tối thiểu hóa. Chú thích là cơ chế chính cho cấu hình dành riêng cho bộ điều khiển. Điều này tạo ra vấn đề về tính di động: chú thích từ bộ điều khiển này không hoạt động với bộ điều khiển khác. Đây là một trong những động lực chính cho Gateway API.[^gateway-api-intro]

<a id="why-annotations-are-problematic"></a>
<a id="heading-29-why-annotations-are-problematic"></a>

### Tại sao chú thích lại có vấn đề

- Chúng được gõ theo chuỗi (không xác thực lược đồ).
- Chúng không di động trên các bộ điều khiển.
- Chúng có thể phát triển lên hàng trăm cặp khóa-giá trị cho các trường hợp sử dụng phức tạp.
- Không có cách nào để chia sẻ cấu hình trên nhiều đối tượng Ingress.

<a id="common-nginx-ingress-annotations"></a>
<a id="heading-30-common-nginx-ingress-annotations"></a>

### Chú thích NGINX Ingress phổ biến

Những điều này áp dụng cho Bộ điều khiển NGINX Ingress (`k8s.io/ingress-nginx`).[^nginx-ingress-annotations] Lưu ý: ingress-nginx sẽ ngừng hoạt động vào tháng 3 năm 2026.

```yaml
metadata:
  annotations:
    # ── Viết lại ────────────────────────────── ──────────────────────────────
    nginx.ingress.kubernetes.io/rewrite-target: /           # viết lại đường dẫn đến /
    nginx.ingress.kubernetes.io/use-regex: "true"           # kích hoạt biểu thức chính quy trong đường dẫn

    # ── Chuyển hướng ────────────────────────────── ──────────────────────────────
    nginx.ingress.kubernetes.io/permanent-redirect: https://new.example.com
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"

    # ── TLS ──────────────────────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/ssl-passthrough: "true"

    # ── Xác thực ──────────────────────────── ────────────────────────────
    nginx.ingress.kubernetes.io/auth-type: basic
    nginx.ingress.kubernetes.io/auth-secret: basic-auth-secret
    nginx.ingress.kubernetes.io/auth-realm: "Authentication Required"
    # Đối với OAuth/OIDC có dịch vụ xác thực bên ngoài:
    nginx.ingress.kubernetes.io/auth-url: "https://auth.example.com/verify"
    nginx.ingress.kubernetes.io/auth-signin: "https://auth.example.com/login"

    # ── Giới hạn tỷ lệ ──────────────────────────── ────────────────────────────
    nginx.ingress.kubernetes.io/limit-rps: "10"             # 10 req/s mỗi IP
    nginx.ingress.kubernetes.io/limit-connections: "5"

    # ── Cấu hình ngược dòng ──────────────────────── ────────────────────────
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "30"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"      # nội dung yêu cầu tối đa

    # ── CORS ─────────────────────────────────────────────────────────────────
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://app.example.com"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, OPTIONS"

    # ── WebSocket ────────────────────────────── ──────────────────────────────
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"  # giữ cho WS tồn tại
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"

    # ── Mối quan hệ phiên ────────────────────────── ───────────────────────────
    nginx.ingress.kubernetes.io/affinity: cookie
    nginx.ingress.kubernetes.io/session-cookie-name: INGRESSCOOKIE
    nginx.ingress.kubernetes.io/session-cookie-expires: "172800"
    nginx.ingress.kubernetes.io/session-cookie-max-age: "172800"
    nginx.ingress.kubernetes.io/session-cookie-path: /

    # ── Tiêu đề tùy chỉnh ──────────────────────────── ────────────────────────────
    nginx.ingress.kubernetes.io/configuration-snippet: |
      more_set_headers "X-Frame-Options: DENY";
      more_set_headers "X-Content-Type-Options: nosniff";
```

<a id="configmap-level-nginx-configuration"></a>
<a id="heading-31-configmap-level-nginx-configuration"></a>

### Cấu hình ConfigMap cấp NGINX

Cài đặt NGINX toàn cầu được đặt trong ConfigMap được bộ điều khiển tham chiếu:

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

<a id="9-popular-ingress-controllers"></a>
<a id="heading-32-9-popular-ingress-controllers"></a>

## 9. Bộ điều khiển Ingress phổ biến

<a id="status-summary-february-2026"></a>
<a id="heading-33-status-summary-february-2026"></a>

### Tóm tắt hiện trạng (tháng 2 năm 2026)

| Bộ điều khiển | Trạng thái | Ghi chú |
|---|---|---|
| ingress-nginx (cộng đồng) | **Nghỉ hưu vào tháng 3 năm 2026** | Di chuyển đi - không có bản vá trong tương lai |
| Bộ điều khiển F5 NGINX Ingress | Đang hoạt động | Thương mại; đã thử nghiệm k8s 1.25–1.32 |
| Traefik | Đang hoạt động v3.x | Hỗ trợ Ingress + Gateway API |
| HAProxy Ingress | Đang hoạt động | L7 hiệu suất cao |
| Đường viền (Envoy) | Đang hoạt động | CNCF; cũng hỗ trợ Gateway API |
| Istio | Đang hoạt động | Lưới dịch vụ đầy đủ; Ingress là chế độ cũ |
| Bộ điều khiển AWS ALB | Đang hoạt động | Cung cấp Cân bằng tải ứng dụng AWS |
| GKE được quản lý Ingress | Đang hoạt động | Được tích hợp vào các cụm GKE |
| Ứng dụng Azure Gateway | Đang hoạt động | Tích hợp AKS |

<a id="ingress-nginx-community--retiring-march-2026ingress-nginx-retirement"></a>
<a id="heading-34-ingress-nginx-community-retiring-march-2026i"></a>

### ingress-nginx (Cộng đồng) - NGHỈ NGỪA tháng 3 năm 2026[^ingress-nginx-retirement]

Bộ điều khiển `ingress-nginx` do cộng đồng duy trì tại `kubernetes/ingress-nginx` sẽ ngừng hoạt động vào tháng 3 năm 2026. Điều này đã được dự án Kubernetes chính thức công bố. Sau khi nghỉ hưu:
- Không có bản phát hành mới để sửa lỗi hoặc vá lỗi bảo mật.
- Các hoạt động triển khai hiện tại vẫn tiếp tục hoạt động nhưng chưa được vá lỗi.
- SIG Network khuyên bạn nên chuyển sang Gateway API hoặc bộ điều khiển được bảo trì tích cực khác.

Điều này khác với **Bộ điều khiển F5 NGINX Ingress** (`nginx/kubernetes-ingress`), được duy trì riêng biệt và được hỗ trợ tích cực.

<a id="f5-nginx-ingress-controllernginx-ingress-controller"></a>
<a id="heading-35-f5-nginx-ingress-controllernginx-ingress-control"></a>

### Bộ điều khiển F5 NGINX Ingress[^nginx-ingress-controller]

```bash
# Cài đặt qua Helm (v4.x - hỗ trợ k8s 1.25-1.32)
helm repo add nginx-stable https://helm.nginx.com/stable
helm install nginx-ingress nginx-stable/nginx-ingress \
  --namespace nginx-ingress --create-namespace \
  --set controller.watchIngressWithoutClass=true
```

```yaml
# IngressClass cho F5 NGINX
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: nginx.org/ingress-controller
```

<a id="traefiktraefik"></a>
<a id="heading-36-traefiktraefik"></a>

### Traefik[^traefik]

Traefik là proxy ngược gốc trên nền tảng đám mây hỗ trợ nguyên bản Kubernetes Ingress và Gateway API.

```bash
# Cài đặt Traefik qua Helm
helm repo add traefik https://traefik.github.io/charts
helm install traefik traefik/traefik \
  --namespace traefik --create-namespace
```

```yaml
# IngressClass cho Traefik
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: traefik
spec:
  controller: traefik.io/ingress-controller
```

Traefik cũng cung cấp CRDs (`IngressRoute`, `Middleware`) của riêng mình để có cấu hình phong phú hơn vượt xa những gì chú thích Ingress có thể thể hiện.

<a id="contour-envoy-basedcontour"></a>
<a id="heading-37-contour-envoy-basedcontour"></a>

### Đường viền (dựa trên Envoy)[^contour]

Đường viền là một dự án CNCF sử dụng Envoy làm mặt phẳng dữ liệu. Nó hỗ trợ Kubernetes Ingress và Gateway API nguyên bản.

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

<a id="10-advanced-patterns"></a>
<a id="heading-38-10-advanced-patterns"></a>

## 10. Mẫu nâng cao

<a id="path-based-routing-fan-out"></a>
<a id="heading-39-path-based-routing-fan-out"></a>

### Định tuyến dựa trên đường dẫn (Fan-Out)

Định tuyến các đường dẫn URL khác nhau đến các dịch vụ phụ trợ khác nhau — một mẫu dịch vụ vi mô phổ biến.

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

<a id="name-based-virtual-hosting"></a>
<a id="heading-40-name-based-virtual-hosting"></a>

### Lưu trữ ảo dựa trên tên

Định tuyến các tên máy chủ khác nhau đến các chương trình phụ trợ khác nhau — tương tự như dịch vụ lưu trữ ảo Apache/NGINX.

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

<a id="url-rewriting-nginx"></a>
<a id="heading-41-url-rewriting-nginx"></a>

### Viết lại URL (NGINX)

Viết lại `/app/foo` thành `/foo` trước khi chuyển tiếp sang phần phụ trợ:

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
      - path: /app(/|$)(.*)          # nhóm chụp biểu thức chính quy $2 = phần còn lại của đường dẫn
        pathType: ImplementationSpecific
        backend:
          service: { name: my-app, port: { number: 80 } }
```

<a id="canary-deployments-nginx"></a>
<a id="heading-42-canary-deployments-nginx"></a>

### Canary Deployments (NGINX)

Phân chia lưu lượng truy cập giữa các phiên bản ổn định và canary bằng cách sử dụng chú thích NGINX Ingress:

```yaml
# --- Phiên bản ổn định (cơ sở Ingress)
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
# --- Phiên bản Canary (nhận 20% lượng truy cập)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "20"     # 20% cho chim hoàng yến
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

Canary theo tiêu đề (luôn gửi người dùng có tiêu đề cụ thể tới canary):

```yaml
annotations:
  nginx.ingress.kubernetes.io/canary: "true"
  nginx.ingress.kubernetes.io/canary-by-header: "X-Canary"
  nginx.ingress.kubernetes.io/canary-by-header-value: "always"
```

<a id="basic-authentication"></a>
<a id="heading-43-basic-authentication"></a>

### Xác thực cơ bản

```bash
# Tạo tập tin htpasswd
htpasswd -c auth admin
# Tạo: admin:$apr1$...

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

<a id="external-authentication-oauth2-proxy"></a>
<a id="heading-44-external-authentication-oauth2-proxy"></a>

### Xác thực bên ngoài (Proxy OAuth2)

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/auth-url: "https://oauth2-proxy.example.com/oauth2/auth"
    nginx.ingress.kubernetes.io/auth-signin: "https://oauth2-proxy.example.com/oauth2/start?rd=$escaped_request_uri"
    nginx.ingress.kubernetes.io/auth-response-headers: "X-Auth-Request-User,X-Auth-Request-Email"
```

<a id="rate-limiting"></a>
<a id="heading-45-rate-limiting"></a>

### Giới hạn tỷ lệ

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/limit-rps: "10"        # requests mỗi giây trên mỗi IP
    nginx.ingress.kubernetes.io/limit-rpm: "100"       # requests mỗi phút trên mỗi IP
    nginx.ingress.kubernetes.io/limit-connections: "5" # concurrent connections per IP
    # Danh sách trắng (không giới hạn tỷ lệ cho các IP này):
    nginx.ingress.kubernetes.io/limit-whitelist: "10.0.0.0/8,192.168.0.0/16"
```

---

<a id="11-rbac-for-ingress"></a>
<a id="heading-46-11-rbac-for-ingress"></a>

## 11. RBAC cho Ingress

Tài nguyên Ingress được đặt tên. Để tạo, cập nhật hoặc xem các đối tượng Ingress, ServiceAccount hoặc người dùng cần có quyền RBAC thích hợp.[^k8s-rbac]

```yaml
# Role để quản lý các đối tượng Ingress trong namespace
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
# ClusterRole để đọc IngressClass (trong phạm vi cụm)
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: ingressclass-reader
rules:
- apiGroups: ["networking.k8s.io"]
  resources: ["ingressclasses"]
  verbs: ["get", "list", "watch"]
```

Bản thân Bộ điều khiển Ingress thường cần ClusterRole để xem Ingress, Services, Endpoints (hoặc EndpointSlices), Secrets và ConfigMaps trên tất cả namespaces:

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
  resources: ["endpointslices"]      # kể từ Kubernetes 1.21
  verbs: ["list", "watch"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses", "ingressclasses"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses/status"]
  verbs: ["update"]
- apiGroups: ["coordination.k8s.io"]
  resources: ["leases"]              # bầu cử lãnh đạo
  verbs: ["get", "list", "watch", "create", "update"]
```

---

<a id="12-troubleshooting"></a>
<a id="heading-47-12-troubleshooting"></a>

## 12. Khắc phục sự cố

<a id="checklist"></a>
<a id="heading-48-checklist"></a>

### Danh sách kiểm tra

Khi Ingress không hoạt động, hãy làm theo thứ tự chẩn đoán sau:

1. **Bộ điều khiển Ingress có tồn tại và nó có đang chạy không?**
   ```bash
   kubectl get pods -n ingress-nginx
   kubectl logs -n ingress-nginx deploy/ingress-nginx-controller | tail -50
   ```

2. **Ingress có tồn tại và có IP không?**
   ```bash
   kubectl get ingress -A
   # Nếu ĐỊA CHỈ trống, bộ điều khiển chưa chọn nó.
   ```

3. **IngressClass có đúng không?**
   ```bash
   kubectl get ingressclass
   kubectl describe ingress <name> | grep "Ingress Class"
   ```

4. **Service phụ trợ có sẵn không?**
   ```bash
   kubectl get svc,endpoints -n <namespace>
   # Endpoints không được để trống
   ```

5. **DNS có phân giải thành IP Ingress không?**
   ```bash
   nslookup myapp.example.com
   # Nên trả lại IP Ingress từ bước 2
   ```

6. **TLS Secret có đúng là namespace không?**
   ```bash
   kubectl get secret <secretname> -n <ingress-namespace>
   ```

<a id="common-issues"></a>
<a id="heading-49-common-issues"></a>

### Các vấn đề chung

**Vấn đề: Trường `ADDRESS` trống sau khi tạo Ingress**

Nguyên nhân: không khớp với IngressClass; bộ điều khiển không chạy; bộ điều khiển không thể truy cập máy chủ API.

```bash
# Kiểm tra nhật ký bộ điều khiển để tìm lỗi
kubectl logs deploy/ingress-nginx-controller -n ingress-nginx
# Tìm kiếm: "Lỗi lấy Endpoints cho Service"
```

**Sự cố: `404 Not Found` từ bộ điều khiển**

Không có quy tắc phù hợp. Kiểm tra xem `host` có khớp chính xác với tiêu đề HTTP `Host` (phân biệt chữ hoa chữ thường) hay không. Kiểm tra xem `path` và `pathType` có đúng không. Hãy nhớ: `Exact /foo` không khớp với `/foo/`.

**Vấn đề: `502 Bad Gateway`**

Bộ điều khiển không thể tiếp cận phần phụ trợ. Kiểm tra:
```bash
kubectl get endpoints <service-name> -n <namespace>
# ĐIỂM CUỐI không được hiển thị "<none>"
kubectl exec -n ingress-nginx deploy/ingress-nginx-controller -- \
  curl -s http://<pod-ip>:<port>/
```

**Vấn đề: Chứng chỉ TLS hiển thị là không chính xác hoặc tự ký**

Secret có thể không khớp với tên máy chủ hoặc Secret chỉ chứa chứng chỉ lá (thiếu chứng chỉ trung gian). Xác minh:
```bash
kubectl get secret my-tls-secret -n production -o jsonpath='{.data.tls\.crt}' | \
  base64 -d | openssl x509 -text -noout | grep -E "Subject:|Issuer:|DNS:"
```

**Vấn đề: Chú thích không được áp dụng**

Kiểm tra nhật ký điều khiển. Nhiều bộ điều khiển yêu cầu đối tượng Ingress phải được đồng bộ lại. Đồng thời xác minh khóa chú thích được viết đúng chính tả (bộ điều khiển âm thầm bỏ qua các chú thích không xác định).

```bash
kubectl describe ingress <name>
# Phần chú thích hiển thị những gì được thiết lập
```

<a id="debugging-commands"></a>
<a id="heading-50-debugging-commands"></a>

### Lệnh gỡ lỗi

```bash
# Kiểm tra kết nối từ bên trong cụm
kubectl run test-pod --rm -it --image=nicolaka/netshoot -- bash
# Bên trong pod:
curl -H "Host: myapp.example.com" http://<ingress-controller-service-ip>/path
curl -k -H "Host: myapp.example.com" https://<ingress-controller-service-ip>/path

# Kiểm tra cấu hình NGINX được tạo bởi bộ điều khiển
kubectl exec -n ingress-nginx deploy/ingress-nginx-controller -- cat /etc/nginx/nginx.conf

# Xem nhật ký bộ điều khiển trong thời gian thực
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -f

# Kiểm tra các sự kiện trên Ingress
kubectl describe ingress <name> -n <namespace>
```

---

<a id="13-migration-ingress--gateway-api"></a>
<a id="heading-51-13-migration-ingress-gateway-api"></a>

## 13. Di chuyển: Ingress → Gateway API

<a id="why-migrate"></a>
<a id="heading-52-why-migrate"></a>

### Tại sao phải di cư?

- **ingress-nginx ngừng hoạt động vào tháng 3 năm 2026**: Không có bản sửa lỗi hoặc bảo mật nào trong tương lai.
- **Tính biểu cảm**: Gateway API hỗ trợ các tính năng yêu cầu chú thích phức tạp với Ingress
(trọng số lưu lượng truy cập, định tuyến dựa trên tiêu đề, gRPC, chuyển qua TLS) vốn có trong thông số kỹ thuật.
- **Mô hình dựa trên Role**: Gateway API tách cơ sở hạ tầng (Gateway) khỏi định tuyến ứng dụng
(HTTPRoute), cho phép chia sẻ cụm nhiều nhóm tốt hơn.
- **Không có chú thích**: Tất cả cấu hình đều được máy chủ API nhập và xác thực.
- **Áp dụng rộng rãi hơn**: Gateway API được triển khai bởi hơn 20 bộ điều khiển bao gồm Cilium, Envoy
Gateway, Istio, Linkerd, Traefik, NGINX Gateway Nhà cung cấp vải và đám mây.[^gateway-api-impls]

<a id="conceptual-mapping"></a>
<a id="heading-53-conceptual-mapping"></a>

### Lập bản đồ khái niệm

| Khái niệm Ingress | Gateway API tương đương |
|---|---|
| `IngressClass` | `GatewayClass` |
| `Ingress` | `Gateway` + `HTTPRoute` |
| `spec.rules[].host` | `HTTPRoute.spec.hostnames[]` |
| `spec.rules[].http.paths[]` | `HTTPRoute.spec.rules[].matches[]` |
| `spec.tls[]` | `Gateway.spec.listeners[].tls` |
| Chú thích (viết lại) | `HTTPRoute.spec.rules[].filters[].urlRewrite` |
| Chú thích (chuyển hướng) | `HTTPRoute.spec.rules[].filters[].requestRedirect` |
| Chú thích (trọng lượng hoàng yến) | `HTTPRoute.spec.rules[].backendRefs[].weight` |
| `defaultBackend` | Quy tắc tổng hợp `HTTPRoute` |

<a id="simple-migration-example"></a>
<a id="heading-54-simple-migration-example"></a>

### Ví dụ di chuyển đơn giản

**Trước (Ingress):**

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

**Sau (Gateway API):**

```yaml
# Nhân viên cơ sở hạ tầng tạo Gateway (được chia sẻ giữa các nhóm)
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: prod-gateway
  namespace: infra
spec:
  gatewayClassName: cilium            # hoặc envoy-gateway, istio, nginx, v.v.
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
# Người ứng dụng tạo HTTPRoute (trong namespace của riêng họ)
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

Để có hướng dẫn Gateway API hoàn chỉnh, hãy xem tài liệu đi kèm `Kubernetes_GatewayAPI_Complete_Guide.md`.

---

<a id="14-references"></a>
<a id="heading-55-14-references"></a>

## 14. Tài liệu tham khảo

<a id="kubernetes-official-documentation"></a>
<a id="heading-56-kubernetes-official-documentation"></a>

### Tài liệu chính thức của Kubernetes









<a id="ingress-controllers"></a>
<a id="heading-57-ingress-controllers"></a>

### Bộ điều khiển Ingress






<a id="ecosystem"></a>
<a id="heading-58-ecosystem"></a>

### Hệ sinh thái





<a id="further-reading"></a>
<a id="heading-59-further-reading"></a>

### Đọc thêm

- Mạng SIG Kubernetes: https://github.com/kubernetes/community/tree/master/sig-network
- Ingress NGINX GitHub (cộng đồng, đã nghỉ hưu): https://github.com/kubernetes/ingress-nginx
- Gateway API GitHub: https://github.com/kubernetes-sigs/gateway-api

---

*Hướng dẫn đầy đủ về Kubernetes Ingress — v1.0 — Tháng 2 năm 2026 — Dựa trên Kubernetes 1.32 / networking.k8s.io/v1*

[^k8s-ingress]: Kubernetes — Các khái niệm Ingress.
[^k8s-ingressclass]: Kubernetes — IngressClass.
[^k8s-ingress-deprecated-annotation]: Kubernetes — Chú thích kubernetes.io/ingress.class không được dùng nữa.
[^k8s-ingress-pathtypes]: Kubernetes - Các loại đường dẫn Ingress.
[^k8s-ingress-tls]: Kubernetes — Ingress TLS.
[^k8s-ingress-wildcards]: Kubernetes - Máy chủ ký tự đại diện Ingress.
[^k8s-deprecated-apis]: Kubernetes — Hướng dẫn di chuyển API không được dùng nữa.
[^k8s-rbac]: Kubernetes - Sử dụng ủy quyền RBAC.
[^ingress-nginx-retirement]: Ghi chú phát hành EKS - thông báo ngừng hoạt động ingress-nginx, tháng 3 năm 2026.
[^nginx-ingress-controller]: Tài liệu về bộ điều khiển F5 NGINX Ingress (v4.x).
[^nginx-ingress-annotations]: Bộ điều khiển NGINX Ingress - Tham chiếu chú thích.
[^traefik]: Traefik — Tài liệu Kubernetes Ingress.
[^contour]: Đường viền dự án — Kubernetes Ingress (CNCF).
[^cert-manager]: người quản lý chứng chỉ - Bảo mật tài nguyên Ingress.
[^gateway-api-intro]: Kubernetes Gateway API — Giới thiệu.
[^gateway-api-tlsroute]: Kubernetes Gateway API — TLSRoute (Thử nghiệm).
[^gateway-api-impls]: Kubernetes Gateway API — Triển khai.
