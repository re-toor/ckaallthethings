# Cập nhật kiến thức CKA cho Kubernetes 1.35

> **Mốc kiểm tra: 17/09/2026.** Trang CKA và FAQ của Linux Foundation hiện công bố môi trường thi dùng **Kubernetes v1.35**. Repo này bám phiên bản thi, không tự chuyển sang bản Kubernetes mới nhất. Trước ngày thi, kiểm tra lại [FAQ chính thức](https://docs.linuxfoundation.org/tc-docs/certification/faq-cka-ckad-cks).

## Phạm vi ôn tập và cách dùng bộ tài liệu

| Lĩnh vực CKA | Tỷ trọng | Nội dung cần thực hành |
|---|---:|---|
| Kiến trúc, cài đặt và cấu hình cụm | 25% | RBAC, kubeadm, HA, nâng cấp, Helm, Kustomize, CRD và Operator |
| Workload và lập lịch | 15% | Deployment, cấu hình ứng dụng, autoscaling, probe, tài nguyên và lập lịch |
| Service và mạng | 20% | Kết nối Pod, Service, Gateway API, Ingress, NetworkPolicy, CoreDNS |
| Lưu trữ | 10% | StorageClass, PV/PVC, chế độ truy cập và cấp phát volume |
| Xử lý sự cố | 30% | Cụm và node, thành phần hệ thống, tài nguyên, log, mạng |

Nguồn: [đề cương CKA của Linux Foundation](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/). Một tính năng mới không mặc nhiên là nội dung chắc chắn xuất hiện trong đề thi. Các bài trong repo là bài tự luyện, không phải đề thi thật.

Đọc tài liệu Kubernetes đầy đủ để học nền tảng; dùng các hướng dẫn Gateway API, Ingress và CoreDNS để luyện thao tác. Bản tra cứu mạng Linux có nhiều lệnh ngoài phạm vi CKA: ưu tiên `ip`, `ss`, `curl`, `dig`, `nslookup`, `tcpdump` và cách đọc kết quả. Công cụ có sẵn phụ thuộc máy thực hành; trong kỳ thi, tuân theo chỉ dẫn của từng bài.

## Node Linux: kiểm tra cgroup và runtime trước khi nâng cấp

Kubelet 1.35 mặc định đặt `failCgroupV1: true`. Node còn dùng cgroup v1 có thể không khởi động được kubelet. Chuẩn bị lab bằng cgroup v2; `SystemdCgroup = true` chỉ chọn trình điều khiển, không chuyển hệ điều hành từ cgroup v1 sang v2.

```bash
# Chạy trên từng node; kết quả mong đợi là cgroup2fs
stat -fc %T /sys/fs/cgroup

# Xác định phiên bản và trạng thái runtime
containerd --version
sudo crictl info
sudo systemctl status containerd kubelet --no-pager
sudo journalctl -u kubelet -n 100 --no-pager
```

`failCgroupV1: false` là cách tương thích tạm thời, không phải cấu hình khuyến nghị cho lab mới. Xem [KubeletConfiguration 1.35](https://v1-35.docs.kubernetes.io/docs/reference/config-api/kubelet-config.v1beta1/) và [cgroup v2](https://v1-35.docs.kubernetes.io/docs/concepts/architecture/cgroups/).

Kubernetes 1.35 là nhánh cuối còn hỗ trợ containerd 1.x. Khi dùng containerd 2.x, tạo cấu hình bằng chính binary đã cài; đường dẫn plugin CRI khác 1.x. Hai phía kubelet/runtime phải thống nhất trình điều khiển cgroup. Lab này tắt swap để dùng cấu hình kubeadm mặc định; Kubernetes vẫn có hỗ trợ swap có điều kiện, nên không hiểu thành “Kubernetes tuyệt đối không hỗ trợ swap”. Nguồn: [container runtime](https://v1-35.docs.kubernetes.io/docs/setup/production-environment/container-runtimes/) và [swap trên Linux](https://v1-35.docs.kubernetes.io/docs/concepts/cluster-administration/swap-memory-management/).

## Nâng cấp kubeadm từ 1.34 lên 1.35

Không bỏ qua phiên bản minor. Sao lưu etcd, kiểm tra cgroup/CNI/runtime, rồi nâng cấp từng control plane trước các worker. Chọn bản vá **1.35.x** có trong kho; nếu đề bài chỉ định phiên bản thì dùng đúng phiên bản đó. Không coi `1.35.0` là bản vá mới nhất.

Trên từng node cần nâng cấp, đổi kho APT sang 1.35 và xác định gói đích:

```bash
sudo install -d -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.35/deb/Release.key |
  sudo gpg --dearmor --yes -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /' |
  sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
apt-cache madison kubeadm

# Ví dụ lấy bản 1.35.x cao nhất hiện có; có thể gán phiên bản đề bài yêu cầu.
K8S_PKG_VERSION=$(apt-cache madison kubeadm | awk '$3 ~ /^1\.35\./ {print $3}' | sort -V | tail -1)
test -n "$K8S_PKG_VERSION" || exit 1
K8S_TARGET="v${K8S_PKG_VERSION%%-*}"
printf 'Gói: %s; Kubernetes: %s\n' "$K8S_PKG_VERSION" "$K8S_TARGET"

sudo apt-mark unhold kubeadm
sudo apt-get install -y "kubeadm=$K8S_PKG_VERSION"
sudo apt-mark hold kubeadm
```

Trên control plane đầu tiên:

```bash
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply "$K8S_TARGET"
```

Trên mỗi control plane còn lại hoặc worker, sau khi nâng cấp gói kubeadm:

```bash
sudo kubeadm upgrade node
```

Với **từng node**, dùng máy có kubeconfig quản trị để drain trước khi nâng kubelet. Thay tên bên dưới bằng tên node thật. `--delete-emptydir-data` chỉ dùng khi đã chấp nhận mất dữ liệu `emptyDir`; nếu PDB chặn drain, kiểm tra nguyên nhân trước.

```bash
# Máy quản trị: mỗi lần chỉ bảo trì một node
NODE_NAME=worker-1
kubectl drain "$NODE_NAME" --ignore-daemonsets

# Trên node đang bảo trì: dùng cùng K8S_PKG_VERSION đã chọn ở trên
sudo apt-mark unhold kubelet kubectl
sudo apt-get install -y "kubelet=$K8S_PKG_VERSION" "kubectl=$K8S_PKG_VERSION"
sudo apt-mark hold kubelet kubectl
sudo systemctl daemon-reload
sudo systemctl restart kubelet

# Máy quản trị: xác minh node Ready rồi mở lại lập lịch
kubectl get nodes -o wide
kubectl uncordon "$NODE_NAME"
kubectl get pods -A
```

Nguồn: [quy trình nâng cấp kubeadm 1.35](https://v1-35.docs.kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/) và [chính sách chênh lệch phiên bản](https://v1-35.docs.kubernetes.io/docs/setup/release/version-skew-policy/). Kubelet không được mới hơn kube-apiserver; kubectl được hỗ trợ trong phạm vi lệch một minor so với kube-apiserver, với giới hạn chặt hơn nếu các API server khác phiên bản.

## Thay đổi CPU và bộ nhớ của Pod tại chỗ

**In-place Pod resize ổn định trong 1.35.** Có thể thay `requests`/`limits` CPU, bộ nhớ của container qua subresource `/resize`, không cần xoá Pod. `resizePolicy` quyết định việc phải khởi động lại container; thay đổi không bảo đảm luôn được áp dụng ngay nếu node thiếu tài nguyên. Không được đổi lớp QoS của Pod.

```bash
kubectl create namespace resize-lab
kubectl apply -n resize-lab -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: resize-demo
spec:
  containers:
  - name: app
    image: nginx:stable
    resources:
      requests:
        cpu: 100m
        memory: 64Mi
      limits:
        cpu: 500m
        memory: 128Mi
    resizePolicy:
    - resourceName: cpu
      restartPolicy: NotRequired
    - resourceName: memory
      restartPolicy: RestartContainer
EOF
kubectl wait -n resize-lab --for=condition=Ready pod/resize-demo --timeout=120s
kubectl patch pod resize-demo -n resize-lab --subresource=resize --type=merge \
  -p '{"spec":{"containers":[{"name":"app","resources":{"requests":{"cpu":"200m","memory":"64Mi"},"limits":{"cpu":"750m","memory":"128Mi"}}}]}}'
kubectl get pod resize-demo -n resize-lab -o yaml
```

Quan sát `status.conditions` (`PodResizePending`, `PodResizeInProgress`) và tài nguyên thực tế trong `status.containerStatuses`. Việc đổi image và việc resize là hai thao tác khác nhau. Danh sách container, tên container, `command`, `args` của Pod hiện hữu vẫn có các ràng buộc bất biến. Đổi template của Deployment vẫn tạo rollout; VPA là thành phần bổ sung, không tự xuất hiện khi nâng Kubernetes.

Nguồn: [hướng dẫn resize dành cho 1.35](https://v1-35.docs.kubernetes.io/docs/tasks/configure-pod-container/resize-container-resources/).

## Service, EndpointSlice và kube-proxy

Khi Service không có backend, kiểm tra selector, nhãn Pod, readiness và EndpointSlice:

```bash
kubectl get svc web -n default -o yaml
kubectl get pods -n default --show-labels -o wide
kubectl get endpointslices -n default -l kubernetes.io/service-name=web -o yaml
```

API Endpoints đã bị đánh dấu deprecated từ 1.33; vẫn có thể gặp trong bài thực hành cũ nhưng nên đọc EndpointSlice. `trafficDistribution: PreferSameZone` và `PreferSameNode` ổn định trong 1.35. Đây là **ưu tiên** vị trí backend; khác với ràng buộc `internalTrafficPolicy: Local` hoặc `externalTrafficPolicy: Local`, có thể làm rơi lưu lượng khi không có endpoint cục bộ.

Nguồn: [Service 1.35](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/service/) và [định tuyến Service](https://v1-35.docs.kubernetes.io/docs/reference/networking/virtual-ips/).

Chế độ IPVS của kube-proxy bị deprecated trong 1.35 nhưng chưa bị xoá. Khi gặp cụm dùng IPVS vẫn phải biết chẩn đoán; với lab mới, chọn iptables hoặc nftables phù hợp kernel và CNI. Không đổi chế độ proxy trong kỳ thi nếu đề không yêu cầu. Nguồn: [ghi chú Kubernetes 1.35](https://kubernetes.io/blog/2025/12/17/kubernetes-v1-35-release/).

## Gateway API và Ingress: phân biệt API với controller

Gateway API là tập CRD và cần controller triển khai; nó không tự được cài khi nâng Kubernetes. Trước khi áp dụng ví dụ, kiểm tra tài nguyên và phiên bản mà cụm hỗ trợ:

```bash
kubectl api-resources --api-group=gateway.networking.k8s.io
kubectl get gatewayclass
kubectl get gateway,httproute -A
kubectl describe gateway web-gateway -n default
```

Ưu tiên luyện GatewayClass, Gateway, HTTPRoute, listener, `parentRefs`, `backendRefs`, `allowedRoutes` và ReferenceGrant. Kiểm tra các điều kiện `Accepted`, `Programmed`, `ResolvedRefs` đúng trên loại tài nguyên tương ứng. Phiên bản Gateway API và controller phải theo ma trận tương thích, không suy ra từ Kubernetes 1.35. Xem [tài liệu Gateway API](https://gateway-api.sigs.k8s.io/) và [ma trận Envoy Gateway](https://gateway.envoyproxy.io/news/releases/matrix/).

**Ingress NGINX của cộng đồng đã kết thúc bảo trì từ tháng 3/2026.** Các ví dụ annotation `nginx.ingress.kubernetes.io/*` trong repo được giữ để học cách đọc cấu hình cũ và xử lý bài có sẵn controller. Không dùng manifest cài Ingress NGINX cũ làm khuyến nghị cho cụm mới. API `networking.k8s.io/v1 Ingress` vẫn tồn tại; dự án controller ngừng bảo trì không có nghĩa API Ingress bị xoá. Nguồn: [thông báo ngừng Ingress NGINX](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/) và [API Ingress](https://v1-35.docs.kubernetes.io/docs/concepts/services-networking/ingress/).

## Sao lưu và khôi phục etcd

Với etcd hiện đại, dùng `etcdctl` để chụp snapshot của cụm đang chạy; dùng **`etcdutl`** để kiểm tra và khôi phục snapshot. Khôi phục là thao tác ngoại tuyến, không cần truyền chứng chỉ truy cập API etcd cho `etcdutl`.

```bash
sudo etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/healthcheck-client.crt \
  --key=/etc/kubernetes/pki/etcd/healthcheck-client.key \
  snapshot save /backup/snapshot.db
sudo etcdutl snapshot status /backup/snapshot.db -w table

# Ví dụ cho lab một thành viên: dừng thành phần liên quan trước khi phục hồi.
# Thư mục đích phải mới; điều chỉnh tên/địa chỉ theo cấu hình cụm thực tế.
sudo etcdutl snapshot restore /backup/snapshot.db \
  --data-dir=/var/lib/etcd-restored \
  --name=controlplane1 \
  --initial-cluster=controlplane1=https://10.10.10.11:2380 \
  --initial-advertise-peer-urls=https://10.10.10.11:2380 \
  --bump-revision=1000000000 --mark-compacted
```

Revision bump và đánh dấu compact giúp watcher/informer của Kubernetes bỏ cache cũ sau phục hồi. Với nhiều thành viên, dùng cùng snapshot và cấu hình membership nhất quán trên từng thành viên. Sau đó cập nhật `hostPath` thư mục dữ liệu trong static Pod manifest, kiểm tra quyền truy cập, khởi động lại thành phần và xác minh API/Pod. Không áp dụng cấu hình một thành viên vào cụm nhiều thành viên đang chạy. Nguồn: [khôi phục etcd 3.6](https://etcd.io/docs/v3.6/op-guide/recovery/).

## Giới hạn của lab cài đặt trong repo

Lab hiện có **1 HAProxy + 2 control plane + 2 worker** để luyện cài đặt và join. Với stacked etcd, hai thành viên cần cả hai để có quorum; mất một thành viên là mất quorum. Một HAProxy cũng là điểm lỗi đơn. Đây chưa phải kiến trúc HA chịu lỗi cho production.

Để luyện HA chịu mất một control plane, bố trí ít nhất ba control plane/etcd và đầu vào API có dự phòng. Số worker không thay đổi quorum etcd. Nguồn: [topology HA kubeadm](https://v1-35.docs.kubernetes.io/docs/setup/production-environment/tools/kubeadm/ha-topology/).

## Kiến thức mở rộng: đọc đúng mức độ ổn định

Image volume ở mức beta và bật mặc định trong 1.35, nhưng còn phụ thuộc runtime hỗ trợ (chẳng hạn containerd 2.1+). Pod-level resources vẫn là beta trong 1.35; không nhầm với resize tài nguyên từng container đã ổn định. Xem [volume](https://v1-35.docs.kubernetes.io/docs/concepts/storage/volumes/) và [quản lý tài nguyên](https://v1-35.docs.kubernetes.io/docs/concepts/configuration/manage-resources-containers/). Không dành thời gian cài tính năng thử nghiệm trong bài thi nếu không được yêu cầu.

## Danh sách tự kiểm tra trước ngày thi

- Kiểm tra phiên bản thi và tài liệu được phép truy cập trên trang Linux Foundation.
- Luôn dùng đúng context, node và namespace đề bài chỉ định.
- Tự tạo và sửa manifest với `kubectl explain`, `--dry-run=client -o yaml` và `kubectl diff` khi phù hợp.
- Luyện một vòng nâng cấp, drain/uncordon, sao lưu/khôi phục và xử lý node NotReady trên lab riêng.
- Chẩn đoán mạng theo đường đi: Pod → Service/EndpointSlice → DNS → NetworkPolicy → Gateway/Ingress.
- Xác minh trạng thái thực tế sau thao tác; không chỉ kiểm tra lệnh trả về thành công.
