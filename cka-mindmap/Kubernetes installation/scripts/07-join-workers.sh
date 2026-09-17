#!/usr/bin/env bash
# ============================================================
# Bước 6: Nối worker nodes vào cụm
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/env.sh"

# Kiểm tra xem thông tin tham gia có tồn tại không
if [[ ! -f "${JOIN_INFO_DIR}/worker-join-cmd.sh" ]]; then
    err "Không tìm thấy lệnh tham gia. Trước tiên hãy chạy 04-init-cluster.sh."
    exit 1
fi

WORKER_JOIN_CMD=$(cat "${JOIN_INFO_DIR}/worker-join-cmd.sh")

for i in "${!WORKER_IPS[@]}"; do
    ip="${WORKER_IPS[$i]}"
    host="${WORKER_HOSTS[$i]}"
    log "Tham gia ${host} (${ip}) với tên worker..."

    run_on "$ip" "bash -s" <<EOF
        set -euo pipefail
        ${WORKER_JOIN_CMD}
EOF

    log "${host} đã tham gia với tên worker."
done

# Xác minh từ CP1
log "Đang xác minh tất cả nodes..."
sleep 5
run_on "$CP1_IP" "kubectl get nodes -o wide"

log "Tất cả workers đã tham gia thành công!"
