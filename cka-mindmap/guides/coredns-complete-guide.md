<a id="coredns-for-kubernetes--complete-expert-reference-guide"></a>
<a id="heading-0-coredns-for-kubernetes-complete-expert-reference"></a>

# CoreDNS dành cho Kubernetes — Hướng dẫn tham khảo đầy đủ của chuyên gia

> **Bản tiếng Việt · CKA Kubernetes 1.35 · cập nhật 17/09/2026.** Đọc [các thay đổi cho phiên bản thi](kubernetes-1.35-update.md).

> **Mục tiêu:** Kubernetes 1.35; kiểm tra image CoreDNS thực tế của cụm trước khi sửa hoặc nâng cấp. Plugin có thể yêu cầu phiên bản CoreDNS riêng.
> **Cập nhật lần cuối:** Tháng 2 năm 2026
> **CKA 2026 được căn chỉnh**

---

<a id="table-of-contents"></a>
<a id="heading-1-table-of-contents"></a>

## Mục lục

1. [Tổng quan & Lịch sử](#1-overview--history)
2. [Kiến trúc & Linh kiện bên trong](#2-architecture--internal-components)
3. [Corefile — Tham khảo cấu hình](#3-corefile--configuration-reference)
4. [Plugin — Tham khảo đầy đủ](#4-plugins--complete-reference)
5. [Đối tượng Deployment & Kubernetes](#5-deployment--kubernetes-objects)
6. [Cấu hình nâng cao và trường hợp sử dụng](#6-advanced-configurations--use-cases)
7. [Khắc phục sự cố — Chẩn đoán hệ thống](#7-troubleshooting--systematic-diagnosis)
8. [Điều chỉnh & Giám sát Hiệu suất](#8-performance-tuning--monitoring)
9. [Tham khảo nhanh CKA 2026](#9-cka-2026-quick-reference)
10. [Tăng cường bảo mật](#10-security-hardening)
11. [Bảng tham khảo đầy đủ](#11-complete-reference-tables)
12. [Đa cụm DNS & Chủ đề nâng cao](#12-multi-cluster-dns--advanced-topics)

---

<a id="1-overview--history"></a>
<a id="heading-2-1-overview-history"></a>

## 1. Tổng quan & Lịch sử

<a id="11-what-is-coredns"></a>
<a id="heading-3-11-what-is-coredns"></a>

### 1.1 CoreDNS là gì?

CoreDNS là **máy chủ DNS mặc định cho cụm Kubernetes** (GA kể từ Kubernetes 1.13, tháng 12 năm 2018).[^k8s-dns-concepts] Đây là một máy chủ DNS linh hoạt, có thể mở rộng được viết bằng Go, một **dự án đã tốt nghiệp CNCF**,[^cncf-coredns] được cấp phép theo Apache 2.0.

CoreDNS đã thay thế `kube-dns` và khác biệt về mặt kiến trúc: **mọi tính năng đều là một plugin**.[^coredns-manual] Corefile khai báo những plugin nào đang hoạt động và chúng xử lý từng truy vấn DNS theo thứ tự nào.

| Tài sản | Giá trị |
|---|---|
| Viết bằng | Đi (golang) |
| Giấy phép | Apache 2.0 |
| Quản trị | Đồ án tốt nghiệp CNCF |
| Mặc định trong Kubernetes | Kể từ v1.13 (GA, tháng 12 năm 2018) |
| Ổn định mới nhất (tháng 2 năm 2026) | **1.13.2** (Tháng 12 năm 2025) |
| Hỗ trợ giao thức | UDP/TCP, DoT (RFC 7858),[^rfc7858] DoH (RFC 8484),[^rfc8484] DoQ (RFC 9250)[^rfc9250] |
| Thay thế | kube-dns (không dùng nữa) |
| Nguồn | https://github.com/coredns/coredns |

<a id="12-coredns-vs-kube-dns"></a>
<a id="heading-4-12-coredns-vs-kube-dns"></a>

### 1.2 CoreDNS so với kube-dns

| tính năng | CoreDNS | kube-dns |
|---|---|---|
| Kiến trúc | Chuỗi nhị phân đơn, plugin | 3 containers: dnsmasq + kubedns + sidecar |
| Cấu hình | Corefile (khai báo) | Cờ dòng lệnh trên container |
| Khả năng mở rộng | Plugin API - không cần fork | Cần có nĩa |
| Dấu chân bộ nhớ | ~70–170 Mi (có thể định cấu hình) | Đường cơ sở cao hơn |
| Số liệu | Prometheus bản địa (plugin prometheus) | Thông qua nhà xuất khẩu sidecar |
| Giao thức DNS | UDP, TCP, DoT, DoH, DoQ | Chỉ UDP, TCP |
| Duy trì | Có — dự án CNCF đang hoạt động | Không được dùng nữa |

<a id="13-release-history-recent--2025-coredns-releases"></a>
<a id="heading-5-13-release-history-recent-2025-coredns-rele"></a>

### Lịch sử phát hành 1.3 (Gần đây - 2025) [^coredns-releases]

| Phiên bản | Ngày | Những thay đổi chính |
|---|---|---|
| **1.13.2** | Tháng 12 năm 2025 | Giới hạn tốc độ Kubernetes API, giới hạn độ dài biểu thức chính quy (bảo vệ ReDoS), hỗ trợ ban đầu DoH3, biên dịch trước CNAME viết lại biểu thức chính quy, nắp OOM nhiều ổ cắm |
| 1.13.1 | Tháng 10 năm 2025 | Sửa lỗi, cải tiến hiệu suất |
| **1.13.0** | Tháng 10 năm 2025 | Nomad plugin GA, xử lý tắt máy được cải thiện, các tùy chọn `show_first`/`consolidate` mới trong plugin lỗi, cải tiến xử lý SIGTERM duyên dáng |
| 1.12.4 | Tháng 9 năm 2025 | Sửa lỗi lan truyền ngữ cảnh DoH, xử lý bù nhãn trong plugin tệp, sửa lỗi rò rỉ kết nối trong gRPC/transfer, hỗ trợ tùy chọn `prefer` |
| **1.12.3** | tháng 8 năm 2025 | `startup_timeout` cho plugin kubernetes, `fallthrough` trong gRPC, EDNS0 Hành động `unset` khi viết lại, bảo quản trường hợp SRV trên mỗi RFC 6763 |
| **1.12.2** | Tháng 6 năm 2025 | Plugin `multicluster` cho cụm chéo DNS thông qua ServiceImport CRDs, giới hạn luồng đồng thời QUIC, plugin `fallthrough` trong tệp |
| **1.12.1** | tháng 3 năm 2025 | Giới hạn tra cứu CNAME tăng 7→10, chuyển tiếp `failfast_all_unhealthy_upstreams`, sửa lỗi kubernetes pod DeletionTimestamp |
| 1.12.0 | tháng 1 năm 2025 | Cải tiến DoQ, tối ưu hóa EndpointSlice, tối ưu hóa phân bổ AutoPath |

> **Mẹo thi CKA:** Bài kiểm tra sẽ kiểm tra bạn về CoreDNS trong `kube-system`. Biết cách kiểm tra, chỉnh sửa và khởi động lại CoreDNS. Các tác vụ phổ biến nhất: chỉnh sửa ConfigMap (Corefile), gỡ lỗi phân giải DNS từ bên trong pods và hiểu các quy ước đặt tên DNS.

---

<a id="2-architecture--internal-components"></a>
<a id="heading-6-2-architecture-internal-components"></a>

## 2. Kiến trúc & Thành phần bên trong

<a id="21-high-level-architecture"></a>
<a id="heading-7-21-high-level-architecture"></a>

### Kiến trúc cấp cao 2.1

```
┌──────────────────── Kubernetes Cluster ──────────────────────────┐
│                                                                  │
│   [Ứng dụng Pod] ── Truy vấn DNS ──> [kube-dns Service :53]            │
│      ↑                                │                          │
│   Cân tải /etc/resolv.conf                     │
│   nameserver 10.96.0.10        ┌──────┴──────┐                   │
│   ndots:5 [CoreDNS Pod-1] [CoreDNS Pod-2]       │
│                                    │                             │
│                           Chuỗi plugin:                          │
│                      lỗi → sức khỏe → sẵn sàng → kubernetes        │
│                      → prometheus → chuyển tiếp → bộ đệm → tải lại     │
│                                    │                             │
│              ┌─────────────────────┼──────────────────┐          │
│        [k8s API] [Ngược dòng DNS] [Bộ nhớ đệm]       │
│    (cluster.local) (/etc/resolv.conf) (trong bộ nhớ)      │
│                                                                  │
│   [ConfigMap: coredns / Corefile] ──mount──> CoreDNS Pods      │
└──────────────────────────────────────────────────────────────────┘
```

<a id="22-kubernetes-objects-deployed-by-coredns"></a>
<a id="heading-8-22-kubernetes-objects-deployed-by-coredns"></a>

### Các đối tượng 2.2 Kubernetes được CoreDNS triển khai

| loại | Tên | Namespace | Mục đích |
|---|---|---|---|
| Deployment | lõi | kube-system | Chạy CoreDNS pods (mặc định: 2 bản sao) |
| Service | kube-dns | kube-system | ClusterIP (e.g., 10.96.0.10), cổng 53 UDP+TCP, cổng 9153 số liệu |
| ConfigMap | lõi | kube-system | Chứa cấu hình Corefile |
| ServiceAccount | lõi | kube-system | Nhận dạng cho các cuộc gọi API |
| ClusterRole | hệ thống:coredns | — | list/watch: Endpoints, EndpointSlices, Services, Pods, Namespace |
| ClusterRoleBinding | hệ thống:coredns | — | Liên kết ClusterRole với coredns ServiceAccount |
| PodDisruptionBudget | lõi | kube-system | Đảm bảo ít nhất 1 pod luôn hoạt động trong thời gian gián đoạn |

> **EndpointSlices vs Endpoints:** Vì Kubernetes 1.21, CoreDNS mặc định xem **EndpointSlices** (`discovery.k8s.io/v1`) thay vì Endpoints API cũ. EndpointSlices có khả năng mở rộng cao hơn (chúng phân chia các tập hợp điểm cuối lớn). ClusterRole cấp quyền truy cập vào cả hai để có khả năng tương thích ngược. Trên Kubernetes 1.32, chỉ EndpointSlices được sử dụng nội bộ.

<a id="23-plugin-chain--the-core-concept"></a>
<a id="heading-9-23-plugin-chain-the-core-concept"></a>

### Chuỗi plugin 2.3 - Khái niệm cốt lõi

Mọi truy vấn DNS đều đi qua **mỗi plugin trong Corefile theo thứ tự khai báo**. Một plugin có thể:

- **Xử lý yêu cầu** và trả lời phản hồi (plugin đầu cuối)
- **Sửa đổi** yêu cầu hoặc phản hồi (plugin phần mềm trung gian)
- **Chuyển qua** tới plugin tiếp theo trong chuỗi
- **Tạo ra tác dụng phụ** (ghi nhật ký, số liệu, điểm cuối sức khỏe)

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

<a id="24-dns-resolution-paths"></a>
<a id="heading-10-24-dns-resolution-paths"></a>

### Đường dẫn độ phân giải 2.4 DNS

<a id="internal-service-clusterlocal"></a>

#### Service nội bộ (cluster.local)

```bash
# /etc/resolv.conf của Pod (được đưa vào bởi kubelet):
nameserver 10.96.0.10        # kube-dns Service ClusterIP
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5

# Truy vấn: curl http://my-service
# Với ndots:5, 'my-service' có 0 dấu chấm < 5 → kích hoạt mở rộng tìm kiếm:
# 1. my-service.default.svc.cluster.local ← Câu trả lời CoreDNS (TÌM THẤY)
# 2. my-service.svc.cluster.local ← chỉ đạt được nếu số 1 thất bại
# 3. my-service.cluster.local ← chỉ đạt nếu #2 thất bại
# 4. dịch vụ của tôi.                            ← truy vấn tuyệt đối

# Cross-namespace: curl http://my-service.other-ns
# 'my-service.other-ns' có 1 dấu chấm < 5 → mở rộng tìm kiếm:
# 1. my-service.other-ns.default.svc.cluster.local ← NXDOMAIN
# 2. my-service.other-ns.svc.cluster.local ← NXDOMAIN
# 3. my-service.other-ns.cluster.local ← NXDOMAIN
# 4. my-service.other-ns.                            ← nếu vẫn không tìm thấy
# Sử dụng FQDN: my-service.other-ns.svc.cluster.local để tránh điều này!
```

<a id="external-dns-resolution"></a>

#### Phân giải DNS bên ngoài

```bash
# Truy vấn: curl https://api.github.com
# Plugin kubernetes CoreDNS: "không phải khu vực của tôi (cluster.local), vượt qua"
# Plugin chuyển tiếp CoreDNS: chuyển tiếp tới /etc/resolv.conf trên node
#   (thường là nhà cung cấp đám mây DNS, e.g., 169.254.169.253 trên AWS)
# Phản hồi được lưu vào bộ nhớ đệm bằng plugin bộ nhớ đệm trong TTL giây
```

<a id="25-dns-record-types-in-kubernetes-k8s-dns-concepts"></a>
<a id="heading-11-25-dns-record-types-in-kubernetes-k8s-dns-conce"></a>

### Các loại bản ghi 2.5 DNS trong Kubernetes [^k8s-dns-concepts]

| Loại bản ghi | mẫu | Ví dụ |
|---|---|---|
| A/AAA | `<service>.<ns>.svc.cluster.local` | `my-svc.default.svc.cluster.local → 10.96.5.10` |
| A/ AAAA (không đầu) | `<service>.<ns>.svc.cluster.local` | Trả về tất cả IP pod |
| A/AAA (pod) | `<ip-dashes>.<ns>.pod.cluster.local` | `10-0-0-5.default.pod.cluster.local → 10.0.0.5` |
| CHXHCNVN | `_<port>._<proto>.<svc>.<ns>.svc.cluster.local` | `_http._tcp.web.default.svc.cluster.local` [^rfc6763] |
| PTR | `<reversed-ip>.in-addr.arpa` | `10.5.96.10.in-addr.arpa → svc.ns.svc.cluster.local` |
| CNAME | Dịch vụ ExternalName | `ext.default.svc.cluster.local → CNAME → external.example.com` |
| A (StatefulSet pod) | `<pod>.<svc>.<ns>.svc.cluster.local` | `cassandra-0.cassandra.default.svc.cluster.local` |

> **Lưu ý về độ chính xác:** Bản ghi IP Pod (`<ip-dashes>.<ns>.pod.cluster.local`) chỉ được cung cấp khi `pods` được đặt thành `insecure` hoặc `verified` trong plugin kubernetes. Với `pods disabled` mặc định, các bản ghi này trả về NXDOMAIN.

---

<a id="3-corefile--configuration-reference"></a>
<a id="heading-12-3-corefile-configuration-reference"></a>

## 3. Corefile — Tham khảo cấu hình

<a id="31-corefile-syntax--structure"></a>
<a id="heading-13-31-corefile-syntax-structure"></a>

### 3.1 Corefile Cú pháp và cấu trúc

```corefile
# Cú pháp:
<zones> [<port>] {
    <plugin> [options]
    ...
}

# Nhiều vùng có thể chia sẻ một khối máy chủ (được phân tách bằng dấu cách)
# Nhiều khối máy chủ có thể cùng tồn tại trong một Corefile

# Kubernetes Corefile mặc định (kubeadm, Kubernetes 1.29+):
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

<a id="32-viewing--editing-the-corefile"></a>
<a id="heading-14-32-viewing-editing-the-corefile"></a>

### 3.2 Xem và chỉnh sửa Corefile

```bash
# Xem CoreDNS ConfigMap (chứa Corefile)
kubectl get configmap coredns -n kube-system -o yaml

# Chỉnh sửa ConfigMap một cách tương tác
kubectl edit configmap coredns -n kube-system

# Trích xuất Corefile vào tệp cục bộ
kubectl get configmap coredns -n kube-system \
  -o jsonpath='{.data.Corefile}' > Corefile

# Áp dụng ConfigMap đã sửa đổi từ tệp
kubectl apply -f coredns-configmap.yaml

# Buộc tải lại (plugin tải lại thực hiện việc này tự động ~ cứ sau 30 giây)
# Nhưng đối với những thay đổi khẩn cấp, hãy buộc khởi động lại liên tục:
kubectl rollout restart deployment coredns -n kube-system

# Xem trạng thái triển khai
kubectl rollout status deployment coredns -n kube-system

# Xác minh việc tải lại đã xảy ra thông qua nhật ký
kubectl logs -n kube-system -l k8s-app=kube-dns | grep reload
# Expected: [INFO] plugin/reload: Running configuration MD5 = <hash>
```

> **Tải lại nóng:** Plugin `reload` theo dõi ConfigMap để biết các thay đổi và tự động tải lại cấu hình CoreDNS trong vòng ~30 giây. **Không cần khởi động lại pod để thay đổi cấu hình.** Tuy nhiên, đối với những thay đổi lớn về cấu trúc (thêm plugin mới yêu cầu phân bổ bộ nhớ), khởi động lại bắt buộc sẽ an toàn hơn.

<a id="33-multiple-server-blocks"></a>
<a id="heading-15-33-multiple-server-blocks"></a>

### 3.3 Nhiều khối máy chủ

```corefile
# Nhiều vùng trong một Corefile - mỗi khối độc lập

# Khối 1: Cụm DNS
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

# Khối 2: Tên miền sơ khai → máy chủ DNS riêng
# (Khối máy chủ riêng = người nghe riêng, vùng khác)
corp.internal:53 {
    errors
    forward . 10.10.0.53 10.10.0.54 {
        max_concurrent 200
    }
    cache 60
}

# Khối 3: Một tên miền sơ khai khác
test.example:53 {
    errors
    forward . 172.16.0.53
    cache 30
}
```

> **Sự khác biệt quan trọng:** Các miền sơ khai cũng có thể được triển khai với nhiều dòng `forward` **bên trong một khối .:53** (quan trọng thứ tự - kết quả trùng khớp cụ thể nhất trước tiên). Các khối máy chủ riêng biệt cung cấp cho mỗi vùng phiên bản máy chủ và chuỗi plugin riêng.

<a id="34-import-plugin--splitting-configuration"></a>
<a id="heading-16-34-import-plugin-splitting-configuration"></a>

### Plugin nhập 3.4 - Cấu hình phân tách

```corefile
# ConfigMap có thể có nhiều phím
# Plugin 'nhập' bao gồm các tệp cấu hình khác

# Chìa khóa: Corefile
.:53 {
    errors
    health { lameduck 5s }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
        pods insecure
        fallthrough in-addr.arpa ip6.arpa
    }
    # Nhập ghi đè tùy chỉnh (được thêm vào khối máy chủ này)
    import /etc/coredns/custom/*.override
    prometheus :9153
    forward . /etc/resolv.conf
    cache 30
    loop
    reload
    loadbalance
}
# Nhập khối máy chủ bổ sung
import /etc/coredns/custom/*.server

# Key: custom-stub.server (thêm khối máy chủ riêng)
stub.corp:53 {
    forward . 10.20.0.10
    cache 30
}
```

<a id="35-environment-variables-in-corefile"></a>
<a id="heading-17-35-environment-variables-in-corefile"></a>

### Biến môi trường 3.5 trong Corefile

```corefile
# Sử dụng cú pháp {$VAR_NAME} để thay thế biến môi trường
.:53 {
    forward . {$UPSTREAM_DNS_1} {$UPSTREAM_DNS_2}
    cache {$CACHE_TTL}
}

# Đặt các biến env trong thông số CoreDNS Deployment:
# thông số kỹ thuật:
#   mẫu:
#     thông số kỹ thuật:
#       containers:
#         - Tên: coredns
#           env:
#             - tên: UPSTREAM_DNS_1
#               giá trị: "8.8.8.8"
#             - tên: UPSTREAM_DNS_2
#               giá trị: "8.8.4.4"
#             - tên: CACHE_TTL
#               giá trị: "300"
```

---

<a id="4-plugins--complete-reference"></a>
<a id="heading-18-4-plugins-complete-reference"></a>

## 4. Plugin - Tài liệu tham khảo đầy đủ

<a id="41-kubernetes-plugin-core-plugin-plugin-kubernetes"></a>
<a id="heading-19-41-kubernetes-plugin-core-plugin-plugin-kuber"></a>

### Plugin 4.1 `kubernetes` (Plugin lõi) [^plugin-kubernetes]

Plugin kubernetes kết nối với máy chủ Kubernetes API và tổng hợp các phản hồi DNS từ Services, EndpointSlices, [^k8s-endpointslices] Pods và Namespace.

```corefile
kubernetes [ZONES...] {
    resyncperiod DURATION      # khoảng thời gian đồng bộ lại đầy đủ (mặc định: 0 = chỉ xem)
    endpoint URL               # URL kube-apiserver (mặc định: tự động phát hiện trong cụm)
    tls CERT KEY CACERT        # Chứng chỉ TLS cho giao tiếp API
    kubeconfig KUBECONFIG [CTX] # kubeconfig for out-of-cluster deployment
    namespaces NS [NS...]       # chỉ giới hạn ở namespaces cụ thể
    namespace_labels EXPR       # bộ chọn nhãn để lọc namespace
    labels EXPR                 # bộ chọn nhãn để lọc đối tượng
    pods POD-MODE               # bị vô hiệu hóa (mặc định) | không an toàn | đã xác minh
    endpoint_pod_names          # sử dụng tên pod làm tên điểm cuối trong bản ghi A
    ttl TTL                     # phản hồi TTL tính bằng giây (mặc định: 5, tối đa: 3600)
    noendpoints                 # vô hiệu hóa bản ghi dịch vụ endpoint/headless
    fallthrough [ZONES...]      # chuyển sang plugin tiếp theo trên NXDOMAIN
    ignore empty_service        # trả lại NXDOMAIN cho các dịch vụ có 0 điểm cuối sẵn sàng
    multicluster ZONES...       # cụm chéo DNS thông qua ServiceImport CRDs [1.12.2+]
    startup_timeout DURATION    # chờ tối đa cho đồng bộ hóa API ban đầu [1.12.3+, mặc định: 5s]
}
```

<a id="pods-mode-comparison"></a>

#### So sánh chế độ pods

| Chế độ | Hành vi | Bảo mật | Trường hợp sử dụng |
|---|---|---|---|
| `disabled` (mặc định) | Pod Một bản ghi chưa bao giờ được phục vụ | An toàn nhất | sử dụng chung |
| `insecure` | Luôn trả về bản ghi từ IP truy vấn (không xác thực) | **KHÔNG AN TOÀN** | Chỉ di chuyển kube-dns kế thừa |
| `verified` | Chỉ trả về nếu pod có IP đó tồn tại trong cùng namespace | Trung bình | Các trường hợp sử dụng chứng chỉ SSL, lưới dịch vụ |

> **Lưu ý về độ chính xác:** `pods insecure` được đặt trong kubeadm Corefile mặc định để tương thích ngược với kube-dns, nhưng `pods disabled` an toàn hơn cho các cụm mới không dựa vào pod IP DNS.

<a id="example-configurations"></a>

#### Cấu hình ví dụ

```corefile
# Tiêu chuẩn sản xuất
kubernetes cluster.local in-addr.arpa ip6.arpa {
    pods insecure
    fallthrough in-addr.arpa ip6.arpa
    ttl 30
}

# Hạn chế ở namespaces cụ thể
kubernetes cluster.local {
    namespaces production staging monitoring
    pods verified
    ttl 60
}

# Lọc namespace dựa trên nhãn
kubernetes cluster.local {
    namespace_labels environment in (production, staging)
    pods insecure
    fallthrough in-addr.arpa ip6.arpa
    ttl 30
}

# Lọc đối tượng dựa trên nhãn
kubernetes cluster.local {
    labels app in (web, api), environment=production
    pods disabled
    ttl 30
}

# Thời gian chờ khởi động lâu hơn cho các máy chủ API chậm [1.12.3+]
kubernetes cluster.local {
    startup_timeout 30s
    pods insecure
    fallthrough in-addr.arpa ip6.arpa
    ttl 30
}

# plugin đa cụm: cụm chéo DNS thông qua ServiceImport CRDs [1.12.2+]
# Yêu cầu: kubernetes-sigs/mcs-api CRDs + bộ điều khiển nhiều cụm
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

<a id="42-forward-plugin-plugin-forward"></a>
<a id="heading-20-42-forward-plugin-plugin-forward"></a>

### 4.2 `forward` Plugin [^plugin-forward]

```corefile
forward FROM TO... {
    except IGNORED_NAMES                    # đừng chuyển tiếp những cái tên này
    force_tcp                               # luôn sử dụng TCP (không phải UDP)
    prefer_udp                              # thích UDP hơn, hãy thử lại TCP khi cắt bớt
    expire DURATION                         # hết hạn ngược dòng sau khoảng thời gian này (mặc định: 10 giây)
    max_fails N                             # không khỏe mạnh sau N lần thất bại liên tiếp (mặc định: 2)
    health_check DURATION [no_rec]          # khoảng thời gian kiểm tra sức khỏe (mặc định: 0.5s)
    max_concurrent N                        # truy vấn ngược dòng đồng thời tối đa (mặc định: 0=không giới hạn)
    tls CERT KEY CA                         # Chứng chỉ TLS cho thượng nguồn DoT
    tls_servername NAME                     # Tên máy chủ SNI cho DoT
    policy random|round_robin|sequential    # lựa chọn ngược dòng (mặc định: ngẫu nhiên)
    failfast_all_unhealthy_upstreams        # SERVFAIL ngay lập tức nếu tất cả ngược dòng trở xuống [1.12.1+]
}

# Ví dụ:

# Tiêu chuẩn: chuyển tiếp tới node DNS
forward . /etc/resolv.conf {
    max_concurrent 1000
}

# Trình phân giải ngược dòng rõ ràng
forward . 8.8.8.8 8.8.4.4 1.1.1.1 {
    max_fails 3
    health_check 5s
    prefer_udp
    policy round_robin
}

# Tên miền sơ khai thành DNS riêng tư
forward corp.internal. 10.1.0.53 10.1.0.54 {
    max_concurrent 500
    max_fails 2
}

# DNS qua TLS (DoT) lên thượng nguồn
forward . tls://8.8.8.8 tls://8.8.4.4 {
    tls_servername dns.google
    health_check 5s
    prefer_udp
}

# Lỗi nhanh khi tất cả các luồng ngược dòng đều ngừng hoạt động [1.12.1+]
forward . 10.0.0.1 10.0.0.2 {
    failfast_all_unhealthy_upstreams
    health_check 2s
    max_fails 1
}
```

> **Lưu ý về độ chính xác trên `prefer_udp`:** Điều này được khuyến nghị cho môi trường AWS/cloud. Một số loại phiên bản EC2 có lỗi khiến kết nối TCP DNS dung lượng lớn không thành công. `prefer_udp` sử dụng UDP theo mặc định và chỉ quay lại TCP khi cắt bớt, tránh vấn đề này.

<a id="43-cache-plugin-plugin-cache"></a>
<a id="heading-21-43-cache-plugin-plugin-cache"></a>

### 4.3 `cache` Plugin [^plugin-cache]

```corefile
cache [TTL] [ZONES...] {
    success CAPACITY [TTL] [MINTTL]         # cài đặt bộ đệm phản hồi tích cực
    denial  CAPACITY [TTL] [MINTTL]         # Cài đặt bộ đệm NXDOMAIN/NODATA
    prefetch AMOUNT [DURATION] [PERCENTAGE] # proactive cache refresh
    serve_stale [DURATION] [REFRESH_MODE]   # phục vụ các mục đã hết hạn khi lỗi ngược dòng
    disable [success|denial] [ZONES...]     # tắt bộ nhớ đệm cho type/zones cụ thể
    keepttl                                 # bảo tồn TTL ngược dòng ban đầu
}

# Đơn giản: giới hạn TTL ở mức tối đa 30 giây (các phản hồi có TTL > 30 giây được lưu trữ dưới dạng 30 giây; các phản hồi có TTL < 30 giây sẽ giữ nguyên TTL của chúng)
cache 30

# Điều chỉnh nâng cao
cache {
    success 9984 300 10   # 9984 mục nhập, giới hạn TTL tối đa 300 giây, tầng TTL tối thiểu 10 giây
    denial  9984 5   1    # 9984 mục nhập, giới hạn TTL tối đa 5 giây, tầng TTL tối thiểu 1 giây (kiểm tra lại NXDOMAIN nhanh)
    prefetch 10 60s 10%   # tìm nạp trước khi vẫn còn <10% TTL, trong khoảng thời gian 60 giây
    serve_stale 1h verify # serve stale for up to 1h; verify upstream is alive first
}

# Không lưu trữ các bản ghi cụm nội bộ (chúng thay đổi thường xuyên)
cache {
    success 9984 300
    disable success cluster.local  # bỏ qua bộ đệm tích cực cho cluster.local
}
```

> **`serve_stale` — Được bật theo mặc định từ 1.12.1+:** Khi DNS ngược dòng tạm thời không thể truy cập được, CoreDNS tiếp tục trả lời từ các mục được lưu trong bộ nhớ đệm. Chế độ `verify` (mặc định) kiểm tra ngược dòng trước khi phân phối cũ; `immediate` phục vụ cũ mà không kiểm tra. `DURATION` mặc định là 1 giờ.

> **Ngữ nghĩa TTL của bộ nhớ đệm:** Tham số TTL trong `cache` là **cap** (tối đa), không phải là TTL theo nghĩa đen. Các phản hồi có TTL ngược dòng dài hơn giới hạn sẽ được lưu trữ với giá trị giới hạn. Phản hồi có TTL ngắn hơn sẽ giữ nguyên giá trị ban đầu. Biểu mẫu `cache 30` đơn giản đặt giới hạn 30 giây cho cả mục nhập thành công và từ chối.

> **DUNG LƯỢNG Bộ nhớ đệm:** Mặc định là 9984 mục nhập (giá trị thân thiện với bản đồ băm gần 10000). Tăng cho các cụm lớn có nhiều tên dịch vụ độc đáo. Mỗi mục nhập có dung lượng ~100–200 byte; 9984 mục ≈ 1–2 MB bộ nhớ.

<a id="44-log-plugin-plugin-log"></a>
<a id="heading-22-44-log-plugin-plugin-log"></a>

### 4.4 `log` Plugin [^plugin-log]

```corefile
# Ghi lại tất cả các truy vấn DNS (RẤT dài dòng - chỉ sử dụng để gỡ lỗi)
log

# Chỉ đăng nhập các lớp cụ thể
log {
    class denial error  # chỉ ghi lại các phản hồi và lỗi NXDOMAIN
}

# Chỉ đăng nhập cho các khu vực cụ thể
log cluster.local {
    class all
}
```

```bash
# Xem nhật ký
kubectl logs -n kube-system -l k8s-app=kube-dns -f

# Định dạng nhật ký (mặc định):
# [THÔNG TIN] <client_ip>:<port> - <id> "<name> <class> <type> <proto> <size> <do> <bufsize>" <rcode> <rflags> <rsize> <duration>
# Ví dụ:
# [THÔNG TIN] 10.0.0.5:47832 - 12345 "kubernetes.default.svc.cluster.local. TRONG udp 50 false 512" NOERROR qr,aa,rd 68 0.000234s
```

<a id="45-errors-plugin-plugin-errors"></a>
<a id="heading-23-45-errors-plugin-plugin-errors"></a>

### 4.5 `errors` Plugin [^plugin-errors]

```corefile
# Luôn thêm lỗi làm plugin ĐẦU TIÊN trong mọi khối máy chủ
# Nó phát hiện sự hoảng loạn, ghi lỗi vào stdout và ngăn chặn sự cố lan truyền
errors

# Hợp nhất các lỗi giống nhau lặp đi lặp lại [1.13.0+]
errors {
    consolidate 5m ".* i/o timeout .*"
    consolidate 30s ".* dns .* i/o timeout .*"
}
```

<a id="46-health--ready-plugins-plugin-healthplugin-ready"></a>
<a id="heading-24-46-health-ready-plugins-plugin-healthplugi"></a>

### 4.6 `health` & `ready` Plugin [^plugin-health][^plugin-ready]

```corefile
# sức khỏe: Điểm cuối sức khỏe HTTP trên cổng 8080 (đầu dò độ sống)
health {
    lameduck 5s   # đợi 5 giây sau SIGTERM trước khi đánh dấu không lành mạnh
                  # cho phép các kết nối hiện có cạn kiệt
}
# NHẬN http://<pod-ip>:8080/health → "OK" khi khỏe mạnh

# sẵn sàng: Điểm cuối sẵn sàng HTTP trên cổng 8181
ready
# NHẬN http://<pod-ip>:8181/ready → 200 khi tất cả các plugin được khởi tạo
# Được sử dụng bởi Kubernetes
```

```bash
# Kiểm tra health/ready từ cụm bên trong
kubectl exec -n kube-system <coredns-pod> -- wget -qO- http://127.0.0.1:8080/health
kubectl exec -n kube-system <coredns-pod> -- wget -qO- http://127.0.0.1:8181/ready
```

> **Thăm dò mức độ sẵn sàng trong Deployment:**
> ```yaml
> sẵn sàngProbe:
>   httpNhận:
>     đường dẫn: / sẵn sàng
>     cổng: 8181
>   ban đầuDelayGiây: 0
>   giai đoạnGiây: 2
>   Ngưỡng thất bại: 3
> ```

<a id="47-prometheus-plugin-plugin-prometheus"></a>
<a id="heading-25-47-prometheus-plugin-plugin-prometheus"></a>

### 4.7 `prometheus` Plugin [^plugin-prometheus]

```corefile
# Bật tính năng quét số liệu Prometheus trên cổng 9153
prometheus :9153
```

```bash
# Số liệu truy cập
kubectl port-forward -n kube-system svc/kube-dns 9153:9153 &
curl -s http://localhost:9153/metrics | grep coredns

# Số liệu chính:
# coredns_dns_request_duration_seconds{} - biểu đồ độ trễ truy vấn
# coredns_dns_requests_total{} - tổng số truy vấn của server/zone/type/proto
# coredns_dns_responses_total{rcode="NXDOMAIN"} — tỷ lệ NXDOMAIN
# coredns_dns_responses_total{rcode="SERVFAIL"} — tỷ lệ SERVFAIL
# coredns_cache_hits_total{} - số lần truy cập bộ đệm
# coredns_cache_misses_total{} - số lần thiếu bộ nhớ cache
# coredns_forward_requests_total{} - truy vấn được chuyển tiếp
# coredns_forward_responses_total{} — phản hồi ngược dòng bằng rcode
# coredns_kubernetes_dns_programming_duration_seconds - Đồng bộ hóa EndpointSlice
# process_resident_memory_bytes - mức sử dụng bộ nhớ hiện tại
# go_goroutines - số lượng goroutine (phát hiện rò rỉ)
```

<a id="48-rewrite-plugin-plugin-rewrite"></a>
<a id="heading-26-48-rewrite-plugin-plugin-rewrite"></a>

### 4.8 `rewrite` Plugin [^plugin-rewrite]

```corefile
# Viết lại một tên cụ thể
rewrite name old.example.com new.example.com

# Viết lại Regex bằng cách viết lại câu trả lời (hai chiều)
rewrite stop {
    name regex (.*)\\.old\\.cluster\\.local {1}.new.cluster.local
    answer name (.*)\\.new\\.cluster\\.local {1}.old.cluster.local
}

# Viết lại TTL trong phản hồi
rewrite ttl answer 300

# Thao tác EDNS0
rewrite edns0 local set 0xffee 0x1234

# Hành động hủy đặt EDNS0 [1.12.3+]
rewrite edns0 local unset 0xffee

# Thực tế: chuyển hướng tên dịch vụ cũ sang tên mới
# Pods truy vấn 'legacy-db' → được chuyển đến 'postgres'
rewrite name legacy-db.default.svc.cluster.local postgres.default.svc.cluster.local

# Quan trọng: 'stop' ngăn không cho các quy tắc viết lại tiếp theo khớp với nhau
# Không có 'dừng', tất cả các quy tắc viết lại phù hợp sẽ được áp dụng theo trình tự
```

<a id="49-autopath-plugin-plugin-autopath"></a>
<a id="heading-27-49-autopath-plugin-plugin-autopath"></a>

### 4.9 `autopath` Plugin [^plugin-autopath]

```corefile
# Yêu cầu: pods đã được xác minh trong plugin kubernetes
# Cho phép hoàn thành đường dẫn tìm kiếm phía máy chủ - giảm truy vấn DNS của máy khách

cluster.local {
    autopath @kubernetes
    kubernetes cluster.local {
        pods verified      # BẮT BUỘC cho đường dẫn tự động
    }
}

# Không có đường dẫn tự động (phía máy khách, ndots:5):
# Pod truy vấn 'redis' → 4-5 truy vấn tuần tự với miền tìm kiếm
# Mỗi người thực hiện một chuyến đi khứ hồi tới CoreDNS

# Với autopath (phía máy chủ):
# Pod gửi MỘT truy vấn, CoreDNS thử tất cả các miền tìm kiếm trong nội bộ
# Trả về kết quả khớp — giảm đáng kể lưu lượng và độ trễ của DNS
```

> **Cân bằng bộ nhớ:** `pods verified` yêu cầu CoreDNS duy trì đồng hồ trên tất cả pods (để ánh xạ IP→pod). Điều này làm tăng mức sử dụng bộ nhớ tương ứng với số lượng pods trong cụm.

<a id="410-hosts-plugin-plugin-hosts"></a>
<a id="heading-28-410-hosts-plugin-plugin-hosts"></a>

### 4.10 `hosts` Plugin [^plugin-hosts]

```corefile
# Phục vụ DNS từ định dạng tệp máy chủ (ánh xạ tĩnh)
hosts {
    10.0.0.1  legacy.example.com
    10.0.0.2  old-api.example.com
    ttl 60
    reload 15s       # tự động tải lại file máy chủ
    fallthrough      # chuyển sang plugin tiếp theo nếu không tìm thấy tên ở đây
}

# Tệp máy chủ cũng có thể được gắn từ ConfigMap
# và được tham chiếu là: máy chủ /etc/coredns/hosts { ... }
```

<a id="411-loop-plugin-plugin-loop"></a>
<a id="heading-29-411-loop-plugin-plugin-loop"></a>

### 4.11 `loop` Plugin [^plugin-loop]

```corefile
# Phát hiện và dừng các vòng chuyển tiếp
loop

# Nếu phát hiện thấy vòng lặp, CoreDNS sẽ ghi lại:
# [FATAL] plugin/loop: Đã phát hiện vòng lặp (127.0.0.1:12345 -> :53) cho vùng "."
# và tạm dừng - ngăn chặn cơn bão truy vấn vô hạn
```

> **Luôn bao gồm `loop`!** Vòng chuyển tiếp (CoreDNS chuyển tiếp tới chính nó) gây ra hiện tượng khuếch đại truy vấn theo cấp số nhân. Plugin `loop` phát hiện điều này và làm hỏng CoreDNS trước khi nó hạ gục DNS của cụm.

<a id="412-reload-plugin-plugin-reload"></a>
<a id="heading-30-412-reload-plugin-plugin-reload"></a>

### 4.12 `reload` Plugin [^plugin-reload]

```corefile
# Xem Corefile để biết các thay đổi và tự động tải lại nóng
reload

# Khoảng thời gian kiểm tra tùy chỉnh (mặc định: 30 giây)
reload 10s

# Với jitter để ngăn tất cả pods tải lại đồng thời
reload 30s 15s  # kiểm tra cứ sau 30 giây với jitter ngẫu nhiên tối đa 15 giây
```

<a id="413-loadbalance-plugin-plugin-loadbalance"></a>
<a id="heading-31-413-loadbalance-plugin-plugin-loadbalance"></a>

### 4.13 `loadbalance` Plugin [^plugin-loadbalance]

```corefile
# Ngẫu nhiên hóa vòng tròn các bản ghi A, AAAA và MX trong phản hồi
# Cung cấp cân bằng tải phía máy khách cơ bản trên nhiều IP pod
loadbalance

# Chỉ hỗ trợ chính sách 'round_robin'
loadbalance round_robin
```

<a id="414-other-notable-plugins"></a>
<a id="heading-32-414-other-notable-plugins"></a>

### 4.14 Các plugin đáng chú ý khác

| Trình cắm | Mô tả |
|---|---|
| `dnssec` | Ký hiệu phản hồi nhanh chóng với DNSSEC. Yêu cầu một khóa riêng. |
| `file` | Phục vụ dữ liệu vùng từ một tệp vùng. Hỗ trợ DNSSEC (NSEC). Trường hợp SRV được bảo toàn theo RFC 6763 [1.12.3+]. |
| `transfer` | Cho phép chuyển vùng AXFR - hoạt động như một máy chủ DNS chính. |
| `secondary` | Nhận dữ liệu vùng từ sơ cấp qua AXFR. Sửa lỗi rò rỉ Goroutine trong [1.13.2]. |
| `etcd` | Sử dụng etcd làm phụ trợ DNS (thay thế SkyDNS). |
| `template` | Tạo phản hồi từ mẫu Go — hữu ích cho các mẫu ký tự đại diện. |
| `metadata` | Cung cấp siêu dữ liệu cho mỗi truy vấn (tên pod, namespace, nhãn) cho các plugin khác. |
| `pprof` | Đi đến điểm cuối hồ sơ pprof để gỡ lỗi hiệu suất. |
| `whoami` | Trả về IP máy chủ và cổng trong phản hồi DNS. Tốt cho việc thử nghiệm. |
| `route53` | Sử dụng AWS Route53 làm chương trình phụ trợ DNS. Đã cập nhật lên AWS Go SDK v2 [1.12.3+]. |
| `azure` | Sử dụng Azure DNS làm phụ trợ. |
| `clouddns` | Sử dụng Google Cloud DNS làm chương trình phụ trợ. |
| `nomad` | Tích hợp HashiCorp Nomad. GA trong [1.13.0]. |

---

<a id="5-deployment--kubernetes-objects"></a>
<a id="heading-33-5-deployment-kubernetes-objects"></a>

## 5. Đối tượng Deployment & Kubernetes

<a id="51-inspecting-coredns"></a>
<a id="heading-34-51-inspecting-coredns"></a>

### 5.1 Kiểm tra CoreDNS

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
# Nên liệt kê các địa chỉ IP của CoreDNS pods

# ── ConfigMap ─────────────────────────────────────────────────
kubectl get configmap coredns -n kube-system -o yaml
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}'

# ── RBAC ──────────────────────────────────────────────────────
kubectl get clusterrole system:coredns -o yaml
kubectl get clusterrolebinding system:coredns -o yaml
kubectl get serviceaccount coredns -n kube-system

# ── Phiên bản ───────────────────────── ──────────────────────────
kubectl get deployment coredns -n kube-system \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
# Đầu ra mẫu: registry.k8s.io/coredns/coredns:v1.11.3

# ── PodDisruptionBudget ───────────────────────────────────────
kubectl get pdb -n kube-system
kubectl describe pdb coredns -n kube-system

# ── Sự kiện gần đây ────────────────────── ───────────────────────
kubectl get events -n kube-system --sort-by='.lastTimestamp' | grep -i dns
```

<a id="52-coredns-deployment-yaml-complete-reference"></a>
<a id="heading-35-52-coredns-deployment-yaml-complete-reference"></a>

### 5.2 CoreDNS Deployment YAML (Tham khảo đầy đủ)

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
      # Mức độ ưu tiên cao - DNS là cơ sở hạ tầng quan trọng
      priorityClassName: system-cluster-critical
      serviceAccountName: coredns
      # Cho phép lập lịch trên nodes có taint
      tolerations:
        - key: CriticalAddonsOnly
          operator: Exists
        - key: node-role.kubernetes.io/control-plane
          effect: NoSchedule
          # Lưu ý: các cụm cũ hơn được sử dụng node-role.kubernetes.io/master
          # Cả tolerations đều có trong CoreDNS 1.9.3+ để tương thích
      nodeSelector:
        kubernetes.io/os: linux
      # Thích trải rộng trên nodes (chống ái lực)
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
              # chỉ bộ nhớ - không giới hạn CPU (điều tiết CPU gây ra độ trễ)
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
                - NET_BIND_SERVICE  # cần thiết để liên kết cổng 53
              drop:
                - ALL               # bỏ tất cả các khả năng khác
            readOnlyRootFilesystem: true  # container FS ở chế độ chỉ đọc
      dnsPolicy: Default   # CoreDNS sử dụng node DNS, không phải chính nó (tránh vòng lặp bootstrap)
      volumes:
        - name: config-volume
          configMap:
            name: coredns
            items:
              - key: Corefile
                path: Corefile
```

> **Lưu ý về độ chính xác — Giới hạn CPU:** Việc triển khai CoreDNS chính thức KHÔNG đặt giới hạn CPU (chỉ là yêu cầu). Việc điều chỉnh CPU trên DNS pods gây ra các đột biến về độ trễ rất khó chẩn đoán. Bộ nhớ limits được đặt vì OOM là chế độ lỗi sạch.

> **Lưu ý về độ chính xác — `dnsPolicy: Default`:** Bản thân CoreDNS sử dụng `dnsPolicy: Default` (DNS của node), KHÔNG phải `ClusterFirst`. Điều này rất quan trọng — nếu CoreDNS sử dụng dịch vụ riêng của mình làm máy chủ tên, nó sẽ tạo ra sự phụ thuộc vòng tròn khi khởi động.

<a id="53-kube-dns-service-yaml"></a>
<a id="heading-36-53-kube-dns-service-yaml"></a>

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
  # QUAN TRỌNG: IP này phải khớp với cờ --cluster-dns của kubelet
  # Được đặt trong quá trình khởi tạo kubeadm với --service-dns-domain và cụm CIDR
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

<a id="54-coredns-configmap-yaml"></a>
<a id="heading-37-54-coredns-configmap-yaml"></a>

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

<a id="55-scaling-coredns"></a>
<a id="heading-38-55-scaling-coredns"></a>

### 5.5 Co giãn CoreDNS

```bash
# Cân thủ công
kubectl scale deployment coredns -n kube-system --replicas=4

# Tài nguyên bản vá limits (dành cho cụm lớn)
kubectl patch deployment coredns -n kube-system --type json -p '[
  {"op":"replace","path":"/spec/template/spec/containers/0/resources/limits/memory","value":"256Mi"},
  {"op":"replace","path":"/spec/template/spec/containers/0/resources/requests/memory","value":"128Mi"}
]'

# Triển khai Bộ co giãn tự động ngang DNS [^k8s-dns-autoscale]
# Công thức: bản sao = max(ceil(cores/coresPerReplica), ceil(nodes/nodesPerReplica))
kubectl apply -f https://k8s.io/examples/admin/dns/dns-horizontal-autoscaler.yaml

# Định cấu hình ngưỡng tự động co giãn
kubectl edit configmap dns-autoscaler -n kube-system
# Dữ liệu ConfigMap mặc định:
# {
#   "coresPerReplica": 256, -- 1 bản sao trên 256 lõi CPU
#   "nodesPerReplica": 16, -- 1 bản sao trên 16 nodes
#   "phút": 1,
#   "tối đa": 20,
#   "preventSinglePointOfFailure": true -- đảm bảo tối thiểu 2 bản sao
# }

# Kiểm tra trạng thái tự động co giãn hiện tại
kubectl get deployment dns-autoscaler -n kube-system
```

<a id="56-pod-dns-configuration-dnspolicy--dnsconfig-k8s-pod-dns-config"></a>
<a id="heading-39-56-pod-dns-configuration-dnspolicy-dnsconfig-"></a>

### Cấu hình 5.6 Pod DNS (dnsPolicy & dnsConfig) [^k8s-pod-dns-config]

```yaml
# Tùy chọn chính sách dns:
# ClusterFirst (mặc định) - sử dụng cụm DNS (CoreDNS)
# ClusterFirstWithHostNet - giống như ClusterFirst nhưng đối với HostNetwork: true pods
# Mặc định - kế thừa /etc/resolv.conf của node (bỏ qua hoàn toàn CoreDNS)
# Không có - DNS tùy chỉnh hoàn toàn; PHẢI cung cấp dnsConfig

# Ví dụ: Cấu hình DNS tùy chỉnh
apiVersion: v1
kind: Pod
metadata:
  name: custom-dns-pod
spec:
  dnsPolicy: None   # bắt buộc khi sử dụng dnsConfig tùy chỉnh làm máy chủ tên duy nhất
  dnsConfig:
    nameservers:
      - 10.96.0.10         # CoreDNS service ClusterIP
    searches:
      - default.svc.cluster.local
      - svc.cluster.local
      - cluster.local
    options:
      - name: ndots
        value: "2"          # Giảm từ mặc định 5 để cắt truy vấn NXDOMAIN cho tên miền bên ngoài
      - name: timeout
        value: "1"
      - name: attempts
        value: "3"
  containers:
    - name: app
      image: nginx

# Ví dụ: Tăng cường cụm hiện có DNS với các tùy chọn bổ sung (dnsPolicy: ClusterFirst + dnsConfig)
apiVersion: v1
kind: Pod
metadata:
  name: augmented-dns-pod
spec:
  dnsPolicy: ClusterFirst   # vẫn sử dụng CoreDNS
  dnsConfig:
    options:
      - name: ndots
        value: "2"           # chỉ ghi đè ndots
  containers:
    - name: app
      image: nginx
```

> **Lưu ý về độ chính xác:** Khi `dnsPolicy: ClusterFirst` được kết hợp với `dnsConfig`, dnsConfig **hợp nhất với** resolv.conf do cụm tạo ra (nó không thay thế nó). `nameservers` và `searches` từ dnsConfig được **được thêm**. Chỉ khi `dnsPolicy: None` được đặt thì dnsConfig **thay thế hoàn toàn** resolv.conf.

---

<a id="6-advanced-configurations--use-cases"></a>
<a id="heading-40-6-advanced-configurations-use-cases"></a>

## 6. Cấu hình nâng cao & trường hợp sử dụng

<a id="61-custom-stub-domains"></a>
<a id="heading-41-61-custom-stub-domains"></a>

### Tên miền sơ khai tùy chỉnh 6.1

```yaml
# Phương pháp 1: Chỉ thị chuyển tiếp bổ sung trong khối .:53
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
        # Tên miền sơ khai: chuyển tiếp corp.internal tới các máy chủ DNS tại chỗ
        forward corp.internal. 10.10.0.53 10.10.0.54 {
            max_concurrent 200
            max_fails 2
            health_check 5s
        }
        # Mọi thứ khác đối với node DNS
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
# Cách 2: Tách các khối máy chủ (cách biệt hơn, chuỗi plugin riêng)
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

<a id="62-externalname-services-k8s-externalname"></a>
<a id="heading-42-62-externalname-services-k8s-externalname"></a>

### 6.2 ExternalName Services [^k8s-externalname]

```yaml
# ExternalName: CoreDNS trả về bản ghi CNAME
apiVersion: v1
kind: Service
metadata:
  name: external-db
  namespace: default
spec:
  type: ExternalName
  externalName: database.prod.example.com
  # Không cần cổng hoặc bộ chọn

# Kết quả DNS:
# bên ngoài-db.default.svc.cluster.local
#   → CNAME → database.prod.example.com
#   → A → (bất cứ điều gì database.prod.example.com phân giải thành)
```

> **Quan trọng:** Các dịch vụ ExternalName KHÔNG hoạt động minh bạch với xác minh TLS — chứng chỉ TLS dành cho `database.prod.example.com` nhưng ứng dụng có thể kết nối bằng tên dịch vụ Kubernetes. Ngoài ra, một số máy khách HTTP tuân theo CNAME và bỏ qua dịch vụ hoàn toàn. Để sản xuất, thay vào đó hãy cân nhắc sử dụng dịch vụ không đầu với EndpointSlices thủ công.

<a id="63-headless-services--statefulsets-k8s-statefulset-dns"></a>
<a id="heading-43-63-headless-services-statefulsets-k8s-statefu"></a>

### 6.3 Không đầu Services & StatefulSets [^k8s-statefulset-dns]

```yaml
# Dịch vụ không đầu: clusterIP: Không có
# CoreDNS trả về TẤT CẢ IP pod, không phải một VIP nào
apiVersion: v1
kind: Service
metadata:
  name: cassandra
  namespace: default
spec:
  clusterIP: None    # làm nó mất đầu
  selector:
    app: cassandra
  ports:
    - port: 9042
      name: cql
```

```bash
# DNS cho dịch vụ không đầu (trả về nhiều bản ghi A):
# cassandra.default.svc.cluster.local → 10.0.0.1, 10.0.0.2, 10.0.0.3

# StatefulSet pods nhận tên DNS riêng lẻ ỔN ĐỊNH thông qua dịch vụ không đầu:
# <pod-name>.<headless-service>.<namespace>.svc.cluster.local
cassandra-0.cassandra.default.svc.cluster.local → 10.0.0.1
cassandra-1.cassandra.default.svc.cluster.local → 10.0.0.2
cassandra-2.cassandra.default.svc.cluster.local → 10.0.0.3

# Những tên này vẫn tồn tại trong suốt quá trình khởi động lại pod (pod có cùng tên, IP mới)
# Đây là nền tảng nhận dạng ổn định cho các ứng dụng có trạng thái:
# Kafka, ZooKeeper, Cassandra, etcd, MongoDB ReplicaSets, v.v.
```

<a id="64-nodelocal-dnscache-k8s-nodelocal"></a>
<a id="heading-44-64-nodelocal-dnscache-k8s-nodelocal"></a>

### 6.4 NodeLocal DNSCache [^k8s-nodelocal]

NodeLocal DNSCache cải thiện đáng kể hiệu suất DNS bằng cách chạy bộ đệm cục bộ trên mọi node.[^k8s-nodelocal]

```bash
# Kiến trúc:
# Pod → /etc/resolv.conf → 169.254.20.10 (bộ nhớ đệm cục bộ liên kết, node)
#                                  │
#         ┌─────────────────────────┴─────────────────────────┐
#    Bộ nhớ đệm HIT (micro giây) Bộ nhớ đệm MISS
#    Trả về câu trả lời được lưu trong bộ nhớ đệm ┌────────────────────────┐
#                              cluster.local? → CoreDNS Pod
#                              bên ngoài? → Trực tiếp ngược dòng DNS

# Step 1: Get CoreDNS ClusterIP
CLUSTER_DNS=$(kubectl get svc kube-dns -n kube-system \
              -o jsonpath='{.spec.clusterIP}')
echo "CoreDNS IP: $CLUSTER_DNS"

# Bước 2: Tải xuống manifest
wget https://raw.githubusercontent.com/kubernetes/kubernetes/master/\
cluster/addons/dns/nodelocaldns/nodelocaldns.yaml

# Bước 3: Thay thế phần giữ chỗ
LOCAL_DNS="169.254.20.10"
DNS_DOMAIN="cluster.local"
sed -i "s/__PILLAR__CLUSTER__DNS__/$CLUSTER_DNS/g" nodelocaldns.yaml
sed -i "s/__PILLAR__LOCAL__DNS__/$LOCAL_DNS/g" nodelocaldns.yaml
sed -i "s/__PILLAR__DNS__DOMAIN__/$DNS_DOMAIN/g" nodelocaldns.yaml

# Bước 4: Triển khai
kubectl apply -f nodelocaldns.yaml

# Bước 5: Xác minh
kubectl get daemonset -n kube-system node-local-dns
kubectl get pods -n kube-system -l k8s-app=node-local-dns -o wide
# Should see one pod per node, all Running

# Bước 6: Kiểm tra
kubectl run test-dns --image=nicolaka/netshoot -it --rm -- bash
# Bên trong pod:
cat /etc/resolv.conf
# Nên hiển thị 169.254.20.10 làm máy chủ tên
dig @169.254.20.10 kubernetes.default.svc.cluster.local

# Bước 7: Xác minh số liệu
kubectl port-forward -n kube-system \
  $(kubectl get pod -n kube-system -l k8s-app=node-local-dns -o jsonpath='{.items[0].metadata.name}') \
  9253:9253
curl -s http://localhost:9253/metrics | grep coredns_cache
```

**Lợi ích của NodeLocal DNSCache:**
- Độ trễ DNS: ms → µs cho các mục được lưu trong bộ nhớ đệm
- Tải CoreDNS: giảm 70–90%
- Sự cạn kiệt của Conntrack: đã loại bỏ đối với node-local DNS (sử dụng địa chỉ liên kết cục bộ, bỏ qua iptables)
- Bộ nhớ đệm NXDOMAIN: ndots: 5 lỗi lặp lại được lưu vào bộ đệm thay vì nhấn CoreDNS liên tục

<a id="65-the-ndots5-problem--solutions-k8s-dns-conceptsk8s-custom-dns"></a>
<a id="heading-45-65-the-ndots5-problem-solutions-k8s-dns-conc"></a>

### 6.5 Các điểm:5 Vấn đề & Giải pháp [^k8s-dns-concepts][^k8s-custom-dns]

```bash
# ndots:5 có nghĩa là: nếu tên có ít hơn 5 dấu chấm, trước tiên hãy thử tìm kiếm tên miền
# Đối với api.stripe.com (2 chấm < 5), các truy vấn này sẽ thực hiện theo trình tự:
# 1. api.stripe.com.default.svc.cluster.local → NXDOMAIN (lãng phí 5ms)
# 2. api.stripe.com.svc.cluster.local → NXDOMAIN (lãng phí 5ms)
# 3. api.stripe.com.cluster.local → NXDOMAIN (lãng phí 5ms)
# 4. api.stripe.com.                           → THÀNH CÔNG! (câu trả lời thực tế)
# Tổng chi phí: 15-60 mili giây cho mỗi tên máy chủ bên ngoài duy nhất trong lần tra cứu đầu tiên

# GIẢI PHÁP 1: Dấu chấm cuối cùng trong mã ứng dụng (FQDN)
# curl https://api.stripe.com. (dấu chấm cuối = tuyệt đối, bỏ qua tìm kiếm)

# GIẢI PHÁP 2: Giảm số điểm trên mỗi pod
spec:
  dnsConfig:
    options:
      - name: ndots
        value: "2"
# Bây giờ 'api.stripe.com' (2 dấu chấm, KHÔNG ít hơn 2) → đi thẳng

# GIẢI PHÁP 3: NodeLocal DNSCache
# Phản hồi NXDOMAIN được lưu trữ cục bộ
# Tra cứu lần đầu vẫn chậm, nhưng việc lặp lại diễn ra ngay lập tức (µs, không phải ms)

# GIẢI PHÁP 4: Điều chỉnh TTL từ chối bộ đệm CoreDNS
# bộ đệm {
#     từ chối 9984 30 5 # bộ đệm NXDOMAIN trong tối đa 30 giây
# }

# BIỆN PHÁP: Kiểm tra tỷ lệ NXDOMAIN của bạn
kubectl port-forward -n kube-system svc/kube-dns 9153:9153 &
curl -s http://localhost:9153/metrics | grep 'coredns_dns_responses_total.*NXDOMAIN'
# Tỷ lệ cao? Bạn đang phải trả thuế ndots rất nhiều.
```

---

<a id="7-troubleshooting--systematic-diagnosis"></a>
<a id="7-troubleshooting--systematic-diagnosis-k8s-dns-debug"></a>
<a id="heading-46-7-troubleshooting-systematic-diagnosis-k8s-dn"></a>

## 7. Xử lý sự cố — Chẩn đoán hệ thống [^k8s-dns-debug]

<a id="71-diagnostic-methodology"></a>
<a id="heading-47-71-diagnostic-methodology"></a>

### Phương pháp chẩn đoán 7.1

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
    │   CÓ → plugin kubernetes vẫn ổn → kiểm tra forward/external
    │   KHÔNG → plugin kubernetes / sự cố API / chính sách mạng đối với pods
    ├── External resolution ok (google.com)?
    │   CÓ → DNS bên ngoài tốt → thu hẹp ở service/namespace cụ thể
    │   KHÔNG → plugin chuyển tiếp / vấn đề ngược dòng DNS / node DNS
    └── BOTH fail → CoreDNS down / network policy blocking / kube-dns service issue

STEP 4: Check CoreDNS logs
    kubectl logs -n kube-system -l k8s-app=kube-dns --tail=100

STEP 5: Check Corefile for misconfigurations
    kubectl get cm coredns -n kube-system -o jsonpath='{.data.Corefile}'

STEP 6: Check pod's /etc/resolv.conf and dnsPolicy
    kubectl exec <pod> -- cat /etc/resolv.conf

STEP 7: Check network policies, node DNS, conntrack
```

<a id="72-debug-pod-commands"></a>
<a id="heading-48-72-debug-pod-commands"></a>

### 7.2 Gỡ lỗi các lệnh Pod

```bash
# Khởi chạy gỡ lỗi pod với đầy đủ các công cụ mạng
kubectl run dns-debug \
  --image=nicolaka/netshoot \
  --restart=Never \
  -it --rm \
  -- bash

# Hoặc busybox tối thiểu (có sẵn trên các cụm air-gapped)
kubectl run dns-debug \
  --image=busybox:1.28 \
  --restart=Never \
  -it --rm \
  -- sh

# --- Gỡ lỗi bên trong pod ---

# 1. Kiểm tra cấu hình DNS của pod
cat /etc/resolv.conf
# Sản lượng dự kiến:
# máy chủ tên 10.96.0.10
# tìm kiếm default.svc.cluster.local svc.cluster.local cluster.local
# tùy chọn ndots:5

# 2. Kiểm tra dịch vụ Kubernetes nội bộ
nslookup kubernetes.default
nslookup kubernetes.default.svc.cluster.local
dig kubernetes.default.svc.cluster.local A
dig kubernetes.default.svc.cluster.local ANY

# 3. Kiểm tra một dịch vụ cụ thể trong bất kỳ namespace nào
nslookup my-service.production.svc.cluster.local

# 4. Kiểm tra DNS bên ngoài
nslookup google.com
dig google.com A

# 5. Truy vấn trực tiếp CoreDNS (bỏ qua các miền tìm kiếm resolv.conf)
dig @10.96.0.10 kubernetes.default.svc.cluster.local A

# 6. PTR (tra cứu ngược)
dig -x 10.96.0.1

# 7. Hồ sơ SRV
dig _https._tcp.kubernetes.default.svc.cluster.local SRV

# 8. Theo dõi độ phân giải đầy đủ
dig +trace google.com

# 9. Thời gian truy vấn DNS
time nslookup google.com

# 10. Kiểm tra dịch vụ headless (cần có nhiều bản ghi A)
dig my-headless-svc.default.svc.cluster.local A
```

<a id="73-common-issues--solutions"></a>
<a id="heading-49-73-common-issues-solutions"></a>

### 7.3 Các vấn đề và giải pháp thường gặp

<a id="issue-1-dns-loop-detected"></a>

#### Vấn đề 1: Đã phát hiện vòng lặp DNS

```bash
# Triệu chứng trong nhật ký CoreDNS:
# [FATAL] plugin/loop: Đã phát hiện vòng lặp (127.0.0.1:54142 -> :53) cho vùng "."
# CoreDNS thoát liên tục

# Nguyên nhân cốt lõi: /etc/resolv.conf của node trỏ đến 127.0.0.1 hoặc 127.0.0.53
# (Trình phân giải sơ khai được giải quyết bởi systemd) mà CoreDNS sau đó sẽ chuyển tiếp trở lại chính nó

# Chẩn đoán: trên node
cat /etc/resolv.conf
# Nếu nó hiển thị: nameserver 127.0.0.53 hoặc nameserver 127.0.0.1 → loop!

# Cách khắc phục 1: Trỏ về phía trước tại DNS ngược dòng rõ ràng (không phải /etc/resolv.conf)
kubectl edit configmap coredns -n kube-system
# Thay đổi: chuyển tiếp. /etc/resolv.conf
# Tới: chuyển tiếp . 8.8.8.8 8.8.4.4

# Cách khắc phục 2: Trỏ tới cấu hình thực của systemd-resolved
# Thay đổi: chuyển tiếp. /etc/resolv.conf
# Tới: chuyển tiếp . /run/systemd/resolve/resolv.conf

# Sửa lỗi 3 (trên systemd đã phân giải nodes): Sử dụng ngược dòng thực, không phải sơ khai
# Trên node: mèo /run/systemd/resolve/resolv.conf
# Cái này chứa các IP DNS ngược dòng thực tế
```

<a id="issue-2-coredns-oomkilled--crashloopbackoff"></a>

#### Vấn đề 2: CoreDNS OOMKilled / CrashLoopBackOff

```bash
# Chẩn đoán
kubectl describe pod -n kube-system -l k8s-app=kube-dns
# Tìm kiếm: Trạng thái cuối cùng: Đã chấm dứt / Lý do: OOMKilled

# Kiểm tra việc sử dụng bộ nhớ
kubectl top pods -n kube-system -l k8s-app=kube-dns

# Cách 1: Tăng bộ nhớ limits
kubectl patch deployment coredns -n kube-system --type json -p '[
  {"op":"replace",
   "path":"/spec/template/spec/containers/0/resources/limits/memory",
   "value":"256Mi"},
  {"op":"replace",
   "path":"/spec/template/spec/containers/0/resources/requests/memory",
   "value":"128Mi"}
]'

# Cách khắc phục 2: Thu nhỏ quy mô (phân phối tải)
kubectl scale deployment coredns -n kube-system --replicas=4

# Cách 3: Giảm kích thước bộ đệm (nếu bộ nhớ bị hạn chế)
kubectl edit configmap coredns -n kube-system
# Thay đổi: bộ đệm 30
# Tới: bộ đệm {
#       thành công 4096 30
#       từ chối 4096 5
#     }

# Cách khắc phục 4: Triển khai NodeLocal DNSCache để giảm tải trên CoreDNS pods
```

<a id="issue-3-servfail--intermittent-failures"></a>

#### Vấn đề 3: SERVFAIL/Lỗi không liên tục

```bash
# Chẩn đoán: kiểm tra tình trạng kiệt sức của conntrack (nguyên nhân phổ biến nhất trên quy mô lớn)
# Trên node bị ảnh hưởng:
sudo sysctl net.netfilter.nf_conntrack_count
sudo sysctl net.netfilter.nf_conntrack_max
# Nếu số lượng >80% mức tối đa → conntrack kiệt sức!

# Đồng thời kiểm tra:
dmesg | grep -i conntrack | tail -20
# Tìm: nf_conntrack: bảng đầy, rớt gói

# Cách 1: Tăng conntrack max
sudo sysctl -w net.netfilter.nf_conntrack_max=524288
# Kiên trì:
echo 'net.netfilter.nf_conntrack_max=524288' | sudo tee -a /etc/sysctl.conf

# Cách khắc phục 2: Triển khai NodeLocal DNSCache
# DNS từ bộ đệm cục bộ node → IP liên kết cục bộ → bỏ qua hoàn toàn conntrack

# Cách khắc phục 3: Bật chế độ dự phòng để có SERVFAIL nhanh hơn khi luồng ngược dòng không hoạt động
kubectl edit configmap coredns -n kube-system
# chuyển tiếp . /etc/resolv.conf {
#     max_đồng thời 1000
#     Failfast_all_unhealthy_upstreams # [yêu cầu CoreDNS 1.12.1+]
# }

# Khắc phục 4: Dành riêng cho đám mây — Điều tiết VPC DNS (AWS)
# AWS VPC DNS (169.254.169.253) có tỷ lệ trên mỗi ENI limits
# Mở rộng quy mô bản sao CoreDNS (thêm pods = nhiều ENI hơn = nhiều hạn ngạch hơn)
# Hoặc triển khai NodeLocal DNSCache
```

<a id="issue-4-slow-external-dns-ndots5-latency-tax"></a>

#### Vấn đề 4: DNS bên ngoài chậm (ndots:5 Thuế độ trễ)

```bash
# Chẩn đoán: đo tỷ lệ NXDOMAIN
kubectl port-forward -n kube-system svc/kube-dns 9153:9153 &
curl -s http://localhost:9153/metrics | grep 'rcode="NXDOMAIN"'

# Ngoài ra còn có thời gian giải quyết:
kubectl run time-test --image=busybox:1.28 -it --rm -- sh
time nslookup api.github.com  # việc này mất bao lâu?

# Khắc phục: ndots:2 cho các triển khai cụ thể
spec:
  template:
    spec:
      dnsConfig:
        options:
          - name: ndots
            value: "2"

# Khắc phục: Tăng TTL bộ đệm từ chối
# bộ đệm {
#   từ chối 9984 30 5 # NXDOMAIN được lưu trong bộ nhớ đệm tối đa 30 giây, tối thiểu 5 giây
# }
```

<a id="issue-5-service-not-resolving-nxdomain-for-existing-service"></a>

#### Vấn đề 5: Service không giải quyết được (NXDOMAIN cho Service hiện có)

```bash
# Chẩn đoán
kubectl get svc my-service -n my-namespace
kubectl get ep my-service -n my-namespace
# Kiểm tra: dịch vụ có tồn tại không? Nó có điểm cuối không?

# Kiểm tra trực tiếp DNS với CoreDNS pod
COREDNS_POD=$(kubectl get pods -n kube-system -l k8s-app=kube-dns \
  -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n kube-system $COREDNS_POD -- \
  nslookup my-service.my-namespace.svc.cluster.local 127.0.0.1

# Kiểm tra xem plugin kubernetes có thể tiếp cận API không
kubectl logs -n kube-system $COREDNS_POD | grep -i "kubernetes\|apiserver\|timeout"

# Kiểm tra RBAC - CoreDNS có thể liệt kê các dịch vụ không?
kubectl auth can-i list services \
  --as=system:serviceaccount:kube-system:coredns

# Kiểm tra xem namespace có được gắn nhãn hay không (nếu bạn sử dụng bộ lọc namespace_labels)
kubectl get namespace my-namespace --show-labels

# Kiểm tra xem dịch vụ có đúng nhãn không (nếu sử dụng bộ lọc nhãn)
kubectl get svc my-service -n my-namespace --show-labels
```

<a id="issue-6-pods-etcresolvconf-is-wrong"></a>

#### Vấn đề 6: /etc/resolv.conf của Pod sai

```bash
# Triệu chứng: resolv.conf của pod không có miền tìm kiếm cụm
kubectl exec <pod> -- cat /etc/resolv.conf

# Dự kiến:
# máy chủ tên 10.96.0.10
# tìm kiếm default.svc.cluster.local svc.cluster.local cluster.local
# tùy chọn ndots:5

# Nguyên nhân A: dnsPolicy là "Mặc định" (sử dụng node DNS, không phải CoreDNS)
kubectl get pod <pod> -o jsonpath='{.spec.dnsPolicy}'
# Nên là ClusterFirst (hoặc trống = ClusterFirst)

# Nguyên nhân B: Cờ kubelet --cluster-dns không khớp với IP kube-dns Service
kubectl get svc kube-dns -n kube-system -o jsonpath='{.spec.clusterIP}'
# Trên node: ps aux | grep kubelet | grep -o '\-\-cluster-dns=[^ ]*'
# Những PHẢI phù hợp

# Nguyên nhân C:hostNetwork: true pod cần ClusterFirstWithHostNet
kubectl get pod <pod> -o jsonpath='{.spec.hostNetwork}'
# Nếu đúng và dnsPolicy là ClusterFirst → đặt ClusterFirstWithHostNet
```

<a id="issue-7-networkpolicy-blocking-dns-k8s-netpol"></a>

#### Vấn đề 7: NetworkPolicy Chặn DNS [^k8s-netpol]

```bash
# Triệu chứng: DNS chỉ thất bại đối với pods khi áp dụng NetworkPolicies
# Tất cả lưu lượng truy cập DNS là cổng UDP/TCP 53

# Thêm quy tắc đầu ra để cho phép DNS:
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-egress
  namespace: my-namespace
spec:
  podSelector: {}        # áp dụng cho tất cả pods trong namespace
  policyTypes:
    - Egress
  egress:
    # Cho phép dịch vụ DNS sang CoreDNS trên cổng 53 (trường hợp tiêu chuẩn)
    - ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
    # Nếu sử dụng NodeLocal DNSCache (169.254.20.10), cũng cho phép liên kết phạm vi cục bộ:
    - to:
        - ipBlock:
            cidr: 169.254.20.10/32  # IP liên kết cục bộ NodeLocal DNS
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
```

<a id="74-enabling-debug-logging"></a>
<a id="heading-50-74-enabling-debug-logging"></a>

### 7.4 Kích hoạt tính năng ghi nhật ký gỡ lỗi

```bash
# Tạm thời thêm plugin 'log' vào CoreDNS
kubectl edit configmap coredns -n kube-system
# Thêm 'log' sau 'lỗi' trong khối .:53

# Đợi tải lại (~30 giây) hoặc buộc khởi động lại:
kubectl rollout restart deployment coredns -n kube-system

# Xem nhật ký truy vấn
kubectl logs -n kube-system -l k8s-app=kube-dns -f

# QUAN TRỌNG: Xóa 'log' sau khi gỡ lỗi!
# Mọi truy vấn DNS đều được ghi lại - đây là trong một cụm bận
# hàng triệu mục nhật ký mỗi phút, ảnh hưởng đến hiệu suất của CoreDNS
```

---

<a id="8-performance-tuning--monitoring"></a>
<a id="heading-51-8-performance-tuning-monitoring"></a>

## 8. Điều chỉnh và giám sát hiệu suất

<a id="81-key-metrics"></a>
<a id="heading-52-81-key-metrics"></a>

### Các số liệu chính của 8.1

| Số liệu | Ngưỡng cảnh báo | hành động |
|---|---|---|
| `coredns_dns_request_duration_seconds` P99 | > 100 mili giây | Co giãn CoreDNS, thêm NodeLocal DNS |
| `coredns_dns_responses_total{rcode="NXDOMAIN"}` / tổng cộng | > 30% | Giảm ndots, thêm bộ đệm từ chối |
| `coredns_dns_responses_total{rcode="SERVFAIL"}` | Bất kỳ sự tăng đột biến nào | Kiểm tra ngược dòng DNS, conntrack |
| `coredns_cache_hits_total` / (trượt+trượt) | < 70% | Tăng TTL hoặc dung lượng bộ đệm |
| `process_resident_memory_bytes` | > 80% giới hạn | Tăng giới hạn bộ nhớ |
| `coredns_forward_requests_total` | Tăng trưởng đều đặn | Co giãn CoreDNS, thêm NodeLocal DNS |
| `coredns_kubernetes_dns_programming_duration_seconds` | > 5s | Sự cố hiệu suất máy chủ API |

<a id="82-prometheus-alert-rules"></a>
<a id="heading-53-82-prometheus-alert-rules"></a>

### Quy tắc cảnh báo 8.2 Prometheus

```yaml
groups:
  - name: coredns.rules
    interval: 30s
    rules:
      # CoreDNS pods xuống
      - alert: CoreDNSDown
        expr: absent(up{job="coredns"} == 1) or kube_deployment_status_replicas_ready{deployment="coredns", namespace="kube-system"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "CoreDNS is down — cluster DNS is broken"

      # Độ trễ cao
      - alert: CoreDNSHighLatency
        expr: histogram_quantile(0.99, rate(coredns_dns_request_duration_seconds_bucket[5m])) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CoreDNS P99 latency > 100ms"

      # Tỷ lệ SERVFAIL cao
      - alert: CoreDNSHighSERVFAIL
        expr: rate(coredns_dns_responses_total{rcode="SERVFAIL"}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "CoreDNS returning too many SERVFAILs — upstream DNS issue?"

      # Tỷ lệ NXDOMAIN cao (chỉ số thuế ndots)
      - alert: CoreDNSHighNXDOMAIN
        expr: |
          (rate(coredns_dns_responses_total{rcode="NXDOMAIN"}[5m]) /
           rate(coredns_dns_requests_total[5m])) > 0.3
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "High NXDOMAIN rate (>30%) — consider reducing ndots or adding cache"

      # rủi ro OOM
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

<a id="83-performance-optimization-checklist"></a>
<a id="heading-54-83-performance-optimization-checklist"></a>

### Danh sách kiểm tra tối ưu hóa hiệu suất 8.3

| Ưu tiên | Tối ưu hóa | tác động | nỗ lực |
|---|---|---|---|
| 🔴 Cao | Triển khai DNSCache NodeLocal | Giảm tải 70-90%, độ trễ µs | Trung bình |
| 🔴 Cao | Co giãn bản sao CoreDNS (bộ co giãn tự động) | Xử lý gai tải | Thấp |
| 🔴 Cao | Tăng conntrack tối đa trên nodes | Ngăn chặn cơn bão SERVFAIL | Thấp |
| 🟡 Trung bình | Giảm số điểm cho pods hướng ra bên ngoài | Cắt giảm truy vấn NXDOMAIN 75% | Thấp |
| 🟡 Trung bình | Điều chỉnh TTL bộ đệm (thành công 300 giây trở lên) | Giảm tải ngược dòng | Thấp |
| 🟡 Trung bình | Kích hoạt server_stale (1.12.1+ mặc định) | Khả năng phục hồi trong thời gian mất điện | không có |
| 🟡 Trung bình | Pod chống ái lực trên nodes/zones | HA cho DNS | Thấp |
| 🟢 Thấp | Đặt max_concurrent ở phía trước | Ngăn chặn tình trạng quá tải ngược dòng | Thấp |
| 🟢 Thấp | Bật tìm nạp trước trong bộ đệm | Giảm lỗi nhớ cache | Thấp |
| 🟢 Thấp | Sử dụng Prefer_udp ở phía trước (đám mây) | Tránh các sự cố TCP | Thấp |

---

<a id="9-cka-2026-quick-reference"></a>
<a id="heading-55-9-cka-2026-quick-reference"></a>

## 9. Tham khảo nhanh CKA 2026

<a id="91-most-tested-topics"></a>
<a id="heading-56-91-most-tested-topics"></a>

### 9.1 Chủ đề được thử nghiệm nhiều nhất

| chủ đề | Phải biết |
|---|---|
| Định dạng bản ghi DNS | `<svc>.<ns>.svc.cluster.local` |
| Định dạng bản ghi Pod | `<pod-ip-dashes>.<ns>.pod.cluster.local` |
| StatefulSet pod DNS | `<pod>.<headless-svc>.<ns>.svc.cluster.local` |
| Dấu chấm mặc định | `5` |
| CoreDNS namespace | `kube-system` |
| Dịch vụ CoreDNS | `kube-dns` |
| Vị trí Corefile | ConfigMap `coredns` trong `kube-system` |
| mặc định chính sách dns | `ClusterFirst` |
| dnsPolicy cho HostNetwork pods | `ClusterFirstWithHostNet` |
| CoreDNS sử dụng chính nó cho DNS? | KHÔNG — `dnsPolicy: Default` (node DNS) |
| Cơ chế tải lại nóng | Đồng hồ plugin `reload` ConfigMap |

<a id="92-must-know-commands"></a>
<a id="heading-57-92-must-know-commands"></a>

### 9.2 Các lệnh phải biết

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
# HOẶC: kubectl nhận cm coredns -n kube-system -o yaml > coredns-cm.yaml
#     vim coredns-cm.yaml
#     Áp dụng kubectl -f coredns-cm.yaml

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

<a id="93-dns-naming-cheat-sheet"></a>
<a id="heading-58-93-dns-naming-cheat-sheet"></a>

### Bảng đặt tên 9.3 DNS

```bash
# Từ bất kỳ pod nào trong namespace "mặc định":

# Tên viết tắt (giống namespace):
my-service                    → resolves via search domain expansion

# Cross-namespace (FQDN được đề xuất):
my-service.other-ns.svc.cluster.local

# Máy chủ Kubernetes API:
kubernetes.default.svc.cluster.local

# Dịch vụ không đầu (trả về TẤT CẢ IP pod):
headless-svc.default.svc.cluster.local

# StatefulSet cá nhân pod:
web-0.headless-svc.default.svc.cluster.local
web-1.headless-svc.default.svc.cluster.local

# Pod theo IP (yêu cầu pods: không an toàn hoặc đã được xác minh):
10-0-0-5.default.pod.cluster.local   # pod có IP 10.0.0.5

# Bản ghi SRV:
_http._tcp.my-service.default.svc.cluster.local

# Tra cứu ngược:
dig -x 10.96.0.10   # → kube-dns.kube-system.svc.cluster.local

# Dịch vụ ExternalName (CNAME):
ext-svc.default.svc.cluster.local → CNAME → external.example.com
```

---

<a id="10-security-hardening"></a>
<a id="heading-59-10-security-hardening"></a>

## 10. Tăng cường bảo mật

<a id="101-coredns-security-context"></a>
<a id="heading-60-101-coredns-security-context"></a>

### Bối cảnh bảo mật 10.1 CoreDNS

```yaml
# Bối cảnh bảo mật mặc định (an toàn) - không làm suy yếu những bối cảnh này:
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    add:
      - NET_BIND_SERVICE   # liên kết cổng 53 (cổng đặc quyền, yêu cầu giới hạn này)
    drop:
      - ALL                # không có khả năng nào khác
  readOnlyRootFilesystem: true
  # runAsNonRoot: true # Lưu ý: CoreDNS image chạy bằng root theo mặc định
  #                      # Một số triển khai tăng cường thêm runAsUser: 1000
```

<a id="102-security-improvements-in-112x113x"></a>
<a id="heading-61-102-security-improvements-in-112x113x"></a>

### 10.2 Cải tiến bảo mật trong 1.12.x–1.13.x

| Phiên bản | tính năng | lợi ích |
|---|---|---|
| 1.13.2 | Giới hạn độ dài Regex (lõi) | Ngăn chặn cạn kiệt tài nguyên ReDoS |
| 1.13.2 | Giới hạn tốc độ Kubernetes API | Ngăn chặn quá tải máy chủ API từ CoreDNS |
| 1.13.0 | Hợp nhất lỗi `show_first` | Giảm thư rác nhật ký, cải thiện khả năng quan sát |
| 1.12.4+ | Cập nhật Go CVE thường xuyên | Giải quyết các lỗ hổng bảo mật stdlib |
| 1.12.3 | Hành động hủy đặt EDNS0 | Thao tác EDNS0 chi tiết cho các chính sách bảo mật |

<a id="103-dns-security-best-practices"></a>
<a id="heading-62-103-dns-security-best-practices"></a>

### Thực tiễn tốt nhất về bảo mật 10.3 DNS

| Thực hành | Thực hiện |
|---|---|
| Mã hóa các truy vấn ngược dòng | `forward . tls://8.8.8.8` với `tls_servername dns.google` |
| Hạn chế khả năng hiển thị của namespace | `namespace_labels` hoặc `namespaces` trong plugin kubernetes |
| Xóa đăng nhập truy vấn trong sản phẩm | Không bao gồm plugin `log` trong sản xuất Corefile |
| NetworkPolicy cho DNS | Chỉ cho phép pods cần thiết tiếp cận kube-dns :53 |
| Tránh `pods insecure` | Sử dụng `pods disabled` trừ khi bạn đặc biệt cần bản ghi IP pod |
| Kiểm toán RBAC | `kubectl get clusterrole system:coredns -o yaml` - xác minh quyền tối thiểu |
| PodDisruptionBudget | Giữ PDB - đảm bảo DNS HA trong quá trình bảo trì node |
| Các vùng đã ký với DNSSEC | Sử dụng plugin `dnssec` cho các vùng bạn kiểm soát |

---

<a id="11-complete-reference-tables"></a>
<a id="heading-63-11-complete-reference-tables"></a>

## 11. Bảng tham khảo đầy đủ

<a id="111-coredns--kubernetes-version-map"></a>
<a id="heading-64-111-coredns-kubernetes-version-map"></a>

### Bản đồ phiên bản 11.1 CoreDNS ↔ Kubernetes

Với Kubernetes 1.35, không suy đoán phiên bản CoreDNS từ tên cụm hoặc bảng tương thích cũ. Xem image kubeadm lựa chọn và image đang chạy:

```bash
kubeadm config images list --kubernetes-version=v1.35.0
kubectl get deployment coredns -n kube-system \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
```

Kubeadm 1.35.0 ghim CoreDNS **v1.13.1** trong [mã nguồn chính thức](https://github.com/kubernetes/kubernetes/blob/v1.35.0/cmd/kubeadm/app/constants/constants.go). Bản vá, nhà cung cấp hoặc cấu hình tuỳ chỉnh có thể thay đổi image này. Dùng phiên bản mà bài thực hành yêu cầu; kiểm tra Corefile/plugin và DNS sau nâng cấp. Không mặc định mọi CoreDNS mới đều tương thích với mọi cụm cũ.


<a id="112-forward-plugin--all-options"></a>
<a id="heading-65-112-forward-plugin-all-options"></a>

### Plugin chuyển tiếp 11.2 - Tất cả tùy chọn

| Tùy chọn | Mặc định | Mô tả |
|---|---|---|
| `except NAMES` | — | Đừng chuyển tiếp những tên này lên thượng nguồn này |
| `force_tcp` | `false` | Luôn sử dụng TCP |
| `prefer_udp` | `false` | Ưu tiên UDP, quay lại TCP khi cắt ngắn |
| `expire DURATION` | 10s | Hết hạn kết nối lên thượng nguồn |
| `max_fails N` | 2 | Đánh dấu không lành mạnh sau N lần thất bại liên tiếp |
| `health_check DURATION` | 0.5s | Khoảng thời gian kiểm tra sức khỏe |
| `max_concurrent N` | 0 (không giới hạn) | Truy vấn ngược dòng đồng thời tối đa |
| `tls CERT KEY CA` | — | Chứng chỉ TLS cho DoT |
| `tls_servername NAME` | — | SNI cho DoT |
| `chính sách ngẫu nhiên\ | round_robin\ | tuần tự` | ngẫu nhiên | Chính sách lựa chọn ngược dòng |
| `failfast_all_unhealthy_upstreams` | `false` | SERVFAIL ngay lập tức nếu tất cả đều hỏng [1.12.1+] |

<a id="113-cache-plugin--all-options"></a>
<a id="heading-66-113-cache-plugin-all-options"></a>

### Plugin bộ đệm 11.3 - Tất cả tùy chọn

| Tùy chọn | Mặc định | Mô tả |
|---|---|---|
| `success CAPACITY TTL MINTTL` | 9984 3600 0 | Bộ nhớ đệm tích cực: mục nhập tối đa, **giới hạn TTL** (kẹp TTL ngược dòng đến mức tối đa này), sàn TTL tối thiểu |
| `denial CAPACITY TTL MINTTL` | 9984 3600 0 | Bộ nhớ đệm âm: mục nhập tối đa, **giới hạn TTL** (kẹp TTL ngược dòng đến mức tối đa này), sàn TTL tối thiểu |
| `prefetch AMOUNT DURATION PERCENTAGE` | bị vô hiệu hóa | Tìm nạp trước các mục trong bộ đệm trước khi hết hạn |
| `serve_stale DURATION MODE` | 1h xác minh [1.12.1+] | Phục vụ cũ khi lỗi ngược dòng |
| `vô hiệu hóa thành công\ | từ chối [ZONES]` | — | Tắt bộ đệm cho type/zones cụ thể |
| `keepttl` | `false` | Bảo toàn TTL ngược dòng thay vì giới hạn |

<a id="114-dnspolicy-values"></a>
<a id="heading-67-114-dnspolicy-values"></a>

### 11.4 dnsCác giá trị chính sách

| Giá trị | Máy chủ tên | Tìm kiếm tên miền | Trường hợp sử dụng |
|---|---|---|---|
| `ClusterFirst` (mặc định) | kube-dns ClusterIP | Tên miền cluster.local + node | Hầu hết pods |
| `ClusterFirstWithHostNet` | kube-dns ClusterIP | Tên miền cluster.local + node | Pods với `hostNetwork: true` |
| `Default` | DNS của nút | Miền tìm kiếm của nút | Pods phải sử dụng node DNS |
| `None` | Phải cung cấp trong `dnsConfig` | Phải cung cấp trong `dnsConfig` | DNS tùy chỉnh hoàn toàn |

<a id="115-kubernetes-plugin--all-options"></a>
<a id="heading-68-115-kubernetes-plugin-all-options"></a>

### Plugin kubernetes 11.5 - Tất cả tùy chọn

| Tùy chọn | Mặc định | Mô tả |
|---|---|---|
| `ZONES` | cluster.local | Các khu vực mà plugin có thẩm quyền |
| `resyncperiod` | 0 (chỉ xem) | Khoảng thời gian đồng bộ lại đầy đủ |
| `endpoint URL` | trong cụm | URL máy chủ Kubernetes API |
| `namespaces NS...` | tất cả | Chỉ phục vụ những namespaces này |
| `namespace_labels EXPR` | — | Bộ chọn nhãn cho namespaces |
| `labels EXPR` | — | Bộ chọn nhãn cho đối tượng |
| `pods MODE` | bị vô hiệu hóa | Xử lý bản ghi IP Pod: disabled/insecure/verified |
| `endpoint_pod_names` | `false` | Sử dụng tên pod làm nhãn điểm cuối trong bản ghi A |
| `ttl TTL` | 5s | Phản hồi TTL (tối đa 3600) |
| `noendpoints` | `false` | Tắt việc cung cấp bản ghi điểm cuối |
| `fallthrough [ZONES]` | — | Chuyển sang plugin tiếp theo trên NXDOMAIN |
| `ignore empty_service` | — | NXDOMAIN dành cho các dịch vụ không có điểm cuối sẵn sàng |
| `multicluster ZONES` | — | Cụm chéo DNS thông qua ServiceImport CRDs [1.12.2+] |
| `startup_timeout DURATION` | 5s | Chờ tối đa cho lần đồng bộ hóa API ban đầu [1.12.3+] |

---

<a id="12-multi-cluster-dns--advanced-topics"></a>
<a id="heading-69-12-multi-cluster-dns-advanced-topics"></a>

## 12. DNS đa cụm & Chủ đề nâng cao

<a id="121-multi-cluster-dns-via-the-multicluster-plugin--coredns-1122-plugin-multiclustermcs-api-spec"></a>
<a id="heading-70-121-multi-cluster-dns-via-the-multicluster-plugin"></a>

### 12.1 Nhiều cụm DNS thông qua Plugin `multicluster` — CoreDNS 1.12.2+ [^plugin-multicluster][^mcs-api-spec]

Plugin `multicluster` (được gửi trong CoreDNS 1.12.2) cho phép phân giải DNS cụm chéo bằng cách sử dụng `ServiceImport` và `ServiceExport` CRDs được xác định bởi dự án [kubernetes-sigs/mcs-api](https://github.com/kubernetes-sigs/mcs-api). Đây là chức năng độc lập được triển khai trong chính CoreDNS - nó yêu cầu control plane (Submariner, Liqo hoặc Admiral) nhiều cụm tương thích để quản lý các đối tượng `ServiceImport`/`ServiceExport` trên các cụm.

> **Ghi chú trưởng thành:** `ServiceImport`/`ServiceExport` CRDs tồn tại trong `kubernetes-sigs/mcs-api`, là một dự án Kubernetes SIG — chưa phải là một phần của Kubernetes API cốt lõi. Plugin CoreDNS `multicluster` ổn định (GA) kể từ CoreDNS 1.12.2, nhưng bạn phải cài đặt riêng CRDs và bộ điều khiển nhiều cụm hỗ trợ.

```corefile
# Yêu cầu:
#   1. Đã cài đặt kubernetes-sigs/mcs-api CRDs (ServiceImport, ServiceExport)
#   2. Bộ điều khiển nhiều cụm (e.g., Submariner, Liqo, Admiral) đang chạy
#      để tạo các đối tượng ServiceImport từ các dịch vụ đã xuất

clusterset.local:53 {
    multicluster clusterset.local        # câu trả lời cho <svc>.<ns>.svc.clusterset.local
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

Cách thức hoạt động: các dịch vụ được xuất qua đối tượng `ServiceExport` có thể phân giải được trên tất cả các cụm thông qua bản ghi `ServiceImport` của chúng trong vùng `clusterset.local`:

```bash
# Trong một cụm duy nhất:
my-svc.default.svc.cluster.local     → pod IPs in the local cluster only

# Trên toàn bộ cụm (yêu cầu tồn tại ServiceImport):
my-svc.default.svc.clusterset.local  → pod IPs across all participating clusters
```

Plugin CoreDNS `multicluster` theo dõi các đối tượng `ServiceImport` (không phải đối tượng `Service`) thông qua Kubernetes API và tổng hợp các bản ghi DNS cho vùng `clusterset.local`. Nguồn plugin và tham chiếu tùy chọn đầy đủ có tại: https://coredns.io/plugins/multicluster/

<a id="122-coredns-with-service-meshes"></a>
<a id="heading-71-122-coredns-with-service-meshes"></a>

### 12.2 CoreDNS với lưới Service

```
# Istio:
# - Phân giải DNS vẫn vượt qua CoreDNS
# - Istio chặn lưu lượng truy cập SAU DNS → không cần thay đổi CoreDNS trong hầu hết các trường hợp
# - Ngoại lệ: Istio DNS Proxying (1.8+) có thể chặn DNS đối với tên ServiceEntry
#   Đặt: meshConfig.dnsProxyingEnabled: đúng
#   Sau đó Istio phân giải tên ServiceEntry (không phải CoreDNS)

# Người liên kết:
# - Không cần thay đổi CoreDNS
# - Linkerd chặn ở cấp độ mạng, DNS là tiêu chuẩn

# Cilium (có Hubble):
# - Cilium có thể thực thi NetworkPolicies ảnh hưởng đến DNS
# - Sử dụng quy tắc 'toFQDNs' trong CiliumNetworkPolicy cho các chính sách đầu ra dựa trên FQDN
# - Các phản hồi CoreDNS bị Cilium chặn để điền vào ánh xạ FQDN → IP
```

<a id="123-building-coredns-with-custom-plugins"></a>
<a id="heading-72-123-building-coredns-with-custom-plugins"></a>

### 12.3 Tòa nhà CoreDNS với các plugin tùy chỉnh

```bash
# Các plugin CoreDNS là các gói Go triển khai giao diện plugin.Handler:
# gõ giao diện xử lý {
#     ServeDNS(ctx context.Context, w dns.ResponseWriter, r *dns.Msg) (int, lỗi)
#     Chuỗi tên()
# }

# Xây dựng các bước:
git clone https://github.com/coredns/coredns
cd coredns

# 1. Thêm plugin vào plugin.cfg (order = chuỗi thứ tự)
echo "myplugin:github.com/myorg/coredns-myplugin" >> plugin.cfg

# 2. Xây dựng
make

# 3. Chứa đựng
docker build -t my-coredns:v1.13.2-custom .
docker push myregistry/my-coredns:v1.13.2-custom

# 4. Cập nhật triển khai
kubectl set image deployment/coredns coredns=myregistry/my-coredns:v1.13.2-custom -n kube-system

# 5. Sử dụng trong Corefile
# .:53 {
#     giá trị cấu hình myplugin
#     kubernetes cluster.local
#     chuyển tiếp . /etc/resolv.conf
# }
```

---

*Hướng dẫn tham khảo của chuyên gia CoreDNS — v1.1 — Dựa trên CoreDNS trên Kubernetes 1.35 — Tháng 2 năm 2026*

---

<a id="references"></a>
<a id="heading-73-references"></a>

## Tài liệu tham khảo

<a id="coredns-official"></a>
<a id="heading-74-coredns-official"></a>

### CoreDNS chính thức


<a id="coredns-plugin-documentation"></a>
<a id="heading-75-coredns-plugin-documentation"></a>

### Tài liệu về plugin CoreDNS


<a id="kubernetes-official-documentation"></a>
<a id="heading-76-kubernetes-official-documentation"></a>

### Tài liệu chính thức của Kubernetes


<a id="internet-standards-rfcs"></a>
<a id="heading-77-internet-standards-rfcs"></a>

### Tiêu chuẩn Internet (RFC)


<a id="multi-cluster-dns"></a>
<a id="heading-78-multi-cluster-dns"></a>

### Nhiều cụm DNS


<a id="monitoring--observability"></a>
<a id="heading-79-monitoring-observability"></a>

### Giám sát & Khả năng quan sát


<a id="cka-certification"></a>
<a id="heading-80-cka-certification"></a>

### Chứng nhận CKA


<a id="debugging-tools"></a>
<a id="heading-81-debugging-tools"></a>

### Công cụ gỡ lỗi


<a id="further-reading"></a>
<a id="heading-82-further-reading"></a>

### Đọc thêm



[^coredns-repo]: Kho lưu trữ nguồn CoreDNS - https://github.com/coredns/coredns
[^coredns-website]: Trang web chính thức của CoreDNS — https://coredns.io/
[^coredns-manual]: Hướng dẫn sử dụng CoreDNS (tham khảo plugin đầy đủ) - https://coredns.io/manual/toc/
[^coredns-releases]: CoreDNS GitHub phát hành và nhật ký thay đổi — https://github.com/coredns/coredns/releases
[^coredns-deployment]: Kho lưu trữ CoreDNS Deployment (hướng dẫn nâng cấp và di chuyển) — https://github.com/coredns/deployment
[^cncf-coredns]: Trang dự án CNCF CoreDNS — https://www.cncf.io/projects/coredns/
[^plugin-kubernetes]: Phần bổ trợ `kubernetes` — https://coredns.io/plugins/kubernetes/
[^plugin-forward]: Phần bổ trợ `forward` — https://coredns.io/plugins/forward/
[^plugin-cache]: Phần bổ trợ `cache` — https://coredns.io/plugins/cache/
[^plugin-log]: Phần bổ trợ `log` — https://coredns.io/plugins/log/
[^plugin-errors]: Phần bổ trợ `errors` — https://coredns.io/plugins/errors/
[^plugin-health]: Phần bổ trợ `health` — https://coredns.io/plugins/health/
[^plugin-ready]: Phần bổ trợ `ready` — https://coredns.io/plugins/ready/
[^plugin-prometheus]: Plugin `prometheus` (số liệu) — https://coredns.io/plugins/metrics/
[^plugin-rewrite]: Phần bổ trợ `rewrite` — https://coredns.io/plugins/rewrite/
[^plugin-autopath]: Phần bổ trợ `autopath` — https://coredns.io/plugins/autopath/
[^plugin-hosts]: Phần bổ trợ `hosts` — https://coredns.io/plugins/hosts/
[^plugin-loop]: Phần bổ trợ `loop` — https://coredns.io/plugins/loop/
[^plugin-reload]: Phần bổ trợ `reload` — https://coredns.io/plugins/reload/
[^plugin-loadbalance]: Phần bổ trợ `loadbalance` — https://coredns.io/plugins/loadbalance/
[^plugin-dnssec]: Phần bổ trợ `dnssec` — https://coredns.io/plugins/dnssec/
[^plugin-file]: Phần bổ trợ `file` — https://coredns.io/plugins/file/
[^plugin-template]: Phần bổ trợ `template` — https://coredns.io/plugins/template/
[^plugin-import]: Phần bổ trợ `import` — https://coredns.io/plugins/import/
[^k8s-dns-concepts]: DNS dành cho Services và Pods — https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
[^k8s-custom-dns]: Tùy chỉnh DNS Service — https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/
[^k8s-dns-debug]: Gỡ lỗi Phân giải DNS - https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/
[^k8s-coredns-migration]: Sử dụng CoreDNS cho Service Discovery (di chuyển từ kube-dns) — https://kubernetes.io/docs/tasks/administer-cluster/coredns/
[^k8s-nodelocal]: Sử dụng NodeLocal DNSCache trong cụm Kubernetes - https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/
[^k8s-dns-autoscale]: Tự động co giãn DNS Service trong một cụm — https://kubernetes.io/docs/tasks/administer-cluster/dns-horizontal-autoscaling/
[^k8s-pod-dns-config]: Cấu hình DNS của Pod — https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-s-dns-config
[^k8s-endpointslices]: EndpointSlices — https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/
[^k8s-statefulset-dns]: StatefulSet: ID mạng ổn định — https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id
[^k8s-externalname]: Service Loại ExternalName — https://kubernetes.io/docs/concepts/services-networking/service/#externalname
[^k8s-netpol]: Chính sách mạng — https://kubernetes.io/docs/concepts/services-networking/network-policies/
[^kubeadm-coredns]: kubeadm - Sử dụng CoreDNS làm tiện ích bổ sung DNS - https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/#config-file
[^k8s-pdb]: PodDisruptionBudget — https://kubernetes.io/docs/tasks/run-application/configure-pdb/
[^rfc1035]: RFC 1035 — Tên miền: Triển khai và đặc tả — https://www.rfc-editor.org/rfc/rfc1035
[^rfc7858]: RFC 7858 - Đặc điểm kỹ thuật cho DNS qua Bảo mật lớp vận chuyển (DoT) - https://www.rfc-editor.org/rfc/rfc7858
[^rfc8484]: RFC 8484 — DNS Truy vấn qua HTTPS (DoH) — https://www.rfc-editor.org/rfc/rfc8484
[^rfc9250]: RFC 9250 — DNS qua kết nối QUIC chuyên dụng (DoQ) — https://www.rfc-editor.org/rfc/rfc9250
[^rfc6763]: RFC 6763 — DNS dựa trên Service Discovery (bản ghi DNS-SD / SRV) — https://www.rfc-editor.org/rfc/rfc6763
[^rfc4592]: RFC 4592 — Role của ký tự đại diện trong hệ thống tên miền — https://www.rfc-editor.org/rfc/rfc4592
[^plugin-multicluster]: Tài liệu bổ trợ CoreDNS `multicluster` — https://coredns.io/plugins/multicluster/
[^mcs-api-spec]: kubernetes-sigs/mcs-api - Định nghĩa ServiceImport & ServiceExport CRD (thông số API ổn định được sử dụng bởi plugin multicluster) - https://github.com/kubernetes-sigs/mcs-api
[^prometheus-docs]: Tài liệu Prometheus — https://prometheus.io/docs/
[^coredns-metrics]: Tham khảo số liệu CoreDNS (plugin prometheus) - https://coredns.io/plugins/metrics/
[^cka-curriculum]: Chương trình giảng dạy CNCF - Quản trị viên Kubernetes được chứng nhận - https://github.com/cncf/curriculum
[^cka-exam-info]: Tổng quan về kỳ thi CKA — Quỹ Linux — https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/
[^netshoot]: nicolaka/netshoot — Hộp đựng dao quân đội Thụy Sĩ khắc phục sự cố mạng — https://github.com/nicolaka/netshoot
[^busybox]: BusyBox — Con dao quân đội Thụy Sĩ nhúng Linux — https://busybox.net/
[^coredns-blog]: Blog CoreDNS (thông báo plugin, bình luận ghi chú phát hành) - https://coredns.io/blog/
[^kubernetes-sig-network]: Mạng SIG Kubernetes (đề xuất DNS & KEP) — https://github.com/kubernetes/community/tree/master/sig-network
[^coredns-community]: Cộng đồng CoreDNS (thảo luận GitHub, họp cộng đồng) — https://github.com/coredns/coredns/blob/master/COMMUNITY.md
