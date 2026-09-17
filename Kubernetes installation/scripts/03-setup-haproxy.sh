#!/usr/bin/env bash
# ============================================================
# Bước 2: Cài đặt và cấu hình HAProxy trên bộ cân bằng tải
# ============================================================
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/env.sh"

log "Đang cài đặt HAProxy trên ${LB_HOST} (${LB_IP})..."

# Cài đặt HAProxy
run_on "$LB_IP" "bash -s" <<'INSTALL'
    sudo apt-get update -qq
    sudo apt-get install -y haproxy
    sudo cp /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg.bak
INSTALL

# Tạo và triển khai cấu hình (các biến được mở rộng cục bộ)
HAPROXY_CFG="global
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

# ----- Kubernetes API Server -----
frontend k8s-api
    bind *:6443
    mode tcp
    default_backend k8s-api-backend

backend k8s-api-backend
    mode tcp
    option tcp-check
    balance roundrobin
    server ${CP1_HOST} ${CP1_IP}:6443 check fall 3 rise 2
    server ${CP2_HOST} ${CP2_IP}:6443 check fall 3 rise 2

# ----- Bảng thống kê (http://${LB_IP}:8404/stats) -----
frontend stats
    bind *:8404
    mode http
    stats enable
    stats uri /stats
    stats refresh 10s"

echo "$HAPROXY_CFG" | run_on "$LB_IP" "sudo tee /etc/haproxy/haproxy.cfg > /dev/null"

# Kích hoạt và bắt đầu
run_on "$LB_IP" "sudo systemctl enable haproxy && sudo systemctl restart haproxy"

log "Quá trình thiết lập HAProxy đã hoàn tất."
log "Bảng điều khiển thống kê: http://${LB_IP}:8404/stats"
log "Điểm cuối API: ${LB_IP}:6443 -> ${CP1_IP}:6443, ${CP2_IP}:6443"
