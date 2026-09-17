#!/usr/bin/env bash
# ============================================================
# Bước 7: Cài đặt Calico CNI
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/env.sh"

log "Đang cài đặt Calico ${CALICO_VERSION} trên cụm..."

run_on "$CP1_IP" "bash -s" <<EOF
    set -euo pipefail

    # Calico 3.31 tách CRD của operator thành manifest riêng.
    kubectl apply --server-side -f https://raw.githubusercontent.com/projectcalico/calico/${CALICO_VERSION}/manifests/operator-crds.yaml
    kubectl wait --for=condition=Established crd/installations.operator.tigera.io --timeout=120s

    # Cài đặt Tigera operator của Calico
    kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/${CALICO_VERSION}/manifests/tigera-operator.yaml

    # Đợi operator sẵn sàng
    echo "Đang chờ Tigera operator..."
    kubectl rollout status deployment/tigera-operator -n tigera-operator --timeout=120s || true

    # Cài đặt tài nguyên tùy chỉnh Calico (sử dụng 192.168.0.0/16 CIDR mặc định)
    kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/${CALICO_VERSION}/manifests/custom-resources.yaml
EOF

log "Đang chờ Calico pods khởi động (quá trình này có thể mất 2-3 phút)..."
sleep 30

# Kiểm tra định kỳ đến khi các Pod calico-system chạy
for attempt in $(seq 1 12); do
    READY=$(run_on "$CP1_IP" "kubectl get pods -n calico-system --no-headers 2>/dev/null | grep -c Running || echo 0")
    TOTAL=$(run_on "$CP1_IP" "kubectl get pods -n calico-system --no-headers 2>/dev/null | wc -l | tr -d ' ' || echo 0")
    log "Calico pods: ${READY}/${TOTAL} đang chạy (thử ${attempt}/12)"

    if [[ "$READY" -gt 0 && "$READY" == "$TOTAL" ]]; then
        break
    fi
    sleep 15
done

run_on "$CP1_IP" "kubectl get pods -n calico-system"

log "Quá trình cài đặt Calico CNI đã hoàn tất."

# Kiểm tra trạng thái node
log "Trạng thái nút:"
run_on "$CP1_IP" "kubectl get nodes -o wide"
