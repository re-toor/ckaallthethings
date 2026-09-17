#!/usr/bin/env bash
# ============================================================
# Bước 4: Khởi tạo cụm Kubernetes trên Control Plane 1
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/env.sh"

mkdir -p "$JOIN_INFO_DIR"

log "Đang khởi tạo cụm Kubernetes trên ${CP1_HOST} (${CP1_IP})..."
log "Điểm cuối của control plane: ${CONTROL_PLANE_ENDPOINT} (thông qua HAProxy)"
log "Pod CIDR: ${POD_CIDR}"

# Chạy kubeadm init và lưu đầu ra
INIT_OUTPUT=$(run_on "$CP1_IP" "sudo kubeadm init \
    --kubernetes-version 'stable-${K8S_VERSION}' \
    --control-plane-endpoint '${CONTROL_PLANE_ENDPOINT}' \
    --upload-certs \
    --pod-network-cidr '${POD_CIDR}' \
    --apiserver-advertise-address '${CP1_IP}'" 2>&1) || {
    err "Khởi tạo kubeadm không thành công!"
    echo "$INIT_OUTPUT"
    exit 1
}

echo "$INIT_OUTPUT"

# Lưu toàn bộ đầu ra để tham khảo
echo "$INIT_OUTPUT" > "${JOIN_INFO_DIR}/kubeadm-init-output.txt"

# Trích xuất khóa chứng chỉ
CERT_KEY=$(echo "$INIT_OUTPUT" | grep -A2 "certificate-key" | grep -oP '[a-f0-9]{64}' | head -1)
echo "$CERT_KEY" > "${JOIN_INFO_DIR}/certificate-key.txt"

# Trích xuất hàm băm chứng chỉ CA của mã thông báo khám phá
CA_CERT_HASH=$(echo "$INIT_OUTPUT" | grep "discovery-token-ca-cert-hash" | head -1 | grep -oP 'sha256:[a-f0-9]+')
echo "$CA_CERT_HASH" > "${JOIN_INFO_DIR}/ca-cert-hash.txt"

# Nhận mã thông báo tham gia mới
JOIN_TOKEN=$(run_on "$CP1_IP" "sudo kubeadm token create")
echo "$JOIN_TOKEN" > "${JOIN_INFO_DIR}/token.txt"

# Xây dựng các lệnh nối
WORKER_JOIN="sudo kubeadm join ${CONTROL_PLANE_ENDPOINT} --token ${JOIN_TOKEN} --discovery-token-ca-cert-hash ${CA_CERT_HASH}"
CP_JOIN="${WORKER_JOIN} --control-plane --certificate-key ${CERT_KEY}"

echo "$WORKER_JOIN" > "${JOIN_INFO_DIR}/worker-join-cmd.sh"
echo "$CP_JOIN" > "${JOIN_INFO_DIR}/cp-join-cmd.sh"

# Cấu hình kubectl cho tài khoản SSH trên CP1
log "Đang định cấu hình kubectl trên ${CP1_HOST}..."
run_on "$CP1_IP" "bash -s" <<'REMOTE'
    mkdir -p $HOME/.kube
    sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config
    sudo chown $(id -u):$(id -g) $HOME/.kube/config
REMOTE

# Sao chép kubeconfig sang máy Mac cục bộ
log "Đang sao chép kubeconfig sang máy cục bộ..."
mkdir -p "$HOME/.kube"
run_on "$CP1_IP" "sudo cat /etc/kubernetes/admin.conf" > "${JOIN_INFO_DIR}/admin.conf"

# Cập nhật địa chỉ máy chủ trong kubeconfig để trỏ đến bộ cân bằng tải
sed -i.bak "s|server: https://${CP1_IP}:6443|server: https://${LB_IP}:6443|" "${JOIN_INFO_DIR}/admin.conf" 2>/dev/null || \
sed -i '' "s|server: https://${CP1_IP}:6443|server: https://${LB_IP}:6443|" "${JOIN_INFO_DIR}/admin.conf"

log "Đã khởi tạo cụm thành công!"
log "Thông tin tham gia được lưu vào: ${JOIN_INFO_DIR}/"
log "Kubeconfig đã lưu vào: ${JOIN_INFO_DIR}/admin.conf"
log ""
log "Để sử dụng kubectl từ máy Mac của bạn:"
log "export KUBECONFIG=${JOIN_INFO_DIR}/admin.conf"
log "kubectl get nodes"
