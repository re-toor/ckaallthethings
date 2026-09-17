#!/usr/bin/env bash
# ============================================================
# Bước 9: Xác minh và quản lý chứng chỉ
#
# kubeadm tạo bộ PKI khi chạy "kubeadm init":
#   /etc/kubernetes/pki/
#   ├── ca.crt / ca.key ← CA gốc cụm
#   ├── apiserver.crt / apiserver.key ← Máy chủ API TLS
#   ├── apiserver-kubelet-client.crt ← API→kubelet xác thực
#   ├── front-proxy-ca.crt / .key ← CA proxy phía trước
#   ├── front-proxy-client.crt / .key ← Lớp tổng hợp
#   ├── sa.key / sa.pub ← Khóa ký token ServiceAccount
#   └── etcd/
#       ├── ca.crt / ca.key ← etcd CA
#       ├── server.crt / server.key     ← etcd TLS
#       ├── peer.crt / peer.key ← etcd ngang hàng TLS
#       └── healthcheck-client.crt/key ← etcd kiểm tra sức khỏe
#
# Kịch bản này:
#   - Xác minh tất cả các chứng chỉ tồn tại trên cả hai control plane
#   - Kiểm tra ngày hết hạn (mặc định chứng chỉ lá hết hạn sau một năm)
#   - Xác thực CA nhất quán trên các control plane
#   - Cung cấp các lệnh gia hạn
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/env.sh"

PASS=0
FAIL=0
WARN=0

check_pass() { echo "    ✅ $1"; ((PASS+=1)); }
check_fail() { echo "    ❌ $1"; ((FAIL+=1)); }
check_warn() { echo "    ⚠️  $1"; ((WARN+=1)); }

# ──────────────────────────────────────────────
# 1. Xác minh tệp PKI tồn tại trên cả hai control plane
# ──────────────────────────────────────────────
log "1. Xác minh tệp PKI trên control plane..."

EXPECTED_FILES=(
    "ca.crt" "ca.key"
    "apiserver.crt" "apiserver.key"
    "apiserver-kubelet-client.crt" "apiserver-kubelet-client.key"
    "apiserver-etcd-client.crt" "apiserver-etcd-client.key"
    "front-proxy-ca.crt" "front-proxy-ca.key"
    "front-proxy-client.crt" "front-proxy-client.key"
    "sa.key" "sa.pub"
    "etcd/ca.crt" "etcd/ca.key"
    "etcd/server.crt" "etcd/server.key"
    "etcd/peer.crt" "etcd/peer.key"
    "etcd/healthcheck-client.crt" "etcd/healthcheck-client.key"
)

for i in "${!CP_IPS[@]}"; do
    ip="${CP_IPS[$i]}"
    host="${CP_HOSTS[$i]}"
    echo ""
    echo "  ${host} (${ip}):"

    for f in "${EXPECTED_FILES[@]}"; do
        if run_on "$ip" "sudo test -f /etc/kubernetes/pki/${f}" 2>/dev/null; then
            check_pass "${f}"
        else
            check_fail "${f} — KHÔNG TÌM THẤY"
        fi
    done
done

# ──────────────────────────────────────────────
# 2. Kiểm tra ngày hết hạn của chứng chỉ
# ──────────────────────────────────────────────
log "2. Ngày hết hạn của chứng chỉ (từ ${CP1_HOST})..."

echo ""
run_on "$CP1_IP" "sudo kubeadm certs check-expiration 2>/dev/null" || \
    warn "Không thể chạy kiểm tra hết hạn chứng chỉ kubeadm"

# Kiểm tra xem có chứng chỉ nào hết hạn trong vòng 30 ngày không
echo ""
echo "  Kiểm tra chứng chỉ sẽ hết hạn trong 30 ngày..."
CERTS_TO_CHECK=("ca" "apiserver" "apiserver-kubelet-client" "front-proxy-ca" "front-proxy-client" "apiserver-etcd-client" "etcd/ca" "etcd/server" "etcd/peer" "etcd/healthcheck-client")

THRESHOLD_DAYS=30
THRESHOLD_SECS=$((THRESHOLD_DAYS * 86400))
NOW=$(date +%s)

for cert in "${CERTS_TO_CHECK[@]}"; do
    EXPIRY=$(run_on "$CP1_IP" "sudo openssl x509 -in /etc/kubernetes/pki/${cert}.crt -noout -enddate 2>/dev/null | cut -d= -f2" || echo "")
    if [[ -n "$EXPIRY" ]]; then
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$EXPIRY" +%s 2>/dev/null || echo "0")
        REMAINING=$(( EXPIRY_EPOCH - NOW ))
        DAYS_LEFT=$(( REMAINING / 86400 ))
        if [[ $REMAINING -lt $THRESHOLD_SECS ]]; then
            check_warn "${cert}.crt sẽ hết hạn sau ${DAYS_LEFT} ngày!"
        else
            check_pass "${cert}.crt — còn ${DAYS_LEFT} ngày"
        fi
    fi
done

# ──────────────────────────────────────────────
# 3. Xác thực tính nhất quán của CA trên các control plane
# ──────────────────────────────────────────────
log "3. Xác thực tính nhất quán của CA trên các control plane..."

