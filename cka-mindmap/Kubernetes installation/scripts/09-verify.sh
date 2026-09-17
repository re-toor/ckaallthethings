#!/usr/bin/env bash
# ============================================================
# Bước 8: Xác minh tình trạng cụm
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/env.sh"

PASS=0
FAIL=0

check() {
    local desc="$1"; shift
    echo -n "  ${desc}... "
    if "$@" > /dev/null 2>&1; then
        echo "OK"
        ((PASS+=1))
    else
        echo "FAIL"
        ((FAIL+=1))
    fi
}

log "============================================"
log "Kiểm tra sức khỏe cụm Kubernetes"
log "============================================"

# 1. HAProxy
log "1. Cân bằng tải HAProxy (${LB_HOST})"
check "Dịch vụ HAProxy đang chạy" run_on "$LB_IP" "systemctl is-active haproxy"
check "Cổng 6443 đang lắng nghe" run_on "$LB_IP" "ss -tlnp | grep -q 6443"

# 2. Trạng thái nút
log "2. Trạng thái nút"
NODES=$(run_on "$CP1_IP" "kubectl get nodes --no-headers 2>/dev/null")
echo "$NODES"
echo ""

for host in "${K8S_NODE_HOSTS[@]}"; do
    check "Node ${host} ở trạng thái Ready" bash -c "echo '$NODES' | grep -q '${host}.*Ready'"
done

# 3. Các thành phần control plane
log "3. Thành phần control plane"
for component in etcd kube-apiserver kube-controller-manager kube-scheduler; do
    COUNT=$(run_on "$CP1_IP" "kubectl get pods -n kube-system --no-headers -l component=${component} 2>/dev/null | grep -c Running || echo 0")
    check "${component} đang chạy (${COUNT} bản sao)" test "$COUNT" -ge 1
done

# 4. Calico
log "4. Calico CNI"
CALICO_RUNNING=$(run_on "$CP1_IP" "kubectl get pods -n calico-system --no-headers 2>/dev/null | grep -c Running || echo 0")
CALICO_TOTAL=$(run_on "$CP1_IP" "kubectl get pods -n calico-system --no-headers 2>/dev/null | wc -l | tr -d ' ' || echo 0")
check "Pod Calico (${CALICO_RUNNING}/${CALICO_TOTAL} đang chạy)" test "$CALICO_RUNNING" -eq "$CALICO_TOTAL"

# 5. CoreDNS
log "5. CoreDNS"
COREDNS_RUNNING=$(run_on "$CP1_IP" "kubectl get pods -n kube-system -l k8s-app=kube-dns --no-headers 2>/dev/null | grep -c Running || echo 0")
check "CoreDNS đang chạy (${COREDNS_RUNNING} Pod)" test "$COREDNS_RUNNING" -ge 1

# 6. Kiểm tra kết nối cụm
log "6. Kiểm tra kết nối"
check "Truy cập API server qua LB" run_on "$CP1_IP" "kubectl --server=https://${LB_IP}:6443 get nodes"

# 7. Thử nghiệm triển khai nhanh
log "7. Kiểm tra nhanh Deployment"
run_on "$CP1_IP" "kubectl delete deployment nginx-test --ignore-not-found > /dev/null 2>&1"
run_on "$CP1_IP" "kubectl create deployment nginx-test --image=nginx --replicas=2"
sleep 10
READY=$(run_on "$CP1_IP" "kubectl get deployment nginx-test -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo 0")
check "Deployment thử nghiệm (${READY}/2 sẵn sàng)" test "$READY" -eq 2
run_on "$CP1_IP" "kubectl delete deployment nginx-test --ignore-not-found > /dev/null 2>&1"

# Tóm tắt
log "============================================"
log "Kết quả: ${PASS} đạt, ${FAIL} thất bại"
log "============================================"

if [[ $FAIL -gt 0 ]]; then
    warn "Một số lần kiểm tra không thành công. Xem lại kết quả đầu ra ở trên."
    exit 1
else
    log "Tất cả các kiểm tra đã được thông qua! Cụm của bạn khỏe mạnh."
fi
