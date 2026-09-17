<a id="kubernetes-ha-cluster-setup-guide"></a>
<a id="heading-0-kubernetes-ha-cluster-setup-guide"></a>

# Lab Kubernetes 1.35 với nhiều control plane

> **Bản tiếng Việt · CKA Kubernetes 1.35 · cập nhật 17/09/2026.** Đọc [các thay đổi cho phiên bản thi](../guides/kubernetes-1.35-update.md).


<a id="architecture"></a>
<a id="heading-1-architecture"></a>

> **Giới hạn lab:** hai thành viên stacked etcd cần cả hai để có quorum; mất một node là mất quorum. Một HAProxy cũng là điểm lỗi đơn. Muốn HA chịu lỗi, cần ít nhất ba control plane/etcd và đầu vào API có dự phòng.

## Kiến trúc

```
                        +---------------------------+
                        |     loadbalancersrv       |
                        |       10.10.10.10         |
                        |       HAProxy (LB)        |
                        +------------+--------------+
                                     |
                                     | :6443
                          +----------+------------+
                          |                       |
               +----------+-------+    +----------+-------+
               |   controlplane1  |    |   controlplane2  |
               |    10.10.10.11   |    |    10.10.10.12   |
               | Control Plane 1  |    | Control Plane 2  |
               +------------------+    +------------------+

               +----------+-------+    +----------+-------+
               |      node01      |    |      node02      |
               |    10.10.10.14   |    |    10.10.10.15   |
               |     Worker 1     |    |     Worker 2     |
               +------------------+    +------------------+
```

| Tên máy chủ | IP | Role |
|-----------------|-------------|-----------------------|
| loadbalancersrv | 10.10.10.10 | Bộ cân bằng tải HAProxy |
| controlplane1 | 10.10.10.11 | Control Plane 1 |
| controlplane2 | 10.10.10.12 | Control Plane 2 |
| node01 | 10.10.10.14 | Worker 1 |
| node02 | 10.10.10.15 | Worker 2 |

- **Cân bằng tải:** HAProxy trên loadbalancersrv, lưu lượng truy cập API theo vòng tròn tới cả hai control plane
- **Control plane:** Chạy etcd, kube-apiserver, kube-controller-manager, kube-scheduler
- **Worker:** Chạy workloads (pods)
- **CNI:** Calico (pod CIDR: 192.168.0.0/16)
- **Kubernetes:** v1.35

---

<a id="prerequisites"></a>
<a id="heading-2-prerequisites"></a>

## Điều kiện tiên quyết

Các bước sau phải được hoàn thành trên **tất cả K8 nodes** (controlplane1, controlplane2, node01, node02) trước khi tiếp tục.

<a id="1-disable-swap"></a>
<a id="heading-3-1-disable-swap"></a>

### 1. Tắt Hoán đổi

Kubelet sẽ **từ chối bắt đầu** nếu tính năng trao đổi được bật. Đây là một trong những nguyên nhân phổ biến nhất gây ra lỗi kết nối.

```bash
# Vô hiệu hóa trao đổi ngay lập tức
sudo swapoff -a

# Xóa các mục trao đổi khỏi fstab để nó tắt sau khi khởi động lại
sudo sed -i '/swap/d' /etc/fstab

# Nếu có một tệp hoán đổi tồn tại, hãy xóa nó
sudo rm -f /swap.img

# Xác minh tính năng hoán đổi đã tắt (Dòng hoán đổi sẽ hiển thị tất cả các số 0)
free -h
```

> **Cảnh báo:** Nếu bạn bỏ qua bước này, `kubeadm join` có thể thành công nhưng kubelet sẽ gặp sự cố với: `"failed to run Kubelet: running with swap on is not supported"`. Điều này có thể gây ra các lỗi sai lệch như các thành viên etcd không khởi động được khi tham gia control plane.

<a id="2-load-kernel-modules-and-enable-ip-forwarding"></a>
<a id="heading-4-2-load-kernel-modules-and-enable-ip-forwarding"></a>

### 2. Tải mô-đun hạt nhân và kích hoạt chuyển tiếp IP

```bash
# Tải các mô-đun hạt nhân cần thiết
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# Cho phép chuyển tiếp IP và lưu lượng cầu nối
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

**Xác minh tính năng chuyển tiếp IP đang hoạt động:**

```bash
cat /proc/sys/net/ipv4/ip_forward
# Phải quay lại: 1
```

Nếu nó trả về `0`, hãy kích hoạt nó ngay lập tức:

```bash
sudo sysctl -w net.ipv4.ip_forward=1
```

> **Cảnh báo:** `kubeadm init` và `kubeadm join` sẽ bị lỗi với lỗi preflight nếu `ip_forward` không được đặt thành `1`: `"/proc/sys/net/ipv4/ip_forward contents are not set to 1"`. Tệp cấu hình sysctl.d đảm bảo nó vẫn tồn tại trong suốt quá trình khởi động lại, nhưng luôn xác minh trước khi chạy các lệnh kubeadm.

<a id="3-install-and-configure-containerd"></a>
<a id="heading-5-3-install-and-configure-containerd"></a>

> **Kiểm tra cgroup v2:** chạy `stat -fc %T /sys/fs/cgroup` trên mọi node; kết quả phải là `cgroup2fs`. Kubelet 1.35 mặc định từ chối cgroup v1. Đặt `SystemdCgroup = true` không tự bật cgroup v2.

### 3. Cài đặt và cấu hình containerd

```bash
sudo apt-get update
sudo apt-get install -y containerd

