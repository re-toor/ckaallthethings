#!/usr/bin/env bash
# ============================================================
# Bước 1: Cấu hình /etc/hosts trên mọi node
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/env.sh"

HOSTS_BLOCK="# --- Kubernetes Cluster Nodes ---
${LB_IP}  ${LB_HOST}
${CP1_IP}  ${CP1_HOST}
${CP2_IP}  ${CP2_HOST}
${W1_IP}  ${W1_HOST}
${W2_IP}  ${W2_HOST}
# --- End Kubernetes Cluster Nodes ---"

for i in "${!ALL_IPS[@]}"; do
    ip="${ALL_IPS[$i]}"
    host="${ALL_HOSTS[$i]}"
    log "Đang định cấu hình /etc/hosts trên ${host} (${ip})..."

    run_on "$ip" "bash -s" <<EOF
        sudo sed -i '/# --- Kubernetes Cluster Nodes ---/,/# --- End Kubernetes Cluster Nodes ---/d' /etc/hosts
        sudo sed -i -e '/loadbalancersrv/d' -e '/controlplane[12]/d' -e '/node0[12]/d' /etc/hosts
        echo '${HOSTS_BLOCK}' | sudo tee -a /etc/hosts > /dev/null
        echo "  Hoàn tất trên \$(hostname)"
EOF
done

log "Đang xác minh kết nối..."
for i in "${!ALL_IPS[@]}"; do
    ip="${ALL_IPS[$i]}"
    host="${ALL_HOSTS[$i]}"
    echo "  Từ ${host}:"
    for target in "${ALL_HOSTS[@]}"; do
        run_on "$ip" "ping -c1 -W2 ${target} > /dev/null 2>&1 && echo '    + ${target} OK' || echo '    - ${target} FAIL'"
    done
done

log "Cấu hình máy chủ hoàn tất."
