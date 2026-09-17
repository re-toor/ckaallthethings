<a id="kubernetes-ingress-cka-step-by-step-practice-guide"></a>
<a id="heading-0-kubernetes-ingress-cka-step-by-step-practice-guid"></a>

# Kubernetes Ingress: Hướng dẫn thực hành từng bước của CKA

> **Controller cũ:** Ingress NGINX đã kết thúc bảo trì từ tháng 3/2026. Các ví dụ annotation NGINX bên dưới chỉ để thực hành với controller có sẵn trong lab hoặc đề bài. API Ingress vẫn tồn tại. Với cụm mới, chọn controller còn được bảo trì hoặc Gateway API. [Thông báo chính thức](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/).


> **Bản tiếng Việt · CKA Kubernetes 1.35 · cập nhật 17/09/2026.** Đọc [các thay đổi cho phiên bản thi](kubernetes-1.35-update.md).


> **Phiên bản:** v1.0 — Tháng 2 năm 2026 — Dựa trên Chương trình giảng dạy Kubernetes 1.35 / đề cương CKA
>
> ⚠️ **Lưu ý bài kiểm tra:** Môi trường thi CKA sử dụng Kubernetes 1.35. `networking.k8s.io/v1`
> Ingress API là phiên bản hợp lệ duy nhất. Bản beta cũ API (`extensions/v1beta1`) đã bị xóa và sẽ
> gây ra lỗi. Tất cả các câu trả lời trong hướng dẫn này đều sử dụng `networking.k8s.io/v1`.

---

<a id="table-of-contents"></a>
<a id="heading-1-table-of-contents"></a>

## Mục lục