# Tạo cấu hình mặc định và kích hoạt SystemdCgroup
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml > /dev/null
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

sudo systemctl restart containerd
sudo systemctl enable containerd
```

<a id="4-install-crictl"></a>
<a id="heading-6-4-install-crictl"></a>

### 4. Cài đặt crictl

```bash
CRICTL_VERSION="v1.35.0"
curl -L "https://github.com/kubernetes-sigs/cri-tools/releases/download/${CRICTL_VERSION}/crictl-${CRICTL_VERSION}-linux-amd64.tar.gz" | sudo tar -C /usr/local/bin -xz

# Định cấu hình crictl để sử dụng containerd
cat <<EOF | sudo tee /etc/crictl.yaml
runtime-endpoint: unix:///run/containerd/containerd.sock
image-endpoint: unix:///run/containerd/containerd.sock
timeout: 10
EOF
```

---

<a id="step-1-configure-etchosts-on-all-nodes"></a>
<a id="heading-7-step-1-configure-etchosts-on-all-nodes"></a>

## Bước 1: Định cấu hình /etc/hosts trên tất cả các nút

Thêm ánh xạ tên máy chủ đến IP để tất cả nodes có thể phân giải lẫn nhau.

**Chạy trên TẤT CẢ 5 máy:**

```bash
cat <<EOF | sudo tee -a /etc/hosts
# --- Nút cụm Kubernetes ---
10.10.10.10  loadbalancersrv
10.10.10.11  controlplane1
10.10.10.12  controlplane2
10.10.10.14  node01
10.10.10.15  node02
# --- Kết thúc các nút cụm Kubernetes ---
EOF
```

**Hoặc sử dụng tập lệnh tự động hóa:**
```bash
./scripts/01-setup-hosts.sh
```

---

<a id="step-2-configure-ufw-firewall"></a>
<a id="heading-8-step-2-configure-ufw-firewall"></a>

## Bước 2: Cấu hình tường lửa UFW

Mỗi vai trò node yêu cầu các cổng khác nhau. Chỉ mở những gì cần thiết cho mỗi vai trò.

<a id="load-balancer-loadbalancersrv"></a>
<a id="heading-9-load-balancer-loadbalancersrv"></a>

### Cân bằng tải (loadbalancersrv)

```bash
sudo ufw allow ssh
sudo ufw allow 6443/tcp    # K8s API - HAProxy lắng nghe ở đây và chuyển tiếp tới control plane
sudo ufw allow 8404/tcp    # Bảng điều khiển thống kê HAProxy
sudo ufw --force enable
sudo ufw reload
```

| Cảng | Giao thức | Mục đích |
|------|----------|-------------------------|
| 22 | TCP | SSH |
| 6443 | TCP | K8s API qua HAProxy |
| 8404 | TCP | Bảng điều khiển thống kê HAProxy |

<a id="control-planes-controlplane1-controlplane2"></a>
<a id="heading-10-control-planes-controlplane1-controlplane2"></a>

### Control plane (controlplane1, controlplane2)

```bash
sudo ufw allow ssh
# Kubernetes control plane
sudo ufw allow 6443/tcp        # Máy chủ API
sudo ufw allow 2379:2380/tcp   # Giao tiếp khách hàng và ngang hàng etcd
sudo ufw allow 10250/tcp       # Kubelet API
sudo ufw allow 10257/tcp       # kube-controller-manager
sudo ufw allow 10259/tcp       # kube-scheduler
sudo ufw allow 10256/tcp       # Kiểm tra sức khỏe kube-proxy
# Calico CNI
sudo ufw allow 179/tcp         # BGP tiên phong
sudo ufw allow 4789/udp        # Đóng gói VXLAN
sudo ufw allow 5473/tcp        # Calico Typha
sudo ufw --force enable
sudo ufw reload
```

| Cảng | Giao thức | Mục đích |
|-----------|----------|-------------------------|
| 22 | TCP | SSH |
| 6443 | TCP | Máy chủ API |
| 2379-2380 | TCP | Máy khách và ngang hàng etcd |
| 10250 | TCP | Kubelet API |
| 10257 | TCP | kube-controller-manager |
| 10259 | TCP | kube-scheduler |
| 10256 | TCP | Kiểm tra sức khỏe kube-proxy |
| 179 | TCP | Calico BGP |
| 4789 | UDP | Calico VXLAN |
| 5473 | TCP | Calico Typha |

<a id="workers-node01-node02"></a>
<a id="heading-11-workers-node01-node02"></a>

### Worker (node01, node02)

```bash
sudo ufw allow ssh
# Kubernetes worker
sudo ufw allow 10250/tcp       # Kubelet API
sudo ufw allow 10256/tcp       # Kiểm tra sức khỏe kube-proxy
sudo ufw allow 30000:32767/tcp # NodePort services
# Calico CNI
sudo ufw allow 179/tcp         # BGP tiên phong
sudo ufw allow 4789/udp        # Đóng gói VXLAN
sudo ufw allow 5473/tcp        # Calico Typha
sudo ufw --force enable
sudo ufw reload
```

| Cảng | Giao thức | Mục đích |
|-------------|----------|-------------------------|
| 22 | TCP | SSH |
| 10250 | TCP | Kubelet API |
| 10256 | TCP | Kiểm tra sức khỏe kube-proxy |
| 30000-32767 | TCP | Dịch vụ NodePort |
| 179 | TCP | Calico BGP |
| 4789 | UDP | Calico VXLAN |
| 5473 | TCP | Calico Typha |

> **Mẹo:** Nếu tất cả nodes đều nằm trên mạng riêng đáng tin cậy, bạn có thể đơn giản hóa bằng:
> `sudo ufw allow from 10.10.10.0/24`

**Hoặc sử dụng tập lệnh tự động hóa:**
```bash
./scripts/02-setup-firewall.sh
```

---

<a id="step-3-set-up-haproxy-load-balancer"></a>
<a id="heading-12-step-3-set-up-haproxy-load-balancer"></a>

## Bước 3: Thiết lập cân bằng tải HAProxy

Điều này ** chỉ chạy trên Loadbalancersrv**. HAProxy sẽ phân phối lưu lượng máy chủ API (cổng 6443) trên cả hai control plane.

**Chạy trên loadbalancersrv:**

```bash
sudo apt-get update
sudo apt-get install -y haproxy
sudo cp /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg.bak
```

Tạo cấu hình:

```bash
sudo tee /etc/haproxy/haproxy.cfg > /dev/null <<'EOF'
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon

