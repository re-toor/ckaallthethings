#!/usr/bin/env bash
# ============================================================
# Script điều phối triển khai
# Triển khai cụm Kubernetes HA đầy đủ từ máy Mac của bạn.
#
# Cách sử dụng:
#   ./deploy-all.sh              # Chạy mọi bước
#   ./deploy-all.sh --from 4     # Tiếp tục từ bước 4
#   ./deploy-all.sh --step 7     # Chỉ chạy bước 7
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/env.sh"

FROM_STEP=1
ONLY_STEP=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        --from) FROM_STEP="$2"; shift 2 ;;
        --step) ONLY_STEP="$2"; shift 2 ;;
        *) err "Unknown option: $1"; exit 1 ;;
    esac
done

should_run() {
    local step=$1
    if [[ $ONLY_STEP -gt 0 ]]; then
        [[ $step -eq $ONLY_STEP ]]
    else
        [[ $step -ge $FROM_STEP ]]
    fi
}

run_step() {
    local step=$1
    local name=$2
    local script=$3

    if should_run "$step"; then
        log "=========================================="
        log "Bước ${step}: ${name}"
        log "=========================================="
        bash "${SCRIPT_DIR}/${script}"
        log "Bước ${step} hoàn tất."
        echo ""
    else
        echo "  Bỏ qua bước ${step}: ${name}"
    fi
}

echo ""
echo "============================================================"
echo "  Triển khai lab Kubernetes nhiều control plane"
echo "============================================================"
echo ""
echo "  Kiến trúc:"
echo "    LB:  ${LB_HOST} (${LB_IP})"
echo "    CP1: ${CP1_HOST} (${CP1_IP})"
echo "    CP2: ${CP2_HOST} (${CP2_IP})"
echo "    W1:  ${W1_HOST} (${W1_IP})"
echo "    W2:  ${W2_HOST} (${W2_IP})"
echo ""
echo "  Kubernetes: v${K8S_VERSION}"
echo "  CNI:        Calico ${CALICO_VERSION}"
echo "  Tài khoản SSH:   ${SSH_USER}"
echo ""

# Preflight: kiểm tra kết nối SSH với tất cả nodes
log "Preflight: Kiểm tra kết nối SSH..."
for i in "${!ALL_IPS[@]}"; do
    ip="${ALL_IPS[$i]}"
    host="${ALL_HOSTS[$i]}"
    if run_on "$ip" "echo ok" > /dev/null 2>&1; then
        echo "  + ${host} (${ip}): đã kết nối"
    else
        err "Không thể SSH tới ${host} (${ip}) dưới dạng ${SSH_USER}"
        err "Sửa kết nối SSH và thử lại."
        exit 1
    fi
done
log "Tất cả nodes đều có thể truy cập được."

run_step 1  "Cấu hình /etc/hosts"           "01-setup-hosts.sh"
run_step 2  "Cấu hình tường lửa UFW"         "02-setup-firewall.sh"
run_step 3  "Cấu hình HAProxy"    "03-setup-haproxy.sh"
run_step 4  "Cài gói Kubernetes"    "04-install-k8s-packages.sh"
run_step 5  "Khởi tạo cụm (CP1)"       "05-init-cluster.sh"
run_step 6  "Join control plane 2"           "06-join-controlplane.sh"
run_step 7  "Join các worker"              "07-join-workers.sh"
run_step 8  "Cài Calico CNI"             "08-install-calico.sh"
run_step 9  "Kiểm tra cụm"          "09-verify.sh"
run_step 10 "Kiểm tra chứng chỉ"            "10-setup-certs.sh"

echo ""
log "============================================================"
log "Đã triển khai xong!"
log "============================================================"
log ""
log "Để sử dụng kubectl từ máy Mac của bạn:"
log "export KUBECONFIG=${JOIN_INFO_DIR}/admin.conf"
log "kubectl get nodes"
log ""
log "Hoặc hợp nhất vào kubeconfig mặc định của bạn:"
log "cp ${JOIN_INFO_DIR}/admin.conf ~/.kube/config"
log ""
log "Số liệu thống kê HAProxy: http://${LB_IP}:8404/stats"
log ""
