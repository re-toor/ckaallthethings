#!/usr/bin/env bash
# ============================================================
# Bước 5: Nối control plane node thứ hai vào cụm
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/env.sh"

# Kiểm tra xem thông tin tham gia có tồn tại không
if [[ ! -f "${JOIN_INFO_DIR}/cp-join-cmd.sh" ]]; then
    err "Không tìm thấy lệnh tham gia. Trước tiên hãy chạy 04-init-cluster.sh."
    exit 1
fi

CP_JOIN_CMD=$(cat "${JOIN_INFO_DIR}/cp-join-cmd.sh")

log "Tham gia ${CP2_HOST} (${CP2_IP}) với tên control plane..."

run_on "$CP2_IP" "bash -s" <<EOF
    set -euo pipefail
    ${CP_JOIN_CMD} --apiserver-advertise-address '${CP2_IP}'
EOF

# Cấu hình kubectl trên CP2
log "Đang định cấu hình kubectl trên ${CP2_HOST}..."
run_on "$CP2_IP" "bash -s" <<'REMOTE'
    mkdir -p $HOME/.kube
    sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
    sudo chown $(id -u):$(id -g) $HOME/.kube/config
REMOTE

log "${CP2_HOST} đã tham gia thành công với tên control plane!"

# Xác minh từ CP1
log "Đang xác minh nodes..."
run_on "$CP1_IP" "kubectl get nodes -o wide"