defaults
    log     global
    mode    tcp
    option  tcplog
    option  dontlognull
    timeout connect 5000ms
    timeout client  50000ms
    timeout server  50000ms

frontend k8s-api
    bind *:6443
    mode tcp
    default_backend k8s-api-backend

backend k8s-api-backend
    mode tcp
    option tcp-check
    balance roundrobin
    server controlplane1 10.10.10.11:6443 check fall 3 rise 2
    server controlplane2 10.10.10.12:6443 check fall 3 rise 2

frontend stats
    bind *:8404
    mode http
    stats enable
    stats uri /stats
    stats refresh 10s
EOF
```

Bắt đầu HAProxy:

```bash
sudo systemctl enable haproxy
sudo systemctl restart haproxy
sudo systemctl status haproxy
```

Xác minh: Mở `http://10.10.10.10:8404/stats` trong trình duyệt (phần phụ trợ sẽ hiển thị XUỐNG cho đến khi máy chủ API khởi động).

**Hoặc sử dụng tập lệnh tự động hóa:**
```bash
./scripts/03-setup-haproxy.sh
```

---

<a id="step-4-install-kubeadm-kubelet-kubectl"></a>
<a id="heading-13-step-4-install-kubeadm-kubelet-kubectl"></a>

## Bước 4: Cài đặt kubeadm, kubelet, kubectl

**Chạy trên controlplane1, controlplane2, node01, node02** (KHÔNG trên Loadbalancersrv):

```bash
# Thêm kho lưu trữ apt Kubernetes
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg

sudo mkdir -p -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.35/deb/Release.key \
    | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /" \
    | sudo tee /etc/apt/sources.list.d/kubernetes.list > /dev/null

# cài đặt
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl

# Ngăn chặn nâng cấp tự động
sudo apt-mark hold kubelet kubeadm kubectl

# Kích hoạt kubelet
sudo systemctl enable kubelet
```

**Hoặc sử dụng tập lệnh tự động hóa:**
```bash
./scripts/04-install-k8s-packages.sh
```

---

<a id="step-5-initialize-the-cluster-control-plane-1"></a>
<a id="heading-14-step-5-initialize-the-cluster-control-plane-1"></a>

## Bước 5: Khởi tạo cụm (Control Plane 1)

**CHỈ chạy trên controlplane1:**

```bash
sudo kubeadm init \
    --control-plane-endpoint "10.10.10.10:6443" \
    --upload-certs \
    --pod-network-cidr "192.168.0.0/16" \
    --apiserver-advertise-address "10.10.10.11"
```

<a id="what-this-does-certificates--pki"></a>
<a id="heading-15-what-this-does-certificates-pki"></a>

### Điều này làm gì (chứng chỉ/PKI)

`kubeadm init` tạo PKI hoàn chỉnh theo `/etc/kubernetes/pki/`:

```
/etc/kubernetes/pki/
├── ca.crt / ca.key                  <- Cluster root CA (signs all other certs)
├── apiserver.crt / apiserver.key    <- API server TLS serving cert
├── apiserver-kubelet-client.crt     <- API server -> kubelet client cert
├── apiserver-etcd-client.crt        <- API server -> etcd client cert
├── front-proxy-ca.crt / .key       <- Front-proxy CA (aggregation layer)
├── front-proxy-client.crt / .key   <- Front-proxy client cert
├── sa.key / sa.pub                  <- Service account token signing key pair
└── etcd/
    ├── ca.crt / ca.key             <- etcd-specific CA
    ├── server.crt / server.key     <- etcd TLS serving cert
    ├── peer.crt / peer.key         <- etcd peer-to-peer TLS
    └── healthcheck-client.crt/key  <- etcd health check client cert
```

Những điểm chính:
- **`--upload-certs`** mã hóa và tải khóa CA lên kubeadm-certs Secret trong kube-system. Điều này cho phép CP2 tự động tải chúng xuống trong quá trình tham gia (bí mật sẽ tự động bị xóa sau 2 giờ).
- Cần có **khóa chứng chỉ** ở đầu ra để tham gia control plane - nó giải mã các chứng chỉ đã tải lên.
- **SAN máy chủ API (Tên thay thế chủ đề):** Chứng chỉ apiserver tự động bao gồm `10.10.10.10` (LB), `10.10.10.11` (CP1), `10.96.0.1` (IP dịch vụ kubernetes), `localhost` và tên máy chủ.
- Tất cả các chứng chỉ thành phần (apiserver, máy khách kubelet, etcd, v.v.) sẽ hết hạn sau **1 năm**. Chứng chỉ CA hết hạn sau **10 năm**.