1. [Phạm vi kỳ thi CKA](#1-cka-exam-coverage)
2. [Thẻ tham khảo nhanh](#2-quick-reference-card)
3. [Nhiệm vụ 1: Tạo Ingress](#task-1-create-a-basic-ingress) cơ bản
4. [Nhiệm vụ 2: Đầu ra đa đường dẫn Ingress](#task-2-multi-path-fan-out-ingress)
5. [Nhiệm vụ 3: Hosting ảo dựa trên tên](#task-3-name-based-virtual-hosting)
6. [Nhiệm vụ 4: TLS/HTTPS Ingress](#task-4-tlshttps-ingress)
7. [Nhiệm vụ 5: Phần cuối mặc định](#task-5-default-backend)
8. [Nhiệm vụ 6: IngressClass — Mặc định và không mặc định](#task-6-ingressclass--default-and-non-default)
9. [Nhiệm vụ 7: Gỡ lỗi Ingress](#task-7-debug-a-broken-ingress) bị hỏng
10. [Nhiệm vụ 8: Ingress với chú thích viết lại](#task-8-ingress-with-rewrite-annotation)
11. [Mẹo và bẫy thi ](#exam-tips-and-traps)
12. [Tài liệu tham khảo](#references)

---

<a id="1-cka-exam-coverage"></a>
<a id="heading-2-1-cka-exam-coverage"></a>

## 1. Bảo hiểm kỳ thi CKA

Bài kiểm tra CKA (đề cương hiện hành) bao gồm Ingress trong miền **Services & Mạng** (~20% bài kiểm tra). Bạn được mong đợi có thể:[^cka-curriculum]

- Thể hiện kiến thức về chính sách mạng
- Sử dụng bộ điều khiển `Ingress` và tài nguyên `Ingress`
- Biết cách cấu hình `IngressClass`
- Sử dụng `kubectl` để tạo, mô tả và khắc phục sự cố các đối tượng Ingress

Bạn sẽ có quyền truy cập vào tài liệu Kubernetes tại https://kubernetes.io/docs trong kỳ thi. Đường dẫn nhanh nhất là `docs → search "ingress"` → sao chép YAML và chỉnh sửa.

<a id="exam-environment-notes"></a>
<a id="heading-3-exam-environment-notes"></a>

### Ghi chú về môi trường thi

- Bài kiểm tra sử dụng cụm Kubernetes trực tiếp (không phải kind/minikube mà dựa trên kubeadm).
- Bộ điều khiển Ingress đã được cài đặt trong hầu hết các tác vụ; bạn chỉ cần tạo tài nguyên Ingress.
- Tự động hoàn thành `kubectl` được bật. Sử dụng nó.
- `kubectl create ingress --help` tạo các lệnh mệnh lệnh giàn giáo.

---

<a id="2-quick-reference-card"></a>
<a id="heading-4-2-quick-reference-card"></a>

## 2. Thẻ tham khảo nhanh

```
╔══════════════════════════════════════════════════════════════════════╗
║                  INGRESS QUICK REFERENCE                             ║
╠══════════════════════════════════════════════════════════════════════╣
║  Phiên bản API: networking.k8s.io/v1                                  ║
║  Loại: Ingress (được đặt tên cách nhau)                                ║
║  Ngoài ra: IngressClass (phạm vi cụm)                        ║
╠══════════════════════════════════════════════════════════════════════╣
║  IMPERATIVE CREATION                                                 ║
║  kubectl create ingress <name>                                       ║
║    --class=<classname>                                               ║
║    --rule="host/path=svc:port"                                       ║
║    --rule="host/path=svc:port,tls=secretname"                        ║
╠══════════════════════════════════════════════════════════════════════╣
║  PATH TYPES                                                          ║
║  Tiền tố /foo khớp với /foo và /foo/bar                      ║
║  CHỈ khớp chính xác/foo//foo                              ║
║  Triển khai cụ thể (do bộ điều khiển xác định; tránh nếu di động)     ║
╠══════════════════════════════════════════════════════════════════════╣
║  TLS                                                                 ║
║  Secret loại: kubernetes.io/tls                                     ║
║  Các trường: tls.crt tls.key                                      ║
║  Secret phải CÙNG namespace với Ingress                         ║
╠══════════════════════════════════════════════════════════════════════╣
║  INGRESSCLASS DEFAULT ANNOTATION                                     ║
║  ingressclass.kubernetes.io/is-default-class: "đúng"                 ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

<a id="task-1-create-a-basic-ingress"></a>
<a id="heading-5-task-1-create-a-basic-ingress"></a>

## Nhiệm vụ 1: Tạo Ingress cơ bản

**Kịch bản:** Một ứng dụng `web-app` đang chạy dưới dạng Deployment với Service `web-svc` trên cổng 80 trong namespace `default`. Tạo Ingress có tên `web-ingress` định tuyến `GET myapp.example.com/` đến dịch vụ. Cụm có bộ điều khiển Ingress với IngressClass `nginx`.

<a id="step-1--verify-prerequisites"></a>
<a id="heading-6-step-1-verify-prerequisites"></a>

### Bước 1 - Xác minh điều kiện tiên quyết

```bash
# Xác nhận Service tồn tại
kubectl get svc web-svc
# NAME      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
# web-svc   ClusterIP   10.96.150.200   <none>        80/TCP    3m

# Xác nhận IngressClass tồn tại
kubectl get ingressclass
# NAME    CONTROLLER             PARAMETERS   AGE
# nginx k8s.io/ingress-nginx <none> 20m
```

<a id="step-2--create-ingress-imperatively"></a>
<a id="heading-7-step-2-create-ingress-imperatively"></a>

### Bước 2 - Tạo Ingress một cách bắt buộc

```bash
kubectl create ingress web-ingress \
  --class=nginx \
  --rule="myapp.example.com/=web-svc:80"
```

Điều này tạo ra YAML và áp dụng nó. Định dạng `--rule` là `host/path=service:port`.

<a id="step-3--verify"></a>
<a id="heading-8-step-3-verify"></a>

### Bước 3 - Xác minh

```bash
kubectl get ingress web-ingress
# NAME          CLASS   HOSTS               ADDRESS         PORTS   AGE
# xâm nhập web nginx myapp.example.com 203.0.113.10 80 30s

kubectl describe ingress web-ingress
# Quy tắc:
#   Phần cuối của đường dẫn máy chủ
#   ----               ----  --------
#   myapp.example.com
#                      / web-svc:80 (10.244.1.5:80)
```

<a id="step-4--declarative-version-equivalent"></a>
<a id="heading-9-step-4-declarative-version-equivalent"></a>

### Bước 4 - Phiên bản khai báo (tương đương)

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
        pathType: Prefix             # luôn chỉ định rõ ràng pathType
        backend:
          service:
            name: web-svc
            port:
              number: 80
```

> **Bẫy kiểm tra:** Việc bỏ qua `pathType` sẽ gây ra lỗi xác thực. Đây là trường bắt buộc trong
> `networking.k8s.io/v1`. Lệnh bắt buộc tự động thêm nó; YAML khai báo phải
> bao gồm nó một cách rõ ràng.[^k8s-ingress-pathtypes]

---

<a id="task-2-multi-path-fan-out-ingress"></a>
<a id="heading-10-task-2-multi-path-fan-out-ingress"></a>

## Nhiệm vụ 2: Đầu ra đa đường dẫn Ingress

**Kịch bản:** Tạo Ingress có tên `fanout-ingress` trong namespace `apps` định tuyến tất cả lưu lượng truy cập từ `store.example.com` đến các chương trình phụ trợ khác nhau dựa trên đường dẫn:
- `/frontend` → `frontend-svc:80`
- `/api` → `api-svc:8080`
- `/admin` → `admin-svc:9000`

<a id="step-1--create-declaratively"></a>
<a id="heading-11-step-1-create-declaratively"></a>

### Bước 1 - Tạo khai báo

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

<a id="step-2--verify-routing-rules"></a>
<a id="heading-12-step-2-verify-routing-rules"></a>

### Bước 2 - Xác minh quy tắc định tuyến

```bash
kubectl describe ingress fanout-ingress -n apps
# Quy tắc:
#   Phần cuối của đường dẫn máy chủ
#   ----                ----       --------
#   store.example.com
#                       /frontend frontend-svc:80 (...)
#                       /api api-svc:8080 (...)
#                       /quản trị viên-svc:9000 (...)
```

<a id="step-3--test-from-inside-the-cluster"></a>
<a id="heading-13-step-3-test-from-inside-the-cluster"></a>

### Bước 3 - Kiểm tra từ bên trong cụm

```bash
# Lấy IP cụm của bộ điều khiển
kubectl get svc -n ingress-nginx ingress-nginx-controller
# NAME                       TYPE       CLUSTER-IP     PORT(S)
# ingress-nginx-controller   NodePort   10.96.55.123   80:31080/TCP,443:31443/TCP

# Kiểm tra từng đường dẫn
kubectl run test --rm -it --image=nicolaka/netshoot -- bash
# Bên trong:
curl -H "Host: store.example.com" http://10.96.55.123/frontend
curl -H "Host: store.example.com" http://10.96.55.123/api/users
curl -H "Host: store.example.com" http://10.96.55.123/admin
```

> **Mẹo thi:** Trong kỳ thi CKA, bạn có thể thường xuyên kiểm tra bằng `curl -H "Host: <hostname>"` với
> IP của bộ điều khiển thay vì cần DNS thực.

---

<a id="task-3-name-based-virtual-hosting"></a>
<a id="heading-14-task-3-name-based-virtual-hosting"></a>

## Nhiệm vụ 3: Lưu trữ ảo dựa trên tên

**Kịch bản:** Tạo Ingress `vhost-ingress` trong namespace `web` định tuyến lưu lượng truy cập đến hai chương trình phụ trợ khác nhau dựa trên tên máy chủ:
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
# vhost-ingress nginx blog.example.com,shop.example.com 203.0.113.10 80
```

> **Mẹo thi:** Một đối tượng Ingress có thể có nhiều quy tắc với các tên máy chủ khác nhau. Tất cả các quy tắc
> chia sẻ cùng một IP/hostname bên ngoài (hiển thị trong trường ĐỊA CHỈ). Việc định tuyến được thực hiện bởi HTTP
> So khớp tiêu đề máy chủ, không phải theo các IP khác nhau.

---

<a id="task-4-tlshttps-ingress"></a>
<a id="heading-15-task-4-tlshttps-ingress"></a>

## Nhiệm vụ 4: TLS/HTTPS Ingress

**Kịch bản:** Tạo TLS hỗ trợ Ingress có tên `secure-ingress` trong namespace `production`. Chứng chỉ và khóa TLS đã có sẵn. Định tuyến `secure.example.com` tới `secure-svc:443`.

<a id="step-1--create-the-tls-secret"></a>
<a id="heading-16-step-1-create-the-tls-secret"></a>

### Bước 1 - Tạo TLS Secret

```bash
# Trong bài kiểm tra, bạn có thể được cấp các tệp chứng chỉ hoặc bạn có thể tạo tệp tự ký:
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key \
  -out tls.crt \
  -subj "/CN=secure.example.com/O=example"

kubectl create secret tls secure-tls \
  --cert=tls.crt \
  --key=tls.key \
  --namespace=production
```

Xác minh Secret đã được tạo đúng loại:

```bash
kubectl get secret secure-tls -n production
# NAME          TYPE                DATA   AGE
# bảo mật-tls kubernetes.io/tls 2 10s

kubectl describe secret secure-tls -n production
# dữ liệu
# ====
# tls.crt: 1090 byte
# tls.key: 1704 byte
```

<a id="step-2--create-the-ingress-with-tls"></a>
<a id="heading-17-step-2-create-the-ingress-with-tls"></a>

### Bước 2 - Tạo Ingress với TLS

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
    - secure.example.com           # phải phù hợp với máy chủ theo các quy tắc bên dưới
    secretName: secure-tls         # phải ở namespace: sản xuất
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

<a id="step-3--verify-1"></a>
<a id="heading-18-step-3-verify"></a>

### Bước 3 - Xác minh

```bash
kubectl get ingress secure-ingress -n production
# NAME             CLASS   HOSTS                 ADDRESS         PORTS     AGE
# xâm nhập an toàn nginx secure.example.com 203.0.113.10 80, 443 30s
# Lưu ý: PORTS hiển thị 443 vì TLS được định cấu hình

kubectl describe ingress secure-ingress -n production
# TLS:
#   tls an toàn chấm dứt secure.example.com
```

<a id="step-4--test-https"></a>
<a id="heading-19-step-4-test-https"></a>

### Bước 4 - Kiểm tra HTTPS

```bash
kubectl run test --rm -it --image=nicolaka/netshoot -- bash
# Bên trong:
curl -k -H "Host: secure.example.com" https://203.0.113.10/
# -k bỏ qua xác minh chứng chỉ (cần thiết với chứng chỉ tự ký)
```

> **Bẫy thi cử:**
> 1. TLS Secret phải ở **cùng namespace** với đối tượng Ingress.[^k8s-ingress-tls]
> 2. Tên máy chủ trong `tls[].hosts` phải **khớp chính xác** với tên máy chủ trong `rules[].host`.
>    Thay vào đó, sự không khớp khiến bộ điều khiển sử dụng chứng chỉ mặc định của nó.
> 3. Loại Secret phải là `kubernetes.io/tls`. Các loại sai bị một số người âm thầm bỏ qua
>    bộ điều khiển và gây ra lỗi chứng chỉ.

---

<a id="task-5-default-backend"></a>
<a id="heading-20-task-5-default-backend"></a>

## Nhiệm vụ 5: Phần cuối mặc định

**Kịch bản:** Tạo Ingress `catch-all` trong namespace `default` định tuyến `app.example.com/` đến `main-svc:80` và quay trở lại `error-page-svc:8080` đối với bất kỳ nội dung nào không khớp.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: catch-all
  namespace: default
spec:
  ingressClassName: nginx
  defaultBackend:                     # xử lý tất cả requests chưa từng có
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

> **Mẹo thi:** `defaultBackend` ở cấp độ Ingress xử lý requests:
> - Không trùng khớp với máy chủ nào trong bất kỳ quy tắc nào, **hoặc**
> - Phù hợp với một máy chủ nhưng không có đường dẫn trong quy tắc của máy chủ đó.
>
> Nó KHÔNG yêu cầu máy chủ hoặc đường dẫn. Nó là một tài liệu tham khảo dịch vụ trần.

---

<a id="task-6-ingressclass--default-and-non-default"></a>
<a id="heading-21-task-6-ingressclass-default-and-non-default"></a>

## Nhiệm vụ 6: IngressClass - Mặc định và Không mặc định

**Kịch bản A:** Đặt IngressClass hiện có có tên `nginx` làm lớp mặc định.

```bash
# Dán chú thích lên IngressClass
kubectl annotate ingressclass nginx \
  "ingressclass.kubernetes.io/is-default-class=true"

# Xác minh
kubectl get ingressclass nginx -o yaml | grep -A2 annotations
# chú thích:
#   ingressclass.kubernetes.io/is-default-class: "đúng"
```

**Kịch bản B:** Tạo IngressClass `internal-nginx` mới trỏ đến cùng một bộ điều khiển nhưng không đặt nó làm mặc định.

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

**Kịch bản C:** Ingress không có bộ `ingressClassName`. Làm thế nào để nó được xử lý?

```bash
# Kiểm tra: có IngressClass mặc định không?
kubectl get ingressclass
# Nếu chính xác một người có is-default-class=true → lớp đó yêu cầu Ingress
# Nếu không có hoặc nhiều → Ingress không được xử lý (không có bộ điều khiển nào xử lý được)

# Chỉ định một lớp một cách rõ ràng mà không cần chỉnh sửa manifest đầy đủ:
kubectl patch ingress my-ingress \
  -p '{"spec":{"ingressClassName":"nginx"}}'
```

> **Bẫy bài kiểm tra:** Chú thích `ingressclass.kubernetes.io/is-default-class` nằm trên
> **Đối tượng IngressClass**, không phải trên chính tài nguyên Ingress. Một sai lầm phổ biến là đặt
> nó trên Ingress.

---

<a id="task-7-debug-a-broken-ingress"></a>
<a id="heading-22-task-7-debug-a-broken-ingress"></a>

## Nhiệm vụ 7: Gỡ lỗi Ingress bị hỏng

**Kịch bản:** Ingress `broken-ingress` đã được tạo nhưng trả về `404` cho tất cả requests. Tìm và khắc phục sự cố.

<a id="systematic-debugging-steps"></a>
<a id="heading-23-systematic-debugging-steps"></a>

### Các bước gỡ lỗi có hệ thống

```bash
# Bước 1: Kiểm tra chính đối tượng Ingress
kubectl describe ingress broken-ingress
# Hãy tìm:
# - "Không có cổng nào được xác định cho dịch vụ": cổng name/number không khớp
# - "Service không tồn tại": sai tên dịch vụ hoặc sai namespace
# - Phần sự kiện cho lỗi điều khiển

# Bước 2: Kiểm tra xem Ingress có IP không
kubectl get ingress broken-ingress
# Nếu ĐỊA CHỈ trống → IngressClass không khớp hoặc bộ điều khiển không hoạt động

# Bước 3: Xác minh IngressClass
kubectl get ingress broken-ingress -o jsonpath='{.spec.ingressClassName}'
kubectl get ingressclass
# Tên lớp trong Ingress phải khớp với IngressClass hiện có

# Bước 4: Kiểm tra backend Service
kubectl get svc <backend-service> -n <namespace>
kubectl get endpoints <backend-service> -n <namespace>
# Endpoints KHÔNG được để trống. Nếu trống, hãy kiểm tra nhãn pod và bộ chọn dịch vụ.

# Bước 5: Kiểm tra xem cổng Service có khớp không
kubectl get svc <backend-service> -o yaml | grep -A5 "ports:"
# Số cổng trong phần phụ trợ Ingress phải khớp với cổng được hiển thị bởi Service

# Bước 6: Kiểm tra nhật ký bộ điều khiển
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller | grep "broken-ingress"

# Bước 7: Kiểm tra định tuyến trực tiếp với bộ điều khiển
kubectl get svc -n ingress-nginx
INGRESS_IP=$(kubectl get ingress broken-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl -H "Host: broken.example.com" http://$INGRESS_IP/

# Bước 8: Kiểm tra xem máy chủ trong yêu cầu cuộn có khớp CHÍNH XÁC với quy tắc máy chủ không
kubectl get ingress broken-ingress -o jsonpath='{.spec.rules[*].host}'
```

<a id="common-fixes"></a>
<a id="heading-24-common-fixes"></a>

### Các bản sửa lỗi phổ biến

```bash
# Cách khắc phục 1: Số cổng dịch vụ sai
kubectl edit ingress broken-ingress
# Thay đổi: port.number: 8000 → port.number: 8080

# Cách 2: Service sai namespace (Ingress và Service PHẢI ở cùng một namespace)
kubectl get svc --all-namespaces | grep my-svc
# Di chuyển Ingress để sửa namespace hoặc tạo lại Service đúng namespace

# Cách khắc phục 3: Thiếu IngressClass
kubectl patch ingress broken-ingress \
  -p '{"spec":{"ingressClassName":"nginx"}}'

# Khắc phục 4: Điểm cuối trống (pod không chạy)
kubectl get pods -l app=my-app
kubectl describe pod <pod> | tail -20
```

---

<a id="task-8-ingress-with-rewrite-annotation"></a>
<a id="heading-25-task-8-ingress-with-rewrite-annotation"></a>

## Nhiệm vụ 8: Ingress với chú thích viết lại

**Kịch bản:** Tạo một Ingress phục vụ requests tại `/old-path` và ghi lại chúng thành `/new-path` trước khi chuyển tiếp tới `app-svc:80`. Sử dụng Bộ điều khiển NGINX Ingress.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rewrite-ingress
  namespace: default
  annotations:
    # Viết lại đường dẫn đã chụp vào phần phụ trợ
    nginx.ingress.kubernetes.io/rewrite-target: /new-path$2
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /old-path(/|$)(.*)        # nắm bắt phần còn lại bằng $2
        pathType: ImplementationSpecific
        backend:
          service:
            name: app-svc
            port:
              number: 80
EOF
```

```bash
# Kiểm tra: yêu cầu tới /old-path/foo sẽ đạt đến phần phụ trợ dưới dạng /new-path/foo
curl -H "Host: myapp.example.com" http://<ingress-ip>/old-path/foo
```

> **Mẹo kiểm tra:** Chú thích `rewrite-target` dành riêng cho NGINX. Nó sẽ không hoạt động trên các thiết bị khác
> bộ điều khiển. Trong kỳ thi, nếu nhiệm vụ yêu cầu sử dụng chú thích thì sẽ có bộ điều khiển NGINX.
> Nếu được yêu cầu "viết lại" mà không chỉ định cơ chế, chú thích này là câu trả lời được mong đợi.

---

<a id="exam-tips-and-traps"></a>
<a id="heading-26-exam-tips-and-traps"></a>

## Mẹo và bẫy thi

<a id="-do-these"></a>
<a id="heading-27--do-these"></a>

### ✅ Hãy làm những điều này

**Sử dụng các lệnh bắt buộc để tăng tốc:**
```bash
# Tạo Ingress cơ bản nhanh chóng
kubectl create ingress my-ingress \
  --class=nginx \
  --rule="example.com/=svc:80"

# Thêm TLS vào lệnh mệnh lệnh
kubectl create ingress my-ingress \
  --class=nginx \
  --rule="example.com/*=svc:80,tls=my-tls-secret"
```

**Sử dụng `kubectl explain` để tham khảo trường:**
```bash
kubectl explain ingress.spec.rules.http.paths.pathType
kubectl explain ingress.spec.tls
```

**Sao chép từ tài liệu:** Trong bài kiểm tra, hãy truy cập https://kubernetes.io/docs/concepts/services-networking/ingress/ và sao chép ví dụ YAML — chỉnh sửa tên máy chủ, tên dịch vụ và cổng.

<a id="-avoid-these-traps"></a>
<a id="heading-28--avoid-these-traps"></a>

### ❌ Tránh những cái bẫy này

1. **`pathType` sai:** Luôn bao gồm nó. `Prefix` là phổ biến nhất trong kỳ thi.

2. **Phiên bản API sai trong YAML:** Luôn sử dụng `apiVersion: networking.k8s.io/v1`. cái cũ
`extensions/v1beta1` sẽ gây ra lỗi.[^k8s-deprecated-apis]

3. **TLS Secret sai namespace:** Secret phải ở **giống namespace** như
Ingress, không có trong `default` hoặc `kube-system`.

4. **Cổng không khớp:** `port.number` trong phần phụ trợ Ingress phải khớp với cổng được hiển thị bởi
Service (cổng Service, không phải cổng đích).

5. **`ingressClassName` so với chú thích:** Sử dụng trường `spec.ingressClassName`, không phải trường không được dùng nữa
Chú thích `kubernetes.io/ingress.class`. Trường này được ưu tiên hơn chú thích.

6. **Quên `ingressClassName`:** Nếu Ingress không có lớp và không có IngressClass mặc định
tồn tại, không có bộ điều khiển nào sẽ xử lý nó. Luôn đặt `ingressClassName`.

7. **Kiểm tra tiêu đề máy chủ:** Khi kiểm tra với `curl`, bạn phải đặt tiêu đề Máy chủ theo cách thủ công
trừ khi DNS được định cấu hình:
   ```bash
   curl -H "Host: myapp.example.com" http://<ingress-ip>/
   # KHÔNG: curl http://myapp.example.com/ (trừ khi DNS được thiết lập)
   ```

8. **Chính xác so với Tiền tố cho đường dẫn `/`:** `pathType: Exact` với `path: /` CHỈ khớp với gốc.
`pathType: Prefix` với `path: /` phù hợp với mọi thứ — thường là những gì bạn muốn cho tuyến đường mặc định.

<a id="time-saving-patterns"></a>
<a id="heading-29-time-saving-patterns"></a>

### Mô hình tiết kiệm thời gian

```bash
# Giàn giáo YAML nhanh - sau đó chỉnh sửa
kubectl create ingress test \
  --class=nginx \
  --rule="host.com/=svc:80" \
  --dry-run=client -o yaml > ingress.yaml
# Chỉnh sửa ingress.yaml, sau đó:
kubectl apply -f ingress.yaml

# Xác nhận Ingress đã được chọn (xem ĐỊA CHỈ xuất hiện)
kubectl get ingress -w

# Một lớp lót để lấy IP
kubectl get ingress my-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

---

<a id="references"></a>
<a id="heading-30-references"></a>

## Tài liệu tham khảo







---

*Hướng dẫn thực hành CKA Ingress — v1.0 — Tháng 2 năm 2026 — Dựa trên Chương trình giảng dạy Kubernetes 1.35 / đề cương CKA*

[^k8s-ingress-pathtypes]: Kubernetes - Các loại đường dẫn Ingress.
[^k8s-ingress-tls]: Kubernetes — Ingress TLS.
[^k8s-deprecated-apis]: Kubernetes — Hướng dẫn di chuyển API không được dùng nữa.
[^k8s-ingressclass]: Kubernetes — IngressClass.
[^cka-curriculum]: CNCF - Chương trình giảng dạy CKA.
[^nginx-ingress-annotations]: Bộ điều khiển NGINX Ingress - Tham chiếu chú thích.
