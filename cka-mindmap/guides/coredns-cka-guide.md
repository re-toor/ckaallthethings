<a id="coredns--cka-2026-exam-complete-step-by-step-practice-guide"></a>
<a id="heading-0-coredns-cka-2026-exam-complete-step-by-step-pra"></a>

# Kỳ thi CoreDNS — CKA 2026: Hướng dẫn thực hành từng bước đầy đủ

> **Bản tiếng Việt · CKA Kubernetes 1.35 · cập nhật 17/09/2026.** Đọc [các thay đổi cho phiên bản thi](kubernetes-1.35-update.md).


> **Phạm vi ôn thi:** CoreDNS thuộc lĩnh vực Service và mạng (20%); việc chẩn đoán cũng liên quan lĩnh vực xử lý sự cố (30%). Không có tỷ trọng riêng chính thức cho CoreDNS.[^cka-curriculum]
> **Thời gian luyện tập mục tiêu:** Biết cách hoàn thành bất kỳ nhiệm vụ CoreDNS nào trong vòng chưa đầy 5 phút
> **Các công cụ có sẵn trong kỳ thi:** `kubectl`, `vim`/`nano`, `nslookup`, `dig`, `curl`, `crictl`


---

<a id="table-of-contents"></a>
<a id="heading-1-table-of-contents"></a>

## Mục lục