**Quan trọng:** `--control-plane-endpoint` trỏ tới bộ cân bằng tải HAProxy, KHÔNG trực tiếp tới node này. Điều này rất quan trọng đối với HA - tất cả các tệp kubeconfig và các lệnh nối sẽ tham chiếu địa chỉ LB.

Sau khi thành công, **lưu kết quả đầu ra.** Nó chứa các lệnh nối và khóa chứng chỉ.

Thiết lập kubectl:

```bash
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Xác minh:

```bash
kubectl get nodes
# Sẽ hiển thị controlplane1 với trạng thái NotReady (chưa có CNI)
```

**Hoặc sử dụng tập lệnh tự động hóa:**
```bash
./scripts/05-init-cluster.sh
```

---

<a id="step-6-join-control-plane-2"></a>
<a id="heading-16-step-6-join-control-plane-2"></a>

## Bước 6: Tham gia Control Plane 2

**Chạy trên controlplane2:**

Sử dụng lệnh nối control plane từ đầu ra `kubeadm init`:

```bash
sudo kubeadm join 10.10.10.10:6443 \
    --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash> \
    --control-plane \
    --certificate-key <certificate-key> \
    --apiserver-advertise-address "10.10.10.12"
```

<a id="what-happens-with-certificates-during-join"></a>
<a id="heading-17-what-happens-with-certificates-during-join"></a>

### Điều gì xảy ra với chứng chỉ trong quá trình tham gia

1. Cờ `--discovery-token-ca-cert-hash` xác minh danh tính của cụm CA — điều này ngăn chặn các cuộc tấn công trung gian trong quá trình tham gia.
2. `--certificate-key` giải mã các khóa CA từ kubeadm-certs Secret được tải lên trong quá trình init.
3. Sau đó, kubeadm tạo chứng chỉ **mới** cho controlplane2 (apiserver, etcd peer/server, v.v.) được ký bởi **cùng** cụm CA.
4. Thành viên etcd trên controlplane2 nhận được chứng chỉ ngang hàng của riêng mình và được thêm vào cụm etcd.

Sau khi tham gia, controlplane2 có `/etc/kubernetes/pki/` riêng với:
- **Được chia sẻ:** `ca.crt`, `ca.key`, `front-proxy-ca.crt/.key`, `etcd/ca.crt/.key`, `sa.key/.pub` (giống hệt với controlplane1)
- **Duy nhất:** `apiserver.crt/.key`, `etcd/server.crt/.key`, `etcd/peer.crt/.key` (được tạo mới cho node này)

Sau đó thiết lập kubectl trên node này:

```bash
mkdir -p $HOME/.kube
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

**Hoặc sử dụng tập lệnh tự động hóa:**
```bash
./scripts/06-join-controlplane.sh
```

---

<a id="step-7-join-worker-nodes"></a>
<a id="heading-18-step-7-join-worker-nodes"></a>

## Bước 7: Tham gia các nút worker

**Chạy trên node01 và node02:**

Sử dụng lệnh nối worker từ đầu ra `kubeadm init`:

```bash
sudo kubeadm join 10.10.10.10:6443 \
    --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>
```

<a id="certificates-on-worker-nodes"></a>
<a id="heading-19-certificates-on-worker-nodes"></a>

### Chứng chỉ trên worker nodes

Người lao động nhận được một bộ chứng chỉ tối thiểu:
- **`/etc/kubernetes/kubelet.conf`** — kubeconfig có chứng chỉ ứng dụng khách dành cho kubelet để xác thực với máy chủ API.
- **`/var/lib/kubelet/pki/kubelet-client-current.pem`** — chứng chỉ ứng dụng khách được xoay vòng tự động (kubelet tự động xử lý việc gia hạn thông qua tính năng `RotateKubeletClientCertificate`).
- **`/var/lib/kubelet/pki/kubelet.crt/.key`** — Chứng chỉ phục vụ của kubelet (dành cho máy chủ API -> giao tiếp kubelet).

Worker **không** có khóa riêng CA — họ chỉ có `ca.crt` (công khai) để xác minh.

**Hoặc sử dụng tập lệnh tự động hóa:**
```bash
./scripts/07-join-workers.sh
```

---

<a id="step-8-install-calico-cni"></a>
<a id="heading-20-step-8-install-calico-cni"></a>

## Bước 8: Cài đặt Calico CNI

**Chạy trên controlplane1 (hoặc bất kỳ node nào có kubectl):**

```bash
# Cài đặt Tigera operator
kubectl apply --server-side -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/operator-crds.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/tigera-operator.yaml
kubectl wait --for=condition=Established crd/installations.operator.tigera.io --timeout=120s

# Cài đặt tài nguyên tùy chỉnh Calico
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/custom-resources.yaml
```

Đợi 2-3 phút để Calico khởi tạo, sau đó xác minh:

```bash
# All Calico pods should be Running
kubectl get pods -n calico-system

# Để theo dõi trực tiếp nó
kubectl get pods -n calico-system

# All nodes should now be Ready
kubectl get nodes
```