CA_FILES=("ca.crt" "front-proxy-ca.crt" "etcd/ca.crt" "sa.pub")
for ca in "${CA_FILES[@]}"; do
    HASH_CP1=$(run_on "$CP1_IP" "sudo sha256sum /etc/kubernetes/pki/${ca} 2>/dev/null | awk '{print \$1}'" || echo "none1")
    HASH_CP2=$(run_on "$CP2_IP" "sudo sha256sum /etc/kubernetes/pki/${ca} 2>/dev/null | awk '{print \$1}'" || echo "none2")
    if [[ "$HASH_CP1" == "$HASH_CP2" && "$HASH_CP1" != "none1" ]]; then
        check_pass "${ca} — khớp trên cả hai control plane"
    else
        check_fail "${ca} — KHÔNG KHỚP giữa các control plane!"
    fi
done

# ──────────────────────────────────────────────
# 4. Xác minh SAN chứng chỉ máy chủ API
# ──────────────────────────────────────────────
log "4. SAN chứng chỉ máy chủ API (Tên thay thế chủ đề)..."

echo ""
echo "  Chứng chỉ API server cần chứa IP của LB và cả hai control plane."
echo ""
SANS=$(run_on "$CP1_IP" "sudo openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -text 2>/dev/null | grep -A1 'Subject Alternative Name'" || echo "")
echo "  ${SANS}"
echo ""

for expected_ip in "$LB_IP" "$CP1_IP" "$CP2_IP"; do
    if echo "$SANS" | grep -q "$expected_ip"; then
        check_pass "SAN chứa ${expected_ip}"
    else
        check_warn "SAN thiếu ${expected_ip} — có thể cần tạo lại chứng chỉ apiserver"
    fi
done

# Kiểm tra xem IP dịch vụ kubernetes (IP đầu tiên trong dịch vụ CIDR) có được bao gồm không
# Mặc định: 10.96.0.1
if echo "$SANS" | grep -q "10.96.0.1"; then
    check_pass "SAN chứa IP Service kubernetes (10.96.0.1)"
fi

# ──────────────────────────────────────────────
# 5. Xác minh chứng chỉ ứng dụng khách kubelet trên workers
# ──────────────────────────────────────────────
log "5. Chứng chỉ máy khách Kubelet trên worker nodes..."

for i in "${!WORKER_IPS[@]}"; do
    ip="${WORKER_IPS[$i]}"
    host="${WORKER_HOSTS[$i]}"
    echo ""
    echo "  ${host} (${ip}):"

    if run_on "$ip" "sudo test -f /var/lib/kubelet/pki/kubelet-client-current.pem" 2>/dev/null; then
        check_pass "Đã có kubelet-client-current.pem"
        EXPIRY=$(run_on "$ip" "sudo openssl x509 -in /var/lib/kubelet/pki/kubelet-client-current.pem -noout -enddate 2>/dev/null | cut -d= -f2" || echo "unknown")
        echo "      Hết hạn: ${EXPIRY}"
    else
        check_warn "Không tìm thấy kubelet-client-current.pem (có thể đang dùng bootstrap token)"
    fi

    if run_on "$ip" "sudo test -f /etc/kubernetes/kubelet.conf" 2>/dev/null; then
        check_pass "Đã có kubelet.conf"
    else
        check_fail "Không tìm thấy kubelet.conf"
    fi
done

# ──────────────────────────────────────────────
# Tóm tắt
# ──────────────────────────────────────────────
echo ""
log "============================================"
log "Kết quả kiểm tra chứng chỉ"
log "✅ Đạt: ${PASS} ⚠️ Cảnh báo: ${WARN} ❌ Không đạt: ${FAIL}"
log "============================================"

if [[ $FAIL -gt 0 ]]; then
    err "Một số kiểm tra chứng chỉ không thành công. Xem đầu ra ở trên."
fi

if [[ $WARN -gt 0 ]]; then
    echo ""
    warn "Lệnh gia hạn chứng chỉ (chạy trên mỗi control plane):"
    echo ""
    echo "  # Gia hạn tất cả chứng chỉ:"
    echo "  sudo kubeadm certs renew all"
    echo ""
    echo "  # Gia hạn một chứng chỉ cụ thể:"
    echo "  sudo kubeadm certs renew apiserver"
    echo ""
    echo "  # Sau gia hạn, tạo lại từng Static Pod để nạp chứng chỉ mới."
    echo "  # Di chuyển từng manifest ra ngoài /etc/kubernetes/manifests,"
    echo "  # chờ kubelet dừng Pod, rồi đưa manifest trở lại và xác minh."
    echo "  # Chỉ restart kubelet không đảm bảo container nạp chứng chỉ mới."
    echo ""
    echo "  # Cập nhật bản sao kubeconfig sau khi gia hạn admin.conf:"
    echo '  sudo cp /etc/kubernetes/admin.conf "$HOME/.kube/config"'
    echo '  sudo chown "$(id -u):$(id -g)" "$HOME/.kube/config"'
fi