1. [Kiến thức nền tảng (Phải ghi nhớ)](#1-foundation-knowledge)
2. [Nhiệm vụ 01 - Kiểm tra và xác minh CoreDNS](#task-01--inspect--verify-coredns)
3. [Nhiệm vụ 02 - Kiểm tra phân giải DNS từ bên trong Pod](#task-02--test-dns-resolution-from-inside-a-pod)
4. [Nhiệm vụ 03 - Thêm tên miền sơ khai tùy chỉnh](#task-03--add-a-custom-stub-domain)
5. [Nhiệm vụ 04 - Thêm mục nhập máy chủ tĩnh](#task-04--add-static-host-entries)
6. [Nhiệm vụ 05 - Định cấu hình Pod DNS với Cài đặt tùy chỉnh](#task-05--configure-pod-dns-with-custom-settings)
7. [Nhiệm vụ 06 - Gỡ lỗi: CoreDNS Pods Crashing](#task-06--debug-coredns-pods-crashing)
8. [Nhiệm vụ 07 - Gỡ lỗi: Service Không giải quyết được](#task-07--debug-service-not-resolving)
9. [Nhiệm vụ 08 - Gỡ lỗi: Đã phát hiện vòng lặp DNS](#task-08--debug-dns-loop-detected)
10. [Nhiệm vụ 09 - Tỷ lệ CoreDNS](#task-09--scale-coredns)
11. [Nhiệm vụ 10 - Nâng cấp CoreDNS Image](#task-10--upgrade-coredns-image)
12. [Nhiệm vụ 11 - Khôi phục Corefile](#task-11--restore-broken-corefile) bị hỏng
13. [Nhiệm vụ 12 - Định cấu hình ExternalName Service](#task-12--configure-externalname-service)
14. [Nhiệm vụ 13 - Xác minh Service không đầu DNS](#task-13--verify-headless-service-dns)
15. [Nhiệm vụ 14 - Sửa Pod với dnsPolicy](#task-14--fix-a-pod-with-wrong-dnspolicy) sai
16. [Nhiệm vụ 15 - Kích hoạt tính năng ghi nhật ký truy vấn tạm thời](#task-15--enable-temporary-query-logging)
17. [Mô phỏng bài kiểm tra đầy đủ (Tính thời gian)](#full-exam-simulation-timed)
18. [Thẻ tham khảo nhanh](#quick-reference-card)

---

<a id="1-foundation-knowledge"></a>
<a id="heading-2-1-foundation-knowledge"></a>

## 1. Kiến thức nền tảng

Trước khi thực hiện bất kỳ nhiệm vụ nào, hãy ghi những thông tin này vào bộ nhớ.

<a id="coredns-object-locations-k8s-coredns-migration"></a>
<a id="heading-3-coredns-object-locations-k8s-coredns-migration"></a>

### Vị trí đối tượng CoreDNS [^k8s-coredns-migration]

```
Namespace:      kube-system
Deployment:     coredns
Service:        kube-dns
ConfigMap:      coredns  (contains the Corefile)
Labels on pods: k8s-app=kube-dns
```

<a id="dns-naming-pattern-the-most-tested-thing-k8s-dns-concepts"></a>
<a id="heading-4-dns-naming-pattern-the-most-tested-thing-k8s-d"></a>

### Mẫu đặt tên DNS (điều được thử nghiệm nhiều nhất) [^k8s-dns-concepts]

```
<service-name>.<namespace>.svc.<cluster-domain>
      │              │              └── cluster.local (mặc định)
      │              └──────────────── Tên namespace
      └─────────────────────────────── service name

Examples:
  kubernetes.default.svc.cluster.local           ← Kubernetes API service
  my-app.production.svc.cluster.local            ← cross-namespace
  cassandra-0.cassandra.default.svc.cluster.local ← StatefulSet pod
  10-0-0-5.default.pod.cluster.local             ← pod by IP (if enabled)
```

<a id="pods-etcresolvconf-know-this-by-heart"></a>
<a id="heading-5-pods-etcresolvconf-know-this-by-heart"></a>

### /etc/resolv.conf của Pod (Hãy thuộc nằm lòng điều này)

```
nameserver 10.96.0.10            ← kube-dns Service ClusterIP
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

<a id="default-corefile-memorize-the-structure"></a>
<a id="heading-6-default-corefile-memorize-the-structure"></a>

### Corefile mặc định (Ghi nhớ cấu trúc)

```corefile
.:53 {
    errors                              # Thứ 1: bắt lỗi
    health {                            # Thứ 2: điểm cuối sống động :8080/health
        lameduck 5s
    }
    ready                               # Thứ 3: điểm cuối sẵn sàng :8181/ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {   # Thứ 4: DNS nội bộ
        pods insecure
        fallthrough in-addr.arpa ip6.arpa
        ttl 30
    }
    prometheus :9153                    # Thứ 5: số liệu
    forward . /etc/resolv.conf {        # Thứ 6: DNS bên ngoài
        max_concurrent 1000
    }
    cache 30                            # Thứ 7: phản hồi bộ đệm
    loop                                # Thứ 8: phát hiện vòng lặp
    reload                              # Lần 9: tải lại nóng
    loadbalance                         # Lần 10: thi đấu vòng tròn
}
```

<a id="dnspolicy-values-k8s-pod-dns-config"></a>
<a id="heading-7-dnspolicy-values-k8s-pod-dns-config"></a>

### Giá trị chính sách dns[^k8s-pod-dns-config]

| Giá trị | Máy chủ tên được sử dụng |
|---|---|
| `ClusterFirst` (mặc định) | CoreDNS (kube-dns ClusterIP) |
| `ClusterFirstWithHostNet` | CoreDNS (dành cho `hostNetwork: true` pods) |
| `Default` | DNS của riêng nút (KHÔNG phải CoreDNS) |
| `None` | Phải chỉ định trong `dnsConfig` |

---

<a id="task-01--inspect--verify-coredns"></a>
<a id="heading-8-task-01-inspect-verify-coredns"></a>

## Nhiệm vụ 01 - Kiểm tra và xác minh CoreDNS

**Dạng câu hỏi bài kiểm tra:** *"Xác minh rằng CoreDNS đang hoạt động chính xác trong cụm. Liệt kê pods đang chạy, chi tiết dịch vụ và cấu hình Corefile hiện tại."*

<a id="step-by-step"></a>
<a id="heading-9-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Kiểm tra Pod ở trạng thái Running và Ready
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

**Sản lượng dự kiến:**
```
NAME                       READY   STATUS    RESTARTS   AGE
coredns-5d78c9869d-abc12   1/1     Running   0          5d
coredns-5d78c9869d-def34   1/1     Running   0          5d
```

```bash
# BƯỚC 2: Kiểm tra Service
kubectl get svc kube-dns -n kube-system
```

**Sản lượng dự kiến:**
```
NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
kube-dns   ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   5d
```

```bash
# BƯỚC 3: Xác nhận Service có Endpoints (có thể truy cập pods)
kubectl get endpoints kube-dns -n kube-system
```

**Sản lượng dự kiến:**
```
NAME       ENDPOINTS                                              AGE
kube-dns   10.0.0.12:53,10.0.0.13:53   5d
# Nên liệt kê IP:53 cho mỗi CoreDNS pod
```

```bash
# BƯỚC 4: Xem Corefile hiện tại
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}'
# HOẶC xem toàn bộ ConfigMap với siêu dữ liệu:
kubectl get configmap coredns -n kube-system -o yaml
```

```bash
# BƯỚC 5: Kiểm tra chi tiết triển khai
kubectl describe deployment coredns -n kube-system

# BƯỚC 6: Kiểm tra phiên bản CoreDNS đang chạy
kubectl get deployment coredns -n kube-system \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
```

**Xác minh:** Tất cả pods Running + 1/1 Ready, dịch vụ kube-dns đều có điểm cuối. ✓

---

<a id="task-02--test-dns-resolution-from-inside-a-pod"></a>
<a id="heading-10-task-02-test-dns-resolution-from-inside-a-pod"></a>

## Nhiệm vụ 02 - Kiểm tra phân giải DNS từ bên trong Pod

**Dạng câu hỏi kiểm tra:** *"Xác minh rằng phân giải DNS đang hoạt động bên trong cụm. Xác nhận rằng cả tên dịch vụ nội bộ và tên miền bên ngoài đều có thể được giải quyết."*

<a id="step-by-step-1"></a>
<a id="heading-11-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Khởi chạy trình gỡ lỗi pod (sử dụng busybox:1.28 - có nslookup và sh)
kubectl run dns-test \
  --image=busybox:1.28 \
  --restart=Never \
  -it \
  --rm \
  -- sh
```

> **Mẹo CKA:** `busybox:1.28` là DNS tiêu chuẩn gỡ lỗi image trong bài kiểm tra.[^netshoot] Các phiên bản busybox mới hơn đã bị hỏng `nslookup`. Nếu không có, hãy sử dụng `nicolaka/netshoot`.[^netshoot]

```bash
# Bên trong pod - chạy tất cả những thứ này:

# BƯỚC 2: Xác minh /etc/resolv.conf là chính xác
cat /etc/resolv.conf
# Nên hiển thị:
# máy chủ tên 10.96.0.10
# tìm kiếm default.svc.cluster.local svc.cluster.local cluster.local
# tùy chọn ndots:5

# BƯỚC 3: Kiểm tra nội bộ Kubernetes DNS
nslookup kubernetes
# Expected: resolves kubernetes.default.svc.cluster.local → ClusterIP

nslookup kubernetes.default.svc.cluster.local
# FQDN trực tiếp - sẽ trả về cùng một IP

# BƯỚC 4: Kiểm tra chéo namespace (dịch vụ kube-dns có trong kube-system)
nslookup kube-dns.kube-system.svc.cluster.local

# BƯỚC 5: Kiểm tra DNS bên ngoài
nslookup google.com
# Nên trả lại IP của Google

# BƯỚC 6: Kiểm tra bằng dig (dài dòng hơn)
# Trước tiên hãy thoát khỏi busybox, sử dụng netshoot để đào:
exit
```

```bash
# Đối với thử nghiệm dựa trên đào:
kubectl run dns-test \
  --image=nicolaka/netshoot \
  --restart=Never \
  -it \
  --rm \
  -- bash

# Netshoot bên trong:
dig kubernetes.default.svc.cluster.local A
dig @10.96.0.10 kubernetes.default.svc.cluster.local   # truy vấn trực tiếp CoreDNS
dig google.com A
dig -x 10.96.0.1    # tra cứu ngược
exit
```

<a id="what-to-look-for-in-exam-answers"></a>
<a id="heading-12-what-to-look-for-in-exam-answers"></a>

### Những gì cần tìm trong câu trả lời bài kiểm tra

- DNS nội bộ hoạt động (kubernetes.default giải quyết) → Plugin `kubernetes` OK
- DNS bên ngoài hoạt động (google.com giải quyết) → Plugin `forward` OK
- resolv.conf có máy chủ tên và miền tìm kiếm chính xác → kubelet được định cấu hình chính xác

---

<a id="task-03--add-a-custom-stub-domain"></a>
<a id="heading-13-task-03-add-a-custom-stub-domain"></a>

## Nhiệm vụ 03 - Thêm tên miền sơ khai tùy chỉnh

**Dạng câu hỏi bài kiểm tra:** *"Định cấu hình CoreDNS để chuyển tiếp tất cả truy vấn DNS cho miền `db.local` tới máy chủ DNS tại `10.96.100.10`. Tất cả các truy vấn khác sẽ tiếp tục sử dụng cấu hình DNS ngược dòng hiện tại."*

<a id="step-by-step-2"></a>
<a id="heading-14-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Sao lưu ConfigMap hiện tại
kubectl get configmap coredns -n kube-system -o yaml > /tmp/coredns-backup.yaml
echo "Backup saved to /tmp/coredns-backup.yaml"

# BƯỚC 2: Chỉnh sửa ConfigMap
kubectl edit configmap coredns -n kube-system
```

Trong trình chỉnh sửa, thêm miền sơ khai **INSIDE** khối `.:53 { }`, **trước** dòng `forward . /etc/resolv.conf` chính:

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
    forward db.local. 10.96.100.10          # ← THÊM DÒNG NÀY (tên miền sơ khai)
    forward . /etc/resolv.conf {            # ← Cái này ở lại, xử lý mọi thứ khác
        max_concurrent 1000
    }
    cache 30
    loop
    reload
    loadbalance
}
```

Lưu và thoát (`:wq` trong vim).

```bash
# BƯỚC 3: Xác minh ConfigMap đã được lưu
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}'
# Xác nhận bạn thấy: chuyển tiếp db.local. 10.96.100.10

# BƯỚC 4: Đợi tải lại nóng HOẶC buộc khởi động lại
# Tùy chọn A: Đợi ~30 giây (plugin tải lại sẽ nhận các thay đổi)
sleep 35

# Tùy chọn B: Buộc khởi động lại ngay lập tức
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# BƯỚC 5: Xác minh không có lỗi trong nhật ký CoreDNS
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=20
# Look for: [INFO] plugin/reload: Running configuration MD5 = ...
# Không có dòng [ERROR] hoặc [FATAL]

# BƯỚC 6: Kiểm tra tên miền sơ khai (mô phỏng từ pod)
kubectl run stub-test --image=busybox:1.28 --restart=Never -it --rm -- sh
# Bên trong pod:
nslookup anyname.db.local
# Nên chuyển tiếp tới 10.96.100.10 (có thể trả về NXDOMAIN nếu không có máy chủ đó,
# nhưng nó KHÔNG nên quay lại ngay lập tức mà không cố gắng chuyển tiếp)
# Việc không có "hết thời gian kết nối" tới sai máy chủ là chìa khóa
exit
```

> **Mẹo CKA:** Người chấm bài thi sẽ xác minh nội dung ConfigMap VÀ CoreDNS đã tải lại mà không có lỗi. Luôn kiểm tra nhật ký sau khi chỉnh sửa.

> **VẤN ĐỀ ĐẶT HÀNG:** Trong khối `.:53`, CoreDNS khớp với các lệnh `forward` từ **cụ thể nhất đến ít cụ thể nhất**. Đặt `forward db.local. 10.x.x.x` **trước** `forward . /etc/resolv.conf`, nếu không thì `forward .` tổng hợp sẽ xử lý `db.local` trước tiên.

---

<a id="task-04--add-static-host-entries"></a>
<a id="heading-15-task-04-add-static-host-entries"></a>

## Nhiệm vụ 04 - Thêm mục nhập máy chủ tĩnh

**Dạng câu hỏi thi:** *"Định cấu hình CoreDNS để tên máy chủ `legacy-app.internal` phân giải thành IP `192.168.50.100` cho tất cả pods trong cụm."*

<a id="step-by-step-3"></a>
<a id="heading-16-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Sao lưu
kubectl get configmap coredns -n kube-system -o yaml > /tmp/coredns-backup.yaml

# BƯỚC 2: Chỉnh sửa ConfigMap
kubectl edit configmap coredns -n kube-system
```

Thêm khối plugin `hosts` **trước** `prometheus` và **sau** `kubernetes` trong khối .:53:

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
        fallthrough                     # ← QUAN TRỌNG: cần phải vượt qua để chuyển tiếp
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
# BƯỚC 3: Xác minh đã lưu
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}'

# BƯỚC 4: Tải lại
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# BƯỚC 5: Kiểm tra nhật ký để tìm lỗi
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=20

# BƯỚC 6: Độ phân giải kiểm tra
kubectl run hosts-test --image=busybox:1.28 --restart=Never -it --rm -- sh
# Bên trong:
nslookup legacy-app.internal
# Dự kiến:
# Máy chủ: 10.96.0.10
# Địa chỉ: 10.96.0.10:53
# Tên: di sản-app.internal
# Địa chỉ: 192.168.50.100
exit
```

> **Lỗi thường gặp:** Quên `fallthrough` trong khối `hosts`. Nếu không có `fallthrough`, bất kỳ tên nào KHÔNG có trong khối máy chủ sẽ trả về NXDOMAIN từ plugin máy chủ mà không cần thử plugin `forward`. Điều này phá vỡ phân giải DNS bên ngoài.

---

<a id="task-05--configure-pod-dns-with-custom-settings"></a>
<a id="heading-17-task-05-configure-pod-dns-with-custom-settings"></a>

## Nhiệm vụ 05 - Định cấu hình Pod DNS với cài đặt tùy chỉnh

**Dạng câu hỏi thi:** *"Tạo Pod có tên `custom-dns-pod` trong `default` namespace với image `nginx:alpine`. Định cấu hình nó để sử dụng máy chủ DNS tại `8.8.8.8` làm máy chủ tên chính và `8.8.4.4` là thứ cấp, với `ndots` được đặt thành `2`. pod KHÔNG nên sử dụng cụm DNS."*

<a id="step-by-step-4"></a>
<a id="heading-18-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Tạo manifest pod
cat << 'EOF' > /tmp/custom-dns-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: custom-dns-pod
  namespace: default
spec:
  dnsPolicy: None       # BẮT BUỘC khi thay thế hoàn toàn cấu hình DNS
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

# BƯỚC 2: Nộp hồ sơ
kubectl apply -f /tmp/custom-dns-pod.yaml

# STEP 3: Wait for pod to be Running
kubectl get pod custom-dns-pod -w
# Ctrl+C once Running

# BƯỚC 4: Xác minh /etc/resolv.conf bên trong pod
kubectl exec custom-dns-pod -- cat /etc/resolv.conf
# Dự kiến:
# máy chủ tên 8.8.8.8
# máy chủ tên 8.8.4.4
# tùy chọn ndots:2

# BƯỚC 5: Xác minh DNS hoạt động
kubectl exec custom-dns-pod -- nslookup google.com
# Nên hoạt động thông qua 8.8.8.8

# Lưu ý: tên nội bộ của cụm sẽ không được phân giải (dnsPolicy: Không, không có cụm DNS)
kubectl exec custom-dns-pod -- nslookup kubernetes
# Điều này sẽ THẤT BẠI - hành vi được mong đợi chỉ với DNS bên ngoài
```

**Biến thể: Cụm mở rộng DNS với các tùy chọn bổ sung (giữ ClusterFirst)**

```bash
# Câu hỏi thi: "Giữ ClusterFirst DNS nhưng giảm ndots xuống còn 2 cho pod"
cat << 'EOF' > /tmp/augmented-dns-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: augmented-dns-pod
  namespace: default
spec:
  dnsPolicy: ClusterFirst    # giữ cụm DNS
  dnsConfig:
    options:
      - name: ndots
        value: "2"           # chỉ ghi đè ndots
  containers:
    - name: nginx
      image: nginx:alpine
EOF

kubectl apply -f /tmp/augmented-dns-pod.yaml
kubectl exec augmented-dns-pod -- cat /etc/resolv.conf
# Dự kiến:
# máy chủ tên 10.96.0.10 ← cụm DNS (từ ClusterFirst)
# tìm kiếm default.svc.cluster.local svc.cluster.local cluster.local
# tùy chọn ndots:2 ← từ dnsConfig (ghi đè ndots mặc định:5)
```

---

<a id="task-06--debug-coredns-pods-crashing"></a>
<a id="heading-19-task-06-debug-coredns-pods-crashing"></a>

## Nhiệm vụ 06 - Gỡ lỗi: CoreDNS Pods gặp sự cố

**Dạng câu hỏi thi:** *"CoreDNS pods nằm trong CrashLoopBackOff. Chẩn đoán và khắc phục sự cố."*

<a id="step-by-step-5"></a>
<a id="heading-20-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Xác nhận sự cố
kubectl get pods -n kube-system -l k8s-app=kube-dns
# NAME                        READY   STATUS             RESTARTS   AGE
# coredns-xxx-yyy 0/1 CrashLoopBackOff 5 3m

# BƯỚC 2: Đọc nhật ký sự cố
kubectl logs -n kube-system -l k8s-app=kube-dns
# Đồng thời lấy nhật ký sự cố trước đó:
kubectl logs -n kube-system -l k8s-app=kube-dns --previous

# BƯỚC 3: Tìm thông báo lỗi cụ thể
# Thông báo sự cố thường gặp:

# A) Lỗi cú pháp trong Corefile:
# [ERROR] Không thể khởi tạo (các) máy chủ: không thể biên dịch Corefile: ...
# [ERROR] Không thể khởi động (các) máy chủ: vùng không hợp lệ

# B) Vòng lặp được phát hiện:
# [FATAL] plugin/loop: Đã phát hiện vòng lặp (127.0.0.1:xxx -> :53) cho vùng "."

# C) Không tìm thấy plugin (lỗi đánh máy hoặc tên plugin sai):
# [ERROR] Không thể khởi động (các) máy chủ: lệnh 'chuyển tiếp' không xác định

# D) OOMKilled (từ mô tả):
# Trạng thái cuối cùng: Đã chấm dứt / Lý do: OOMKilled

# BƯỚC 4A: Sửa lỗi cú pháp Corefile
kubectl edit configmap coredns -n kube-system
# Sửa lỗi cú pháp - những lỗi phổ biến:
# - Lỗi đánh máy: 'chuyển tiếp' nên là 'chuyển tiếp'
# - Thiếu nẹp
# - Thụt lề sai (Corefile sử dụng tab HOẶC dấu cách nhưng không trộn lẫn)
# - Tên lệnh không hợp lệ

# BƯỚC 4B: Sửa vòng lặp
kubectl edit configmap coredns -n kube-system
# Thay đổi: chuyển tiếp. /etc/resolv.conf
# Tới: chuyển tiếp . 8.8.8.8 8.8.4.4

# STEP 4C: Fix OOM
kubectl patch deployment coredns -n kube-system --type json -p '[
  {"op":"replace",
   "path":"/spec/template/spec/containers/0/resources/limits/memory",
   "value":"256Mi"}
]'

# BƯỚC 5: Khởi động lại sau khi sửa lỗi
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# STEP 6: Verify pods are now Running
kubectl get pods -n kube-system -l k8s-app=kube-dns
# NAME                        READY   STATUS    RESTARTS   AGE
# coredns-xxx-yyy             1/1     Running   0          30s

# BƯỚC 7: Xác minh DNS hoạt động
kubectl run verify-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup kubernetes
```

---

<a id="task-07--debug-service-not-resolving"></a>
<a id="heading-21-task-07-debug-service-not-resolving"></a>

## Nhiệm vụ 07 - Gỡ lỗi: Service Không giải quyết được

**Dạng câu hỏi bài kiểm tra:** *"pod trong `app` namespace không thể giải quyết dịch vụ `database.data.svc.cluster.local`. Chẩn đoán và khắc phục sự cố."*

<a id="step-by-step-6"></a>
<a id="heading-22-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Xác minh dịch vụ tồn tại
kubectl get svc database -n data
# Nếu không tìm thấy: tên dịch vụ hoặc namespace sai!

# BƯỚC 2: Kiểm tra điểm cuối dịch vụ
kubectl get endpoints database -n data
# Nếu điểm cuối trống: không có pods nào khớp với bộ chọn (pods không phải nhãn ready/wrong)

# BƯỚC 3: Kiểm tra phân giải DNS từ pod trong 'ứng dụng' namespace
kubectl run dns-diag -n app --image=busybox:1.28 --restart=Never -it --rm -- sh
# Bên trong:
cat /etc/resolv.conf
# Nên bao gồm: tìm kiếm app.svc.cluster.local svc.cluster.local cluster.local

nslookup database.data.svc.cluster.local
# Nếu NXDOMAIN → DNS có vấn đề về cấp độ
# Nếu Máy chủ không tìm thấy → mạng tới CoreDNS bị chặn

nslookup database.data
# Dạng ngắn hơn (sử dụng tên miền tìm kiếm)
exit

# BƯỚC 4: Kiểm tra trực tiếp DNS với CoreDNS pod
COREDNS_POD=$(kubectl get pods -n kube-system -l k8s-app=kube-dns \
  -o jsonpath='{.items[0].metadata.name}')

kubectl exec -n kube-system $COREDNS_POD -- \
  nslookup database.data.svc.cluster.local 127.0.0.1
# Nếu điều này hoạt động nhưng Bước 3 không → chặn chính sách mạng pod→CoreDNS

# BƯỚC 5: Kiểm tra xem NetworkPolicy có chặn DNS không
kubectl get networkpolicies -n app
# Hãy tìm các quy tắc đi ra - chúng có cho phép UDP/TCP cổng 53 không?

# BƯỚC 6: Kiểm tra xem CoreDNS có thể đạt tới k8s API hay không (nếu plugin kubernetes bị lỗi)
kubectl logs -n kube-system $COREDNS_POD | grep -i "error\|timeout\|refused"

# BƯỚC 7: Kiểm tra CoreDNS RBAC (phải có khả năng xem các dịch vụ và điểm cuối)
kubectl auth can-i list services \
  --as=system:serviceaccount:kube-system:coredns
kubectl auth can-i list endpointslices \
  --as=system:serviceaccount:kube-system:coredns
# Cả hai đều là 'có' — nếu 'không', RBAC bị hỏng (khôi phục hệ thống:coredns ClusterRole)

# BƯỚC 8: Xác minh dnsPolicy của pod bị ảnh hưởng
kubectl get pod <affected-pod-name> -n app -o jsonpath='{.spec.dnsPolicy}'
# Phải là 'ClusterFirst' hoặc trống (mặc định = ClusterFirst)
```

---

<a id="task-08--debug-dns-loop-detected"></a>
<a id="heading-23-task-08-debug-dns-loop-detected"></a>

## Nhiệm vụ 08 - Gỡ lỗi: Đã phát hiện vòng lặp DNS

**Dạng câu hỏi bài kiểm tra:** *"CoreDNS pods đang gặp sự cố do lỗi phát hiện vòng lặp. Hãy khắc phục sự cố."*

<a id="step-by-step-7"></a>
<a id="heading-24-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Xác nhận lỗi vòng lặp trong nhật ký
kubectl logs -n kube-system -l k8s-app=kube-dns --previous
# Lỗi dự kiến:
# [FATAL] plugin/loop: Đã phát hiện vòng lặp (127.0.0.1:54321 -> :53) cho vùng "."

# BƯỚC 2: Kiểm tra xem /etc/resolv.conf trên node nói gì
# (CoreDNS sử dụng dnsPolicy mặc định = DNS của node)
# Để kiểm tra: thực thi vào CoreDNS pod hoặc kiểm tra trực tiếp trên node
kubectl exec -n kube-system \
  $(kubectl get pods -n kube-system -l k8s-app=kube-dns -o jsonpath='{.items[0].metadata.name}') \
  -- cat /etc/resolv.conf
# Nếu nó hiển thị: nameserver 127.0.0.53 hoặc 127.0.0.1 → xác nhận vòng lặp

# BƯỚC 3: Sửa Corefile - sử dụng DNS ngược dòng rõ ràng
kubectl edit configmap coredns -n kube-system
```

Thay đổi điều này:
```corefile
forward . /etc/resolv.conf {
    max_concurrent 1000
}
```

Về điều này:
```corefile
forward . 8.8.8.8 8.8.4.4 {
    max_concurrent 1000
}
```

```bash
# HOẶC nếu bạn biết IP DNS ngược dòng thực tế của cụm:
# chuyển tiếp . <node-upstream-dns-ip>

# BƯỚC 4: Khởi động lại CoreDNS
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# BƯỚC 5: Xác minh không còn lỗi vòng lặp
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=20
# Should see: [INFO] plugin/reload: Running configuration MD5 = ...
# KHÔNG có dòng [FATAL]

# BƯỚC 6: Xác minh DNS hoạt động
kubectl run loop-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup google.com
```

---

<a id="task-09--scale-coredns"></a>
<a id="heading-25-task-09-scale-coredns"></a>

## Nhiệm vụ 09 - Thang đo CoreDNS

**Dạng câu hỏi bài kiểm tra:** *"Cụm đang gặp sự cố về hiệu suất DNS. Chia quy mô triển khai CoreDNS thành 4 bản sao và đảm bảo pods được trải rộng trên các node khác nhau."*

<a id="step-by-step-8"></a>
<a id="heading-26-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Kiểm tra bản sao hiện tại
kubectl get deployment coredns -n kube-system
# MONG MUỐN=2, HIỆN TẠI=2, SẴN SÀNG=2 (trạng thái ban đầu)

# BƯỚC 2: Co giãn thành 4 bản sao
kubectl scale deployment coredns -n kube-system --replicas=4

# BƯỚC 3: Xác minh tỷ lệ
kubectl get deployment coredns -n kube-system
# Sẽ hiển thị DESIRED=4

kubectl get pods -n kube-system -l k8s-app=kube-dns -o wide
# Sẽ hiển thị 4 pods - kiểm tra cột NODE để xem phân phối

# BƯỚC 4: Thêm tính năng chống ái lực cứng (đảm bảo pods trên các node khác nhau)
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

# BƯỚC 5: Chờ triển khai
kubectl rollout status deployment coredns -n kube-system

# BƯỚC 6: Xác minh pods nằm trên nodes khác nhau
kubectl get pods -n kube-system -l k8s-app=kube-dns -o wide
# Cột NODE sẽ hiển thị 4 tên node khác nhau

# BƯỚC 7: Xác minh DNS vẫn hoạt động sau khi co giãn
kubectl run scale-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup kubernetes
```

---

<a id="task-10--upgrade-coredns-image"></a>
<a id="heading-27-task-10-upgrade-coredns-image"></a>

## Bài 10 - Cập nhật image CoreDNS theo yêu cầu

**Bài tự luyện:** *"Cập nhật CoreDNS từ phiên bản hiện tại lên `registry.k8s.io/coredns/coredns:v1.13.1`."*

<a id="step-by-step-9"></a>
<a id="heading-28-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Kiểm tra phiên bản hiện tại
kubectl get deployment coredns -n kube-system \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
# Ví dụ cụm cũ có thể dùng v1.11.1; ghi lại phiên bản thực tế để rollback.

# BƯỚC 2: Lưu triển khai hiện tại làm bản sao lưu
kubectl get deployment coredns -n kube-system -o yaml > /tmp/coredns-deployment-backup.yaml

# BƯỚC 3: Cập nhật image
kubectl set image deployment/coredns \
  coredns=registry.k8s.io/coredns/coredns:v1.13.1 \
  -n kube-system

# BƯỚC 4: Theo dõi cập nhật luân phiên
kubectl rollout status deployment coredns -n kube-system
# Đang chờ quá trình triển khai "coredns" hoàn tất: 1 trong 2 bản sao mới đã được cập nhật...
# Đang đợi quá trình triển khai "coredns" hoàn tất: 1 bản sao cũ đang chờ chấm dứt...
# Triển khai "coredns" đã triển khai thành công

# BƯỚC 5: Xác minh phiên bản mới
kubectl get deployment coredns -n kube-system \
  -o jsonpath='{.spec.template.spec.containers[0].image}'
# Sẽ hiển thị: registry.k8s.io/coredns/coredns:v1.13.1

kubectl get pods -n kube-system -l k8s-app=kube-dns
# Both pods should be Running 1/1

# BƯỚC 6: Kiểm tra DNS vẫn hoạt động
kubectl run upgrade-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup kubernetes

# BƯỚC 7: Nếu có sự cố - khôi phục
kubectl rollout undo deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system
```

---

<a id="task-11--restore-broken-corefile"></a>
<a id="heading-29-task-11-restore-broken-corefile"></a>

## Nhiệm vụ 11 - Khôi phục Corefile bị hỏng

**Dạng câu hỏi thi:** *"CoreDNS không hoạt động. Corefile trong ConfigMap đã bị hỏng. Hãy khôi phục nó về trạng thái hoạt động."*

<a id="step-by-step-10"></a>
<a id="heading-30-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Kiểm tra trạng thái và nhật ký pod
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns

# BƯỚC 2: Xem Corefile hiện tại (bị hỏng)
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}'
# Sẽ chứa errors/garbage

# BƯỚC 3: Thay thế bằng Corefile đã biết sử dụng
# Get the kube-dns ClusterIP first:
CLUSTER_DNS=$(kubectl get svc kube-dns -n kube-system -o jsonpath='{.spec.clusterIP}')
echo "DNS Service IP: $CLUSTER_DNS"

# Viết ConfigMap bằng Corefile đúng:
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

# BƯỚC 4: Áp dụng bản sửa lỗi
kubectl apply -f /tmp/coredns-fix.yaml

# BƯỚC 5: Khởi động lại CoreDNS để nhận bản sửa lỗi ngay lập tức
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# BƯỚC 6: Xác minh pods đang chạy
kubectl get pods -n kube-system -l k8s-app=kube-dns
# Both pods: Running 1/1

# BƯỚC 7: Kiểm tra nhật ký thành công
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=10
# Look for: plugin/reload: Running configuration MD5 = ...

# BƯỚC 8: Xác minh đầy đủ DNS
kubectl run fix-test --image=busybox:1.28 --restart=Never -it --rm -- sh
# Bên trong:
nslookup kubernetes
nslookup google.com
exit
```

---

<a id="task-12--configure-externalname-service"></a>
<a id="task-12--configure-externalname-service-k8s-externalname"></a>
<a id="heading-31-task-12-configure-externalname-service-k8s-ext"></a>

## Nhiệm vụ 12 - Định cấu hình ExternalName Service [^k8s-externalname]

**Dạng câu hỏi thi:** *"Tạo Service có tên `external-api` trong `default` namespace thuộc loại ExternalName trỏ đến `api.example.com`."*

<a id="step-by-step-11"></a>
<a id="heading-32-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Tạo dịch vụ ExternalName
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

# BƯỚC 2: Xác minh dịch vụ đã được tạo
kubectl get svc external-api -n default
# Sẽ hiển thị: TYPE=ExternalName, EXTERNAL-IP=api.example.com

kubectl describe svc external-api -n default

# BƯỚC 3: Xác minh phân giải DNS từ bên trong pod
kubectl run ext-test --image=busybox:1.28 --restart=Never -it --rm -- sh
# Bên trong:
nslookup external-api.default.svc.cluster.local
# Phản hồi dự kiến: tên chuẩn = api.example.com.
# (Phản hồi CNAME trỏ đến tên máy chủ bên ngoài)
exit

# BƯỚC 4: Hiểu chuyện gì đã xảy ra
# CoreDNS tạo ra:
# bên ngoài-api.default.svc.cluster.local → CNAME → api.example.com
# Sau đó, máy khách sẽ phân giải api.example.com thông qua DNS bên ngoài
```

---

<a id="task-13--verify-headless-service-dns"></a>
<a id="task-13--verify-headless-service-dns-k8s-statefulset-dns"></a>
<a id="heading-33-task-13-verify-headless-service-dns-k8s-statef"></a>

## Nhiệm vụ 13 - Xác minh Service không đầu DNS [^k8s-statefulset-dns]

**Dạng câu hỏi bài kiểm tra:** *"Một StatefulSet có tên `web` với 3 bản sao tồn tại trong `default` namespace với dịch vụ không đầu `web-headless`. Xác minh rằng các tên pod DNS riêng lẻ giải quyết chính xác."*

<a id="step-by-step-12"></a>
<a id="heading-34-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Xác minh dịch vụ headless tồn tại
kubectl get svc web-headless -n default
# Dự kiến: CLUSTER-IP=Không có (không đầu)

kubectl get svc web-headless -n default -o jsonpath='{.spec.clusterIP}'
# Nên xuất: Không có

# BƯỚC 2: Kiểm tra pods
kubectl get pods -n default -l app=web -o wide
# Sẽ hiển thị: web-0, web-1, web-2 với IP của họ

# BƯỚC 3: Nhận IP pod
kubectl get pods -n default -l app=web \
  -o custom-columns='NAME:.metadata.name,IP:.status.podIP'

# BƯỚC 4: Kiểm tra độ phân giải pod DNS riêng lẻ
kubectl run headless-test --image=busybox:1.28 --restart=Never -it --rm -- sh
# Bên trong:

# Kiểm tra dịch vụ không đầu (phải trả về TẤT CẢ IP pod)
nslookup web-headless.default.svc.cluster.local
# Dự kiến: nhiều bản ghi A, một bản ghi cho mỗi pod

# Kiểm tra cá nhân pods
nslookup web-0.web-headless.default.svc.cluster.local
nslookup web-1.web-headless.default.svc.cluster.local
nslookup web-2.web-headless.default.svc.cluster.local
# Mỗi người sẽ trả về IP của pod đó

exit

# BƯỚC 5: Tìm hiểu mẫu đặt tên DNS
# StatefulSet pods: <pod-name>.<headless-svc>.<namespace>.svc.cluster.local
# web-0.web-headless.default.svc.cluster.local → IP của Pod web-0
```

---

<a id="task-14--fix-a-pod-with-wrong-dnspolicy"></a>
<a id="heading-35-task-14-fix-a-pod-with-wrong-dnspolicy"></a>

## Nhiệm vụ 14 - Sửa Pod với dnsPolicy sai

**Dạng câu hỏi bài kiểm tra:** *"pod có tên `broken-pod` trong `prod` namespace không thể phân giải tên dịch vụ nội bộ của cụm. Nó có thể phân giải các miền bên ngoài. Sửa cấu hình DNS của pod mà không xóa và tạo lại nó."*

<a id="step-by-step-13"></a>
<a id="heading-36-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Điều tra pod
kubectl get pod broken-pod -n prod -o jsonpath='{.spec.dnsPolicy}'
# Đầu ra: Mặc định
# "Mặc định" = sử dụng node DNS, KHÔNG phải cụm DNS — giải thích tại sao lỗi nội bộ!

# BƯỚC 2: Kiểm tra resolv.conf bên trong pod
kubectl exec broken-pod -n prod -- cat /etc/resolv.conf
# Hiển thị DNS của node (e.g., nameserver 192.168.1.1) — không có miền tìm kiếm cluster.local

# BƯỚC 3: Vì dnsPolicy nằm trong thông số pod, bạn PHẢI tạo lại pod
# (Thông số Pod là bất biến đối với dnsPolicy)
# Trước tiên hãy lấy manifest pod
kubectl get pod broken-pod -n prod -o yaml > /tmp/broken-pod.yaml

# BƯỚC 4: Chỉnh sửa manifest
vim /tmp/broken-pod.yaml
# Thay đổi: dnsPolicy: Mặc định
# Tới: dnsPolicy: ClusterFirst
# Đồng thời xóa: ResourceVersion, uid, CreationTimestamp, khối trạng thái

# BƯỚC 5: Xóa và tạo lại
kubectl delete pod broken-pod -n prod
kubectl apply -f /tmp/broken-pod.yaml

# STEP 6: Wait for pod to be Running
kubectl get pod broken-pod -n prod -w

# BƯỚC 7: Xác minh bản sửa lỗi
kubectl exec broken-pod -n prod -- cat /etc/resolv.conf
# Bây giờ sẽ hiển thị: nameserver 10.96.0.10

kubectl exec broken-pod -n prod -- nslookup kubernetes.default.svc.cluster.local
# Nên giải quyết ngay!
```

> **Lưu ý:** Nếu pod được quản lý bởi Deployment, thay vào đó hãy chỉnh sửa Deployment:
> ``` bash
> Triển khai chỉnh sửa kubectl <name> -n prod
> # Thay đổi spec.template.spec.dnsPolicy: Mặc định → ClusterFirst
> # Deployment sẽ tự động cập nhật pods
> ```

---

<a id="task-15--enable-temporary-query-logging"></a>
<a id="heading-37-task-15-enable-temporary-query-logging"></a>

## Nhiệm vụ 15 - Kích hoạt tính năng ghi nhật ký truy vấn tạm thời

**Dạng câu hỏi thi:** *"Bật ghi nhật ký truy vấn DNS trong CoreDNS để gỡ lỗi các lỗi phân giải không liên tục. Sau khi bật, hãy hiển thị đầu ra nhật ký."*

<a id="step-by-step-14"></a>
<a id="heading-38-step-by-step"></a>

### Từng bước một

```bash
# BƯỚC 1: Chỉnh sửa CoreDNS ConfigMap để thêm plugin 'log'
kubectl edit configmap coredns -n kube-system
```

Thêm `log` làm **dòng thứ hai** (sau `errors`, trước `health`):

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
# BƯỚC 2: Lưu và xác minh ConfigMap
kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}' | grep log

# BƯỚC 3: Đợi tải lại nóng (~30 giây) HOẶC buộc khởi động lại
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# BƯỚC 4: Tạo một số lưu lượng truy cập DNS
kubectl run dns-traffic --image=busybox:1.28 --restart=Never -- \
  sh -c "for i in $(seq 1 10); do nslookup kubernetes.default; done"

# BƯỚC 5: Xem nhật ký truy vấn
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30
# Sẽ thấy những dòng như:
# [THÔNG TIN] 10.0.0.5:45678 - 1234 "kubernetes.default. TRONG udp 37 false 512" NOERROR qr,aa,rd 90 0.0001s

# BƯỚC 6: Dọn dẹp - QUAN TRỌNG! Xóa 'log' sau khi gỡ lỗi
kubectl edit configmap coredns -n kube-system
# Xóa dòng 'log'

kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system

# BƯỚC 7: Xác minh nhật ký bị vô hiệu hóa
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=10
# KHÔNG nên xem dòng nhật ký cho mỗi truy vấn nữa
```

---

<a id="full-exam-simulation-timed"></a>
<a id="heading-39-full-exam-simulation-timed"></a>

## Mô phỏng bài kiểm tra đầy đủ (Tính thời gian)

> **Hướng dẫn:** Hoàn thành tất cả các nhiệm vụ bên dưới trong 25 phút. Điều này mô phỏng một kịch bản cụm kỳ thi CKA thực tế. Hãy dành thời gian cho chính mình.

<a id="scenario-setup"></a>
<a id="heading-40-scenario-setup"></a>

### Thiết lập kịch bản

Giả sử một cụm mới có trạng thái CoreDNS bị cố tình phá vỡ.

---

<a id="q1--4-min-investigate-and-report-coredns-health"></a>
<a id="heading-41-q1-4-min-investigate-and-report-coredns-health"></a>

### [Q1 - 4 phút] Điều tra và báo cáo tình trạng của CoreDNS

1. Liệt kê tất cả CoreDNS pods và trạng thái của chúng
2. Hiển thị kube-dns Service ClusterIP
3. Xuất ra Corefile hiện tại

```bash
# Lệnh của bạn ở đây:
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl get svc kube-dns -n kube-system -o jsonpath='{.spec.clusterIP}'
kubectl get cm coredns -n kube-system -o jsonpath='{.data.Corefile}'
```

---

<a id="q2--4-min-add-stub-domain"></a>
<a id="heading-42-q2-4-min-add-stub-domain"></a>

### [Q2 — 4 phút] Thêm tên miền sơ khai

Định cấu hình CoreDNS để chuyển tiếp tất cả các truy vấn cho `legacy.company.com` tới máy chủ DNS tại `10.100.0.1`.

```bash
# Giải pháp:
kubectl get cm coredns -n kube-system -o yaml > /tmp/coredns-bak.yaml
kubectl edit cm coredns -n kube-system
# Thêm vào trước từ chính chuyển tiếp . dòng:
# chuyển tiếp legacy.company.com. 10.100.0.1
kubectl rollout restart deployment coredns -n kube-system
kubectl rollout status deployment coredns -n kube-system
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=5
```

---

<a id="q3--3-min-test-dns"></a>
<a id="heading-43-q3-3-min-test-dns"></a>

### [Q3 — 3 phút] Kiểm tra DNS

Chạy pod và xác nhận rằng `kubernetes.default.svc.cluster.local` đã được giải quyết.

```bash
# Giải pháp:
kubectl run q3-test --image=busybox:1.28 --restart=Never -it --rm -- nslookup kubernetes.default.svc.cluster.local
```

---

<a id="q4--5-min-create-pod-with-custom-dns"></a>
<a id="heading-44-q4-5-min-create-pod-with-custom-dns"></a>

### [Q4 — 5 phút] Tạo pod với DNS tùy chỉnh

Tạo pod `dns-custom` trong namespace `dev` (tạo namespace nếu cần) với image `busybox:1.28`:
- Sử dụng `ClusterFirst` DNS
- Đã đặt `ndots` thành `1`

```bash
# Giải pháp:
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
# Xác minh: tùy chọn ndots:1 có mặt
```

---

<a id="q5--3-min-fix-coredns-oom"></a>
<a id="heading-45-q5-3-min-fix-coredns-oom"></a>

### [Q5 — 3 phút] Sửa CoreDNS OOM

CoreDNS pods đang là OOMKilled. Tăng giới hạn bộ nhớ lên 200Mi.

```bash
# Giải pháp:
kubectl patch deployment coredns -n kube-system --type json -p '[
  {"op":"replace",
   "path":"/spec/template/spec/containers/0/resources/limits/memory",
   "value":"200Mi"}
]'
kubectl rollout status deployment coredns -n kube-system
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

---

<a id="q6--3-min-externalname-service"></a>
<a id="heading-46-q6-3-min-externalname-service"></a>

### [Q6 — 3 phút] ExternalName Service

Tạo Service `ext-db` trong `default` namespace thuộc loại `ExternalName` trỏ tới `db.legacy.example.com`.

```bash
# Giải pháp:
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

<a id="q7--3-min-scale-coredns"></a>
<a id="heading-47-q7-3-min-scale-coredns"></a>

### [Q7 — 3 phút] Thang âm CoreDNS

Co giãn CoreDNS thành 3 bản sao.

```bash
# Giải pháp:
kubectl scale deployment coredns -n kube-system --replicas=3
kubectl rollout status deployment coredns -n kube-system
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

---

<a id="scoring"></a>
<a id="heading-48-scoring"></a>

### Ghi điểm

| Nhiệm vụ | Điểm tối đa | Điểm của bạn |
|---|---|---|
| Câu 1: Kiểm tra CoreDNS | 4 |  |
| Q2: Tên miền sơ khai | 6 |  |
| Câu 3: Kiểm tra DNS | 3 |  |
| Q4: pod DNS tùy chỉnh | 7 |  |
| Câu 5: Khắc phục OOM | 4 |  |
| Q6: ExternalName | 5 |  |
| Câu 7: Tỉ lệ | 3 |  |
| **Tổng cộng** | **32** |  |

---

<a id="quick-reference-card"></a>
<a id="heading-49-quick-reference-card"></a>

## Thẻ tham khảo nhanh

```
╔═════════════════════════════════════════════════════════════════════════╗
║          COREDNS CKA QUICK REFERENCE CARD                               ║
╠═════════════════════════════════════════════════════════════════════════╣
║ LOCATION                                                                ║
║   Namespace: kube-system                                              ║
║   Deployment: lõi                                                  ║
║   Service: kube-dns (cổng 53 UDP+TCP, số liệu 9153)                ║
║   ConfigMap: coredns (chứa Corefile)                        ║
║   Nhãn Pod: k8s-app=kube-dns                                         ║
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
║   Kiểm tra DNS:                                                             ║
║	kubectl run t --image=busybox:1.28 -it --rm -- nslookup kubernetes    ║
╠═════════════════════════════════════════════════════════════════════════╣
║ DNS NAMING                                                              ║
║   Service:     <svc>.<ns>.svc.cluster.local                             ║
║   IP Pod: <ip-dashes>.<ns>.pod.cluster.local                       ║
║   StatefulSet: <pod>.<headless-svc>.<ns>.svc.cluster.local              ║
║   K8s API:     kubernetes.default.svc.cluster.local                     ║
╠═════════════════════════════════════════════════════════════════════════╣
║ DNS POLICIES                                                            ║
║   ClusterFirst (mặc định) → CoreDNS                                      ║
║   ClusterFirstWithHostNet → CoreDNS (dành cho HostNetwork pods)              ║
║   Mặc định → DNS của nút (bỏ qua CoreDNS)                               ║
║   Không có → Phải cung cấp dnsConfig                                         ║
╠═════════════════════════════════════════════════════════════════════════╣
║ STUB MIỀN (thêm bên trong khối .:53, TRƯỚC KHI chuyển tiếp .)                   ║
║   chuyển tiếp stub.domain. <dns-server-ip>                                  ║
╠═════════════════════════════════════════════════════════════════════════╣
║ MÁY CHỦ TĨNH (thêm bên trong khối .:53)                                    ║
║   máy chủ { 1.2.3.4 hostname.domain; thất bại }                        ║
╠═════════════════════════════════════════════════════════════════════════╣
║ RESOLVE.CONF EXPECTED                                                   ║
║   nameserver 10.96.0.10  (kube-dns ClusterIP)                           ║
║   search <ns>.svc.cluster.local svc.cluster.local cluster.local         ║
╠═════════════════════════════════════════════════════════════════════════╣
```

---

*Hướng dẫn thực hành CKA CoreDNS — v1.1 — Tháng 2 năm 2026 — Dựa trên CoreDNS trên Kubernetes 1.35*

---

<a id="references"></a>
<a id="heading-0-references"></a>

## Tài liệu tham khảo

<a id="coredns-official"></a>
<a id="heading-1-coredns-official"></a>

### CoreDNS chính thức


<a id="coredns-plugin-documentation"></a>
<a id="heading-2-coredns-plugin-documentation"></a>

### Tài liệu về plugin CoreDNS


<a id="kubernetes-official-documentation"></a>
<a id="heading-3-kubernetes-official-documentation"></a>

### Tài liệu chính thức của Kubernetes


<a id="cka-certification"></a>
<a id="heading-4-cka-certification"></a>

### Chứng nhận CKA


<a id="debugging-tools"></a>
<a id="heading-5-debugging-tools"></a>

### Công cụ gỡ lỗi


<a id="further-reading"></a>
<a id="heading-6-further-reading"></a>

### Đọc thêm


[^coredns-repo]: Kho lưu trữ nguồn CoreDNS - https://github.com/coredns/coredns
[^coredns-website]: Trang web chính thức của CoreDNS — https://coredns.io/
[^coredns-manual]: Hướng dẫn sử dụng CoreDNS (tham khảo plugin đầy đủ & cú pháp Corefile) — https://coredns.io/manual/toc/
[^coredns-releases]: CoreDNS GitHub phát hành và nhật ký thay đổi — https://github.com/coredns/coredns/releases
[^coredns-deployment]: Kho lưu trữ CoreDNS Deployment (hướng dẫn nâng cấp) — https://github.com/coredns/deployment
[^plugin-kubernetes]: Tham khảo plugin `kubernetes` - https://coredns.io/plugins/kubernetes/
[^plugin-forward]: Tham khảo plugin `forward` - https://coredns.io/plugins/forward/
[^plugin-cache]: Tham khảo plugin `cache` - https://coredns.io/plugins/cache/
[^plugin-log]: Tham khảo plugin `log` - https://coredns.io/plugins/log/
[^plugin-errors]: Tham khảo plugin `errors` - https://coredns.io/plugins/errors/
[^plugin-health]: Tham khảo plugin `health` - https://coredns.io/plugins/health/
[^plugin-ready]: Tham khảo plugin `ready` - https://coredns.io/plugins/ready/
[^plugin-hosts]: Tham khảo plugin `hosts` - https://coredns.io/plugins/hosts/
[^plugin-loop]: Tham khảo plugin `loop` - https://coredns.io/plugins/loop/
[^plugin-reload]: Tham khảo plugin `reload` - https://coredns.io/plugins/reload/
[^k8s-dns-concepts]: DNS dành cho Services và Pods — https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
[^k8s-custom-dns]: Tùy chỉnh DNS Service — https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/
[^k8s-dns-debug]: Gỡ lỗi Phân giải DNS - https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/
[^k8s-coredns-migration]: Sử dụng CoreDNS cho Service Discovery — https://kubernetes.io/docs/tasks/administer-cluster/coredns/
[^k8s-nodelocal]: Sử dụng NodeLocal DNSCache trong cụm Kubernetes - https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/
[^k8s-dns-autoscale]: Tự động co giãn DNS Service trong một cụm — https://kubernetes.io/docs/tasks/administer-cluster/dns-horizontal-autoscaling/
[^k8s-pod-dns-config]: Cấu hình Pod DNS (tham khảo dnsPolicy & dnsConfig) — https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-s-dns-config
[^k8s-endpointslices]: EndpointSlices — https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/
[^k8s-statefulset-dns]: StatefulSet: ID mạng ổn định — https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id
[^k8s-externalname]: Service Loại ExternalName — https://kubernetes.io/docs/concepts/services-networking/service/#externalname
[^k8s-netpol]: Chính sách mạng — https://kubernetes.io/docs/concepts/services-networking/network-policies/
[^kubeadm-coredns]: kubeadm — Cấu hình CoreDNS — https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/#config-file
[^cka-curriculum]: Chương trình giảng dạy CNCF dành cho Quản trị viên Kubernetes được chứng nhận - https://github.com/cncf/curriculum
[^cka-exam-info]: Tổng quan về kỳ thi CKA — Quỹ Linux — https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/
[^cka-handbook]: Cẩm nang ứng viên CKA — https://docs.linuxfoundation.org/tc-docs/certification/lf-handbook2
[^cka-allowed-resources]: Hướng dẫn quan trọng của CKA (tài nguyên được phép trong kỳ thi) - https://docs.linuxfoundation.org/tc-docs/certification/certification-resources-allowed
[^netshoot]: nicolaka/netshoot — Container bộ công cụ gỡ lỗi mạng đầy đủ — https://github.com/nicolaka/netshoot
[^busybox]: BusyBox - Tiện ích Linux tối thiểu (sử dụng v1.28 để làm việc nslookup) - https://busybox.net/
[^coredns-blog]: Blog CoreDNS — https://coredns.io/blog/
[^k8s-concepts-services]: Các khái niệm Kubernetes Service — https://kubernetes.io/docs/concepts/services-networking/service/
[^k8s-pdb]: Định cấu hình PodDisruptionBudget — https://kubernetes.io/docs/tasks/run-application/configure-pdb/