**Hoặc sử dụng tập lệnh tự động hóa:**
```bash
./scripts/08-install-calico.sh
```

---

<a id="step-9-verify-the-cluster"></a>
<a id="heading-21-step-9-verify-the-cluster"></a>

## Bước 9: Xác minh cụm

```bash
# All 4 nodes should be Ready
kubectl get nodes -o wide

# Tất cả hệ thống pods đang chạy
kubectl get pods -n kube-system
kubectl get pods -n calico-system

# Các thành phần của control plane (sẽ hiển thị 2 trong số đó)
kubectl get pods -n kube-system -l tier=control-plane

# Thử nghiệm triển khai
kubectl create deployment nginx-test --image=nginx --replicas=2
kubectl get pods -o wide
# Pods nên lên lịch trên worker nodes (node01, node02)
kubectl delete deployment nginx-test
```

Kiểm tra số liệu thống kê HAProxy tại `http://10.10.10.10:8404/stats` - cả hai phần phụ trợ sẽ hiển thị green/UP.

**Hoặc sử dụng tập lệnh tự động hóa:**
```bash
./scripts/09-verify.sh
```

---

<a id="step-10-verify-certificates"></a>
<a id="heading-22-step-10-verify-certificates"></a>

## Bước 10: Xác minh chứng chỉ

Sau khi cụm đang chạy, hãy xác minh PKI hoạt động tốt:

```bash
# Kiểm tra ngày hết hạn của tất cả các chứng chỉ (chạy trên controlplane1)
sudo kubeadm certs check-expiration
```

Đầu ra dự kiến hiển thị tất cả các chứng chỉ, thời hạn sử dụng của chúng và liệu chúng có được CA ký hay không:

```
CERTIFICATE                EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY
admin.conf                 Feb 25, 2027 00:00 UTC   364d            ca
apiserver                  Feb 25, 2027 00:00 UTC   364d            ca
apiserver-etcd-client      Feb 25, 2027 00:00 UTC   364d            etcd-ca
apiserver-kubelet-client   Feb 25, 2027 00:00 UTC   364d            ca
controller-manager.conf    Feb 25, 2027 00:00 UTC   364d            ca
etcd-healthcheck-client    Feb 25, 2027 00:00 UTC   364d            etcd-ca
etcd-peer                  Feb 25, 2027 00:00 UTC   364d            etcd-ca
etcd-server                Feb 25, 2027 00:00 UTC   364d            etcd-ca
front-proxy-client         Feb 25, 2027 00:00 UTC   364d            front-proxy-ca
scheduler.conf             Feb 25, 2027 00:00 UTC   364d            ca

CERTIFICATE AUTHORITY      EXPIRES                  RESIDUAL TIME
ca                         Feb 23, 2036 00:00 UTC   9y
etcd-ca                    Feb 23, 2036 00:00 UTC   9y
front-proxy-ca             Feb 23, 2036 00:00 UTC   9y
```

<a id="verify-api-server-sans"></a>
<a id="heading-23-verify-api-server-sans"></a>

### Xác minh SAN máy chủ API

Xác nhận chứng chỉ máy chủ API bao gồm IP bộ cân bằng tải:

```bash
sudo openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -text | grep -A1 "Alternative"
```

Nên bao gồm: `10.10.10.10`, `10.10.10.11`, `10.96.0.1`, `controlplane1`, `kubernetes`, v.v.

<a id="verify-ca-consistency-across-control-planes"></a>
<a id="heading-24-verify-ca-consistency-across-control-planes"></a>

### Xác minh tính nhất quán của CA trên các control plane

Các tệp CA phải giống hệt nhau trên cả hai control plane:

```bash
# Chạy trên controlplane1
sudo sha256sum /etc/kubernetes/pki/ca.crt /etc/kubernetes/pki/etcd/ca.crt /etc/kubernetes/pki/front-proxy-ca.crt

# Chạy trên controlplane2 và so sánh các giá trị băm - chúng PHẢI khớp
sudo sha256sum /etc/kubernetes/pki/ca.crt /etc/kubernetes/pki/etcd/ca.crt /etc/kubernetes/pki/front-proxy-ca.crt
```

**Hoặc sử dụng tập lệnh tự động hóa:**
```bash
./scripts/10-setup-certs.sh
```

---

<a id="certificate-renewal"></a>
<a id="heading-25-certificate-renewal"></a>

## Gia hạn chứng chỉ

Chứng chỉ thành phần Kubernetes hết hạn sau **1 năm**. kubeadm có thể gia hạn chúng.

<a id="automatic-renewal-during-upgrade"></a>
<a id="heading-26-automatic-renewal-during-upgrade"></a>

### Tự động gia hạn trong quá trình nâng cấp

Khi bạn chạy `kubeadm upgrade apply`, tất cả các chứng chỉ sẽ tự động được gia hạn.

<a id="manual-renewal"></a>
<a id="heading-27-manual-renewal"></a>

### Gia hạn thủ công

Trên **mỗi** control plane node:

```bash
# Gia hạn tất cả các chứng chỉ
sudo kubeadm certs renew all

# Khởi động lại các thành phần control plane để nhận chứng chỉ mới
sudo systemctl restart kubelet

# pods tĩnh (apiserver, trình quản lý bộ điều khiển, bộ lập lịch, etcd)
# được kubelet tự động khởi động lại khi manifest của chúng thay đổi.
```

