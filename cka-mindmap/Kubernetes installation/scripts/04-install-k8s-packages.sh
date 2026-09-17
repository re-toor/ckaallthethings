#!/usr/bin/env bash
# ============================================================
# Bước 4: Cài kubeadm, kubelet, kubectl trên các node Kubernetes
# Chạy cái này trên control plane + worker nodes (KHÔNG phải bộ cân bằng tải)
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/env.sh"

for i in "${!K8S_NODE_IPS[@]}"; do
    ip="${K8S_NODE_IPS[$i]}"
    host="${K8S_NODE_HOSTS[$i]}"
    log "Đang cài đặt các gói Kubernetes ${K8S_VERSION} trên ${host} (${ip})..."

    run_on "$ip" "bash -s" <<EOF
        set -euo pipefail

        # Kubernetes 1.35 mặc định từ chối node dùng cgroup v1.
        if [[ \$(stat -fc %T /sys/fs/cgroup) != cgroup2fs ]]; then
            echo "Cần bật cgroup v2 trước khi cài Kubernetes ${K8S_VERSION}." >&2
            exit 1
        fi
        # Containerd và swap phải được chuẩn bị theo guide.md trước bước này.
        sudo systemctl is-active --quiet containerd || {
            echo "Containerd chưa hoạt động; hoàn tất bước chuẩn bị trong guide.md." >&2
            exit 1
        }

        # Thêm kho lưu trữ apt Kubernetes
        sudo apt-get update -qq
        sudo apt-get install -y apt-transport-https ca-certificates curl gpg

        sudo mkdir -p -m 755 /etc/apt/keyrings
        curl -fsSL https://pkgs.k8s.io/core:/stable:/v${K8S_VERSION}/deb/Release.key \
            | sudo gpg --dearmor --yes -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

        echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v${K8S_VERSION}/deb/ /" \
            | sudo tee /etc/apt/sources.list.d/kubernetes.list > /dev/null

        # Cài đặt gói
        sudo apt-get update -qq
        sudo apt-get install -y kubelet kubeadm kubectl

        # Ghim các phiên bản để ngăn chặn việc nâng cấp ngẫu nhiên
        sudo apt-mark hold kubelet kubeadm kubectl

        # Bật kubelet (có thể khởi động lại liên tục trước khi kubeadm init/join)
        sudo systemctl enable kubelet

        echo "  kubeadm \$(kubeadm version -o short) đã được cài trên \$(hostname)"
EOF
done

log "Các gói Kubernetes được cài đặt trên tất cả các K8 nodes."