<a id="renew-a-specific-cert"></a>
<a id="heading-28-renew-a-specific-cert"></a>

### Gia hạn một chứng chỉ cụ thể

```bash
sudo kubeadm certs renew apiserver
sudo kubeadm certs renew etcd-server
# v.v.
```

<a id="renew-the-adminconf-kubeconfig"></a>
<a id="heading-29-renew-the-adminconf-kubeconfig"></a>

### Gia hạn admin.conf kubeconfig

```bash
sudo kubeadm certs renew admin.conf
# Sau đó sao chép lại nó:
sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

<a id="set-up-a-renewal-reminder-cron"></a>
<a id="heading-30-set-up-a-renewal-reminder-cron"></a>

### Thiết lập lời nhắc gia hạn (cron)

```bash
# Kiểm tra hàng tháng và cảnh báo nếu bất kỳ chứng chỉ nào hết hạn trong vòng 30 ngày
cat <<'EOF' | sudo tee /etc/cron.monthly/k8s-cert-check
#!/bin/bash
kubeadm certs check-expiration 2>/dev/null | grep -E "^[a-z]" | while read line; do
    days=$(echo "$line" | grep -oP '\d+d' | head -1 | tr -d 'd')
    if [[ -n "$days" && "$days" -lt 30 ]]; then
        echo "WARNING: Kubernetes certificate expiring soon: $line" | logger -t k8s-certs
    fi
done
EOF
sudo chmod +x /etc/cron.monthly/k8s-cert-check
```

<a id="worker-cert-rotation"></a>
<a id="heading-31-worker-cert-rotation"></a>

### Luân chuyển chứng chỉ worker

Chứng chỉ máy khách kubelet của Worker được kubelet luân chuyển **tự động**. Xác minh:

```bash
# Trên node01 hoặc node02:
ls -la /var/lib/kubelet/pki/kubelet-client-current.pem
sudo openssl x509 -in /var/lib/kubelet/pki/kubelet-client-current.pem -noout -enddate
```

---

<a id="using-kubectl-from-your-mac"></a>
<a id="heading-32-using-kubectl-from-your-mac"></a>

## Sử dụng kubectl từ máy Mac của bạn

Sao chép kubeconfig từ controlplane1:

```bash
scp <user>@10.10.10.11:~/.kube/config ~/.kube/config
```

Cập nhật địa chỉ máy chủ để trỏ tới bộ cân bằng tải:

```bash
# Chỉnh sửa ~/.kube/config và thay đổi:
#   máy chủ: https://10.10.10.11:6443
# to:
#   máy chủ: https://10.10.10.10:6443
```

Sau đó:

```bash
kubectl get nodes
```

---

<a id="automation-scripts"></a>
<a id="heading-33-automation-scripts"></a>

## Tập lệnh tự động hóa

Tất cả các tập lệnh đều nằm trong thư mục `scripts/` và chạy **từ máy Mac** của bạn thông qua SSH.

```
scripts/
├── env.sh                      # Cấu hình (tên máy chủ, IP, phiên bản)
├── 01-setup-hosts.sh           # /etc/hosts trên tất cả 5 nodes
├── 02-setup-firewall.sh        # Quy tắc tường lửa UFW cho mỗi vai trò
├── 03-setup-haproxy.sh         # HAProxy trên loadbalancersrv
├── 04-install-k8s-packages.sh  # kubeadm/kubelet/kubectl
├── 05-init-cluster.sh          # kubeadm khởi tạo trên controlplane1
├── 06-join-controlplane.sh     # Tham gia controlplane2
├── 07-join-workers.sh          # Tham gia node01 + node02
├── 08-install-calico.sh        # Cài đặt Calico CNI
├── 09-verify.sh                # Kiểm tra sức khỏe cụm
├── 10-setup-certs.sh           # Xác minh chứng chỉ
└── deploy-all.sh               # Kịch bản chính (chạy đủ 10 bước)
```

1. Chỉnh sửa `scripts/env.sh` - đặt `SSH_USER` thành tên người dùng SSH của bạn
2. Tạo tập lệnh có thể thực thi được: `chmod +x scripts/*.sh`
3. Chạy mọi thứ: `./scripts/deploy-all.sh`

Hoặc chạy từng bước riêng lẻ:

```bash
./scripts/deploy-all.sh --from 5    # Tiếp tục từ bước 5 (khởi tạo cụm)
./scripts/deploy-all.sh --step 2    # Chỉ chạy bước 2 (tường lửa)
./scripts/deploy-all.sh --step 10   # Chỉ chạy bước 10 (kiểm tra chứng chỉ)
```

---

<a id="troubleshooting"></a>
<a id="heading-34-troubleshooting"></a>

## Khắc phục sự cố

<a id="ip-forwarding-not-enabled"></a>
<a id="heading-35-ip-forwarding-not-enabled"></a>

### Chuyển tiếp IP không được kích hoạt

**Triệu chứng:** `kubeadm init` hoặc `kubeadm join` không thành công với:
```
[ERROR FileContent--proc-sys-net-ipv4-ip_forward]: /proc/sys/net/ipv4/ip_forward contents are not set to 1
```

**Sửa chữa:**

```bash
# Kích hoạt ngay lập tức
sudo sysctl -w net.ipv4.ip_forward=1

# Xác minh
cat /proc/sys/net/ipv4/ip_forward
# Phải quay lại: 1

# Kiên trì trong quá trình khởi động lại
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.d/k8s.conf
sudo sysctl --system
```

**Nguyên nhân cốt lõi:** Cấu hình sysctl từ các điều kiện tiên quyết không được áp dụng hoặc bị ghi đè. Luôn xác minh bằng `cat /proc/sys/net/ipv4/ip_forward` trước khi chạy kubeadm.

---

<a id="swap-not-disabled-kubelet-crash-loop"></a>
<a id="heading-36-swap-not-disabled-kubelet-crash-loop"></a>

### Hoán đổi không bị vô hiệu hóa (vòng lặp sự cố kubelet)

**Triệu chứng:** `kubeadm join` có vẻ thành công nhưng các thành phần không khởi động được. Nhật ký Kubelet hiển thị:
```
"failed to run Kubelet: running with swap on is not supported, please disable swap or set --fail-swap-on flag to false"
```

Khi control plane tham gia, điều này khiến etcd container không bao giờ khởi động, gây ra lỗi sai:
```
the etcd member <ID> is not started
```

**Sửa chữa:**

```bash
sudo swapoff -a
sudo sed -i '/swap/d' /etc/fstab
free -h   # Xác minh Hoán đổi hiển thị 0B
```

Sau đó đặt lại và thử nối lại (xem phần "Đặt lại nút và thử lại" bên dưới).

**Nguyên nhân cốt lõi:** Hoán đổi vẫn hoạt động trên node khi tham gia. kubelet từ chối khởi động khi bật trao đổi, điều này ngăn tất cả pods (bao gồm etcd) chạy. Thông báo lỗi từ kubeadm về etcd là sai lệch — vấn đề thực sự là kubelet.

---

<a id="etcd-member-not-started-control-plane-join-failure"></a>
<a id="heading-37-etcd-member-not-started-control-plane-join-failur"></a>

### Thành viên etcd chưa bắt đầu (Lỗi tham gia Control Plane)

**Triệu chứng:** Việc tham gia control plane thứ hai (hoặc thứ ba) không thành công với:
```
error execution phase etcd-join: error creating local etcd static pod manifest file: the etcd member <ID> is not started
```

**Nguyên nhân gốc rễ (kiểm tra theo thứ tự này):**

1. **Đã bật tính năng hoán đổi** khi tham gia node (xem ở trên - nguyên nhân phổ biến nhất)
2. **Trạng thái cũ trái của lần tham gia thất bại trước đó** — node chưa được làm sạch đúng cách
3. **Thành viên etcd cũ** đã đăng ký trên control plane hiện có từ lần thử thất bại trước đó

**Các bước chẩn đoán:**

```bash
# Trên JOINING node, hãy kiểm tra:
free -h                                    # Trao đổi có bị tắt không?
cat /proc/sys/net/ipv4/ip_forward          # Is it 1?
sudo systemctl status containerd           # containerd có đang chạy không?
ls /etc/kubernetes/ 2>&1                   # Phải trống hoặc "Không có tệp như vậy"
ls /var/lib/etcd/ 2>&1                     # Phải trống hoặc "Không có tệp như vậy"

# Trên control plane HIỆN CÓ, hãy kiểm tra các thành viên cũ:
sudo crictl exec $(sudo crictl ps --name etcd -q) etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  member list -w table
```

**Khắc phục - Quy trình dọn dẹp đầy đủ:**

```bash
# --- Trên control plane HIỆN CÓ (e.g., controlplane1) ---
# Xóa thành viên etcd cũ (thay <MEMBER_ID> bằng ID thực)
sudo crictl exec $(sudo crictl ps --name etcd -q) etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  member remove <MEMBER_ID>

# Xác minh chỉ còn lại một thành viên
sudo crictl exec $(sudo crictl ps --name etcd -q) etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  member list

# --- Trên JOINING node (e.g., controlplane2) ---
sudo kubeadm reset -f
sudo rm -rf /etc/kubernetes /var/lib/etcd /var/lib/kubelet /etc/cni/net.d
sudo swapoff -a

# Xác minh trạng thái sạch
ls /etc/kubernetes/ 2>&1    # "Không có tập tin hoặc thư mục như vậy"
ls /var/lib/etcd/ 2>&1      # "Không có tập tin hoặc thư mục như vậy"
free -h                     # Hoán đổi = 0

# --- Trên control plane HIỆN CÓ — tạo lại thông tin xác thực ---
sudo kubeadm init phase upload-certs --upload-certs    # Khóa chứng chỉ mới
sudo kubeadm token create --print-join-command          # Mã thông báo mới + hàm băm

# --- Trên JOINING node — thử lại với thông tin xác thực mới ---
sudo kubeadm join 10.10.10.10:6443 \
  --token <NEW_TOKEN> \
  --discovery-token-ca-cert-hash sha256:<NEW_HASH> \
  --control-plane \
  --certificate-key <NEW_CERT_KEY> \
  --apiserver-advertise-address <THIS_NODE_IP>
```

> **Quan trọng:** Đảm bảo hàm băm `sha256:` nằm trên **một dòng** không có dấu cách hoặc ngắt dòng. Hàm băm bị hỏng tạo ra: `"invalid discovery token CA certificate hash"`.

---

<a id="tokens-expired"></a>
<a id="heading-38-tokens-expired"></a>

### Mã thông báo đã hết hạn

Mã thông báo tham gia sẽ hết hạn sau 24 giờ. Tạo cái mới từ bất kỳ control plane nào:

```bash
# Lệnh tham gia worker mới
kubeadm token create --print-join-command

# Khóa chứng chỉ mới để tham gia control plane (có giá trị trong 2 giờ)
sudo kubeadm init phase upload-certs --upload-certs
```

---

<a id="certificate-key-expired"></a>
<a id="heading-39-certificate-key-expired"></a>

### Khóa chứng chỉ đã hết hạn

`--certificate-key` từ `kubeadm init` sẽ hết hạn sau 2 giờ. Để tham gia control plane mới sau:

```bash
# Trên control plane hiện có, hãy tải lên lại các chứng chỉ:
sudo kubeadm init phase upload-certs --upload-certs
# Điều này in một khóa chứng chỉ mới

# Tạo mã thông báo tham gia mới:
sudo kubeadm token create --print-join-command

# Kết hợp chúng cho control plane mới:
sudo kubeadm join 10.10.10.10:6443 \
    --token <new-token> \
    --discovery-token-ca-cert-hash sha256:<hash> \
    --control-plane \
    --certificate-key <new-certificate-key>
```

---

<a id="node-stuck-in-notready"></a>
<a id="heading-40-node-stuck-in-notready"></a>

### Nút bị kẹt trong NotReady

Thông thường có nghĩa là Calico không chạy trên node đó:

```bash
kubectl describe node <node-name>
kubectl get pods -n calico-system -o wide
```

---

<a id="haproxy-shows-backends-down"></a>
<a id="heading-41-haproxy-shows-backends-down"></a>

### HAProxy hiển thị phần phụ trợ XUỐNG

Máy chủ API chưa khởi động hoặc có cổng chặn tường lửa 6443:

```bash
# Trên control plane, kiểm tra xem apiserver có đang nghe không
ss -tlnp | grep 6443

# Kiểm tra trạng thái tường lửa
sudo ufw status numbered
```

---

<a id="certificate-errors-after-renewal"></a>
<a id="heading-42-certificate-errors-after-renewal"></a>

### Lỗi chứng chỉ sau khi gia hạn

Nếu bạn thấy `x509: certificate has expired` sau khi gia hạn:

```bash
# Khởi động lại kubelet trên node bị ảnh hưởng
sudo systemctl restart kubelet

# Nếu đó là control plane, pods tĩnh sẽ tự động khởi động lại.
# Nếu không, hãy khởi động lại theo cách thủ công:
sudo crictl pods --name kube-apiserver -q | xargs sudo crictl rmp -f
sudo crictl pods --name kube-controller-manager -q | xargs sudo crictl rmp -f
sudo crictl pods --name kube-scheduler -q | xargs sudo crictl rmp -f
sudo crictl pods --name etcd -q | xargs sudo crictl rmp -f
```

---

<a id="accidentally-installed-k8s-packages-on-the-load-balancer"></a>
<a id="heading-43-accidentally-installed-k8s-packages-on-the-load-ba"></a>

### Vô tình cài đặt các gói K8 trên Load Balancer

Nếu bạn cài đặt nhầm kubeadm/kubelet/kubectl/containerd trên bộ cân bằng tải node:

```bash
# Xóa các gói Kubernetes
sudo apt-mark unhold kubelet kubeadm kubectl 2>/dev/null
sudo apt-get purge -y kubelet kubeadm kubectl

# Xóa containerd (nếu không cần thiết)
sudo apt-get purge -y containerd containerd.io

# Dọn dẹp repos và cấu hình
sudo rm -f /etc/apt/sources.list.d/kubernetes.list
sudo rm -f /etc/apt/keyrings/kubernetes-apt-keyring.gpg
sudo rm -rf /etc/kubernetes /var/lib/kubelet /var/lib/etcd /etc/cni
sudo rm -f /etc/crictl.yaml
sudo rm -f /etc/modules-load.d/k8s.conf /etc/sysctl.d/k8s.conf

sudo apt-get autoremove -y
```

---

<a id="reset-a-node-and-retry"></a>
<a id="heading-44-reset-a-node-and-retry"></a>

### Đặt lại nút và thử lại

Nếu xảy ra sự cố trong quá trình tham gia, bạn phải **dọn dẹp hoàn toàn** trước khi thử lại:

```bash
# Đặt lại trạng thái kubeadm
sudo kubeadm reset -f

# Xóa TẤT CẢ các thư mục còn sót lại
sudo rm -rf /etc/kubernetes
sudo rm -rf /var/lib/etcd
sudo rm -rf /var/lib/kubelet
sudo rm -rf /etc/cni/net.d
sudo rm -rf $HOME/.kube

# Xác minh trạng thái sạch
ls /etc/kubernetes/ 2>&1    # "Không có tập tin hoặc thư mục như vậy"
ls /var/lib/etcd/ 2>&1      # "Không có tập tin hoặc thư mục như vậy"
```

> **Cảnh báo:** KHÔNG xả iptables (`iptables -F`) trên node từ xa — điều này sẽ giết phiên SSH của bạn vì các quy tắc UFW phụ thuộc vào iptables. Chỉ làm sạch iptables nếu bạn có quyền truy cập physical/console.

> **Lưu ý:** Nếu đây là lỗi tham gia control plane, bạn cũng phải xóa thành viên etcd cũ khỏi control plane hiện có (xem "Thành viên etcd chưa bắt đầu" ở trên) trước khi thử lại.
