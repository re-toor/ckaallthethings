<a id="complete-linux-network-commands-reference"></a>
<a id="heading-0-complete-linux-network-commands-reference"></a>

# Tra cứu đầy đủ lệnh mạng Linux

> **Bản tiếng Việt · CKA Kubernetes 1.35 · cập nhật 17/09/2026.** Đọc [các thay đổi cho phiên bản thi](kubernetes-1.35-update.md).

<a id="every-command-every-flag-every-option--with-examples--explanations"></a>
<a id="heading-1-every-command-every-flag-every-option-with-exa"></a>

## Mọi lệnh, mọi cờ, mọi tùy chọn — Có ví dụ và giải thích

---

<a id="table-of-contents"></a>

#### MỤC LỤC

1. ip — Giao diện mạng, định tuyến và quản lý đường hầm
2. ping — Kiểm tra kết nối ICMP
3. traceroute — Theo dõi lộ trình
4. tracepath — Theo dõi lộ trình không cần root
5. mtr — Kết hợp Traceroute + Ping
6. ss — Thống kê socket
7. netstat — Thống kê mạng (Cũ)
8. curl — Công cụ truyền dữ liệu
9. wget — Trình tải xuống không tương tác
10. dig — Tiện ích tra cứu DNS
11. nslookup — Công cụ truy vấn DNS
12. host — Tra cứu DNS đơn giản
13. nmap — Máy quét mạng
14. tcpdump — Thu thập và phân tích gói
15. iptables — Tường lửa (Netfilter)
16. nftables — Tường lửa hiện đại
17. firewall-cmd — Tường lửa CLI
18. ufw — Tường lửa đơn giản
19. ifconfig — Cấu hình giao diện (Cũ)
20. route — Bảng định tuyến (Cũ)
21. arp — Quản lý bộ đệm ARP
22. ip neigh — Quản lý ARP/NDP (Hiện đại)
23. ethtool — Cài đặt phần cứng NIC
24. nmcli — Trình quản lý mạng CLI
25. nmtui — Giao diện người dùng văn bản của Trình quản lý mạng
26. ssh — Secure Shell
27. scp — Sao chép an toàn
28. sftp — FTP an toàn
29. rsync — Đồng bộ hóa tệp từ xa
30. nc / netcat — Bộ công cụ mạng đa năng
31. ncat — Netcat hiện đại (Nmap)
32. socat — Rơle đa năng
33. whois — Tra cứu đăng ký tên miền
34. hostname / hostnamectl — Quản lý tên máy chủ
35. ipcalc — Máy tính địa chỉ IP
36. lsof — Liệt kê các socket mạng mở
37. fuser — Xác định các quy trình sử dụng cổng
38. iftop — Giám sát băng thông thời gian thực
39. vnstat — Giám sát giao thông (Lịch sử)
40. nethogs — Giám sát băng thông mỗi quá trình
41. bmon — Giám sát băng thông
42. iperf3 — Kiểm tra hiệu suất mạng
43. tc — Kiểm soát lưu lượng (QoS)
44. iwconfig — Cấu hình không dây (Cũ)
45. iw — Cấu hình không dây (Hiện đại)
46. brctl — Kiểm soát cầu nối (Cũ)
47. bridge — Quản lý cầu (Hiện đại)
48. tunctl / ip tuntap — Thiết bị TUN/TAP
49. vconfig / ip link — Quản lý Vlan
50. dhclient — Máy khách DHCP
51. resolvectl / systemd-resolve — Phân giải DNS
52. telnet — Kết nối từ xa (Cũ)
53. ab — Điểm chuẩn Apache HTTP
54. openssl s_client — Kiểm tra SSL/TLS
55. tcpflow — Tái tạo luồng TCP
56. tshark — Thiết bị đầu cuối Wireshark

---

<a id="1-ip--network-interface-routing--tunnel-management"></a>
<a id="heading-2-1-ip-network-interface-routing-tunnel-manage"></a>

# 1. `ip` — Quản lý giao diện mạng, định tuyến và đường hầm

Lệnh `ip` (từ gói `iproute2`) là công cụ chính để quản lý giao diện mạng, địa chỉ, định tuyến, đường hầm và các mục lân cận trên Linux hiện đại. Nó thay thế các lệnh `ifconfig`, `route`, `arp` và `vconfig` cũ hơn.

<a id="general-syntax"></a>
<a id="heading-3-general-syntax"></a>

## Cú pháp chung

```bash
ip [ OPTIONS ] OBJECT { COMMAND | help }
```

<a id="global-options-apply-to-all-subcommands"></a>
<a id="heading-4-global-options-apply-to-all-subcommands"></a>

## Tùy chọn chung (Áp dụng cho tất cả các lệnh con)

| Cờ | Dạng dài | Mô tả |
| ----------- | ---------------- | ---------------------------------------------------------------------------------- |
| `-c` | `-color` | Bật đầu ra màu để dễ đọc |
| `-s` | `-stats` | Xuất thêm số liệu thống kê; sử dụng `-s -s` để biết thêm |
| `-d` | `-details` | Xuất thông tin chi tiết hơn |
| `-h` | `-human` | Xuất số liệu thống kê mà con người có thể đọc được (với các đơn vị như K, M, G) |
| `-j` | `-json` | Đầu ra ở định dạng JSON (có thể phân tích cú pháp bằng máy) |
| `-p` | `-pretty` | Đầu ra JSON in đẹp (sử dụng với `-j`) |
| `-f FAMILY` | `-family FAMILY` | Họ giao thức: `inet` (IPv4), `inet6` (IPv6), `link` (lớp 2), `bridge`, `mpls` |
| `-4` |  | Viết tắt cho `-f inet` (chỉ IPv4) |
| `-6` |  | Viết tắt cho `-f inet6` (chỉ IPv6) |
| `-B` |  | Viết tắt của `-f bridge` |
| `-0` |  | Viết tắt cho `-f link` (lớp 2) |
| `-o` | `-oneline` | Xuất mỗi bản ghi trên một dòng (thay thế dòng mới bằng `\`) |
| `-r` | `-resolve` | Giải quyết tên DNS cho địa chỉ IP |
| `-n NETNS` | `-netns NETNS` | Chuyển sang mạng được chỉ định namespace trước khi chạy lệnh |
| `-a NETNS` | `-all` | Thực thi lệnh trên toàn bộ mạng namespaces |
| `-t` | `-timestamp` | Hiển thị dấu thời gian khi theo dõi |
| `-br` | `-brief` | In đầu ra ngắn gọn (định dạng bảng nhỏ gọn) |
| `-rc` | `-rcvbuf` | Đặt kích thước bộ đệm nhận socket netlink |
| `-l` | `-loops COUNT` | Số vòng lặp tối đa cho `ip addr flush` |
| `-b` | `-batch FILE` | Đọc lệnh từ tập tin batch |

<a id="ip-link--manage-network-interfaces"></a>
<a id="heading-5-ip-link-manage-network-interfaces"></a>

## `ip link` - Quản lý giao diện mạng

<a id="ip-link-show--display-interface-information"></a>
<a id="heading-6-ip-link-show-display-interface-information"></a>

### `ip link show` — Hiển thị thông tin giao diện

```bash
# Hiển thị tất cả giao diện
ip link show

# Hiển thị giao diện cụ thể
ip link show dev eth0

# Chỉ hiển thị giao diện UP
ip link show up

# Chỉ hiển thị các giao diện của một loại cụ thể
ip link show type bridge
ip link show type vlan
ip link show type veth
ip link show type bond

# Hiển thị với số liệu thống kê
ip -s link show

# Hiển thị ở dạng ngắn gọn
ip -br link show

# Hiển thị ở định dạng JSON
ip -j link show | jq .

# Lọc theo nhóm
ip link show group default
```

**Giải thích các trường đầu ra:**
- `<BROADCAST,MULTICAST,UP,LOWER_UP>` - Cờ giao diện hiển thị khả năng và trạng thái
  - `BROADCAST` - Có thể gửi khung phát sóng
  - `MULTICAST` - Hỗ trợ phát đa hướng
  - `UP` — Được quản trị viên kích hoạt (đã bật)
  - `LOWER_UP` - Đã phát hiện liên kết vật lý (cắm cáp)
  - `NO-CARRIER` - Không phát hiện thấy liên kết vật lý nào
  - `PROMISC` - Đã bật chế độ lăng nhăng
  - `LOOPBACK` - Thiết bị lặp lại
- `mtu 1500` - Đơn vị truyền tối đa (byte)
- `qdisc fq_codel` - Kỷ luật xếp hàng (lịch trình giao thông)
- `state UP` — Trạng thái hoạt động
- `mode DEFAULT` — Chế độ giao diện
- `group default` — Nhóm giao diện
- `qlen 1000` - Độ dài hàng đợi truyền
- `link/ether 00:11:22:33:44:55` — Địa chỉ MAC
- `brd ff:ff:ff:ff:ff:ff` - Địa chỉ quảng bá

<a id="ip-link-set--modify-interface-properties"></a>
<a id="heading-7-ip-link-set-modify-interface-properties"></a>

### `ip link set` - Sửa đổi thuộc tính giao diện

```bash
# Đưa giao diện lên
sudo ip link set eth0 up

# Đưa giao diện xuống
sudo ip link set eth0 down

# Thay đổi MTU (Đơn vị truyền tối đa)
sudo ip link set eth0 mtu 9000          # Khung Jumbo

# Thay đổi địa chỉ MAC
sudo ip link set eth0 down
sudo ip link set eth0 address 00:11:22:33:44:66
sudo ip link set eth0 up

# Đổi tên một giao diện (phải down trước)
sudo ip link set eth0 down
sudo ip link set eth0 name lan0
sudo ip link set lan0 up

# Bật chế độ lăng nhăng (nắm bắt tất cả lưu lượng truy cập trên phân khúc)
sudo ip link set eth0 promisc on

# Tắt chế độ lăng nhăng
sudo ip link set eth0 promisc off

# Đặt độ dài hàng đợi truyền
sudo ip link set eth0 txqueuelen 2000

# Đặt giao diện thành multicast
sudo ip link set eth0 multicast on

# Gán vào mạng namespace
sudo ip link set eth0 netns my_namespace

# Đặt giao diện chính (gắn vào bridge/bond)
sudo ip link set eth0 master br0

# Xóa khỏi chủ
sudo ip link set eth0 nomaster

# Đặt nhóm giao diện
sudo ip link set eth0 group 42

# Đặt ARP on/off
sudo ip link set eth0 arp off          # Tắt ARP
sudo ip link set eth0 arp on           # Kích hoạt ARP

# Đặt cờ động
sudo ip link set eth0 dynamic on
```

**Tất cả các cờ `ip link set`:**

| Cờ | Mô tả |
|------|-------------|
| `up` / `down` | Enable/disable giao diện |
| `arp on/off` | Enable/disable ARP trên giao diện |
| `multicast on/off` | Phát đa hướng Enable/disable |
| `promisc on/off` | Chế độ lăng nhăng Enable/disable |
| `dynamic on/off` | Cờ động Enable/disable |
| `allmulticast on/off` | Nhận tất cả các khung multicast |
| `mtu MTU` | Đặt đơn vị truyền tối đa |
| `name NAME` | Đổi tên giao diện (phải down) |
| `address LLADDR` | Đặt địa chỉ MAC/hardware |
| `broadcast LLADDR` | Đặt địa chỉ phát sóng |
| `peer LLADDR` | Đặt địa chỉ ngang hàng (điểm-điểm) |
| `txqueuelen NUM` | Đặt độ dài hàng đợi truyền |
| `netns NETNS` | Chuyển sang mạng namespace |
| `master DEVICE` | Gắn vào thiết bị chính (bridge/bond) |
| `nomaster` | Tách khỏi thiết bị chính |
| `group GROUP` | Đặt nhóm giao diện |
| `alias NAME` | Đặt chuỗi bí danh giao diện |
| `vf NUM` | Cài đặt chức năng ảo (SR-IOV) |
| `xdp` | Đặt chương trình XDP (eXpress Data Path) |
| `type TYPE ARGS` | Đặt thuộc tính dành riêng cho loại |

<a id="ip-link-add--create-virtual-interfaces"></a>
<a id="heading-8-ip-link-add-create-virtual-interfaces"></a>

### `ip link add` — Tạo giao diện ảo

```bash
# Tạo một cây cầu
sudo ip link add br0 type bridge

# Tạo giao diện Vlan (Vlan ID 100 trên eth0)
sudo ip link add link eth0 name eth0.100 type vlan id 100

# Tạo một cặp veth (cặp ethernet ảo)
sudo ip link add veth0 type veth peer name veth1

# Tạo một trái phiếu
sudo ip link add bond0 type bond mode 802.3ad

# Tạo giao diện giả
sudo ip link add dummy0 type dummy

# Tạo giao diện macvlan
sudo ip link add macvlan0 link eth0 type macvlan mode bridge

# Tạo thiết bị TUN
sudo ip tuntap add dev tun0 mode tun

# Tạo thiết bị TAP
sudo ip tuntap add dev tap0 mode tap

# Tạo đường hầm GRE
sudo ip link add gre1 type gre remote 203.0.113.1 local 198.51.100.1 ttl 255

# Tạo giao diện VXLAN
sudo ip link add vxlan0 type vxlan id 42 remote 203.0.113.1 dstport 4789 dev eth0

# Tạo giao diện WireGuard
sudo ip link add wg0 type wireguard

# Tạo đường hầm GENEVE
sudo ip link add geneve0 type geneve id 100 remote 10.0.0.1

# Tạo đường hầm IPIP
sudo ip link add ipip1 type ipip remote 203.0.113.1 local 198.51.100.1
```

**Các loại giao diện được hỗ trợ:**

| Loại | Mô tả |
|------|-------------|
| `bridge` | Cầu Ethernet |
| `bond` | Liên kết (tổng hợp liên kết) |
| `vlan` | Vlan 802.1Q |
| `veth` | Cặp Ethernet ảo |
| `dummy` | Giao diện giả |
| `macvlan` | Vlan dựa trên MAC |
| `macvtap` | Vlan dựa trên MAC với TAP |
| `ipvlan` | Vlan dựa trên IP |
| `vxlan` | Mạng LAN mở rộng ảo |
| `gre` / `gretap` | đường hầm GRE |
| `ip6gre` / `ip6gretap` | Đường hầm IPv6 GRE |
| `ipip` | IPv4 trong đường hầm IPv4 |
| `sit` | IPv6 trong đường hầm IPv4 |
| `ip6tnl` | Đường hầm IPv6 |
| `vti` / `vti6` | Giao diện đường hầm ảo |
| `wireguard` | WireGuard VPN |
| `geneve` | đường hầm GENEVE |
| `erspan` | đường hầm ERSPAN |
| `xfrm` | Chuyển đổi (IPsec) |
| `netdevsim` | Trình mô phỏng thiết bị mạng |
| `nlmon` | màn hình liên kết mạng |
| `ifb` | Khối chức năng trung gian |
| `can` | CÓ THỂ xe buýt |

<a id="ip-link-delete--remove-virtual-interfaces"></a>
<a id="heading-9-ip-link-delete-remove-virtual-interfaces"></a>

### `ip link delete` — Xóa giao diện ảo

```bash
sudo ip link delete br0
sudo ip link delete eth0.100
sudo ip link delete veth0          # Đồng thời xóa veth1 ngang hàng
```

---

<a id="ip-addr--ip-address--manage-ip-addresses"></a>
<a id="heading-10-ip-addr-ip-address-manage-ip-addresses"></a>

## `ip addr` / `ip address` — Quản lý địa chỉ IP

<a id="ip-addr-show--display-ip-addresses"></a>
<a id="heading-11-ip-addr-show-display-ip-addresses"></a>

### `ip addr show` — Hiển thị địa chỉ IP

```bash
# Hiển thị tất cả địa chỉ
ip addr show
ip addr                             # Viết tắt
ip a                                # Thậm chí còn ngắn hơn

# Hiển thị cho một giao diện cụ thể
ip addr show dev eth0

# Chỉ hiển thị địa chỉ IPv4
ip -4 addr show

# Chỉ hiển thị địa chỉ IPv6
ip -6 addr show

# Hiển thị định dạng ngắn gọn
ip -br addr show

# Hiển thị với bộ lọc phạm vi
ip addr show scope global           # Chỉ những địa chỉ có thể định tuyến toàn cầu
ip addr show scope link             # Chỉ các địa chỉ liên kết cục bộ
ip addr show scope host             # Chỉ địa chỉ máy chủ (loopback)

# Chỉ hiển thị địa chỉ chính
ip addr show primary

# Chỉ hiển thị địa chỉ phụ
ip addr show secondary

# Hiển thị địa chỉ khớp với nhãn
ip addr show label "eth0:*"

# Hiển thị cho một loại cụ thể
ip addr show type bridge

# Hiển thị địa chỉ IPv6 tạm thời (riêng tư)
ip addr show temporary

# Hiển thị các địa chỉ không được dùng nữa
ip addr show deprecated

# Hiển thị địa chỉ dự kiến (Đang xử lý DAD)
ip addr show tentative
```

**Giải thích các trường đầu ra:**
- `inet 192.168.1.100/24` - Địa chỉ IPv4 có độ dài tiền tố
- `brd 192.168.1.255` - Địa chỉ quảng bá
- `scope global` - Phạm vi địa chỉ (toàn cầu, liên kết, máy chủ)
- `dynamic` - Được chỉ định bởi DHCP
- `noprefixroute` - Không có tuyến tiền tố tự động
- `valid_lft forever` - Thời gian tồn tại hợp lệ (hoặc số giây còn lại)
- `preferred_lft forever` — Tuổi thọ ưu tiên

<a id="ip-addr-add--assign-ip-addresses"></a>
<a id="heading-12-ip-addr-add-assign-ip-addresses"></a>

### `ip addr add` - Gán địa chỉ IP

```bash
# Thêm địa chỉ IPv4
sudo ip addr add 192.168.1.100/24 dev eth0

# Thêm địa chỉ IPv4 có tính năng phát sóng
sudo ip addr add 192.168.1.100/24 brd 192.168.1.255 dev eth0

# Thêm địa chỉ IPv4 có nhãn (bí danh)
sudo ip addr add 192.168.1.101/24 dev eth0 label eth0:1

# Thêm địa chỉ IPv6
sudo ip addr add 2001:db8::1/64 dev eth0

# Thêm địa chỉ điểm-điểm
sudo ip addr add 10.0.0.1 peer 10.0.0.2/32 dev tun0

# Thêm thời gian sống hợp lệ và ưu tiên cụ thể (giây)
sudo ip addr add 192.168.1.100/24 dev eth0 valid_lft 3600 preferred_lft 1800

# Ngăn chặn việc tạo tuyến tiền tố tự động
sudo ip addr add 192.168.1.100/24 dev eth0 noprefixroute

# Thêm không có DAD (Phát hiện địa chỉ trùng lặp) cho IPv6
sudo ip addr add 2001:db8::1/64 dev eth0 nodad

# Thêm bằng cờ nhà (Mobile IPv6)
sudo ip addr add 2001:db8::1/64 dev eth0 home
```

**Cờ `ip addr add`:**

| Cờ | Mô tả |
|------|-------------|
| `dev DEVICE` | Giao diện thêm địa chỉ vào |
| `local ADDRESS` | Địa chỉ (có thể bỏ từ khóa `local`) |
| `peer ADDRESS` | Địa chỉ ngang hàng (điểm-điểm) |
| `broadcast ADDRESS` | Địa chỉ quảng bá (`+` để tự động tính toán) |
| `label LABEL` | Giao diện label/alias (e.g., `eth0:1`) |
| `scope SCOPE` | `global`, `link`, `host` hoặc số |
| `valid_lft SECONDS` | Tuổi thọ hợp lệ (`forever` hoặc giây) |
| `preferred_lft SECONDS` | Tuổi thọ ưa thích |
| `noprefixroute` | Không tự động thêm tuyến tiền tố |
| `home` | Địa chỉ nhà (IPv6 di động) |
| `nodad` | Bỏ qua phát hiện địa chỉ trùng lặp |
| `mngtmpaddr` | Quản lý địa chỉ tạm thời |

<a id="ip-addr-del--remove-ip-addresses"></a>
<a id="heading-13-ip-addr-del-remove-ip-addresses"></a>

### `ip addr del` - Xóa địa chỉ IP

```bash
# Xóa một địa chỉ cụ thể
sudo ip addr del 192.168.1.100/24 dev eth0

# Xóa địa chỉ IPv6
sudo ip addr del 2001:db8::1/64 dev eth0
```

<a id="ip-addr-flush--remove-all-addresses-from-an-interface"></a>
<a id="heading-14-ip-addr-flush-remove-all-addresses-from-an-inter"></a>

### `ip addr flush` - Xóa tất cả địa chỉ khỏi giao diện

```bash
# Xóa tất cả địa chỉ khỏi một giao diện
sudo ip addr flush dev eth0

# Chỉ xóa địa chỉ IPv4
sudo ip -4 addr flush dev eth0

# Chỉ xóa các địa chỉ liên kết cục bộ
sudo ip addr flush dev eth0 scope link

# Xả bằng bộ lọc nhãn
sudo ip addr flush label "eth0:*"
```

---

<a id="ip-route--manage-the-routing-table"></a>
<a id="heading-15-ip-route-manage-the-routing-table"></a>

## `ip route` - Quản lý bảng định tuyến

<a id="ip-route-show--display-routes"></a>
<a id="heading-16-ip-route-show-display-routes"></a>

### `ip route show` — Hiển thị các tuyến đường

```bash
# Hiển thị tất cả các tuyến đường (bảng chính)
ip route show
ip route                             # Viết tắt
ip r                                 # Thậm chí còn ngắn hơn

# Chỉ hiển thị các tuyến IPv6
ip -6 route show

# Hiển thị bảng định tuyến cụ thể
ip route show table local
ip route show table all              # Tất cả các bảng

# Hiển thị lộ trình cho một điểm đến cụ thể
ip route get 8.8.8.8                 # Hiển thị tuyến đường nào sẽ được sử dụng
ip route get 8.8.8.8 from 192.168.1.100 iif eth0

# Hiển thị các tuyến đường khớp với tiền tố
ip route show match 10.0.0.0/8

# Hiển thị các tuyến đường khớp chính xác với tiền tố
ip route show exact 10.0.0.0/24

# Hiển thị các tuyến đường qua một cổng cụ thể
ip route show via 192.168.1.1

# Hiển thị tuyến đường trên một thiết bị cụ thể
ip route show dev eth0

# Hiển thị các tuyến đường với một giao thức cụ thể
ip route show proto static
ip route show proto dhcp
ip route show proto kernel
ip route show proto bird            # BGP/OSPF qua BIRD

# Hiển thị các tuyến đường được lưu trong bộ nhớ đệm
ip route show cache

# Hiển thị các tuyến đường có phạm vi cụ thể
ip route show scope link

# Hiển thị các tuyến đường theo một loại cụ thể
ip route show type local
ip route show type broadcast
ip route show type unreachable
```

**Giải thích các trường đầu ra:**
- `default via 192.168.1.1 dev eth0` - Tuyến mặc định qua cổng
- `proto kernel` — Nguồn gốc tuyến đường: `kernel` (tự động), `boot` (khởi động), `static` (thủ công), `dhcp`
- `scope link` - Phạm vi tuyến đường
- `src 192.168.1.100` - Địa chỉ nguồn ưa thích
- `metric 100` - Số liệu tuyến đường (ưu tiên; thấp hơn = ưu tiên)
- `mtu 1500` — Đường dẫn MTU
- `advmss 1460` — MSS được quảng cáo

<a id="ip-route-add--add-routes"></a>
<a id="heading-17-ip-route-add-add-routes"></a>

### `ip route add` — Thêm tuyến đường

```bash
# Thêm một cổng mặc định
sudo ip route add default via 192.168.1.1 dev eth0

# Thêm tuyến mạng
sudo ip route add 10.0.0.0/8 via 192.168.1.1

# Thêm tuyến mạng thông qua một thiết bị cụ thể
sudo ip route add 10.0.0.0/8 via 192.168.1.1 dev eth0

# Thêm tuyến đường với số liệu cụ thể
sudo ip route add 10.0.0.0/8 via 192.168.1.1 metric 100

# Thêm tuyến đường có địa chỉ nguồn cụ thể
sudo ip route add 10.0.0.0/8 via 192.168.1.1 src 192.168.1.100

# Thêm tuyến máy chủ (vào một IP)
sudo ip route add 10.0.0.5/32 via 192.168.1.1

# Thêm tuyến đường với MTU
sudo ip route add 10.0.0.0/8 via 192.168.1.1 mtu 1400

# Thêm tuyến đường không thể truy cập (gói bị từ chối bằng ICMP)
sudo ip route add unreachable 10.99.0.0/16

# Thêm tuyến đường lỗ đen (các gói bị loại bỏ âm thầm)
sudo ip route add blackhole 10.99.0.0/16

# Thêm tuyến đường bị cấm (gói bị từ chối do bị quản trị viên ICMP cấm)
sudo ip route add prohibit 10.99.0.0/16

# Thêm đường ném (không có đường đến đích trong bảng này)
sudo ip route add throw 10.99.0.0/16

# Thêm vào bảng định tuyến cụ thể
sudo ip route add 10.0.0.0/8 via 192.168.1.1 table 100

# Thêm tuyến đường đa đường (ECMP) có trọng số
sudo ip route add 10.0.0.0/8 \
  nexthop via 192.168.1.1 weight 1 \
  nexthop via 192.168.2.1 weight 2

# Thêm tuyến đường với thẻ giao thức cụ thể
sudo ip route add 10.0.0.0/8 via 192.168.1.1 proto static

# Thêm tuyến đường với gợi ý window/rtt/rttvar
sudo ip route add 10.0.0.0/8 via 192.168.1.1 window 65535 rtt 100ms

# Thêm tuyến đường với kiểm soát tắc nghẽn
sudo ip route add 10.0.0.0/8 via 192.168.1.1 congctl bbr

# Thêm tuyến đường với MSS nâng cao
sudo ip route add 10.0.0.0/8 via 192.168.1.1 advmss 1400

# Thêm tuyến đường với vương quốc
sudo ip route add 10.0.0.0/8 via 192.168.1.1 realm 5

# Thêm tuyến đường có liên kết trực tuyến (cổng được kết nối trực tiếp ngay cả khi không có mạng con phù hợp)
sudo ip route add 10.0.0.0/8 via 192.168.1.1 dev eth0 onlink

# Thay thế tuyến đường (thêm hoặc cập nhật)
sudo ip route replace default via 192.168.1.1 dev eth0

# Thay đổi thuộc tính tuyến đường (tuyến đường phải tồn tại)
sudo ip route change 10.0.0.0/8 via 192.168.1.1 mtu 1400
```

**Tất cả các thông số `ip route add`:**

| tham số | Mô tả |
|-----------|-------------|
| `via ADDRESS` | Địa chỉ cổng tiếp theo |
| `dev DEVICE` | Giao diện đầu ra |
| `src ADDRESS` | Địa chỉ nguồn ưa thích |
| `metric NUM` / `preference NUM` | Ưu tiên tuyến đường (thấp hơn = ưu tiên) |
| `mtu NUM` | Đường dẫn MTU |
| `mtu lock NUM` | Đường dẫn MTU bị khóa (không thực hiện PMTUD) |
| `advmss NUM` | MSS được quảng cáo cho các kết nối TCP |
| `table TABLE` | Tên hoặc số bảng định tuyến |
| `proto PROTO` | Giao thức định tuyến: `static`, `boot`, `kernel`, `dhcp`, v.v. |
| `scope SCOPE` | `global`, `link`, `host` |
| `type TYPE` | `unicast`, `local`, `broadcast`, `multicast`, `throw`, `unreachable`, `prohibit`, `blackhole`, `nat` |
| `weight NUM` | Trọng lượng đa đường |
| `onlink` | Gateway được kết nối trực tiếp |
| `nexthop` | Thông số kỹ thuật đa bước nhảy |
| `window NUM` | Gợi ý cửa sổ TCP |
| `rtt TIME` | Ước tính RTT ban đầu |
| `rttvar TIME` | Phương sai RTT ban đầu |
| `ssthresh NUM` | Ngưỡng bắt đầu chậm |
| `cwnd NUM` | Kích thước cửa sổ tắc nghẽn |
| `initcwnd NUM` | Cửa sổ tắc nghẽn ban đầu |
| `initrwnd NUM` | Cửa sổ nhận ban đầu |
| `quickack BOOL` | Enable/disable ACK nhanh |
| `congctl NAME` | Thuật toán kiểm soát tắc nghẽn |
| `features FEATURES` | Tính năng tuyến đường (`ecn`) |
| `realm REALM` | Lĩnh vực định tuyến |
| `expires SECONDS` | Thời gian hết hạn của tuyến đường |
| `pref PREFERENCE` | Tùy chọn tuyến đường IPv6: `low`, `medium`, `high` |

<a id="ip-route-del--delete-routes"></a>
<a id="heading-18-ip-route-del-delete-routes"></a>

### `ip route del` — Xóa tuyến đường

```bash
# Xóa một tuyến đường
sudo ip route del 10.0.0.0/8 via 192.168.1.1

# Xóa tuyến đường mặc định
sudo ip route del default

# Xóa khỏi một bảng cụ thể
sudo ip route del 10.0.0.0/8 table 100
```

<a id="ip-route-flush--remove-multiple-routes"></a>
<a id="heading-19-ip-route-flush-remove-multiple-routes"></a>

### `ip route flush` - Xóa nhiều tuyến đường

```bash
# Xóa tất cả các tuyến đường thông qua một cổng cụ thể
sudo ip route flush via 192.168.1.1

# Xóa tất cả các tuyến đường trong một bảng
sudo ip route flush table 100

# Xóa bộ đệm định tuyến
sudo ip route flush cache

# Xóa các tuyến phù hợp với một giao thức
sudo ip route flush proto dhcp
```

---

<a id="ip-neigh--manage-arpndp-cache-neighbor-table"></a>
<a id="heading-20-ip-neigh-manage-arpndp-cache-neighbor-table"></a>

## `ip neigh` - Quản lý bộ đệm ARP/NDP (Bảng lân cận)

```bash
# Hiển thị bảng lân cận (ARP cho IPv4, NDP cho IPv6)
ip neigh show
ip neigh                             # Viết tắt
ip n                                 # Thậm chí còn ngắn hơn

# Hiển thị cho một giao diện cụ thể
ip neigh show dev eth0

# Chỉ hiển thị các mục có thể truy cập
ip neigh show nud reachable

# Hiển thị các mục có trạng thái cụ thể
ip neigh show nud stale
ip neigh show nud failed
ip neigh show nud permanent

# Thêm mục nhập ARP tĩnh
sudo ip neigh add 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0

# Thêm mục ARP vĩnh viễn
sudo ip neigh add 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0 nud permanent

# Xóa một mục
sudo ip neigh del 192.168.1.50 dev eth0

# Thay đổi một mục nhập
sudo ip neigh change 192.168.1.50 lladdr 00:11:22:33:44:66 dev eth0

# Thay thế một mục (thêm hoặc cập nhật)
sudo ip neigh replace 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0

# Xóa bộ đệm ARP
sudo ip neigh flush all
sudo ip neigh flush dev eth0
sudo ip neigh flush nud stale

# Hiển thị các mục ARP proxy
ip neigh show proxy
```

** NUD (Phát hiện hàng xóm không thể truy cập):**

| tiểu bang | Mô tả |
|-------|-------------|
| `permanent` | Cấu hình thủ công, không bao giờ hết hạn |
| `noarp` | Hợp lệ nhưng không cần ARP (e.g., loopback) |
| `reachable` | Hợp lệ, đã được xác nhận gần đây có thể truy cập được |
| `stale` | Hợp lệ nhưng có thể không thể truy cập được |
| `delay` | Đang chờ gửi thăm dò |
| `probe` | Tích cực thăm dò |
| `failed` | Độ phân giải không thành công |
| `incomplete` | Yêu cầu ARP đã được gửi, đang chờ trả lời |
| `none` | Trạng thái giả |

---

<a id="ip-rule--policy-based-routing-rules"></a>
<a id="heading-21-ip-rule-policy-based-routing-rules"></a>

## `ip rule` — Quy tắc định tuyến dựa trên chính sách

```bash
# Hiển thị tất cả các quy tắc định tuyến
ip rule show
ip rule list

# Thêm quy tắc: lưu lượng truy cập từ 192.168.1.0/24 sử dụng bảng 100
sudo ip rule add from 192.168.1.0/24 table 100

# Thêm quy tắc có mức độ ưu tiên
sudo ip rule add from 192.168.1.0/24 table 100 priority 100

# Định tuyến lưu lượng đến một đích cụ thể thông qua bảng 200
sudo ip rule add to 10.0.0.0/8 table 200

# Lộ trình dựa trên dấu tường lửa
sudo ip rule add fwmark 1 table 100

# Định tuyến dựa trên giao diện đến
sudo ip rule add iif eth0 table 100

# Định tuyến dựa trên giao diện đi
sudo ip rule add oif eth1 table 200

# Tuyến đường dựa trên TOS (Loại Service)
sudo ip rule add tos 0x10 table 100

# Định tuyến dựa trên giao thức IP
sudo ip rule add ipproto tcp table 100

# Tuyến đường dựa trên phạm vi cổng nguồn
sudo ip rule add sport 1024-65535 table 100

# Tuyến đường dựa trên phạm vi cổng đích
sudo ip rule add dport 80 table 100

# Thêm quy tắc không thể truy cập
sudo ip rule add from 10.99.0.0/16 unreachable

# Xóa quy tắc
sudo ip rule del from 192.168.1.0/24 table 100

# Xóa tất cả các quy tắc (NGUY HIỂM - xóa tất cả các quy tắc chính sách)
sudo ip rule flush
```

---

<a id="ip-tunnel--manage-ip-tunnels"></a>
<a id="heading-22-ip-tunnel-manage-ip-tunnels"></a>

## `ip tunnel` - Quản lý đường hầm IP

```bash
# Hiển thị tất cả các đường hầm
ip tunnel show

# Tạo đường hầm IPIP
sudo ip tunnel add tun0 mode ipip remote 203.0.113.1 local 198.51.100.1

# Tạo đường hầm GRE
sudo ip tunnel add gre1 mode gre remote 203.0.113.1 local 198.51.100.1 ttl 255

# Tạo đường hầm SIT (IPv6 qua IPv4)
sudo ip tunnel add sit1 mode sit remote 203.0.113.1 local 198.51.100.1

# Thay đổi thông số đường hầm
sudo ip tunnel change gre1 ttl 128

# Xóa một đường hầm
sudo ip tunnel del tun0
```

**Chế độ đường hầm:**

| Chế độ | Mô tả |
|------|-------------|
| `ipip` | IPv4 trong IPv4 |
| `gre` | Đóng gói định tuyến chung |
| `sit` | IPv6 trong IPv4 (Chuyển đổi Internet Đơn giản) |
| `isatap` | Giao thức đánh địa chỉ đường hầm tự động nội bộ |
| `vti` | Giao diện đường hầm ảo (dành cho IPsec) |
| `ip6ip6` | IPv6 trong IPv6 |
| `ipip6` | IPv4 trong IPv6 |
| `ip6gre` | GRE qua IPv6 |
| `any` | Bất kỳ sự đóng gói nào |

---

<a id="ip-netns--manage-network-namespaces"></a>
<a id="heading-23-ip-netns-manage-network-namespaces"></a>

## `ip netns` - Quản lý namespace mạng

```bash
# Liệt kê tất cả các mạng có tên namespaces
ip netns list

# Tạo namespace mới
sudo ip netns add my_ns

# Xóa namespace
sudo ip netns delete my_ns

# Thực thi lệnh trong namespace
sudo ip netns exec my_ns ip addr show
sudo ip netns exec my_ns bash        # Mở shell trong namespace

# Xác định namespace của một quy trình
ip netns identify PID

# Đính kèm quy trình vào namespace
ip netns attach my_ns PID

# Giám sát các sự kiện namespace
ip netns monitor

# Đặt namespace làm hiện tại (đối với các lệnh ip tiếp theo)
sudo ip -n my_ns addr show           # -n viết tắt của -netns
```

---

<a id="ip-maddr--manage-multicast-addresses"></a>
<a id="heading-24-ip-maddr-manage-multicast-addresses"></a>

## `ip maddr` - Quản lý địa chỉ Multicast

```bash
# Hiển thị tất cả các địa chỉ multicast
ip maddr show

# Hiển thị cho một giao diện cụ thể
ip maddr show dev eth0

# Thêm địa chỉ multicast
sudo ip maddr add 01:00:5e:00:00:01 dev eth0

# Xóa địa chỉ multicast
sudo ip maddr del 01:00:5e:00:00:01 dev eth0
```

---

<a id="ip-mroute--multicast-routing-cache"></a>
<a id="heading-25-ip-mroute-multicast-routing-cache"></a>

## `ip mroute` - Bộ đệm định tuyến đa hướng

```bash
# Hiển thị bộ nhớ đệm định tuyến multicast
ip mroute show
```

---

<a id="ip-monitor--real-time-monitoring"></a>
<a id="heading-26-ip-monitor-real-time-monitoring"></a>

## `ip monitor` — Giám sát thời gian thực

```bash
# Giám sát tất cả các thay đổi (địa chỉ, tuyến đường, liên kết, v.v.)
ip monitor all

# Chỉ theo dõi các thay đổi liên kết
ip monitor link

# Chỉ theo dõi các thay đổi địa chỉ
ip monitor address

# Chỉ theo dõi những thay đổi về tuyến đường
ip monitor route

# Chỉ giám sát những thay đổi của hàng xóm
ip monitor neigh

# Giám sát bằng dấu thời gian
ip -t monitor all

# Giám sát trong namespace cụ thể
sudo ip -n my_ns monitor all
```

---

<a id="ip-xfrm--ipsec--security-association-management"></a>
<a id="heading-27-ip-xfrm-ipsec-security-association-management"></a>

## `ip xfrm` — IPsec / Quản lý hiệp hội bảo mật

```bash
# Hiển thị Hiệp hội bảo mật IPsec
ip xfrm state list

# Hiển thị chính sách bảo mật IPsec
ip xfrm policy list

# Giám sát các sự kiện IPsec
ip xfrm monitor

# Xóa tất cả SA
sudo ip xfrm state flush

# Xóa tất cả các chính sách
sudo ip xfrm policy flush
```

---

<a id="ip-tcp_metrics--tcp-metrics-cache"></a>
<a id="heading-28-ip-tcpmetrics-tcp-metrics-cache"></a>

## `ip tcp_metrics` — Bộ đệm chỉ số TCP

```bash
# Hiển thị số liệu TCP được lưu trong bộ nhớ cache
ip tcp_metrics show

# Hiển thị cho một điểm đến cụ thể
ip tcp_metrics show 8.8.8.8

# Xóa số liệu được lưu trong bộ nhớ đệm
sudo ip tcp_metrics flush

# Xóa số liệu cho một đích đến cụ thể
sudo ip tcp_metrics delete 8.8.8.8
```

---

<a id="ip-token--ipv6-tokenized-interface-identifiers"></a>
<a id="heading-29-ip-token-ipv6-tokenized-interface-identifiers"></a>

## `ip token` — Số nhận dạng giao diện được mã hóa IPv6

```bash
# Hiển thị mã thông báo hiện tại
ip token show

# Đặt mã thông báo cho giao diện
sudo ip token set ::1234:5678:90ab:cdef dev eth0
```

---

<a id="ip-l2tp--l2tpv3-management"></a>
<a id="heading-30-ip-l2tp-l2tpv3-management"></a>

## `ip l2tp` — Quản lý L2TPv3

```bash
# Hiển thị đường hầm L2TP
ip l2tp show tunnel

# Hiển thị phiên L2TP
ip l2tp show session

# Thêm một đường hầm
sudo ip l2tp add tunnel tunnel_id 1 peer_tunnel_id 1 encap udp \
  local 198.51.100.1 remote 203.0.113.1 udp_sport 5000 udp_dport 5000

# Thêm một phiên
sudo ip l2tp add session tunnel_id 1 session_id 1 peer_session_id 1

# Xóa một phiên
sudo ip l2tp del session tunnel_id 1 session_id 1

# Xóa một đường hầm
sudo ip l2tp del tunnel tunnel_id 1
```

---

<a id="2-ping--icmp-connectivity-testing"></a>
<a id="heading-31-2-ping-icmp-connectivity-testing"></a>

# 2. `ping` - Kiểm tra kết nối ICMP

Gửi các gói Yêu cầu tiếng vang ICMP để kiểm tra xem máy chủ có thể truy cập được hay không và đo thời gian khứ hồi.

<a id="syntax"></a>
<a id="heading-32-syntax"></a>

## Cú pháp

```bash
ping [OPTIONS] DESTINATION
```

<a id="all-flags-and-options"></a>
<a id="heading-33-all-flags-and-options"></a>

## Tất cả cờ và tùy chọn

| Cờ | Mô tả |
|------|-------------|
| `-c COUNT` | Dừng sau khi gửi COUNT gói |
| `-i INTERVAL` | Giây giữa các gói (mặc định: 1). Khoảng thời gian < 0.2 yêu cầu root |
| `-w DEADLINE` | Thời gian chờ tính bằng giây; ping thoát sau nhiều giây này bất kể gói sent/received |
| `-W TIMEOUT` | Thời gian chờ đợi mỗi phản hồi tính bằng giây |
| `-s SIZE` | Kích thước tải trọng tính bằng byte (mặc định: 56, tổng ICMP = 64 có tiêu đề) |
| `-t TTL` | Đặt thời gian IP tồn tại |
| `-I INTERFACE` | Liên kết với một giao diện cụ thể hoặc địa chỉ IP nguồn |
| `-f` | Flood ping - gửi các gói nhanh nhất có thể (chỉ root). In `.` để gửi và xóa lùi để nhận |
| `-l PRELOAD` | Gửi gói PRELOAD trước khi chờ trả lời (chỉ root) |
| `-n` | Chỉ đầu ra dạng số (không phân giải tên máy chủ) |
| `-q` | Chế độ im lặng - chỉ hiển thị tóm tắt ở cuối |
| `-v` | đầu ra dài dòng |
| `-a` | Âm thanh ping - tiếng bíp trên mỗi câu trả lời |
| `-A` | Ping thích ứng - điều chỉnh khoảng thời gian thành RTT |
| `-b` | Cho phép ping địa chỉ quảng bá |
| `-B` | Không cho phép ping thay đổi địa chỉ nguồn |
| `-d` | Đặt tùy chọn socket SO_DEBUG |
| `-D` | In dấu thời gian (thời gian Unix + micro giây) trước mỗi dòng |
| `-F FLOW` | Đặt nhãn luồng IPv6 (chỉ IPv6) |
| `-L` | Ngăn chặn loopback của các gói multicast |
| `-m MARK` | Đặt dấu định tuyến trên các gói gửi đi |
| `-M HINT` | Chiến lược khám phá đường dẫn MTU: `do` (đặt DF), `want` (thử DF), `dont` (không đặt DF) |
| `-N` | Sử dụng truy vấn thông tin nút ICMP (IPv6) |
| `-O` | Báo cáo các phản hồi ICMP ECHO chưa được xử lý trước khi gửi tiếp theo |
| `-p PATTERN` | Điền vào các byte đệm bằng mẫu hex (e.g., `-p ff`) |
| `-Q TOS` | Đặt chất lượng của các bit Service/DSCP trong tiêu đề IP |
| `-r` | Bỏ qua bảng định tuyến (gửi trực tiếp trên mạng đính kèm) |
| `-R` | Ghi lại tuyến đường (IPv4; giới hạn ở 9 bước nhảy) |
| `-S SNDBUF` | Đặt kích thước bộ đệm gửi socket |
| `-T OPTION` | Đặt tùy chọn dấu thời gian IP đặc biệt: `tsonly`, `tsandaddr`, `tsprespec` |
| `-U` | In độ trễ đầy đủ giữa người dùng với người dùng |
| `-4` | Buộc IPv4 |
| `-6` | Buộc IPv6 |

<a id="examples"></a>
<a id="heading-34-examples"></a>

## Ví dụ

```bash
# Ping cơ bản
ping google.com
# Đầu ra: 64 byte từ 142.250.80.46: icmp_seq=1 ttl=118 time=11.2 ms

# Ping 5 lần rồi dừng
ping -c 5 192.168.1.1

# Ping với khoảng thời gian thứ hai 0.2
ping -i 0.2 192.168.1.1

# Ping với thời hạn 10 giây (thoát sau 10 giây)
ping -w 10 192.168.1.1

# Ping với kích thước gói lớn (kiểm tra MTU)
ping -s 1472 -M do 192.168.1.1
# Nếu gói quá lớn, bạn sẽ thấy: "Cần mảnh và bộ DF"
# Điều này giúp tìm MTU tối đa trên đường đi

# Flood ping (chỉ root, kiểm tra mất stress/packet)
sudo ping -f -c 1000 192.168.1.1

# Ping từ một IP nguồn cụ thể
ping -I 192.168.1.100 8.8.8.8

# Ping từ một giao diện cụ thể
ping -I eth0 8.8.8.8

# Ping với dấu thời gian
ping -D -c 3 google.com

# Chế độ im lặng (chỉ tóm tắt)
ping -q -c 10 google.com
# Đầu ra:
# 10 gói được truyền, 10 gói được nhận, mất gói 0%, thời gian 9012ms
# rtt min/avg/max/mdev = 10.123/11.456/14.789/1.234 ms

# Ping có tiếng bíp
ping -a google.com

# Đặt TTL thành 10 (sẽ thất bại nếu đích đến cách xa >10 bước nhảy)
ping -t 10 google.com

# Ping địa chỉ quảng bá (khám phá máy chủ trên mạng LAN)
ping -b 192.168.1.255

# Đầu ra số (bỏ qua phân giải DNS)
ping -n -c 3 8.8.8.8

# Ping thích ứng (điều chỉnh khoảng thời gian để phù hợp với RTT)
ping -A -c 20 google.com

# Tùy chọn ghi lại lộ trình
ping -R -c 1 google.com

# Set TOS/DSCP
ping -Q 0x10 google.com

# Ping IPv6
ping -6 ipv6.google.com
ping6 ipv6.google.com               # Lệnh thay thế
```

**Tìm hiểu đầu ra ping:**

```
PING google.com (142.250.80.46) 56(84) bytes of data.
64 bytes from lax17s55-in-f14.1e100.net (142.250.80.46): icmp_seq=1 ttl=118 time=11.2 ms
```

- `56(84)` - Tải trọng 56 byte + tiêu đề ICMP 8 byte + tiêu đề IP 20 byte = tổng cộng 84 byte
- `icmp_seq=1` - Số thứ tự (khoảng trống biểu thị mất gói)
- `ttl=118` — Số bước nhảy còn lại (bắt đầu ở 128, do đó còn khoảng ~10 bước nhảy)
- `time=11.2 ms` - Thời gian khứ hồi

**Thống kê tóm tắt:**

```
--- google.com ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 4006ms
rtt min/avg/max/mdev = 10.123/11.456/14.789/1.234 ms
```

- `min` — Chuyến đi khứ hồi nhanh nhất
- `avg` - Chuyến đi khứ hồi trung bình
- `max` — Chuyến đi khứ hồi chậm nhất
- `mdev` — Độ lệch chuẩn (jitter)

---

<a id="3-traceroute--trace-the-route-to-a-host"></a>
<a id="heading-35-3-traceroute-trace-the-route-to-a-host"></a>

# 3. `traceroute` - Theo dõi lộ trình đến máy chủ

Ánh xạ mọi bộ định tuyến (hop) giữa máy của bạn và đích đến bằng cách gửi các gói có giá trị TTL tăng dần. Khi TTL hết hạn ở một bộ định tuyến, nó sẽ gửi lại thông báo ICMP Time Exceeded.

<a id="syntax-1"></a>
<a id="heading-36-syntax"></a>

## Cú pháp

```bash
traceroute [OPTIONS] DESTINATION [PACKET_LENGTH]
```

<a id="all-flags-and-options-1"></a>
<a id="heading-37-all-flags-and-options"></a>

## Tất cả cờ và tùy chọn

| Cờ | Mô tả |
|------|-------------|
| `-4` | Buộc IPv4 |
| `-6` | Buộc IPv6 |
| `-I` | Sử dụng ICMP ECHO thay vì UDP (yêu cầu root) |
| `-T` | Sử dụng TCP SYN thay vì UDP (yêu cầu root; tốt cho các máy chủ có tường lửa) |
| `-U` | Sử dụng UDP (mặc định) |
| `-d` | Bật gỡ lỗi socket |
| `-F` | Đặt cờ Không phân mảnh |
| `-f FIRST_TTL` | Bắt đầu với TTL này (mặc định: 1) |
| `-g GATEWAY` | Sử dụng định tuyến nguồn lỏng lẻo thông qua cổng này |
| `-i INTERFACE` | Liên kết với một giao diện cụ thể |
| `-m MAX_TTL` | TTL tối đa/số bước nhảy (mặc định: 30) |
| `-n` | Chỉ đầu ra dạng số (không phân giải tên máy chủ) |
| `-p PORT` | Cổng đích (mặc định: 33434 cho UDP, 80 cho TCP) |
| `-q NQUERIES` | Số lượng đầu dò trên mỗi bước nhảy (mặc định: 3) |
| `-r` | Bỏ qua bảng định tuyến |
| `-s SOURCE` | Sử dụng địa chỉ nguồn này |
| `-t TOS` | Đặt loại Service / DSCP |
| `-w WAITTIME` | Số giây chờ phản hồi trên mỗi đầu dò (mặc định: 5) |
| `-z SENDWAIT` | Khoảng thời gian tối thiểu giữa các đầu dò tính bằng ms (mặc định: 0) |
| `-A` | Thực hiện tra cứu đường dẫn AS (hiển thị ASN cho mỗi bước nhảy) |
| `-e` | Hiển thị phần mở rộng ICMP (nhãn MPLS, v.v.) |
| `-M METHOD` | Phương thức: `default`, `icmp`, `tcp`, `udp`, `udplite`, `dccp`, `raw` |
| `-N SQUERIES` | Đầu dò đồng thời (mặc định: 16) |
| `-O OPTION` | Tùy chọn dành riêng cho mô-đun |
| `--mtu` | Khám phá và hiển thị đường dẫn MTU |
| `--back` | Hiển thị lộ trình lùi TTL |
| `--sport PORT` | Cổng nguồn |

<a id="examples-1"></a>
<a id="heading-38-examples"></a>

## Ví dụ

```bash
# Theo dõi cơ bản
traceroute google.com
# Đầu ra:
#  1 cổng (192.168.1.1) 0.543 ms 0.397 ms 0.456 ms
#  2 bộ định tuyến isp (10.0.0.1) 5.234 ms 5.178 ms 5.312 ms
#  3 * * * # Không phản hồi (tường lửa)
#  4 lax17s55-in-f14.1e100.net (142.250.80.46) 11.234 ms 11.456 ms 11.123 ms

# Sử dụng ICMP (thành công tốt hơn thông qua một số tường lửa)
sudo traceroute -I google.com

# Sử dụng TCP trên cổng 443 (tốt nhất cho các đích có tường lửa)
sudo traceroute -T -p 443 google.com

# Chỉ số (nhanh hơn, không có độ trễ phân giải DNS)
traceroute -n google.com

# Giới hạn ở 15 bước nhảy
traceroute -m 15 google.com

# Bắt đầu từ bước nhảy 5 (bỏ qua bước nhảy ban đầu đã biết)
traceroute -f 5 google.com

# Chỉ có 1 đầu dò mỗi bước nhảy (nhanh hơn nhưng kém tin cậy hơn)
traceroute -q 1 google.com

# Hiển thị số AS
traceroute -A google.com

# Sử dụng địa chỉ nguồn cụ thể
traceroute -s 192.168.1.100 google.com

# Khám phá đường dẫn MTU
traceroute --mtu google.com

# Tăng thời gian chờ cho mỗi đầu dò lên 10 giây
traceroute -w 10 google.com

# Sử dụng ICMP với cờ Không phân mảnh
sudo traceroute -I -F google.com

# Traceroute từ một giao diện cụ thể
traceroute -i eth0 google.com
```

**Hiểu kết quả đầu ra:**

Mỗi dòng đại diện cho một bước nhảy. `*` có nghĩa là không nhận được phản hồi nào cho thăm dò đó (bộ định tuyến có thể được định cấu hình để không phản hồi hoặc tường lửa đang chặn).

---

<a id="4-tracepath--route-tracing-without-root"></a>
<a id="heading-39-4-tracepath-route-tracing-without-root"></a>

# 4. `tracepath` — Theo dõi tuyến đường không cần root

Tương tự như `traceroute` nhưng không yêu cầu quyền root. Đồng thời phát hiện Đường dẫn MTU.

<a id="syntax-2"></a>
<a id="heading-40-syntax"></a>

## Cú pháp

```bash
tracepath [OPTIONS] DESTINATION[/PORT]
```

<a id="all-flags"></a>
<a id="heading-41-all-flags"></a>

## Tất cả các lá cờ

| Cờ | Mô tả |
|------|-------------|
| `-4` | Buộc IPv4 |
| `-6` | Buộc IPv6 |
| `-n` | Đầu ra dạng số (không phân giải tên) |
| `-b` | In cả tên máy chủ và IP |
| `-l LENGTH` | Độ dài gói ban đầu (mặc định: 65535 cho IPv4, 128000 cho IPv6) |
| `-m MAX_HOPS` | Số bước nhảy tối đa (mặc định: 30) |
| `-p PORT` | Cảng đích |

<a id="examples-2"></a>
<a id="heading-42-examples"></a>

## Ví dụ

```bash
# Đường dẫn cơ bản
tracepath google.com

# Đường dẫn tới một cổng cụ thể
tracepath google.com/443

# Đầu ra số
tracepath -n google.com

# Đặt số bước nhảy tối đa
tracepath -m 20 google.com

# IPv6
tracepath -6 ipv6.google.com
```

---

<a id="5-mtr--combined-traceroute--ping"></a>
<a id="heading-43-5-mtr-combined-traceroute-ping"></a>

# 5. `mtr` — Traceroute kết hợp + Ping

`mtr` kết hợp `traceroute` và `ping` thành một công cụ chẩn đoán thời gian thực duy nhất. Nó liên tục thăm dò từng bước nhảy và cập nhật số liệu thống kê trực tiếp.

<a id="syntax-3"></a>
<a id="heading-44-syntax"></a>

## Cú pháp

```bash
mtr [OPTIONS] DESTINATION
```

<a id="all-flags-and-options-2"></a>
<a id="heading-45-all-flags-and-options"></a>

## Tất cả cờ và tùy chọn

| Cờ | Mô tả |
|------|-------------|
| `-r` / `--report` | Chế độ báo cáo - chạy rồi in báo cáo cuối cùng (không tương tác) |
| `-w` / `--report-wide` | Báo cáo rộng rãi (không cắt bớt tên máy chủ) |
| `-c COUNT` | Số ping trên mỗi bước nhảy (mặc định: 10 ở chế độ báo cáo, không giới hạn ở chế độ tương tác) |
| `-s SIZE` | Kích thước gói tính bằng byte |
| `-n` / `--no-dns` | Đầu ra số (không có phân giải DNS) |
| `-b` / `--show-ips` | Hiển thị cả tên máy chủ và IP |
| `-o FIELDS` | Chọn trường đầu ra (xem bên dưới) |
| `-i INTERVAL` | Khoảng thời gian giữa các đầu dò tính bằng giây (mặc định: 1) |
| `-m MAX_TTL` | TTL tối đa (mặc định: 30) |
| `-f FIRST_TTL` | Bắt đầu TTL (mặc định: 1) |
| `-4` | Buộc IPv4 |
| `-6` | Buộc IPv6 |
| `-u` | Sử dụng UDP thay vì ICMP |
| `-T` | Sử dụng TCP SYN |
| `-P PORT` | Cổng mục tiêu (dành cho TCP/UDP) |
| `-L LOCALPORT` | Cổng nguồn |
| `-e` | Hiển thị phần mở rộng ICMP |
| `-a ADDRESS` | Liên kết với địa chỉ nguồn |
| `-I INTERFACE` | Liên kết với giao diện |
| `-M MARK` | Đặt dấu định tuyến |
| `-Q TOS` | Đặt TOS/DSCP |
| `-z` | Hiển thị số AS |
| `-y NUM` | Hiển thị số AS ở định dạng cụ thể: 0=none, 1=number, 2=name, 3=both |
| `--csv` | Đầu ra ở định dạng CSV |
| `--raw` | Đầu ra ở định dạng thô |
| `--xml` | Đầu ra ở định dạng XML |
| `--json` | Đầu ra ở định dạng JSON |
| `--gtk` | Sử dụng giao diện GTK |
| `--curses` | Sử dụng giao diện ncurses (mặc định) |
| `--split` | Chia định dạng đầu ra |
| `--no-dns` | Tương tự như `-n` |

**Các trường đầu ra (cờ `-o`):**

| Mã | trường |
|------|-------|
| `L` | Tỷ lệ tổn thất |
| `D` | Gói tin bị rơi |
| `R` | Gói đã nhận |
| `S` | Gói đã gửi |
| `N` | RTT mới nhất (ms) |
| `B` | Min/Best RTT (ms) |
| `A` | RTT trung bình (ms) |
| `W` | Max/Worst RTT (ms) |
| `V` | Độ lệch chuẩn |
| `G` | trung bình hình học |
| `J` | Hiện tại jitter |
| `M` | Jitter mean/avg |
| `X` | Giật giật tồi tệ nhất |
| `I` | Jitter giữa lúc đến |

<a id="examples-3"></a>
<a id="heading-46-examples"></a>

## Ví dụ

```bash
# Chế độ tương tác (cập nhật theo thời gian thực)
mtr google.com

# Chế độ báo cáo (chạy rồi in tóm tắt)
mtr -r -c 100 google.com

# Báo cáo rộng với 50 đầu dò
mtr -rw -c 50 google.com

# Hiển thị IP và tên máy chủ
mtr -b google.com

# Sử dụng TCP trên cổng 443
mtr -T -P 443 google.com

# Đầu ra JSON cho tập lệnh
mtr --json -c 10 google.com

# Hiển thị số AS
mtr -z google.com

# Các trường đầu ra tùy chỉnh (mất, đã gửi, đã nhận, tốt nhất, trung bình, tệ nhất, stdev)
mtr -o "LSRBAWV" google.com

# Chỉ số với khoảng 0.5s
mtr -n -i 0.5 google.com

# Bắt đầu từ bước nhảy 3, tối đa 20 bước nhảy
mtr -f 3 -m 20 google.com

# Đầu ra CSV để phân tích sau
mtr --csv -c 100 google.com > mtr_report.csv

# Liên kết với nguồn cụ thể
mtr -a 192.168.1.100 google.com
```

---

<a id="6-ss--socket-statistics"></a>
<a id="heading-47-6-ss-socket-statistics"></a>

# 6. `ss` — Thống kê socket

`ss` là sự thay thế hiện đại cho `netstat`. Nó lấy thông tin socket trực tiếp từ kernel và nhanh hơn đáng kể.

<a id="syntax-4"></a>
<a id="heading-48-syntax"></a>

## Cú pháp

```bash
ss [OPTIONS] [FILTER]
```

<a id="all-flags-and-options-3"></a>
<a id="heading-49-all-flags-and-options"></a>

## Tất cả cờ và tùy chọn

| Cờ | Mô tả |
|------|-------------|
| `-t` | Hiển thị socket TCP |
| `-u` | Hiển thị socket UDP |
| `-w` | Hiển thị socket RAW |
| `-x` | Hiển thị socket tên miền Unix |
| `-d` | Hiển thị socket DCCP |
| `-S` | Hiển thị socket SCTP |
| `-l` | Chỉ hiển thị socket nghe |
| `-a` | Hiển thị tất cả các socket (nghe + không nghe) |
| `-n` | Đầu ra dạng số (không giải quyết tên dịch vụ) |
| `-r` | Phân giải địa chỉ IP thành tên máy chủ |
| `-p` | Hiển thị quá trình sử dụng socket |
| `-e` | Hiển thị thông tin socket chi tiết (uid, inode, cookie) |
| `-m` | Hiển thị mức sử dụng bộ nhớ socket |
| `-i` | Hiển thị thông tin nội bộ TCP (kiểm soát tắc nghẽn, RTT, v.v.) |
| `-K` | Buộc tiêu diệt các socket phù hợp với bộ lọc (yêu cầu root) |
| `-s` | Tóm tắt thống kê socket in |
| `-o` | Hiển thị thông tin hẹn giờ |
| `-E` | Hiển thị liên tục các sự kiện socket |
| `-Z` | Hiển thị bối cảnh bảo mật SELinux |
| `-z` | Hiển thị bối cảnh socket (tương tự `-Z`) |
| `-N NSNAME` | Chuyển sang mạng namespace |
| `-b` | Hiển thị tùy chọn socket bộ lọc BPF |
| `-4` | Chỉ hiển thị socket IPv4 |
| `-6` | Chỉ hiển thị socket IPv6 |
| `-0` | Hiển thị socket GÓI |
| `-f FAMILY` | Lọc theo họ địa chỉ: `unix`, `inet`, `inet6`, `link`, `netlink`, `vsock`, `tipc`, `xdp` |
| `-A QUERY` | Các bảng socket cần kết xuất: `all`, `inet`, `tcp`, `udp`, `raw`, `unix`, `packet`, `netlink`, `unix_dgram`, `unix_stream`, `unix_seqpacket`, `packet_raw`, `packet_dgram`, `dccp`, `sctp`, `vsock_stream`, `vsock_dgram`, `xdp` |
| `-D FILE` | Kết xuất dữ liệu socket TCP thô vào FILE |
| `-F FILE` | Đọc bộ lọc từ FILE |
| `-H` | Chặn dòng tiêu đề |
| `--no-header` | Tương tự như `-H` |
| `--tos` | Hiển thị giá trị TOS |
| `--cgroup` | Hiển thị nhóm |
| `--tipcinfo` | Hiển thị thông tin socket TIPC |
| `-V` | Hiển thị phiên bản |

<a id="state-filters"></a>
<a id="heading-50-state-filters"></a>

## Bộ lọc trạng thái

```bash
# Lọc theo trạng thái kết nối
ss state ESTABLISHED
ss state SYN-SENT
ss state SYN-RECV
ss state FIN-WAIT-1
ss state FIN-WAIT-2
ss state TIME-WAIT
ss state CLOSE-WAIT
ss state LAST-ACK
ss state CLOSING
ss state CLOSED
ss state LISTEN
ss state ALL

# Loại trừ một trạng thái
ss exclude LISTEN
ss exclude TIME-WAIT

# Nhóm trạng thái kết hợp
ss state connected           # Tất cả ngoại trừ LISTEN và ĐÓNG
ss state synchronized        # THÀNH LẬP + dẫn xuất
ss state bucket              # TIME-WAIT + SYN-RECV
ss state big                 # Tất cả mọi thứ ngoại trừ xô
```

<a id="addressport-filters"></a>
<a id="heading-51-addressport-filters"></a>

## Bộ lọc Address/Port

```bash
# Lọc theo cổng nguồn
ss sport = :80
ss sport = :http
ss sport gt :1024
ss sport lt :1024
ss sport != :22

# Lọc theo cổng đích
ss dport = :443
ss dport = :https

# Lọc theo địa chỉ nguồn
ss src 192.168.1.100
ss src 192.168.1.0/24

# Lọc theo địa chỉ đích
ss dst 8.8.8.8
ss dst 10.0.0.0/8

# Kết hợp các bộ lọc với 'và'/'hoặc'
ss -tn 'src 192.168.1.0/24 and dport = :443'
ss -tn '( dport = :80 or dport = :443 ) and src 192.168.1.0/24'

# Operator lọc
# = eq : Bằng
# != ne : Không bằng
# > gt : Lớn hơn
# < lt : Nhỏ hơn
# >= ge : Lớn hơn hoặc bằng
# <= le : Nhỏ hơn hoặc bằng
```

<a id="examples-4"></a>
<a id="heading-52-examples"></a>

## Ví dụ

```bash
# Hiển thị tất cả các socket TCP đang nghe với tên quy trình
ss -tlnp
# Đầu ra:
# Trạng thái Recv-Q Send-Q Địa chỉ cục bộ:Địa chỉ cổng ngang hàng:Quy trình cổng
# LISTEN 0 128 0.0.0.0:22 0.0.0.0:* người dùng :(("sshd",pid=1234,fd=3))
# LISTEN 0 511 0.0.0.0:80 0.0.0.0:* người dùng :(("nginx",pid=5678,fd=8))

# Hiển thị tất cả các kết nối được thiết lập
ss -tn state established

# Hiển thị tất cả các socket có thông tin hẹn giờ
ss -to

# Hiển thị thông tin nội bộ TCP (cửa sổ tắc nghẽn, RTT, v.v.)
ss -ti

# Hiển thị mức sử dụng bộ nhớ socket
ss -tm

# Hiển thị tóm tắt
ss -s
# Đầu ra:
# Tổng cộng: 356
# TCP: 15 (estab 3, đóng 0, mồ côi 0, timewait 0)
# Vận chuyển Tổng IP IPv6
# RAW          1         0         1
# UDP          8         5         3
# TCP          15        10        5
# INET         24        15        9
# FRAG         0         0         0

# Hiển thị socket UDP
ss -ulnp

# Hiển thị socket tên miền Unix
ss -x

# Hiển thị tất cả các socket trên cổng 443
ss -tn dport = :443

# Hiển thị kết nối từ một mạng con cụ thể
ss -tn src 10.0.0.0/8

# Tắt tất cả các socket TIME-WAIT tới cổng 80
sudo ss -K dport = :80 state time-wait

# Giám sát các sự kiện socket trong thời gian thực
ss -E

# Hiển thị các socket ở định dạng JSON (thông qua bộ lọc tới jq)
ss -tn | head

# Hiển thị bối cảnh SELinux
ss -Ztn

# Hiển thị tất cả socket SCTP
ss -S

# Hiển thị thông tin chi tiết (uid, inode)
ss -teln
```

---

<a id="7-netstat--network-statistics-legacy"></a>
<a id="heading-53-7-netstat-network-statistics-legacy"></a>

# 7. `netstat` — Thống kê mạng (Cũ)

`netstat` là công cụ cũ hơn để hiển thị các kết nối, bảng định tuyến và thống kê giao diện. Được thay thế bằng `ss` và `ip` nhưng vẫn được sử dụng phổ biến.

<a id="syntax-5"></a>
<a id="heading-54-syntax"></a>

## Cú pháp

```bash
netstat [OPTIONS]
```

<a id="all-flags-and-options-4"></a>
<a id="heading-55-all-flags-and-options"></a>

## Tất cả cờ và tùy chọn

| Cờ | Mô tả |
|------|-------------|
| `-t` | Hiển thị kết nối TCP |
| `-u` | Hiển thị kết nối UDP |
| `-l` | Chỉ hiển thị socket nghe |
| `-a` | Hiển thị tất cả các socket (nghe + thiết lập) |
| `-n` | Địa chỉ số và cổng (không giải quyết) |
| `-p` | Hiển thị tên PID/program (yêu cầu root cho tất cả các quy trình) |
| `-r` | Hiển thị bảng định tuyến |
| `-i` | Hiển thị thống kê giao diện |
| `-g` | Hiển thị tư cách thành viên nhóm multicast |
| `-s` | Hiển thị số liệu thống kê theo giao thức |
| `-c` | Chế độ liên tục (cập nhật mỗi giây) |
| `-e` | Hiển thị thông tin bổ sung (người dùng, inode) |
| `-o` | Hiển thị bộ tính giờ |
| `-w` | Hiển thị socket RAW |
| `-x` | Hiển thị socket Unix |
| `-W` | Không cắt bớt địa chỉ IP |
| `-v` | dài dòng |
| `--numeric-hosts` | Không phân giải tên máy chủ |
| `--numeric-ports` | Không giải quyết tên cổng |
| `--numeric-users` | Không phân giải tên người dùng |
| `-A FAMILY` | Các họ địa chỉ: `inet`, `inet6`, `unix`, `ipx`, `ax25`, `netrom`, `econet`, `ddp`, `bluetooth` |
| `-C` | In thông tin định tuyến từ bộ đệm tuyến đường |
| `-F` | In thông tin định tuyến từ FIB |
| `-M` | Hiển thị các kết nối giả mạo |
| `-Z` | Hiển thị bối cảnh bảo mật SELinux |

<a id="examples-5"></a>
<a id="heading-56-examples"></a>

## Ví dụ

```bash
# Hiển thị tất cả các cổng TCP/UDP đang nghe với tên quy trình
netstat -tulnp

# Hiển thị tất cả các kết nối (nghe + thiết lập)
netstat -an

# Chỉ hiển thị các kết nối TCP
netstat -tn

# Hiển thị bảng định tuyến
netstat -rn

# Hiển thị thống kê giao diện
netstat -i

# Hiển thị số liệu thống kê giao diện mở rộng
netstat -ie               # Tương tự với ifconfig

# Hiển thị số liệu thống kê trên mỗi giao thức (TCP/UDP/ICMP)
netstat -s

# Chỉ hiển thị số liệu thống kê TCP
netstat -st

# Hiển thị tư cách thành viên nhóm multicast
netstat -g

# Giám sát liên tục
netstat -c -tn

# Hiển thị tất cả các socket Unix
netstat -x

# Hiển thị bộ tính giờ
netstat -to

# Đầu ra rộng (không cắt bớt địa chỉ)
netstat -Wtn

# Hiển thị với ngữ cảnh SELinux
netstat -Ztn

# Đếm kết nối theo trạng thái
netstat -tn | awk '{print $6}' | sort | uniq -c | sort -rn

# Hiển thị các kết nối giả mạo
netstat -M
```

---

<a id="8-curl--data-transfer-tool"></a>
<a id="heading-57-8-curl-data-transfer-tool"></a>

# 8. `curl` — Công cụ truyền dữ liệu

`curl` chuyển dữ liệu đến hoặc từ máy chủ bằng URL. Hỗ trợ HTTP, HTTPS, FTP, FTPS, SCP, SFTP, TFTP, LDAP, TELNET, MQTT và nhiều giao thức khác.

<a id="syntax-6"></a>
<a id="heading-58-syntax"></a>

## Cú pháp

```bash
curl [OPTIONS] URL [URL...]
```

<a id="all-major-flags-and-options"></a>
<a id="heading-59-all-major-flags-and-options"></a>

## Tất cả các cờ và tùy chọn chính

<a id="http-method-and-request-control"></a>
<a id="heading-60-http-method-and-request-control"></a>

### Kiểm soát yêu cầu và phương thức HTTP

| Cờ | Mô tả |
|------|-------------|
| `-X METHOD` / `--request METHOD` | Đặt phương thức HTTP: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS` |
| `-d DATA` / `--data DATA` | Gửi dữ liệu POST (ngụ ý `-X POST`). Sử dụng `@filename` để đọc từ tệp |
| `--data-raw DATA` | Gửi dữ liệu POST mà không cần giải thích `@` |
| `--data-urlencode DATA` | Mã hóa URL dữ liệu trước khi gửi |
| `--data-binary DATA` | Gửi dữ liệu nhị phân không cần xử lý |
| `--data-ascii DATA` | Tương tự như `--data` |
| `-F "field=value"` / `--form` | Dữ liệu biểu mẫu nhiều phần (tệp tải lên). Sử dụng `@filename` cho các tập tin |
| `-G` / `--get` | Buộc phương thức GET ngay cả với dữ liệu `-d` (thêm vào URL dưới dạng tham số truy vấn) |
| `-I` / `--head` | Gửi yêu cầu HEAD (chỉ tiêu đề) |

<a id="headers-and-authentication"></a>
<a id="heading-61-headers-and-authentication"></a>

### Tiêu đề và xác thực

| Cờ | Mô tả |
|------|-------------|
| `-H "Header: Value"` / `--header` | Tiêu đề Add/replace HTTP. Sử dụng `-H "Header:"` để xóa |
| `-A "Agent"` / `--user-agent` | Đặt tiêu đề Tác nhân người dùng |
| `-e URL` / `--referer` | Đặt tiêu đề Người giới thiệu |
| `-u user:pass` / `--user` | HTTP Xác thực cơ bản |
| `--basic` | Sử dụng xác thực cơ bản HTTP (mặc định) |
| `--digest` | Sử dụng xác thực HTTP Digest |
| `--ntlm` | Sử dụng xác thực HTTP NTLM |
| `--negotiate` | Sử dụng xác thực HTTP đàm phán (SPNEGO/Kerberos) |
| `--anyauth` | Tự động chọn phương thức xác thực tốt nhất |
| `-b "cookies"` / `--cookie` | Gửi cookie (chuỗi hoặc `@file`) |
| `-c FILE` / `--cookie-jar` | Lưu cookie vào tập tin |
| `-j` / `--junk-session-cookies` | Loại bỏ cookie phiên khỏi lọ cookie |
| `--oauth2-bearer TOKEN` | Mã thông báo mang OAuth 2.0 |
| `--aws-sigv4 PROVIDER` | Ký kết AWS Signature Phiên bản 4 |

<a id="output-and-verbosity"></a>
<a id="heading-62-output-and-verbosity"></a>

### Đầu ra và độ chi tiết

| Cờ | Mô tả |
|------|-------------|
| `-o FILE` / `--output` | Ghi đầu ra vào FILE |
| `-O` / `--remote-name` | Lưu với tên tệp từ xa |
| `-J` / `--remote-header-name` | Sử dụng tên tệp Bố trí Nội dung |
| `-s` / `--silent` | Chế độ im lặng (không tiến triển, không lỗi) |
| `-S` / `--show-error` | Hiển thị lỗi ngay cả ở chế độ im lặng |
| `-v` / `--verbose` | Đầu ra dài dòng (hiển thị các tiêu đề request/response) |
| `--trace FILE` | Dấu vết hex đầy đủ tới FILE |
| `--trace-ascii FILE` | Dấu vết ASCII đầy đủ tới TẬP TIN |
| `--trace-time` | Thêm dấu thời gian để theo dõi |
| `-w FORMAT` / `--write-out` | In thông tin sau khi chuyển (xem các biến định dạng bên dưới) |
| `-i` / `--include` | Bao gồm các tiêu đề phản hồi trong đầu ra |
| `-D FILE` / `--dump-header` | Lưu tiêu đề phản hồi vào FILE |
| `--no-progress-meter` | Ẩn thanh tiến trình nhưng vẫn hiển thị đầu ra và lỗi |
| `--progress-bar` | Thanh tiến trình đơn giản thay vì số liệu thống kê |
| `-#` | Tương tự như `--progress-bar` |

<a id="redirects-and-retries"></a>
<a id="heading-63-redirects-and-retries"></a>

### Chuyển hướng và thử lại

| Cờ | Mô tả |
|------|-------------|
| `-L` / `--location` | Theo dõi chuyển hướng |
| `--max-redirs NUM` | Số lần chuyển hướng tối đa (mặc định: 50) |
| `--post301` | Giữ phương thức POST sau khi chuyển hướng 301 |
| `--post302` | Giữ phương thức POST sau khi chuyển hướng 302 |
| `--post303` | Giữ phương thức POST sau khi chuyển hướng 303 |
| `--retry NUM` | Thử lại các lỗi tạm thời |
| `--retry-delay SECONDS` | Chờ giữa các lần thử lại |
| `--retry-max-time SECONDS` | Tổng thời gian thử lại tối đa |
| `--retry-all-errors` | Thử lại tất cả các lỗi (không chỉ tạm thời) |

<a id="ssltls"></a>
<a id="heading-64-ssltls"></a>

### SSL/TLS

| Cờ | Mô tả |
|------|-------------|
| `-k` / `--insecure` | Bỏ qua xác minh chứng chỉ SSL |
| `--cacert FILE` | Sử dụng gói chứng chỉ CA này |
| `--capath DIR` | Thư mục chứng chỉ CA |
| `--cert FILE` | Chứng chỉ khách hàng |
| `--cert-type TYPE` | Loại chứng chỉ: `PEM`, `DER`, `ENG` |
| `--key FILE` | Khóa riêng |
| `--key-type TYPE` | Loại khóa: `PEM`, `DER`, `ENG` |
| `--pass PHRASE` | Cụm mật khẩu khóa riêng |
| `--ciphers LIST` | Mật mã SSL để sử dụng |
| `--tls-max VERSION` | Phiên bản TLS tối đa: `1.0`, `1.1`, `1.2`, `1.3` |
| `--tlsv1` | Buộc TLS 1.x |
| `--tlsv1.0` / `--tlsv1.1` / `--tlsv1.2` / `--tlsv1.3` | Buộc phiên bản TLS cụ thể |
| `--ssl` | Hãy dùng thử SSL/TLS |
| `--ssl-reqd` | Yêu cầu SSL/TLS |
| `--crl-file FILE` | Danh sách thu hồi chứng chỉ |
| `--cert-status` | Xác minh chứng chỉ máy chủ qua OCSP |
| `--pinnedpubkey FILE` | Ghim khóa công khai (tệp hoặc hàm băm) |
| `--ssl-allow-beast` | Cho phép lỗ hổng BEAST |
| `--ssl-no-revoke` | Tắt kiểm tra thu hồi chứng chỉ (Windows) |
| `--ssl-revoke-best-effort` | Kiểm tra thu hồi nỗ lực tốt nhất |

<a id="connection-control"></a>
<a id="heading-65-connection-control"></a>

### Kiểm soát kết nối

| Cờ | Mô tả |
|------|-------------|
| `--connect-timeout SECONDS` | Thời gian tối đa cho giai đoạn kết nối |
| `-m SECONDS` / `--max-time` | Tổng thời gian chuyển tối đa |
| `--speed-limit BYTES` | Tốc độ tối thiểu trong bytes/sec trước khi hủy bỏ |
| `--speed-time SECONDS` | Thời gian đo giới hạn tốc độ |
| `--limit-rate RATE` | Giới hạn tốc độ truyền (e.g., `100K`, `1M`) |
| `--keepalive-time SECONDS` | Khoảng thời gian duy trì TCP |
| `--no-keepalive` | Vô hiệu hóa tính năng giữ TCP |
| `--interface IFACE` | Sử dụng giao diện này |
| `--local-port RANGE` | Phạm vi cổng địa phương |
| `--dns-servers SERVERS` | Sử dụng máy chủ DNS tùy chỉnh |
| `--resolve HOST:PORT:ADDR` | Phân giải DNS tùy chỉnh |
| `--connect-to HOST:PORT:CONNECT_HOST:CONNECT_PORT` | Kết nối với máy chủ thay thế |
| `--happy-eyeballs-timeout-ms MS` | Chúc mừng Eyeballs hết thời gian chờ |
| `--tcp-nodelay` | Kích hoạt TCP_NODELAY |
| `--tcp-fastopen` | Kích hoạt tính năng mở nhanh TCP |

<a id="proxy"></a>
<a id="heading-66-proxy"></a>

### ủy nhiệm

| Cờ | Mô tả |
|------|-------------|
| `-x PROXY` / `--proxy` | Sử dụng proxy `[protocol://]host[:port]` |
| `--proxy-user user:pass` | Xác thực proxy |
| `--proxy-basic` | Xác thực cơ bản proxy |
| `--proxy-digest` | Xác thực thông báo proxy |
| `--proxy-ntlm` | Xác thực NTLM proxy |
| `--proxy-header "H: V"` | Tiêu đề chỉ dành cho proxy |
| `--noproxy HOSTS` | Danh sách máy chủ được phân tách bằng dấu phẩy để bỏ qua proxy |
| `--socks4 HOST:PORT` | Proxy SOCKS4 |
| `--socks4a HOST:PORT` | Proxy SOCKS4a (giải quyết DNS từ xa) |
| `--socks5 HOST:PORT` | Proxy SOCKS5 |
| `--socks5-hostname HOST:PORT` | Proxy SOCKS5 (giải quyết DNS từ xa) |

<a id="miscellaneous"></a>
<a id="heading-67-miscellaneous"></a>

### Linh tinh

| Cờ | Mô tả |
|------|-------------|
| `-C OFFSET` / `--continue-at` | Tiếp tục truyền ở chế độ bù (`-` cho tự động) |
| `-T FILE` / `--upload-file` | Tải tập tin lên |
| `-K FILE` / `--config` | Đọc cấu hình từ tập tin |
| `-q` | Không đọc `.curlrc` |
| `--compressed` | Yêu cầu phản hồi nén (tự động giải nén) |
| `--create-dirs` | Tạo thư mục mẹ cho file đầu ra |
| `--crlf` | Chuyển đổi LF sang CRLF |
| `-Z` / `--parallel` | Thực hiện chuyển giao song song |
| `--parallel-max NUM` | Chuyển song song tối đa |
| `--url URL` | Chỉ định URL (thay thế cho vị trí) |
| `-: ` / `--next` | Đặt lại trạng thái cho URL tiếp theo |
| `--path-as-is` | Không nén `..` trong đường dẫn URL |
| `--raw` | Tắt giải mã HTTP |
| `--no-alpn` | Vô hiệu hóa tiện ích mở rộng ALPN TLS |
| `--no-npn` | Vô hiệu hóa tiện ích mở rộng NPN TLS |
| `--no-sessionid` | Vô hiệu hóa việc sử dụng lại ID phiên SSL |
| `--no-buffer` | Vô hiệu hóa bộ đệm đầu ra |
| `--stderr FILE` | Chuyển hướng stderr sang tập tin |
| `--fail-early` | Thất bại ở lỗi đầu tiên trong đợt |
| `-f` / `--fail` | Lỗi âm thầm trên các lỗi HTTP (không có đầu ra trên 4xx/5xx) |
| `--fail-with-body` | Lỗi HTTP bị lỗi nhưng vẫn xuất nội dung |
| `-N` / `--no-buffer` | Tắt tính năng đệm |
| `--globoff` | Tắt tính năng toàn cầu hóa URL (dấu ngoặc) |
| `--remote-time` | Đặt thời gian tệp cục bộ thành thời gian tệp từ xa |
| `--xattr` | Lưu trữ siêu dữ liệu trong các thuộc tính tệp mở rộng |

<a id="--write-out-format-variables"></a>
<a id="heading-68--write-out-format-variables"></a>

### Biến định dạng `--write-out`

```bash
curl -w "HTTP %{http_code}, Time: %{time_total}s, Size: %{size_download} bytes\n" -so /dev/null URL
```

| Biến | Mô tả |
|----------|-------------|
| `%{http_code}` | Mã phản hồi HTTP |
| `%{http_version}` | Phiên bản HTTP đã qua sử dụng |
| `%{url_effective}` | URL hiệu quả cuối cùng (sau khi chuyển hướng) |
| `%{redirect_url}` | URL chuyển hướng |
| `%{num_redirects}` | Số lượng chuyển hướng |
| `%{time_total}` | Tổng thời gian chuyển (giây) |
| `%{time_namelookup}` | Thời gian phân giải DNS |
| `%{time_connect}` | Thời gian kết nối TCP |
| `%{time_appconnect}` | Thời gian bắt tay TLS |
| `%{time_pretransfer}` | Thời gian cho đến khi quá trình chuyển bắt đầu |
| `%{time_starttransfer}` | Thời gian tới byte đầu tiên (TTFB) |
| `%{time_redirect}` | Thời gian dành cho chuyển hướng |
| `%{size_download}` | Byte đã tải xuống |
| `%{size_upload}` | Byte đã tải lên |
| `%{size_header}` | Kích thước tiêu đề tính bằng byte |
| `%{size_request}` | Kích thước yêu cầu tính bằng byte |
| `%{speed_download}` | Tốc độ tải xuống (bytes/sec) |
| `%{speed_upload}` | Tốc độ tải lên (bytes/sec) |
| `%{content_type}` | Tiêu đề loại nội dung |
| `%{filename_effective}` | Tên tệp được sử dụng cho đầu ra |
| `%{local_ip}` | IP cục bộ được sử dụng |
| `%{local_port}` | Cổng địa phương được sử dụng |
| `%{remote_ip}` | IP từ xa được kết nối với |
| `%{remote_port}` | Cổng từ xa được kết nối với |
| `%{ssl_verify_result}` | Kết quả xác minh SSL |
| `%{scheme}` | Lược đồ URL được sử dụng |
| `%{method}` | Phương pháp HTTP được sử dụng |

<a id="comprehensive-examples"></a>
<a id="heading-69-comprehensive-examples"></a>

## Ví dụ toàn diện

```bash
# Yêu cầu NHẬN đơn giản
curl https://example.com

# NHẬN với các tiêu đề được hiển thị
curl -i https://example.com

# Yêu cầu HEAD (chỉ tiêu đề)
curl -I https://example.com

# Đầu ra dài dòng (gỡ lỗi)
curl -v https://example.com

# POST với dữ liệu biểu mẫu
curl -X POST -d "user=alice&pass=secret" https://example.com/login

# ĐĂNG bằng JSON
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","age":30}' \
  https://api.example.com/users

# ĐĂNG bằng JSON từ tệp
curl -X POST \
  -H "Content-Type: application/json" \
  -d @data.json \
  https://api.example.com/users

# Yêu cầu PUT
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob"}' \
  https://api.example.com/users/1

# XÓA yêu cầu
curl -X DELETE https://api.example.com/users/1

# Yêu cầu VÁ
curl -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie"}' \
  https://api.example.com/users/1

# Tải lên tệp có dạng nhiều phần
curl -F "file=@photo.jpg" -F "description=My Photo" https://example.com/upload

# Tải xuống một tập tin có tên gốc
curl -O https://example.com/file.tar.gz

# Tải xuống với tên tệp tùy chỉnh
curl -o myfile.tar.gz https://example.com/file.tar.gz

# Tiếp tục tải xuống một phần
curl -C - -O https://example.com/largefile.iso

# Theo dõi chuyển hướng
curl -L https://example.com/redirect

# Tải xuống với thanh tiến trình
curl -# -O https://example.com/file.tar.gz

# Tải xuống im lặng (không có đầu ra ngoại trừ lỗi)
curl -sS -O https://example.com/file.tar.gz

# Xác thực cơ bản
curl -u admin:password https://api.example.com/data

# Xác thực mã thông báo mang
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/data

# Đặt tác nhân người dùng tùy chỉnh
curl -A "MyApp/1.0" https://example.com

# Đặt cookie
curl -b "session=abc123" https://example.com

# Lưu và gửi cookie trên requests
curl -c cookies.txt https://example.com/login -d "user=alice&pass=secret"
curl -b cookies.txt https://example.com/dashboard

# Sử dụng proxy
curl -x http://proxy.example.com:8080 https://example.com
curl -x socks5://proxy.example.com:1080 https://example.com

# Bỏ qua xác minh SSL (đối với chứng chỉ tự ký)
curl -k https://self-signed.example.com

# Xác thực chứng chỉ ứng dụng khách
curl --cert client.pem --key client.key https://secure.example.com

# Giới hạn tốc độ tải xuống
curl --limit-rate 500K -O https://example.com/file.tar.gz

# Đặt thời gian chờ kết nối
curl --connect-timeout 5 --max-time 30 https://example.com

# Phân giải DNS tùy chỉnh
curl --resolve example.com:443:1.2.3.4 https://example.com

# HTTP/2 (được bật theo mặc định khi khả dụng)
curl --http2 https://example.com

# HTTP/3 (nếu được biên dịch có hỗ trợ)
curl --http3 https://example.com

# Phân tích thời gian
curl -o /dev/null -s -w "\
  DNS:        %{time_namelookup}s\n\
  Connect:    %{time_connect}s\n\
  TLS:        %{time_appconnect}s\n\
  TTFB:       %{time_starttransfer}s\n\
  Total:      %{time_total}s\n\
  Size:       %{size_download} bytes\n\
  Speed:      %{speed_download} bytes/sec\n\
  HTTP Code:  %{http_code}\n" https://example.com

# Tải xuống song song
curl -Z -O https://example.com/file1.tar.gz -O https://example.com/file2.tar.gz

# Gửi từ stdin
echo "Hello World" | curl -X POST -d @- https://example.com/api

# Yêu cầu phản hồi nén
curl --compressed https://example.com

# Thử lại khi thất bại
curl --retry 3 --retry-delay 5 https://example.com

# Tải xuống qua FTP
curl -u user:pass ftp://ftp.example.com/file.txt

# Tải lên FTP
curl -u user:pass -T localfile.txt ftp://ftp.example.com/

# tải xuống SCP
curl -u user: --key ~/.ssh/id_rsa scp://example.com/~/file.txt

# tải xuống SFTP
curl -u user: --key ~/.ssh/id_rsa sftp://example.com/home/user/file.txt
```

---

<a id="9-wget--non-interactive-network-downloader"></a>
<a id="heading-70-9-wget-non-interactive-network-downloader"></a>

# 9. `wget` — Trình tải xuống mạng không tương tác

`wget` chuyên tải file. Hỗ trợ HTTP, HTTPS, FTP. Điểm mạnh chính: tải xuống đệ quy, tiếp tục và hoạt động ở chế độ nền.

<a id="syntax-7"></a>
<a id="heading-71-syntax"></a>

## Cú pháp

```bash
wget [OPTIONS] URL [URL...]
```

<a id="all-major-flags-and-options-1"></a>
<a id="heading-72-all-major-flags-and-options"></a>

## Tất cả các cờ và tùy chọn chính

<a id="download-control"></a>
<a id="heading-73-download-control"></a>

### Kiểm soát tải xuống

| Cờ | Mô tả |
|------|-------------|
| `-O FILE` | Lưu vào FILE (sử dụng `-` cho stdout) |
| `-o LOGFILE` | Ghi đầu ra vào LOGFILE |
| `-a LOGFILE` | Nối vào LOGFILE |
| `-c` / `--continue` | Tiếp tục tải xuống một phần |
| `-N` / `--timestamping` | Chỉ tải xuống nếu tệp từ xa mới hơn |
| `-T SECONDS` / `--timeout` | Đặt giới hạn thời gian chờ cho các thao tác |
| `--connect-timeout SECONDS` | Thời gian chờ tối đa để kết nối |
| `--read-timeout SECONDS` | Thời gian chờ tối đa khi đọc dữ liệu |
| `--dns-timeout SECONDS` | Thời gian chờ tối đa cho DNS |
| `-t NUM` / `--tries` | Số lần thử lại (0 = vô hạn) |
| `--retry-connrefused` | Thử lại kết nối bị từ chối |
| `--retry-on-http-error CODES` | Thử lại mã HTTP cụ thể |
| `-w SECONDS` / `--wait` | Chờ giữa các lần truy xuất |
| `--waitretry SECONDS` | Chờ giữa các lần thử lại |
| `--random-wait` | Ngẫu nhiên hóa thời gian chờ (0.5x đến 1.5x của `-w`) |
| `-Q SIZE` / `--quota` | Hạn ngạch tải xuống (e.g., `100m`) |
| `--limit-rate RATE` | Giới hạn tốc độ tải xuống (e.g., `200k`) |
| `--bind-address ADDR` | Gắn với địa chỉ IP cục bộ |
| `-b` / `--background` | Đi tới nền sau khi khởi động |
| `--progress TYPE` | Loại tiến trình: `bar`, `dot`, `dot:mega`, `dot:giga` |
| `--show-progress` | Luôn hiển thị thanh tiến trình |
| `--no-verbose` | Tắt dài dòng mà không im lặng |
| `-q` / `--quiet` | Chế độ im lặng |
| `-v` / `--verbose` | Chế độ dài dòng |
| `-d` / `--debug` | Chế độ gỡ lỗi |
| `-nv` | Không dài dòng (chỉ có lỗi và thông tin cơ bản) |
| `-i FILE` / `--input-file` | Đọc URL từ FILE |
| `-B URL` / `--base` | URL cơ sở cho các liên kết tương đối |

<a id="http-options"></a>
<a id="heading-74-http-options"></a>

### Tùy chọn HTTP

| Cờ | Mô tả |
|------|-------------|
| `--header "H: V"` | Thêm tiêu đề tùy chỉnh |
| `--user-agent STRING` / `-U` | Đặt tác nhân người dùng |
| `--referer URL` | Đặt tiêu đề Người giới thiệu |
| `--http-user USER` | Tên người dùng HTTP |
| `--http-password PASS` | Mật khẩu HTTP |
| `--post-data STRING` | Gửi dữ liệu POST |
| `--post-file FILE` | POST dữ liệu từ tập tin |
| `--method METHOD` | Phương pháp HTTP để sử dụng |
| `--body-data STRING` | Nội dung yêu cầu |
| `--body-file FILE` | Yêu cầu nội dung từ tập tin |
| `--no-cookies` | Tắt cookie |
| `--load-cookies FILE` | Tải cookie từ tập tin |
| `--save-cookies FILE` | Lưu cookie vào tập tin |
| `--keep-session-cookies` | Lưu cả cookie phiên |
| `--content-disposition` | Tên tệp xử lý nội dung danh dự |
| `--content-on-error` | Lưu nội dung về lỗi HTTP |
| `--no-http-keep-alive` | Vô hiệu hóa tính năng giữ HTTP |
| `--no-cache` | Không sử dụng các phiên bản được lưu trong bộ nhớ đệm |
| `--auth-no-challenge` | Gửi xác thực mà không cần thử thách 401 |
| `--compression auto` | Yêu cầu nén |
| `--max-redirect NUM` | Chuyển hướng tối đa (mặc định: 20; 0 để tắt) |

<a id="ssltls-1"></a>
<a id="heading-75-ssltls"></a>

### SSL/TLS

| Cờ | Mô tả |
|------|-------------|
| `--no-check-certificate` | Bỏ qua xác minh SSL |
| `--certificate FILE` | Chứng chỉ khách hàng |
| `--certificate-type TYPE` | Loại chứng chỉ |
| `--private-key FILE` | Khóa riêng |
| `--private-key-type TYPE` | Loại khóa |
| `--ca-certificate FILE` | Gói CA |
| `--ca-directory DIR` | thư mục CA |
| `--crl-file FILE` | tập tin CRL |
| `--secure-protocol PROTO` | Phiên bản TLS: `auto`, `SSLv2`, `SSLv3`, `TLSv1`, `TLSv1_1`, `TLSv1_2`, `TLSv1_3`, `PFS` |
| `--https-only` | Chỉ theo các liên kết HTTPS |
| `--no-hsts` | Tắt HSTS |

<a id="recursive-download"></a>
<a id="heading-76-recursive-download"></a>

### Tải xuống đệ quy

| Cờ | Mô tả |
|------|-------------|
| `-r` / `--recursive` | Cho phép tải xuống đệ quy |
| `-l DEPTH` / `--level` | Độ sâu đệ quy tối đa (mặc định: 5; 0 = vô hạn) |
| `-k` / `--convert-links` | Chuyển đổi liên kết để xem địa phương |
| `-p` / `--page-requisites` | Tải xuống tất cả tài nguyên cần thiết để hiển thị trang (CSS, JS, images) |
| `-m` / `--mirror` | Viết tắt của `-r -N -l inf --no-remove-listing` |
| `-E` / `--adjust-extension` | Thêm tiện ích mở rộng `.html` vào tệp HTML |
| `-H` / `--span-hosts` | Cho phép mở rộng trên các máy chủ |
| `-D DOMAINS` / `--domains` | Danh sách các miền được phép được phân tách bằng dấu phẩy |
| `--exclude-domains DOMAINS` | Tên miền cần loại trừ |
| `-np` / `--no-parent` | Đừng lên thư mục mẹ |
| `-A PATTERN` / `--accept` | Chỉ chấp nhận các tệp phù hợp với mẫu (e.g., `*.pdf`) |
| `-R PATTERN` / `--reject` | Từ chối các tệp phù hợp với mẫu |
| `--accept-regex REGEX` | Chấp nhận các URL phù hợp với biểu thức chính quy |
| `--reject-regex REGEX` | Từ chối các URL phù hợp với biểu thức chính quy |
| `-I LIST` / `--include-directories` | Chỉ bao gồm các thư mục này |
| `-X LIST` / `--exclude-directories` | Loại trừ các thư mục này |
| `--follow-ftp` | Theo liên kết FTP từ HTML |
| `--follow-tags LIST` | Các thẻ HTML cần theo dõi (e.g., `a,area`) |
| `--ignore-tags LIST` | Thẻ HTML cần bỏ qua |
| `--ignore-case` | Khớp mẫu không phân biệt chữ hoa chữ thường |
| `--no-host-directories` | Không tạo thư mục máy chủ |
| `--cut-dirs NUM` | Bỏ qua NUM thành phần thư mục |
| `-nH` | Tương tự như `--no-host-directories` |
| `--protocol-directories` | Sử dụng tên giao thức trong thư mục |
| `-nd` / `--no-directories` | Không tạo bất kỳ thư mục nào |
| `-x` / `--force-directories` | Buộc tạo thư mục |
| `--robots on/off` | Tôn trọng robots.txt (mặc định: bật) |
| `--no-clobber` | Không ghi đè lên các tập tin hiện có |
| `--backups NUM` | Giữ NUM bản sao lưu của tệp |

<a id="ftp-options"></a>
<a id="heading-77-ftp-options"></a>

### Tùy chọn FTP

| Cờ | Mô tả |
|------|-------------|
| `--ftp-user USER` | tên người dùng FTP |
| `--ftp-password PASS` | Mật khẩu FTP |
| `--no-passive-ftp` | Sử dụng chế độ FTP đang hoạt động |
| `--no-remove-listing` | Giữ các tập tin `.listing` |
| `--retr-symlinks` | Truy xuất các liên kết tượng trưng dưới dạng tệp |
| `--no-glob` | Vô hiệu hóa tính năng toàn cầu hóa FTP |
| `--preserve-permissions` | Giữ quyền |

<a id="proxy-1"></a>
<a id="heading-78-proxy"></a>

### ủy nhiệm

| Cờ | Mô tả |
|------|-------------|
| `-e http_proxy=URL` | Đặt proxy HTTP |
| `-e https_proxy=URL` | Đặt proxy HTTPS |
| `-e ftp_proxy=URL` | Đặt proxy FTP |
| `-e no_proxy=LIST` | Không có danh sách proxy |
| `--no-proxy` | Không sử dụng bất kỳ proxy nào |
| `--proxy-user USER:PASS` | Xác thực proxy |

<a id="examples-6"></a>
<a id="heading-79-examples"></a>

## Ví dụ

```bash
# Tải xuống một tập tin duy nhất
wget https://example.com/file.tar.gz

# Tải xuống với tên tệp tùy chỉnh
wget -O custom_name.tar.gz https://example.com/file.tar.gz

# Tiếp tục tải xuống bị gián đoạn
wget -c https://example.com/largefile.iso

# Tải xuống ở chế độ nền
wget -b https://example.com/largefile.iso
# Kiểm tra tiến trình: tail -f wget-log

# Tải xuống nhiều tệp từ một danh sách
wget -i urls.txt

# Phản chiếu toàn bộ trang web
wget -m -k -p -E -np https://example.com/docs/

# Chỉ tải xuống các tệp PDF từ một trang web
wget -r -l 2 -A "*.pdf" https://example.com/docs/

# Giới hạn tốc độ tải xuống
wget --limit-rate=200k https://example.com/file.tar.gz

# Tải xuống bằng cách thử lại
wget -t 5 --waitretry=30 https://example.com/file.tar.gz

# Tải xuống với xác thực
wget --http-user=admin --http-password=secret https://example.com/protected/file.txt

# Tải xuống thông qua proxy
wget -e http_proxy=http://proxy:8080 https://example.com/file.tar.gz

# Bỏ qua xác minh SSL
wget --no-check-certificate https://self-signed.example.com/file.txt

# Chỉ tải xuống nếu mới hơn tệp cục bộ
wget -N https://example.com/file.tar.gz

# Tải xuống yên tĩnh (chỉ có lỗi)
wget -q https://example.com/file.tar.gz

# Tải xuống với Tác nhân người dùng tùy chỉnh
wget -U "MyApp/1.0" https://example.com

# Tải xuống với tiêu đề tùy chỉnh
wget --header="Authorization: Bearer TOKEN" https://api.example.com/data

# Chế độ nhện (kiểm tra liên kết mà không cần tải xuống)
wget --spider https://example.com

# Chỉ tải xuống các trang trong một thư mục cụ thể, không cần duyệt qua trang gốc
wget -r -np -l 3 https://example.com/docs/tutorials/

# Lưu cookie và sử dụng lại chúng
wget --save-cookies cookies.txt --post-data "user=alice&pass=secret" https://example.com/login
wget --load-cookies cookies.txt https://example.com/dashboard

# Tải xuống qua FTP
wget ftp://ftp.example.com/pub/file.tar.gz

# FTP có thông tin xác thực
wget --ftp-user=user --ftp-password=pass ftp://ftp.example.com/file.txt

# Chuyển đổi liên kết để duyệt ngoại tuyến
wget -r -k -p -l 2 https://example.com
```

---

<a id="10-dig--dns-lookup-utility"></a>
<a id="heading-80-10-dig-dns-lookup-utility"></a>

# 10. `dig` — Tiện ích tra cứu DNS

`dig` (Domain Information Groper) là công cụ truy vấn DNS mạnh mẽ nhất. Nó truy vấn máy chủ DNS và trả về các bản ghi chi tiết.

<a id="syntax-8"></a>
<a id="heading-81-syntax"></a>

## Cú pháp

```bash
dig [@SERVER] NAME [TYPE] [CLASS] [OPTIONS]
```

<a id="all-flags-and-options-5"></a>
<a id="heading-82-all-flags-and-options"></a>

## Tất cả cờ và tùy chọn

| Cờ | Mô tả |
|------|-------------|
| `@SERVER` | Máy chủ DNS để truy vấn (IP hoặc tên máy chủ) |
| `-b ADDRESS` | Địa chỉ IP nguồn để liên kết với |
| `-p PORT` | Cổng truy vấn (mặc định: 53) |
| `-q NAME` | Tên truy vấn (cũng có thể là vị trí) |
| `-t TYPE` | Loại truy vấn (cũng có thể là vị trí) |
| `-c CLASS` | Lớp truy vấn: `IN` (Internet), `CH` (Hỗn loạn), `HS` (Hesiod), `ANY` |
| `-f FILE` | Chế độ hàng loạt - đọc truy vấn từ tệp |
| `-k KEYFILE` | Tệp khóa TSIG cho các truy vấn đã ký |
| `-y [hmac:]name:key` | Khóa TSIG trực tiếp |
| `-x ADDRESS` | Tra cứu ngược DNS (PTR) |
| `-4` | Buộc IPv4 |
| `-6` | Buộc IPv6 |
| `-m` | Bật gỡ lỗi sử dụng bộ nhớ |
| `-r` | Không đọc `~/.digrc` |
| `-v` | Phiên bản in |

<a id="query-options-prefixed-with--to-enable-no-to-disable"></a>
<a id="heading-83-query-options-prefixed-with-to-enable-no-to-d"></a>

### Tùy chọn truy vấn (Có tiền tố `+` để bật, `+no` để tắt)

| Tùy chọn | Mô tả |
|--------|-------------|
| `+short` | Đầu ra ngắn gọn (chỉ là câu trả lời) |
| `+noall +answer` | Chỉ hiển thị phần trả lời |
| `+verbose` / `+multiline` | Đầu ra nhiều dòng chi tiết (SOA ở định dạng người có thể đọc được) |
| `+trace` | Theo dõi đường dẫn ủy quyền từ máy chủ gốc |
| `+nssearch` | Tìm máy chủ tên có thẩm quyền và hiển thị SOA từ mỗi máy chủ đó |
| `+search` | Sử dụng danh sách tìm kiếm từ resolv.conf |
| `+nosearch` | Không sử dụng danh sách tìm kiếm |
| `+recurse` / `+norecurse` | Truy vấn đệ quy Enable/disable (bit RD) |
| `+tcp` | Sử dụng TCP thay vì UDP |
| `+notcp` | Sử dụng UDP (mặc định) |
| `+dnssec` | Yêu cầu bản ghi DNSSEC (bit DO) |
| `+nodnssec` | Đừng yêu cầu DNSSEC |
| `+cd` | Đặt cờ CD (Đang kiểm tra bị vô hiệu hóa) |
| `+nocd` | Xóa cờ CD |
| `+aaflag` / `+noaaflag` | Cờ Set/clear AA (Câu trả lời có thẩm quyền) |
| `+adflag` / `+noadflag` | Cờ Set/clear AD (Dữ liệu xác thực) |
| `+all` | Hiển thị tất cả các phần và cờ |
| `+noall` | Xóa tất cả các cờ hiển thị |
| `+answer` / `+noanswer` | Phần giải đáp Show/hide |
| `+authority` / `+noauthority` | Phần thẩm quyền Show/hide |
| `+additional` / `+noadditional` | Phần bổ sung Show/hide |
| `+question` / `+noquestion` | Phần câu hỏi Show/hide |
| `+comments` / `+nocomments` | Dòng bình luận Show/hide |
| `+stats` / `+nostats` | Phần thống kê Show/hide |
| `+qr` | Hiển thị truy vấn gửi đi |
| `+cmd` / `+nocmd` | Nhận xét ban đầu của Show/hide hiển thị phiên bản đào |
| `+time=SECONDS` | Thời gian chờ tối đa cho truy vấn mỗi lần thử |
| `+tries=NUM` | Số lần thử truy vấn |
| `+retry=NUM` | Số lần thử lại (thử = thử lại + 1) |
| `+bufsize=BYTES` | Kích thước bộ đệm tin nhắn UDP (EDNS0) |
| `+edns=VERSION` | Đặt phiên bản EDNS |
| `+noedns` | Vô hiệu hóa EDNS |
| `+subnet ADDR/PREFIX` | Đặt mạng con máy khách EDNS (ECS) |
| `+cookie` | Gửi cookie DNS |
| `+nocookie` | Đừng gửi cookie |
| `+nsid` | Yêu cầu NSID (Định danh máy chủ định danh) |
| `+identify` | Hiển thị IP của máy chủ đã trả lời (với `+short`) |
| `+split=BYTES` | Tách đầu ra hex/base64 (mặc định: 56) |
| `+keepopen` | Giữ kết nối TCP mở giữa các truy vấn |
| `+ttlid` / `+nottlid` | Show/hide TTL |
| `+ttlunits` | Hiển thị TTL theo đơn vị con người có thể đọc được |
| `+class` / `+noclass` | Lớp Show/hide |
| `+rrcomments` / `+norrcomments` | Show/hide nhận xét trên mỗi bản ghi |
| `+onesoa` | Chỉ hiển thị một SOA trong AXFR |
| `+zflag` | Đặt cờ Z |
| `+ignore` | Bỏ qua việc cắt bớt (không thử lại với TCP) |
| `+fail` | Trả về SERVFAIL khi hết thời gian chờ |
| `+besteffort` | Hiển thị một phần kết quả khi hết thời gian chờ |
| `+domain=NAME` | Đặt miền tìm kiếm |
| `+mapped` | Cho phép địa chỉ IPv6 được ánh xạ IPv4 |

<a id="dns-record-types"></a>
<a id="heading-84-dns-record-types"></a>

### Các loại bản ghi DNS

| Loại | Mô tả |
|------|-------------|
| `A` | Địa chỉ IPv4 |
| `AAAA` | Địa chỉ IPv6 |
| `CNAME` | Tên chuẩn (bí danh) |
| `MX` | Trao đổi thư |
| `NS` | Máy chủ tên |
| `PTR` | Con trỏ (ngược DNS) |
| `SOA` | Bắt đầu thẩm quyền |
| `TXT` | Bản ghi văn bản |
| `SRV` | Bộ định vị Service |
| `CAA` | Ủy quyền của cơ quan chứng nhận |
| `NAPTR` | Con trỏ thẩm quyền đặt tên |
| `DNSKEY` | Khóa công khai DNSSEC |
| `DS` | Người ký ủy quyền (DNSSEC) |
| `RRSIG` | Chữ ký bản ghi tài nguyên (DNSSEC) |
| `NSEC` / `NSEC3` | Bảo mật tiếp theo (DNSSEC) |
| `TLSA` | Xác thực TLS (DANE) |
| `SSHFP` | Dấu vân tay SSH |
| `LOC` | Vị trí |
| `HINFO` | Thông tin máy chủ |
| `SPF` | Khung chính sách người gửi (không được dùng nữa, sử dụng TXT) |
| `AXFR` | Chuyển toàn vùng |
| `IXFR` | Chuyển vùng gia tăng |
| `ANY` | Tất cả các loại bản ghi |

<a id="examples-7"></a>
<a id="heading-85-examples"></a>

## Ví dụ

```bash
# Tra cứu bản ghi cơ bản A
dig example.com
# Đầu ra chứa: phần CÂU HỎI, TRẢ LỜI, QUYỀN QUYỀN, BỔ SUNG

# Chỉ cần địa chỉ IP
dig +short example.com

# Truy vấn các loại bản ghi cụ thể
dig example.com A
dig example.com AAAA
dig example.com MX
dig example.com NS
dig example.com TXT
dig example.com SOA
dig example.com CNAME
dig example.com SRV
dig example.com CAA

# Truy vấn máy chủ DNS cụ thể
dig @8.8.8.8 example.com
dig @1.1.1.1 example.com
dig @9.9.9.9 example.com

# Tra cứu ngược DNS
dig -x 8.8.8.8
# Trả về: 8.8.8.8.in-addr.arpa.  PTR dns.google.

# Theo dõi chuỗi ủy quyền đầy đủ từ gốc
dig +trace example.com

# Chỉ hiển thị phần trả lời
dig +noall +answer example.com

# Hiển thị câu trả lời có TTL theo đơn vị mà con người có thể đọc được
dig +noall +answer +ttlunits example.com

# SOA dài dòng nhiều dòng
dig +multiline example.com SOA

# Kiểm tra DNSSEC
dig +dnssec example.com

# Kiểm tra xem tên miền có được ký với DNSSEC không
dig +short example.com DNSKEY

# Tìm tất cả các máy chủ tên có thẩm quyền
dig +nssearch example.com

# Chuyển vùng (nếu được phép)
dig @ns1.example.com example.com AXFR

# Truy vấn với mạng con máy khách EDNS
dig +subnet=1.2.3.0/24 example.com @8.8.8.8

# Chế độ TCP (dành cho phản hồi lớn)
dig +tcp example.com ANY

# Truy vấn hàng loạt từ tập tin
# queries.txt chứa một truy vấn trên mỗi dòng:
#   example.com A
#   example.org MX
dig -f queries.txt

# Chỉ hiển thị các phần cụ thể
dig +noall +answer +authority example.com NS

# Yêu cầu NSID
dig +nsid @8.8.8.8 example.com

# Đặt thời gian chờ và thử lại
dig +time=2 +tries=3 example.com

# Truy vấn bản ghi SRV (e.g., cho SIP, XMPP, LDAP)
dig _sip._tcp.example.com SRV
dig _xmpp-server._tcp.example.com SRV
dig _ldap._tcp.dc._msdcs.example.com SRV

# Kiểm tra bản ghi SPF
dig +short example.com TXT | grep spf

# Kiểm tra bản ghi DMARC
dig +short _dmarc.example.com TXT

# Kiểm tra bản ghi DKIM
dig +short selector._domainkey.example.com TXT

# Hiển thị truy vấn gửi đi
dig +qr example.com

# So sánh kết quả từ nhiều máy chủ
dig @8.8.8.8 +short example.com
dig @1.1.1.1 +short example.com
dig @9.9.9.9 +short example.com
```

---

<a id="11-nslookup--dns-query-tool"></a>
<a id="heading-86-11-nslookup-dns-query-tool"></a>

# 11. `nslookup` — Công cụ truy vấn DNS

`nslookup` là công cụ truy vấn DNS cũ hơn, đơn giản hơn. Ít chi tiết hơn `dig` nhưng vẫn được sử dụng phổ biến.

<a id="syntax-9"></a>
<a id="heading-87-syntax"></a>

## Cú pháp

```bash
nslookup [OPTIONS] [NAME] [SERVER]
```

<a id="options"></a>
<a id="heading-88-options"></a>

## Tùy chọn

| Cờ | Mô tả |
|------|-------------|
| `-type=TYPE` | Loại truy vấn (A, AAAA, MX, NS, SOA, TXT, SRV, PTR, ANY, v.v.) |
| `-debug` | Hiển thị thông tin gỡ lỗi |
| `-port=PORT` | Cổng truy vấn |
| `-timeout=SECONDS` | Thời gian chờ tối đa cho truy vấn |
| `-retry=NUM` | Số lần thử lại |
| `-domain=NAME` | Miền mặc định |
| `-search` | Sử dụng danh sách tìm kiếm |
| `-class=CLASS` | Lớp truy vấn |

<a id="interactive-mode-commands"></a>
<a id="heading-89-interactive-mode-commands"></a>

## Lệnh chế độ tương tác

```bash
nslookup                            # Vào chế độ tương tác
> server 8.8.8.8                    # Thay đổi máy chủ DNS
> set type=MX                       # Đặt loại truy vấn
> example.com                       # Thực hiện truy vấn
> set debug                         # Bật đầu ra gỡ lỗi
> set nodebug                       # Tắt đầu ra gỡ lỗi
> set all                           # Hiển thị cài đặt hiện tại
> exit                              # Thoát
```

<a id="examples-8"></a>
<a id="heading-90-examples"></a>

## Ví dụ

```bash
# Tra cứu cơ bản
nslookup example.com

# Sử dụng máy chủ DNS cụ thể
nslookup example.com 8.8.8.8

# Tra cứu bản ghi MX
nslookup -type=MX example.com

# Tra cứu bản ghi NS
nslookup -type=NS example.com

# Tra cứu bản ghi TXT
nslookup -type=TXT example.com

# Tra cứu bản ghi SOA
nslookup -type=SOA example.com

# Đảo ngược DNS
nslookup 8.8.8.8

# Tra cứu AAAA (IPv6)
nslookup -type=AAAA example.com

# Với thông tin gỡ lỗi
nslookup -debug example.com

# bản ghi SRV
nslookup -type=SRV _sip._tcp.example.com
```

---

<a id="12-host--simple-dns-lookup"></a>
<a id="heading-91-12-host-simple-dns-lookup"></a>

# 12. `host` — Tra cứu DNS đơn giản

`host` cung cấp đầu ra DNS rõ ràng, dễ đọc.

<a id="syntax-10"></a>
<a id="heading-92-syntax"></a>

## Cú pháp

```bash
host [OPTIONS] NAME [SERVER]
```

<a id="all-flags-1"></a>
<a id="heading-93-all-flags"></a>

## Tất cả các lá cờ

| Cờ | Mô tả |
|------|-------------|
| `-t TYPE` | Loại truy vấn |
| `-a` | Tương tự như `-t ANY` |
| `-d` | Dài dòng (giống như `-v`) |
| `-l ZONE` | Chuyển vùng |
| `-r` | Truy vấn không đệ quy |
| `-T` | Sử dụng TCP |
| `-4` | Buộc IPv4 |
| `-6` | Buộc IPv6 |
| `-v` | Đầu ra dài dòng (tương tự như dig) |
| `-w` | Đợi mãi mới có phản hồi |
| `-W SECONDS` | Thời gian chờ tối đa cho truy vấn |
| `-R NUM` | Số lần thử lại |
| `-m FLAG` | Gỡ lỗi bộ nhớ: `record`, `usage`, `trace` |
| `-c CLASS` | Lớp truy vấn |
| `-C` | Kiểm tra tính nhất quán của SOA trên tất cả các máy chủ tên có thẩm quyền |
| `-N NUM` | Số dấu chấm phải xuất hiện để được coi là tên tuyệt đối |
| `-s` | KHÔNG gửi truy vấn đến máy chủ tên tiếp theo trên SERVFAIL |

<a id="examples-9"></a>
<a id="heading-94-examples"></a>

## Ví dụ

```bash
# Tra cứu cơ bản
host example.com
# Đầu ra:
# example.com có địa chỉ 93.184.216.34
# example.com có địa chỉ IPv6 2606:2800:220:1:248:1893:25c8:1946
# Thư example.com được xử lý bởi 0 .

# Tra cứu ngược
host 8.8.8.8
# Đầu ra: 8.8.8.8.in-addr.arpa con trỏ tên miền dns.google.

# bản ghi MX
host -t MX example.com

# hồ sơ NS
host -t NS example.com

# bản ghi TXT
host -t TXT example.com

# bản ghi SOA
host -t SOA example.com

# Sử dụng máy chủ DNS cụ thể
host example.com 8.8.8.8

# Đầu ra dài dòng (giống như đào)
host -v example.com

# Tất cả các loại bản ghi
host -a example.com

# Kiểm tra tính nhất quán của SOA
host -C example.com

# Chuyển vùng
host -l example.com ns1.example.com

# Chế độ TCP
host -T example.com
```

---

<a id="13-nmap--network-scanner"></a>
<a id="heading-95-13-nmap-network-scanner"></a>

# 13. `nmap` — Máy quét mạng

`nmap` (Network Mapper) là công cụ tiêu chuẩn công nghiệp để khám phá mạng và kiểm tra bảo mật.

<a id="syntax-11"></a>
<a id="heading-96-syntax"></a>

## Cú pháp

```bash
nmap [SCAN TYPE] [OPTIONS] TARGET
```

<a id="target-specification"></a>
<a id="heading-97-target-specification"></a>

## Đặc điểm mục tiêu

```bash
nmap 192.168.1.1                    # Máy chủ duy nhất
nmap 192.168.1.1 192.168.1.2       # Nhiều máy chủ
nmap 192.168.1.0/24                 # Mạng con CIDR
nmap 192.168.1.1-254               # dải IP
nmap 192.168.1.*                    # Ký tự đại diện
nmap 192.168.1,2.0-255             # Phạm vi Octet
nmap -iL targets.txt               # Đọc từ tập tin
nmap --exclude 192.168.1.1         # Loại trừ máy chủ
nmap --excludefile exclude.txt     # Loại trừ khỏi tập tin
nmap 192.168.1.0/24 --exclude 192.168.1.1
```

<a id="host-discovery"></a>
<a id="heading-98-host-discovery"></a>

## Khám phá máy chủ

| Cờ | Mô tả |
|------|-------------|
| `-sn` | Quét Ping (không quét cổng) - chỉ khám phá máy chủ |
| `-Pn` | Bỏ qua khám phá máy chủ (coi tất cả là trực tuyến) |
| `-PS PORTLIST` | TCP ping SYN trên các cổng nhất định |
| `-PA PORTLIST` | TCP ACK ping trên các cổng nhất định |
| `-PU PORTLIST` | UDP ping trên các cổng nhất định |
| `-PY PORTLIST` | ping SCTP INIT |
| `-PE` | ICMP Echo ping |
| `-PP` | Ping dấu thời gian ICMP |
| `-PM` | Ping mặt nạ địa chỉ ICMP |
| `-PO PROTOCOLS` | Ping giao thức IP |
| `-PR` | Ping ARP (mạng cục bộ) |
| `--disable-arp-ping` | Tắt ping ARP |
| `-n` | Không bao giờ sử dụng phân giải DNS |
| `-R` | Luôn giải quyết DNS |
| `--dns-servers SERVERS` | Máy chủ DNS tùy chỉnh |
| `--system-dns` | Sử dụng trình phân giải OS DNS |
| `--traceroute` | Theo dõi đường dẫn hop |

<a id="scan-techniques"></a>
<a id="heading-99-scan-techniques"></a>

## Kỹ thuật quét

| Cờ | Mô tả |
|------|-------------|
| `-sS` | Quét TCP SYN (mặc định, lén lút, yêu cầu root) |
| `-sT` | TCP Connect scan (bắt tay 3 bước đầy đủ, không cần root) |
| `-sU` | Quét UDP |
| `-sA` | Quét TCP ACK (phát hiện ports/firewalls đã lọc) |
| `-sW` | TCP Quét cửa sổ (như ACK nhưng phát hiện các cổng mở trên một số hệ thống) |
| `-sM` | TCP Quét Maimon (FIN/ACK) |
| `-sN` | TCP Quét rỗng (không đặt cờ) |
| `-sF` | Quét FIN TCP |
| `-sX` | Quét Giáng sinh TCP (FIN+PSH+URG) |
| `-sI ZOMBIE` | Quét nhàn rỗi (cực kỳ lén lút, sử dụng máy chủ zombie) |
| `-sY` | Quét SCTP INIT |
| `-sZ` | Quét SCTP COOKIE-ECHO |
| `-sO` | Quét giao thức IP (phát hiện các giao thức IP được hỗ trợ) |
| `-b FTP_HOST` | Quét thư bị trả lại FTP |
| `--scanflags FLAGS` | Cờ TCP tùy chỉnh |

<a id="port-specification"></a>
<a id="heading-100-port-specification"></a>

## Đặc điểm cổng

| Cờ | Mô tả |
|------|-------------|
| `-p PORTS` | Quét các cổng này. E.g.: `-p 22`, `-p 1-65535`, `-p 80,443`, `-p U:53,T:22` |
| `-p-` | Quét tất cả 65535 cổng |
| `--top-ports N` | Quét N cổng phổ biến nhất |
| `-F` | Quét nhanh (100 cổng phổ biến nhất) |
| `-r` | Quét các cổng một cách tuần tự (không chọn ngẫu nhiên) |
| `--port-ratio RATIO` | Quét cổng có tỷ lệ ≥ RATIO |

<a id="serviceversion-detection"></a>
<a id="heading-101-serviceversion-detection"></a>

## Phát hiện Service/Version

| Cờ | Mô tả |
|------|-------------|
| `-sV` | Thăm dò các cổng mở để biết thông tin service/version |
| `--version-intensity LEVEL` | 0 (nhẹ) đến 9 (thử tất cả các đầu dò) |
| `--version-light` | Tương tự như `--version-intensity 2` |
| `--version-all` | Tương tự như `--version-intensity 9` |
| `--version-trace` | Hiển thị hoạt động quét phiên bản chi tiết |

<a id="os-detection"></a>
<a id="heading-102-os-detection"></a>

## Phát hiện hệ điều hành

| Cờ | Mô tả |
|------|-------------|
| `-O` | Bật tính năng phát hiện hệ điều hành |
| `--osscan-limit` | Chỉ thử phát hiện hệ điều hành trên các máy chủ có triển vọng |
| `--osscan-guess` | Đoán hệ điều hành tích cực hơn |
| `--max-os-tries N` | Số lần thử phát hiện hệ điều hành tối đa |

<a id="timing-and-performance"></a>
<a id="heading-103-timing-and-performance"></a>

## Thời gian và hiệu suất

| Cờ | Mô tả |
|------|-------------|
| `-T0` | Hoang tưởng (rất chậm, trốn tránh IDS) |
| `-T1` | Lén lút (chậm, né tránh IDS) |
| `-T2` | Lịch sự (chậm lại) |
| `-T3` | Bình thường (mặc định) |
| `-T4` | Tích cực (nhanh hơn) |
| `-T5` | Điên (nhanh nhất, có thể lỡ cổng) |
| `--min-hostgroup N` | Máy chủ tối thiểu để quét song song |
| `--max-hostgroup N` | Máy chủ tối đa để quét song song |
| `--min-parallelism N` | Độ song song đầu dò tối thiểu |
| `--max-parallelism N` | Độ song song đầu dò tối đa |
| `--min-rtt-timeout MS` | Thời gian chờ RTT thăm dò tối thiểu |
| `--max-rtt-timeout MS` | Thời gian chờ RTT thăm dò tối đa |
| `--initial-rtt-timeout MS` | Hết thời gian chờ RTT thăm dò ban đầu |
| `--max-retries N` | Số lần truyền lại đầu dò tối đa |
| `--host-timeout MS` | Từ bỏ máy chủ sau thời gian này |
| `--scan-delay MS` | Điều chỉnh độ trễ giữa các đầu dò |
| `--max-scan-delay MS` | Độ trễ tối đa giữa các đầu dò |
| `--min-rate N` | Gói tối thiểu mỗi giây |
| `--max-rate N` | Số gói tối đa mỗi giây |

<a id="firewallids-evasion"></a>
<a id="heading-104-firewallids-evasion"></a>

## Firewall/IDS Trốn tránh

| Cờ | Mô tả |
|------|-------------|
| `-f` | Gói phân mảnh |
| `--mtu VALUE` | Đặt MTU tùy chỉnh |
| `-D DECOYS` | Quét áo choàng với mồi nhử (e.g., `-D RND:5`) |
| `-S SOURCE` | Địa chỉ nguồn giả mạo |
| `-e INTERFACE` | Sử dụng giao diện được chỉ định |
| `--source-port PORT` | Sử dụng cổng nguồn được chỉ định |
| `--proxies URL` | Kết nối chuyển tiếp thông qua proxy |
| `--data HEX` | Nối dữ liệu hex tùy chỉnh |
| `--data-string STRING` | Nối dữ liệu ASCII tùy chỉnh |
| `--data-length NUM` | Nối dữ liệu ngẫu nhiên có độ dài nhất định |
| `--ip-options OPTIONS` | Đặt tùy chọn IP |
| `--ttl VALUE` | Đặt IP TTL |
| `--spoof-mac MAC` | Địa chỉ MAC giả mạo |
| `--badsum` | Gửi với tổng kiểm tra sai |
| `--adler32` | Sử dụng Adler32 để kiểm tra tổng SCTP |

<a id="scripts-nse--nmap-scripting-engine"></a>
<a id="heading-105-scripts-nse-nmap-scripting-engine"></a>

## Tập lệnh (NSE - Công cụ tập lệnh Nmap)

| Cờ | Mô tả |
|------|-------------|
| `-sC` | Chạy các tập lệnh mặc định (giống như `--script=default`) |
| `--script SCRIPTS` | Chạy các tập lệnh được chỉ định. Danh mục: `auth`, `broadcast`, `brute`, `default`, `discovery`, `dos`, `exploit`, `external`, `fuzzer`, `intrusive`, `malware`, `safe`, `version`, `vuln` |
| `--script-args ARGS` | Đối số tập lệnh (e.g., `user=admin,pass=secret`) |
| `--script-args-file FILE` | Tải tập lệnh đối số từ tập tin |
| `--script-trace` | Hiển thị tất cả dữ liệu tập lệnh sent/received |
| `--script-updatedb` | Cập nhật cơ sở dữ liệu tập lệnh |
| `--script-help SCRIPTS` | Hiển thị trợ giúp cho tập lệnh |

<a id="output"></a>
<a id="heading-106-output"></a>

## đầu ra

| Cờ | Mô tả |
|------|-------------|
| `-oN FILE` | Đầu ra bình thường |
| `-oX FILE` | đầu ra XML |
| `-oG FILE` | Đầu ra có thể chỉnh sửa |
| `-oS FILE` | Đầu ra ScRiPt KiDDi3 |
| `-oA BASENAME` | Đầu ra ở tất cả các định dạng chính |
| `-v` | Tăng mức độ chi tiết (sử dụng `-vv` để biết thêm) |
| `-d` | Tăng khả năng gỡ lỗi (sử dụng `-dd` để biết thêm) |
| `--reason` | Hiển thị lý do cho trạng thái cổng |
| `--open` | Chỉ hiển thị các cổng đang mở |
| `--packet-trace` | Hiển thị tất cả các gói sent/received |
| `--iflist` | In giao diện và tuyến đường của máy chủ |
| `--append-output` | Nối vào tập tin đầu ra |
| `--resume FILE` | Tiếp tục quá trình quét bị hủy bỏ |
| `--stylesheet FILE` | Biểu định kiểu XSL cho đầu ra XML |
| `--webxml` | Sử dụng biểu định kiểu Nmap.org |
| `--no-stylesheet` | Không có biểu định kiểu XSL |
| `--stats-every TIME` | In số liệu thống kê định kỳ |

<a id="miscellaneous-1"></a>
<a id="heading-107-miscellaneous"></a>

## Linh tinh

| Cờ | Mô tả |
|------|-------------|
| `-6` | Bật quét IPv6 |
| `-A` | Quét tích cực: Phát hiện hệ điều hành + phiên bản + tập lệnh + theo dõi |
| `-V` | Số phiên bản in |
| `-h` | Trợ giúp |
| `--datadir DIR` | Thư mục dữ liệu Nmap |
| `--send-eth` | Gửi bằng khung Ethernet thô |
| `--send-ip` | Gửi bằng gói IP thô |
| `--privileged` | Giả sử người dùng có đặc quyền |
| `--unprivileged` | Giả sử người dùng không có đặc quyền |
| `--release-memory` | Giải phóng bộ nhớ trước khi thoát |

<a id="comprehensive-examples-1"></a>
<a id="heading-108-comprehensive-examples"></a>

## Ví dụ toàn diện

```bash
# Quét nhanh các cổng thông dụng
nmap 192.168.1.1

# Quét tất cả 65535 cổng
nmap -p- 192.168.1.1

# Quét các cổng cụ thể
nmap -p 22,80,443,3306,5432,8080 192.168.1.1

# Phạm vi cổng quét
nmap -p 1-1000 192.168.1.1

# Quét nhanh (100 cổng phổ biến nhất)
nmap -F 192.168.1.0/24

# Quét Ping (chỉ khám phá máy chủ trực tiếp)
nmap -sn 192.168.1.0/24

# Quét SYN với tính năng phát hiện phiên bản
sudo nmap -sS -sV 192.168.1.1

# Quét tích cực đầy đủ
sudo nmap -A 192.168.1.1

# Phát hiện hệ điều hành
sudo nmap -O 192.168.1.1

# Quét UDP
sudo nmap -sU -p 53,67,68,69,123,161,162,514 192.168.1.1

# Quét kết hợp TCP + UDP
sudo nmap -sS -sU -p T:80,443,U:53,161 192.168.1.1

# Chạy tập lệnh NSE mặc định
nmap -sC 192.168.1.1

# Quét + phiên bản + tập lệnh mặc định
nmap -sV -sC 192.168.1.1

# Chạy các tập lệnh dễ bị tổn thương
nmap --script vuln 192.168.1.1

# Chạy các tập lệnh cụ thể
nmap --script http-title,http-headers 192.168.1.1
nmap --script "http-*" 192.168.1.1
nmap --script "not intrusive" 192.168.1.1
nmap --script "safe and discovery" 192.168.1.1

# SSH vũ phu
nmap --script ssh-brute -p 22 192.168.1.1

# Phát hiện lỗ hổng SSL
nmap --script ssl-heartbleed,ssl-poodle -p 443 192.168.1.1

# Liệt kê HTTP
nmap --script http-enum -p 80 192.168.1.1

# Lấy biểu ngữ Service
nmap -sV --version-intensity 5 192.168.1.1

# Quét tàng hình với mồi nhử
sudo nmap -sS -D RND:5 192.168.1.1

# Quét bằng cổng nguồn cụ thể (bỏ qua một số tường lửa)
sudo nmap --source-port 53 192.168.1.1

# Gói tin mảnh (tránh IDS)
sudo nmap -f 192.168.1.1

# Thời điểm: quyết liệt
nmap -T4 192.168.1.0/24

# Thời điểm: hoang tưởng (trốn tránh IDS)
nmap -T0 192.168.1.1

# Xuất ra tất cả các định dạng
nmap -oA scan_results 192.168.1.0/24

# đầu ra XML
nmap -oX scan.xml 192.168.1.0/24

# Chỉ hiển thị các cổng đang mở
nmap --open 192.168.1.0/24

# Hiển thị lý do cho trạng thái cổng
nmap --reason 192.168.1.1

# Quét nhàn rỗi (cực kỳ lén lút)
sudo nmap -sI zombie.example.com 192.168.1.1

# Quét IPv6
nmap -6 2001:db8::1

# Quét nhanh 20 cổng hàng đầu trên toàn bộ mạng con
nmap --top-ports 20 -T4 10.0.0.0/24

# Liệt kê các giao diện mạng
nmap --iflist

# Quét giới hạn tốc độ
nmap --max-rate 100 192.168.1.0/24

# Tiếp tục quá trình quét bị gián đoạn
nmap --resume scan_results.gnmap
```

---

<a id="14-tcpdump--packet-capture--analysis"></a>
<a id="heading-109-14-tcpdump-packet-capture-analysis"></a>

# 14. `tcpdump` — Thu thập và phân tích gói

`tcpdump` chụp các gói từ giao diện mạng. Nó là bộ phân tích gói dòng lệnh tiêu chuẩn.

<a id="syntax-12"></a>
<a id="heading-110-syntax"></a>

## Cú pháp

```bash
tcpdump [OPTIONS] [EXPRESSION]
```

<a id="all-flags-and-options-6"></a>
<a id="heading-111-all-flags-and-options"></a>

## Tất cả cờ và tùy chọn

| Cờ | Mô tả |
|------|-------------|
| `-i INTERFACE` | Chụp trên giao diện cụ thể. Sử dụng `any` cho tất cả các giao diện |
| `-c COUNT` | Chụp COUNT gói rồi dừng |
| `-w FILE` | Ghi các gói thô vào tập tin (định dạng pcap) |
| `-r FILE` | Đọc gói từ tập tin |
| `-n` | Không phân giải tên máy chủ |
| `-nn` | Không phân giải tên máy chủ HOẶC tên cổng |
| `-v` | đầu ra dài dòng |
| `-vv` | Dài dòng hơn |
| `-vvv` | Độ chi tiết tối đa |
| `-q` | Yên tĩnh (ít thông tin giao thức hơn) |
| `-e` | In tiêu đề lớp liên kết (MAC) |
| `-A` | In tải trọng gói ở dạng ASCII |
| `-X` | In tải trọng gói ở dạng hex và ASCII |
| `-XX` | In gói có tiêu đề cấp liên kết ở dạng hex và ASCII |
| `-D` | Liệt kê các giao diện có sẵn |
| `-l` | Bộ đệm dòng (hữu ích cho đường ống) |
| `-t` | Không in dấu thời gian |
| `-tt` | In dấu thời gian Unix |
| `-ttt` | In delta giữa các gói |
| `-tttt` | Ngày + giờ in |
| `-ttttt` | In delta từ gói đầu tiên |
| `-s SNAPLEN` | Chụp byte SNAPLEN trên mỗi gói (mặc định: 262144). Sử dụng `-s 0` cho gói đầy đủ |
| `-S` | In số thứ tự TCP tuyệt đối |
| `-C FILESIZE` | Xoay file chụp ở FILESIZE (MB) |
| `-G SECONDS` | Xoay các tập tin chụp mỗi GIÂY |
| `-W COUNT` | Chỉ giữ COUNT tệp xoay |
| `-Z USER` | Bỏ đặc quyền cho NGƯỜI DÙNG |
| `-K` | Không xác minh tổng kiểm tra |
| `-p` | Đừng đặt chế độ lăng nhăng |
| `-U` | Đầu ra được đệm gói (ghi từng gói ngay lập tức) |
| `-B BUFFER` | Đặt kích thước bộ đệm chụp kernel (KB) |
| `-F FILE` | Đọc bộ lọc BPF từ tệp |
| `-Q DIRECTION` | Hướng chụp: `in`, `out`, `inout` |
| `--direction DIRECTION` | Tương tự như `-Q` |
| `-j TSTAMP_TYPE` | Loại dấu thời gian |
| `--list-time-stamp-types` | Liệt kê các loại dấu thời gian có sẵn |
| `--time-stamp-precision PREC` | `micro` hoặc `nano` |
| `--immediate-mode` | Cung cấp các gói như đã chụp |
| `--print` | In kết quả được phân tích cú pháp ngay cả với `-w` |
| `--version` | Phiên bản in |
| `--count` | Chỉ in số lượng gói |

<a id="bpf-filter-expressions"></a>
<a id="heading-112-bpf-filter-expressions"></a>

## Biểu thức lọc BPF

Biểu thức BPF (Berkeley Packet Filter) xác định gói nào cần chụp.

<a id="protocol-filters"></a>
<a id="heading-113-protocol-filters"></a>

### Bộ lọc giao thức

```bash
tcpdump tcp                          # Chỉ TCP
tcpdump udp                          # Chỉ UDP
tcpdump icmp                         # chỉ ICMP
tcpdump arp                          # chỉ ARP
tcpdump ip                           # Chỉ IPv4
tcpdump ip6                          # Chỉ IPv6
tcpdump vlan                         # Đã gắn thẻ Vlan
```

<a id="host-filters"></a>
<a id="heading-114-host-filters"></a>

### Bộ lọc máy chủ

```bash
tcpdump host 192.168.1.100           # Lưu lượng truy cập máy chủ to/from
tcpdump src host 192.168.1.100       # Lưu lượng truy cập TỪ máy chủ
tcpdump dst host 192.168.1.100       # Lưu lượng truy cập ĐẾN máy chủ
tcpdump net 192.168.1.0/24           # Lưu lượng mạng to/from
tcpdump src net 10.0.0.0/8           # Lưu lượng TỪ mạng
tcpdump dst net 10.0.0.0/8           # Lưu lượng truy cập ĐẾN mạng
```

<a id="port-filters"></a>
<a id="heading-115-port-filters"></a>

### Bộ lọc cổng

```bash
tcpdump port 80                      # Lưu lượng trên cổng 80
tcpdump src port 443                 # Lưu lượng TỪ cổng 443
tcpdump dst port 22                  # Lưu lượng ĐẾN cổng 22
tcpdump portrange 1024-65535         # Phạm vi cổng
tcpdump tcp port 80                  # Lưu lượng TCP trên cổng 80
tcpdump udp port 53                  # Lưu lượng UDP trên cổng 53
```

<a id="logical-operators"></a>
<a id="heading-116-logical-operators"></a>

### Operator logic

```bash
tcpdump host 192.168.1.1 and port 80          # AND
tcpdump host 192.168.1.1 or host 192.168.1.2  # OR
tcpdump not port 22                             # NOT
tcpdump '(host 192.168.1.1 or host 192.168.1.2) and port 80'  # Nhóm
```

<a id="tcp-flag-filters"></a>
<a id="heading-117-tcp-flag-filters"></a>

### Bộ lọc cờ TCP

```bash
tcpdump 'tcp[tcpflags] & tcp-syn != 0'        # gói SYN
tcpdump 'tcp[tcpflags] & tcp-ack != 0'        # gói ACK
tcpdump 'tcp[tcpflags] & tcp-fin != 0'        # Gói FIN
tcpdump 'tcp[tcpflags] & tcp-rst != 0'        # gói RST
tcpdump 'tcp[tcpflags] & tcp-push != 0'       # Gói PSH
tcpdump 'tcp[tcpflags] & (tcp-syn|tcp-ack) = (tcp-syn|tcp-ack)'  # SYN-ACK
tcpdump 'tcp[tcpflags] = tcp-syn'             # Chỉ SYN (không có cờ nào khác)
```

<a id="size-filters"></a>
<a id="heading-118-size-filters"></a>

### Bộ lọc kích thước

```bash
tcpdump greater 1000                  # Các gói lớn hơn 1000 byte
tcpdump less 64                       # Các gói nhỏ hơn 64 byte
tcpdump 'len > 500'                   # Tương tự như lớn hơn
```

<a id="advanced-filters"></a>
<a id="heading-119-advanced-filters"></a>

### Bộ lọc nâng cao

```bash
# Lưu lượng được gắn thẻ Vlan
tcpdump vlan

# ID Vlan cụ thể
tcpdump 'vlan 100'

# Broadcast/multicast
tcpdump broadcast
tcpdump multicast
tcpdump ether broadcast

# Địa chỉ MAC cụ thể
tcpdump ether host 00:11:22:33:44:55
tcpdump ether src 00:11:22:33:44:55
tcpdump ether dst ff:ff:ff:ff:ff:ff

# Đoạn IP
tcpdump 'ip[6:2] & 0x1fff != 0'

# TTL = 1 (phát hiện đường đi)
tcpdump 'ip[8] = 1'

# HTTP NHẬN requests
tcpdump -A 'tcp port 80 and tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x47455420'

# Truy vấn DNS
tcpdump -n udp port 53
```

<a id="comprehensive-examples-2"></a>
<a id="heading-120-comprehensive-examples"></a>

## Ví dụ toàn diện

```bash
# Nắm bắt tất cả lưu lượng truy cập trên eth0
sudo tcpdump -i eth0

# Chụp không có phân giải DNS/port, dài dòng
sudo tcpdump -i eth0 -nn -vv

# Chụp 100 gói đầu tiên trên bất kỳ giao diện nào
sudo tcpdump -i any -c 100

# Lưu ảnh chụp vào tập tin
sudo tcpdump -i eth0 -w capture.pcap

# Đọc từ tập tin đã lưu
tcpdump -r capture.pcap

# Chỉ ghi lại lưu lượng truy cập HTTP
sudo tcpdump -i eth0 tcp port 80

# Chụp HTTP và HTTPS
sudo tcpdump -i eth0 'tcp port 80 or tcp port 443'

# Ghi lại lưu lượng truy cập DNS
sudo tcpdump -i eth0 udp port 53

# Nắm bắt tất cả lưu lượng truy cập to/from một máy chủ
sudo tcpdump -i eth0 host 192.168.1.100

# Nắm bắt lưu lượng SSH
sudo tcpdump -i eth0 tcp port 22

# Chụp với nội dung gói trong ASCII
sudo tcpdump -i eth0 -A port 80

# Chụp bằng kết xuất hex+ASCII
sudo tcpdump -i eth0 -X port 80

# Chụp với địa chỉ MAC được hiển thị
sudo tcpdump -i eth0 -e

# Chụp các gói đầy đủ (không cắt bớt)
sudo tcpdump -i eth0 -s 0

# Chụp bằng dấu thời gian và ghi vào tập tin
sudo tcpdump -i eth0 -tttt -w timestamped.pcap

# Nắm bắt lưu lượng truy cập giữa hai máy chủ cụ thể
sudo tcpdump -i eth0 'host 192.168.1.1 and host 192.168.1.2'

# Nắm bắt lưu lượng truy cập không phải SSH (loại trừ SSH)
sudo tcpdump -i eth0 'not port 22'

# Chỉ chụp các gói SYN (kết nối mới)
sudo tcpdump -i eth0 'tcp[tcpflags] = tcp-syn'

# Chụp các gói RST (đặt lại kết nối)
sudo tcpdump -i eth0 'tcp[tcpflags] & tcp-rst != 0'

# Đầu ra được đệm dòng cho đường ống
sudo tcpdump -i eth0 -l port 80 | grep "GET"

# Xoay file mỗi 100MB, giữ 10 file
sudo tcpdump -i eth0 -w capture.pcap -C 100 -W 10

# Xoay tệp cứ sau 3600 giây (1 giờ)
sudo tcpdump -i eth0 -w 'capture_%Y%m%d_%H%M%S.pcap' -G 3600

# Chỉ ghi lại lưu lượng truy cập đến
sudo tcpdump -i eth0 -Q in

# Chỉ chụp lưu lượng truy cập đi
sudo tcpdump -i eth0 -Q out

# Chụp ICMP (ping)
sudo tcpdump -i eth0 icmp

# Chụp ARP
sudo tcpdump -i eth0 arp

# Chụp DHCP
sudo tcpdump -i eth0 udp port 67 or udp port 68

# Đếm các gói phù hợp với bộ lọc
sudo tcpdump -i eth0 --count tcp port 80

# In delta giữa các gói
sudo tcpdump -i eth0 -ttt port 443

# Liệt kê các giao diện có sẵn
tcpdump -D
```

---

<a id="15-iptables--firewall-netfilter"></a>
<a id="heading-121-15-iptables-firewall-netfilter"></a>

# 15. `iptables` — Tường lửa (Netfilter)

`iptables` quản lý khung lọc gói của kernel Linux (Netfilter). Nó hoạt động trên chuỗi quy tắc được tổ chức theo bảng.

<a id="tables"></a>
<a id="heading-122-tables"></a>

## Bàn

| Bảng | Mục đích |
|-------|---------|
| `filter` | Mặc định. Lọc gói (accept/drop/reject) |
| `nat` | Dịch địa chỉ mạng |
| `mangle` | Thay đổi gói (TOS, TTL, đánh dấu) |
| `raw` | Miễn trừ theo dõi kết nối |
| `security` | Đánh dấu bảo mật SELinux |

<a id="chains"></a>
<a id="heading-123-chains"></a>

## Dây chuyền

| Chuỗi | Bảng | Mô tả |
|-------|-------|-------------|
| `INPUT` | bộ lọc, mangle, bảo mật | Các gói đến dành cho máy cục bộ |
| `FORWARD` | bộ lọc, mangle, bảo mật | Các gói được định tuyến qua máy |
| `OUTPUT` | bộ lọc, nat, mangle, nguyên, bảo mật | Các gói gửi đi từ máy cục bộ |
| `PREROUTING` | nat, mangle, nguyên | Trước khi quyết định định tuyến |
| `POSTROUTING` | nat, mangle | Sau khi quyết định định tuyến |

<a id="syntax-13"></a>
<a id="heading-124-syntax"></a>

## Cú pháp

```bash
iptables [-t TABLE] COMMAND CHAIN [MATCH] [TARGET]
```

<a id="commands"></a>
<a id="heading-125-commands"></a>

## Lệnh

| Cờ | Mô tả |
|------|-------------|
| `-A CHAIN` | Nối quy tắc vào chuỗi |
| `-I CHAIN [NUM]` | Chèn quy tắc vào vị trí (mặc định: 1) |
| `-D CHAIN RULE` | Xóa quy tắc theo đặc điểm kỹ thuật |
| `-D CHAIN NUM` | Xóa quy tắc theo số |
| `-R CHAIN NUM RULE` | Thay thế quy tắc tại vị trí |
| `-L [CHAIN]` | Liệt kê quy tắc |
| `-S [CHAIN]` | In quy tắc dưới dạng lệnh iptables |
| `-F [CHAIN]` | Xóa (xóa tất cả quy tắc) trong chuỗi |
| `-Z [CHAIN]` | Bộ đếm Zero packet/byte |
| `-N CHAIN` | Tạo chuỗi mới do người dùng xác định |
| `-X [CHAIN]` | Xóa chuỗi trống do người dùng xác định |
| `-P CHAIN TARGET` | Đặt chính sách mặc định cho chuỗi tích hợp |
| `-E OLD NEW` | Đổi tên chuỗi do người dùng xác định |
| `-C CHAIN RULE` | Kiểm tra xem quy tắc có tồn tại không |

<a id="match-options"></a>
<a id="heading-126-match-options"></a>

## Tùy chọn trận đấu

| Cờ | Mô tả |
|------|-------------|
| `-p PROTO` | Giao thức: `tcp`, `udp`, `icmp`, `icmpv6`, `esp`, `ah`, `sctp`, `udplite`, `all` |
| `-s SOURCE` | Nguồn address/network (e.g., `192.168.1.0/24`) |
| `-d DEST` | Điểm đến address/network |
| `-i IFACE` | Giao diện đầu vào (dành cho INPUT/FORWARD/PREROUTING) |
| `-o IFACE` | Giao diện đầu ra (dành cho OUTPUT/FORWARD/POSTROUTING) |
| `-f` | Ghép các đoạn thứ hai và các đoạn tiếp theo |
| `!` | Phủ nhận trận đấu (e.g., `! -s 10.0.0.0/8`) |

<a id="tcp-match-extensions--p-tcp"></a>
<a id="heading-127-tcp-match-extensions-p-tcp"></a>

## Tiện ích mở rộng đối sánh TCP (`-p tcp`)

| Cờ | Mô tả |
|------|-------------|
| `--sport PORT[:PORT]` | Cổng hoặc phạm vi nguồn |
| `--dport PORT[:PORT]` | Cổng hoặc phạm vi đích |
| `--tcp-flags MASK COMP` | Phù hợp với cờ TCP (e.g., `SYN,ACK,FIN,RST SYN`) |
| `--syn` | Khớp các gói SYN (kết nối mới) |
| `--tcp-option NUM` | Phù hợp với tùy chọn TCP |

<a id="udp-match-extensions--p-udp"></a>
<a id="heading-128-udp-match-extensions-p-udp"></a>

## Tiện ích mở rộng đối sánh UDP (`-p udp`)

| Cờ | Mô tả |
|------|-------------|
| `--sport PORT[:PORT]` | Cổng hoặc phạm vi nguồn |
| `--dport PORT[:PORT]` | Cổng hoặc phạm vi đích |

<a id="icmp-match-extensions--p-icmp"></a>
<a id="heading-129-icmp-match-extensions-p-icmp"></a>

## Tiện ích mở rộng đối sánh ICMP (`-p icmp`)

| Cờ | Mô tả |
|------|-------------|
| `--icmp-type TYPE` | Loại ICMP: `echo-request`, `echo-reply`, `destination-unreachable`, `time-exceeded`, v.v. |

<a id="match-modules--m-module"></a>
<a id="heading-130-match-modules-m-module"></a>

## Mô-đun phù hợp (`-m MODULE`)

| mô-đun | Cờ | Mô tả |
|--------|-------|-------------|
| `state` | `--state NEW,ESTABLISHED,RELATED,INVALID` | Trạng thái theo dõi kết nối |
| `conntrack` | `--ctstate`, `--ctproto`, `--ctorigsrc`, v.v. | Theo dõi kết nối nâng cao |
| `multiport` | `--sports`, `--dports`, `--ports` | Kết hợp nhiều cổng (tối đa 15) |
| `iprange` | `--src-range IP-IP`, `--dst-range IP-IP` | Phù hợp với dải IP |
| `mac` | `--mac-source MAC` | Địa chỉ MAC nguồn phù hợp |
| `limit` | `--limit RATE`, `--limit-burst NUM` | Giới hạn tỷ lệ |
| `hashlimit` | `--hashlimit-upto`, `--hashlimit-name`, v.v. | Giới hạn tốc độ trên mỗi địa chỉ |
| `recent` | `--name`, `--set`, `--rcheck`, `--update`, `--seconds`, `--hitcount` | Theo dõi các kết nối gần đây |
| `string` | `--string PATTERN`, `--algo {bm,kmp}` | So khớp nội dung gói |
| `comment` | `--comment "TEXT"` | Thêm nhận xét vào quy tắc |
| `mark` | `--mark VALUE[/MASK]` | Đánh dấu gói phù hợp |
| `owner` | `--uid-owner`, `--gid-owner` | Chủ sở hữu gói phù hợp (chỉ OUTPUT) |
| `length` | `--length MIN:MAX` | Độ dài gói phù hợp |
| `ttl` | `--ttl-eq`, `--ttl-gt`, `--ttl-lt` | Trận đấu với TTL |
| `tos` | `--tos VALUE` | Khớp trường TOS |
| `dscp` | `--dscp VALUE`, `--dscp-class CLASS` | Khớp trường DSCP |
| `time` | `--timestart`, `--timestop`, `--days`, `--monthdays` | So khớp dựa trên thời gian |
| `connlimit` | `--connlimit-above N`, `--connlimit-mask BITS` | Hạn chế kết nối đồng thời |
| `set` | `--match-set NAME FLAGS` | Trận đấu với ipset |
| `geoip` | `--src-cc`, `--dst-cc` | Phù hợp theo quốc gia (xt_geoip) |
| `addrtype` | `--src-type TYPE`, `--dst-type TYPE` | Loại địa chỉ phù hợp (LOCAL, UNICAST, v.v.) |
| `physdev` | `--physdev-in`, `--physdev-out` | Kết hợp thiết bị vật lý cầu nối |
| `policy` | `--pol`, `--dir`, `--strict` | Phù hợp với chính sách IPsec |
| `u32` | `--u32 TEST` | Khớp các byte tùy ý |

<a id="targets--j-target"></a>
<a id="heading-131-targets-j-target"></a>

## Mục tiêu (`-j TARGET`)

| Mục tiêu | Mô tả |
|--------|-------------|
| `ACCEPT` | Chấp nhận gói |
| `DROP` | Âm thầm thả gói tin |
| `REJECT` | Từ chối với lỗi ICMP (có thể định cấu hình bằng `--reject-with`) |
| `LOG` | Ghi nhật ký gói (tiếp tục xử lý) |
| `RETURN` | Quay trở lại từ chuỗi người dùng đến chuỗi gọi |
| `QUEUE` | Xếp hàng vào không gian người dùng |
| `NFQUEUE` | Xếp hàng vào không gian người dùng qua nfnetlink |
| `MASQUERADE` | Lễ hội hóa trang NAT (SNAT động, nat/POSTROUTING) |
| `SNAT` | Nguồn NAT (`--to-source IP[:PORT]`, nat/POSTROUTING) |
| `DNAT` | Điểm đến NAT (`--to-destination IP[:PORT]`, nat/PREROUTING) |
| `REDIRECT` | Chuyển hướng đến cổng cục bộ (`--to-ports PORT`, nat/PREROUTING) |
| `MARK` | Đặt dấu gói (`--set-mark VALUE`) |
| `CONNMARK` | Đặt dấu kết nối |
| `TOS` | Đặt trường TOS |
| `DSCP` | Đặt trường DSCP |
| `TTL` | Sửa đổi TTL |
| `TCPMSS` | Kẹp MSS (`--clamp-mss-to-pmtu`) |
| `NOTRACK` | Bỏ qua theo dõi kết nối (bảng thô) |
| `CLASSIFY` | Đặt mức độ ưu tiên của gói |
| `TPROXY` | Proxy minh bạch |
| `CT` | Phân công người trợ giúp theo dõi kết nối |
| `AUDIT` | Ghi nhật ký kiểm tra |
| `SECMARK` | Đặt dấu bảo mật |

<a id="display-options"></a>
<a id="heading-132-display-options"></a>

## Tùy chọn hiển thị

| Cờ | Mô tả |
|------|-------------|
| `-L` | Liệt kê quy tắc |
| `-n` | Đầu ra số |
| `-v` | Verbose (hiển thị bộ đếm, giao diện) |
| `--line-numbers` | Hiển thị số quy tắc |
| `-x` | Bộ đếm byte/packet chính xác |

<a id="comprehensive-examples-3"></a>
<a id="heading-133-comprehensive-examples"></a>

## Ví dụ toàn diện

```bash
# Liệt kê tất cả các quy tắc (dài dòng, số, có số dòng)
sudo iptables -L -n -v --line-numbers

# Liệt kê các quy tắc dưới dạng lệnh (dễ dàng với save/restore)
sudo iptables -S

# Liệt kê các quy tắc NAT
sudo iptables -t nat -L -n -v

# Đặt chính sách mặc định (đường cơ sở an toàn)
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# Cho phép lặp lại
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A OUTPUT -o lo -j ACCEPT

# Cho phép các kết nối được thiết lập và liên quan
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Cho phép SSH
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Cho phép HTTP và HTTPS
sudo iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT

# Cho phép DNS
sudo iptables -A INPUT -p udp --dport 53 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 53 -j ACCEPT

# Cho phép ICMP (ping)
sudo iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# Chặn một IP cụ thể
sudo iptables -A INPUT -s 10.0.0.5 -j DROP

# Chặn một mạng con
sudo iptables -A INPUT -s 10.99.0.0/16 -j DROP

# Từ chối (gửi ICMP không thể truy cập) thay vì gửi im lặng
sudo iptables -A INPUT -s 10.0.0.5 -j REJECT --reject-with icmp-port-unreachable

# Giới hạn tốc độ kết nối đến (chống DDoS)
sudo iptables -A INPUT -p tcp --dport 80 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT

# Giới hạn kết nối SSH (ngăn chặn bạo lực)
sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH
sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP

# Giới hạn kết nối đồng thời từ một IP duy nhất
sudo iptables -A INPUT -p tcp --dport 80 -m connlimit --connlimit-above 50 -j REJECT

# Ghi nhật ký các gói bị rơi
sudo iptables -A INPUT -j LOG --log-prefix "IPTables-Dropped: " --log-level 4
sudo iptables -A INPUT -j DROP

# NAT / Giả mạo (cho phép chia sẻ internet)
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo sysctl -w net.ipv4.ip_forward=1

# SNAT (nguồn tĩnh NAT)
sudo iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -o eth0 -j SNAT --to-source 203.0.113.1

# DNAT / Chuyển tiếp cổng
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 8080 -j DNAT --to-destination 192.168.1.100:80
sudo iptables -A FORWARD -p tcp -d 192.168.1.100 --dport 80 -j ACCEPT

# Cổng chuyển hướng (chuyển tiếp cổng cục bộ)
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8080

# Cho phép lưu lượng truy cập từ MAC cụ thể
sudo iptables -A INPUT -m mac --mac-source 00:11:22:33:44:55 -j ACCEPT

# Phù hợp với dải IP
sudo iptables -A INPUT -m iprange --src-range 192.168.1.100-192.168.1.200 -j ACCEPT

# Quy tắc dựa trên thời gian (chỉ cho phép HTTP trong giờ làm việc)
sudo iptables -A INPUT -p tcp --dport 80 -m time --timestart 08:00 --timestop 18:00 --days Mon,Tue,Wed,Thu,Fri -j ACCEPT

# So khớp theo chủ sở hữu (chỉ chuỗi OUTPUT)
sudo iptables -A OUTPUT -m owner --uid-owner nobody -j DROP

# Kẹp MSS cho các sự cố VPN/tunnel
sudo iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu

# Đánh dấu các gói để định tuyến chính sách
sudo iptables -t mangle -A PREROUTING -s 192.168.1.0/24 -j MARK --set-mark 1

# So khớp chuỗi trong nội dung gói
sudo iptables -A INPUT -m string --string "X-Malicious" --algo bm -j DROP

# Chèn quy tắc tại vị trí 1
sudo iptables -I INPUT 1 -p tcp --dport 22 -j ACCEPT

# Xóa quy tắc theo số
sudo iptables -D INPUT 3

# Xóa quy tắc theo đặc điểm kỹ thuật
sudo iptables -D INPUT -p tcp --dport 80 -j ACCEPT

# Xóa tất cả các quy tắc
sudo iptables -F

# Xóa quy tắc NAT
sudo iptables -t nat -F

# Bộ đếm không
sudo iptables -Z

# Tạo chuỗi tùy chỉnh
sudo iptables -N MY_CHAIN
sudo iptables -A MY_CHAIN -p tcp --dport 80 -j ACCEPT
sudo iptables -A MY_CHAIN -j RETURN
sudo iptables -A INPUT -j MY_CHAIN

# Lưu quy tắc
sudo iptables-save > /etc/iptables/rules.v4

# Khôi phục quy tắc
sudo iptables-restore < /etc/iptables/rules.v4

# Quy tắc IPv6 (sử dụng ip6tables)
sudo ip6tables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo ip6tables -L -n -v
```

---

<a id="16-nftables--modern-firewall-replaces-iptables"></a>
<a id="heading-134-16-nftables-modern-firewall-replaces-iptables"></a>

# 16. `nftables` — Tường lửa hiện đại (Thay thế iptables)

`nftables` là khung lọc gói Linux hiện đại thay thế `iptables`, `ip6tables`, `arptables` và `ebtables` trong một công cụ hợp nhất duy nhất. Mặc định trên Debian 10+, Ubuntu 22.04+, RHEL 8+ và Fedora 32+.

<a id="general-syntax-1"></a>
<a id="heading-135-general-syntax"></a>

## Cú pháp chung

```bash
nft [ options ] COMMAND OBJECT
nft -f /path/to/rules.nft       # Tải quy tắc từ tập tin
```

<a id="address-families"></a>
<a id="heading-136-address-families"></a>

## Địa chỉ gia đình

| gia đình | Tay cầm |
|--------|---------|
| `ip` | IPv4 |
| `ip6` | IPv6 |
| `inet` | IPv4 + IPv6 (được khuyến nghị cho hầu hết các quy tắc) |
| `arp` | ARP |
| `bridge` | Cầu Ethernet |
| `netdev` | Ingress/egress trên mỗi thiết bị |

<a id="listing-and-inspecting"></a>
<a id="heading-137-listing-and-inspecting"></a>

## Liệt kê và kiểm tra

```bash
# Liệt kê mọi thứ (bảng, chuỗi, quy tắc, bộ)
sudo nft list ruleset

# Liệt kê một bảng cụ thể
sudo nft list table inet filter

# Liệt kê một chuỗi
sudo nft list chain inet filter input

# Hiển thị các thẻ điều khiển (cần thiết để xóa quy tắc)
sudo nft -a list ruleset

# Đầu ra JSON
sudo nft -j list ruleset

# Theo dõi các sự kiện trong thời gian thực
sudo nft monitor
```

<a id="tables-1"></a>
<a id="heading-138-tables"></a>

## Bàn

```bash
# Tạo bảng
sudo nft add table inet filter

# Xóa bảng (xóa tất cả các chuỗi và quy tắc)
sudo nft delete table inet filter

# Xóa bảng (xóa tất cả quy tắc, giữ nguyên cấu trúc)
sudo nft flush table inet filter
```

<a id="chains-1"></a>
<a id="heading-139-chains"></a>

## Dây chuyền

Các chuỗi gắn vào **móc** trong ngăn xếp mạng: `prerouting`, `input`, `forward`, `output`, `postrouting`.

```bash
# Tạo chuỗi cơ sở (với chính sách hook, loại và mặc định)
sudo nft add chain inet filter input \
  '{ type filter hook input priority 0; policy drop; }'

# Tạo một chuỗi thông thường (được gọi từ quy tắc, không có hook)
sudo nft add chain inet filter my_chain

# Xóa một chuỗi
sudo nft delete chain inet filter my_chain

# Xóa một chuỗi (loại bỏ các quy tắc của nó)
sudo nft flush chain inet filter input
```

<a id="rules"></a>
<a id="heading-140-rules"></a>

## Quy tắc

```bash
# Cho phép lặp lại
sudo nft add rule inet filter input iif lo accept

# Cho phép thành lập và liên quan
sudo nft add rule inet filter input ct state established,related accept

# Cho phép SSH (có giới hạn tốc độ)
sudo nft add rule inet filter input tcp dport 22 ct state new limit rate 5/minute accept

# Cho phép HTTP và HTTPS
sudo nft add rule inet filter input tcp dport { 80, 443 } accept

# Cho phép DNS (UDP + TCP)
sudo nft add rule inet filter input meta l4proto { tcp, udp } th dport 53 accept

# Cho phép ICMP (ping)
sudo nft add rule inet filter input icmp type echo-request accept
sudo nft add rule inet filter input icmpv6 type echo-request accept

# Thả và đăng nhập mọi thứ khác
sudo nft add rule inet filter input log prefix "INPUT DROP: " drop

# Chặn một IP cụ thể
sudo nft add rule inet filter input ip saddr 192.168.1.50 drop

# Chặn một mạng con
sudo nft add rule inet filter input ip saddr 10.0.0.0/8 drop

# Chèn quy tắc ở vị trí 0 (trước tất cả các quy tắc khác)
sudo nft insert rule inet filter input iif lo accept

# Xóa quy tắc bằng điều khiển (điều khiển bằng nft -a list)
sudo nft delete rule inet filter input handle 5

# Thay thế tất cả các quy tắc nguyên tử từ một tệp
sudo nft -f /etc/nftables.conf
```

<a id="sets-named-groups"></a>
<a id="heading-141-sets-named-groups"></a>

## Bộ (Nhóm được đặt tên)

```bash
# Tạo bộ IP được đặt tên
sudo nft add set inet filter blacklist '{ type ipv4_addr; }'

# Thêm IP vào bộ
sudo nft add element inet filter blacklist { 192.168.1.50, 10.0.0.1 }

# Tham chiếu được đặt trong một quy tắc
sudo nft add rule inet filter input ip saddr @blacklist drop

# Xóa phần tử khỏi tập hợp
sudo nft delete element inet filter blacklist { 192.168.1.50 }

# Đã đặt khoảng thời gian cho phạm vi cổng
sudo nft add set inet filter allowed_ports '{ type inet_service; flags interval; }'
sudo nft add element inet filter allowed_ports { 80, 443, 8000-8100 }
```

<a id="nat"></a>
<a id="heading-142-nat"></a>

## NAT

```bash
# Tạo bảng và chuỗi NAT
sudo nft add table nat
sudo nft add chain nat prerouting  '{ type nat hook prerouting priority -100; }'
sudo nft add chain nat postrouting '{ type nat hook postrouting priority 100; }'

# Masquerade (chia sẻ internet / SNAT để gửi đi)
sudo nft add rule nat postrouting oif eth0 masquerade

# Tĩnh SNAT
sudo nft add rule nat postrouting ip saddr 192.168.1.0/24 snat to 203.0.113.1

# DNAT / Chuyển tiếp cổng (chuyển hướng cổng vào 80 sang máy chủ nội bộ)
sudo nft add rule nat prerouting tcp dport 80 dnat to 192.168.1.10:8080

# Chuyển hướng cổng cục bộ
sudo nft add rule nat prerouting tcp dport 80 redirect to :8080
```

<a id="complete-rule-file-example"></a>
<a id="heading-143-complete-rule-file-example"></a>

## Ví dụ về tệp quy tắc hoàn chỉnh

```bash
# /etc/nftables.conf
table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;
        iif lo accept
        ct state established,related accept
        icmp type echo-request accept
        icmpv6 type echo-request accept
        tcp dport 22 ct state new limit rate 5/minute accept
        tcp dport { 80, 443 } accept
        log prefix "INPUT DROP: " drop
    }
    chain forward { type filter hook forward priority 0; policy drop; }
    chain output  { type filter hook output  priority 0; policy accept; }
}

table nat {
    chain prerouting  { type nat hook prerouting  priority -100; }
    chain postrouting { type nat hook postrouting priority  100;
        oif eth0 masquerade
    }
}
```

<a id="saving-and-loading"></a>
<a id="heading-144-saving-and-loading"></a>

## Lưu và tải

```bash
# Lưu bộ quy tắc hiện tại
sudo nft list ruleset > /etc/nftables.conf

# Tải từ tập tin
sudo nft -f /etc/nftables.conf

# Kích hoạt dịch vụ (tự động tải khi khởi động)
sudo systemctl enable --now nftables
sudo systemctl reload nftables
```

---

<a id="17-firewall-cmd--firewalld-cli-rhelcentosfedora"></a>
<a id="heading-145-17-firewall-cmd-firewalld-cli-rhelcentosfedo"></a>

# 17. `firewall-cmd` — CLI được tường lửa (RHEL/CentOS/Fedora)

<a id="commands-1"></a>
<a id="heading-146-commands"></a>

## Lệnh

```bash
# Trạng thái
sudo firewall-cmd --state
sudo firewall-cmd --get-active-zones
sudo firewall-cmd --get-zones
sudo firewall-cmd --get-default-zone
sudo firewall-cmd --list-all
sudo firewall-cmd --list-all-zones

# Quản lý khu vực
sudo firewall-cmd --set-default-zone=public
sudo firewall-cmd --zone=public --list-all
sudo firewall-cmd --zone=trusted --add-interface=eth1

# Services
sudo firewall-cmd --list-services
sudo firewall-cmd --get-services                        # Tất cả các dịch vụ có sẵn
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --remove-service=http
sudo firewall-cmd --permanent --zone=public --add-service=ssh

# Cổng
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=5000-5100/tcp
sudo firewall-cmd --permanent --remove-port=8080/tcp
sudo firewall-cmd --list-ports

# Quy tắc phong phú (quy tắc phức tạp)
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" service name="ssh" accept'
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="10.0.0.5" drop'
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.100" port protocol="tcp" port="3306" accept'

# Chuyển tiếp cổng
sudo firewall-cmd --permanent --add-forward-port=port=80:proto=tcp:toport=8080
sudo firewall-cmd --permanent --add-forward-port=port=80:proto=tcp:toaddr=192.168.1.100:toport=80

# Hóa trang (NAT)
sudo firewall-cmd --permanent --add-masquerade
sudo firewall-cmd --permanent --remove-masquerade

# Quy tắc trực tiếp (iptables thô)
sudo firewall-cmd --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 9000 -j ACCEPT

# ICMP
sudo firewall-cmd --permanent --add-icmp-block=echo-reply
sudo firewall-cmd --permanent --remove-icmp-block=echo-reply

# Tải lại
sudo firewall-cmd --reload

# Thời gian chạy so với vĩnh viễn
# Không có --permanent: áp dụng ngay lập tức nhưng bị mất khi tải lại
# Với --permanent: đã lưu nhưng yêu cầu --reload mới có hiệu lực
```

---

<a id="18-ufw--uncomplicated-firewall"></a>
<a id="heading-147-18-ufw-uncomplicated-firewall"></a>

# 18. `ufw` — Tường lửa đơn giản

Giao diện thân thiện với người dùng dành cho `iptables`, thường được sử dụng trên Ubuntu/Debian.

<a id="all-commands"></a>
<a id="heading-148-all-commands"></a>

## Tất cả các lệnh

```bash
# Enable/Disable
sudo ufw enable                      # Kích hoạt tường lửa
sudo ufw disable                     # Tắt tường lửa
sudo ufw reset                       # Đặt lại về mặc định

# Trạng thái
sudo ufw status                      # Hiển thị trạng thái và quy tắc
sudo ufw status verbose              # Trạng thái dài dòng
sudo ufw status numbered             # Hiển thị quy tắc với số

# Chính sách mặc định
sudo ufw default deny incoming       # Chặn tất cả các cuộc gọi đến
sudo ufw default allow outgoing      # Cho phép tất cả đi
sudo ufw default deny forward        # Chặn chuyển tiếp

# Allow/Deny theo cổng
sudo ufw allow 22                    # Cho phép cổng 22 (TCP+UDP)
sudo ufw allow 22/tcp                # Chỉ cho phép cổng 22 TCP
sudo ufw allow 80,443/tcp            # Cho phép nhiều cổng
sudo ufw allow 6000:6007/tcp         # Cho phép phạm vi cổng
sudo ufw deny 23                     # Từ chối cổng 23

# Allow/Deny theo tên dịch vụ
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 'Apache Full'

# Allow/Deny theo IP
sudo ufw allow from 192.168.1.100
sudo ufw deny from 10.0.0.5
sudo ufw allow from 192.168.1.0/24

# Cho phép từ IP đến cổng cụ thể
sudo ufw allow from 192.168.1.100 to any port 22
sudo ufw allow from 192.168.1.0/24 to any port 80 proto tcp

# Cho phép giao diện cụ thể
sudo ufw allow in on eth0 to any port 80

# Giới hạn tỷ lệ (ngăn chặn lực lượng vũ phu)
sudo ufw limit ssh                   # Giới hạn kết nối SSH

# Xóa quy tắc
sudo ufw delete allow 80
sudo ufw delete 3                    # Xóa theo số

# Hồ sơ ứng tuyển
sudo ufw app list                    # Liệt kê hồ sơ có sẵn
sudo ufw app info 'OpenSSH'         # Hiển thị chi tiết hồ sơ
sudo ufw allow 'OpenSSH'

# Ghi nhật ký
sudo ufw logging on                  # Bật ghi nhật ký
sudo ufw logging off                 # Vô hiệu hóa ghi nhật ký
sudo ufw logging low                 # Nhật ký bị chặn
sudo ufw logging medium              # Nhật ký bị chặn + không hợp lệ
sudo ufw logging high                # Ghi log ở mức high
sudo ufw logging full                # Ghi log ở mức full

# Routing/Forwarding
sudo ufw route allow in on eth0 out on eth1 to 10.0.0.0/24
```

---

<a id="19-ifconfig--interface-configuration-legacy"></a>
<a id="heading-149-19-ifconfig-interface-configuration-legacy"></a>

# 19. `ifconfig` — Cấu hình giao diện (Cũ)

`ifconfig` là công cụ cổ điển để định cấu hình giao diện mạng, một phần của `net-tools`. Nó đã được **thay thế bởi `ip addr` và `ip link`** trên tất cả các hệ thống Linux hiện đại và có thể không được cài đặt theo mặc định.

<a id="installation"></a>
<a id="heading-150-installation"></a>

## Cài đặt

```bash
sudo apt install net-tools          # Debian/Ubuntu
sudo dnf install net-tools          # RHEL/Fedora
```

<a id="viewing-interfaces"></a>
<a id="heading-151-viewing-interfaces"></a>

## Xem giao diện

```bash
# Hiển thị tất cả các giao diện đang hoạt động (UP)
ifconfig

# Hiển thị TẤT CẢ các giao diện bao gồm cả xuống
ifconfig -a

# Hiển thị giao diện cụ thể
ifconfig eth0

# Hiển thị số liệu thống kê (lỗi, rớt)
ifconfig -v eth0

# Bảng tóm tắt ngắn
ifconfig -s
```

<a id="reading-ifconfig-output"></a>
<a id="heading-152-reading-ifconfig-output"></a>

### Đọc đầu ra ifconfig

```
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
      inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
      inet6 fe80::250:56ff:fe9b:1234  prefixlen 64  scopeid 0x20<link>
      ether 00:50:56:9b:12:34  txqueuelen 1000  (Ethernet)
      RX packets 12345  bytes 10485760 (10.0 MiB)
      RX errors 0  dropped 0  overruns 0  frame 0
      TX packets 8765  bytes 7340032 (7.0 MiB)
      TX errors 0  dropped 0  overruns 0  carrier 0  collisions 0
```

| trường | Ý nghĩa |
|-------|---------|
| `flags` | Trạng thái giao diện (UP, BROADCAST, RUNNING, MULTICAST) |
| `mtu` | Đơn vị truyền tối đa |
| `inet` | Địa chỉ IPv4 |
| `netmask` | Mặt nạ mạng con |
| `broadcast` | Địa chỉ quảng bá |
| `inet6` | Địa chỉ IPv6 |
| `ether` | Địa chỉ MAC |
| `RX/TX packets` | Số lượng gói Received/sent |
| `errors` | Số lỗi (CRC, khung, v.v.) |
| `dropped` | Gói tin bị rớt (tràn bộ đệm) |

<a id="configuring-interfaces"></a>
<a id="heading-153-configuring-interfaces"></a>

## Cấu hình giao diện

```bash
# Gán địa chỉ IPv4
sudo ifconfig eth0 192.168.1.100 netmask 255.255.255.0

# Chỉ định với phát sóng rõ ràng
sudo ifconfig eth0 192.168.1.100 netmask 255.255.255.0 broadcast 192.168.1.255

# Thêm địa chỉ IPv6
sudo ifconfig eth0 add fe80::1/64

# Xóa địa chỉ IPv6
sudo ifconfig eth0 del fe80::1/64

# Đưa giao diện LÊN
sudo ifconfig eth0 up

# Đưa giao diện XUỐNG
sudo ifconfig eth0 down

# Thay đổi MTU
sudo ifconfig eth0 mtu 9000

# Thay đổi địa chỉ MAC (giao diện phải ngừng hoạt động trước)
sudo ifconfig eth0 down
sudo ifconfig eth0 hw ether 00:11:22:33:44:55
sudo ifconfig eth0 up

# Bật chế độ lăng nhăng
sudo ifconfig eth0 promisc

# Tắt chế độ lăng nhăng
sudo ifconfig eth0 -promisc

# Tắt ARP
sudo ifconfig eth0 -arp

# Tạo bí danh ảo (IP phụ)
sudo ifconfig eth0:0 10.0.0.1 netmask 255.255.255.0
sudo ifconfig eth0:1 10.0.0.2 netmask 255.255.255.0

# Đặt độ dài hàng đợi truyền
sudo ifconfig eth0 txqueuelen 2000
```

<a id="modern-equivalents-prefer-these"></a>
<a id="heading-154-modern-equivalents-prefer-these"></a>

## Tương đương hiện đại (thích những cái này)

| `ifconfig` | Tương đương `ip` |
|------------|-----------------|
| `ifconfig` | `ip -br addr show` |
| `ifconfig -a` | `ip addr show` |
| `ifconfig eth0 192.168.1.1/24` | `ip addr add 192.168.1.1/24 dev eth0` |
| `ifconfig eth0 up` | `ip link set eth0 up` |
| `ifconfig eth0 down` | `ip link set eth0 down` |
| `ifconfig eth0 mtu 9000` | `ip link set eth0 mtu 9000` |
| `ifconfig eth0 hw ether XX:XX` | `ip link set eth0 address XX:XX` |
| `ifconfig eth0 promisc` | `ip link set eth0 promisc on` |

---



<a id="20-route--routing-table-management-legacy"></a>
<a id="heading-155-20-route-routing-table-management-legacy"></a>

# 20. `route` — Quản lý bảng định tuyến (Cũ)

Lệnh `route` hiển thị và sửa đổi bảng định tuyến IP. Nó đã được **thay thế bởi `ip route`** trên các hệ thống Linux hiện đại và là một phần của gói `net-tools`.

<a id="installation-1"></a>
<a id="heading-156-installation"></a>

## Cài đặt

```bash
sudo apt install net-tools          # Debian/Ubuntu
sudo dnf install net-tools          # RHEL/Fedora
```

<a id="viewing-the-routing-table"></a>
<a id="heading-157-viewing-the-routing-table"></a>

## Xem bảng định tuyến

```bash
# Hiển thị bảng định tuyến (với độ phân giải tên máy chủ)
route

# Hiển thị số (không có DNS, nhanh hơn và rõ ràng hơn)
route -n

# Hiển thị bảng định tuyến IPv6
route -6 -n

# Định dạng mở rộng
route -e -n
```

<a id="reading-route--n-output"></a>
<a id="heading-158-reading-route-n-output"></a>

### Đọc đầu ra `route -n`

```
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.1.1     0.0.0.0         UG    100    0        0 eth0
192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0
127.0.0.0       0.0.0.0         255.0.0.0       U     0      0        0 lo
```

| Cờ | Ý nghĩa |
|------|---------|
| `U` | Tuyến đường đã lên |
| `G` | Sử dụng Gateway |
| `H` | Tuyến máy chủ (IP đơn) |
| `R` | Được khôi phục bằng daemon định tuyến |
| `D` | Được cài đặt động |
| `M` | Được sửa đổi bằng daemon định tuyến |
| `!` | Từ chối tuyến đường |

<a id="adding-routes"></a>
<a id="heading-159-adding-routes"></a>

## Thêm tuyến đường

```bash
# Thêm cổng mặc định
sudo route add default gw 192.168.1.1

# Thêm cổng mặc định qua giao diện cụ thể
sudo route add default gw 192.168.1.1 dev eth0

# Thêm tuyến mạng
sudo route add -net 10.0.0.0/8 gw 192.168.1.254

# Thêm tuyến mạng qua giao diện (không có cổng)
sudo route add -net 192.168.2.0/24 dev eth1

# Thêm tuyến máy chủ (IP cụ thể)
sudo route add -host 203.0.113.1 gw 192.168.1.254

# Thêm tuyến đường từ chối (lỗ đen)
sudo route add -net 10.0.0.0/8 reject
```

<a id="deleting-routes"></a>
<a id="heading-160-deleting-routes"></a>

## Xóa tuyến đường

```bash
# Xóa cổng mặc định
sudo route del default

# Xóa mặc định qua cổng cụ thể
sudo route del default gw 192.168.1.1

# Xóa tuyến mạng
sudo route del -net 10.0.0.0/8

# Xóa tuyến máy chủ
sudo route del -host 203.0.113.1
```

<a id="modern-equivalents-prefer-these-1"></a>
<a id="heading-161-modern-equivalents-prefer-these"></a>

## Tương đương hiện đại (thích những cái này)

| `route` | Tương đương `ip route` |
|---------|----------------------|
| `route -n` | `ip route show` |
| `route add default gw 1.2.3.4` | `ip route add default via 1.2.3.4` |
| `route add -net 10.0/8 gw 1.2.3.4` | `ip route add 10.0.0.0/8 via 1.2.3.4` |
| `route del default` | `ip route del default` |
| `route del -net 10.0/8` | `ip route del 10.0.0.0/8` |

---



<a id="21-arp--arp-cache-management-legacy"></a>
<a id="heading-162-21-arp-arp-cache-management-legacy"></a>

# 21. `arp` — Quản lý bộ đệm ARP (Cũ)

Lệnh `arp` quản lý bộ đệm ARP kernel - bảng ánh xạ địa chỉ IPv4 tới địa chỉ MAC. Nó đã được **thay thế bởi `ip neigh`** trên Linux hiện đại và là một phần của `net-tools`.

<a id="installation-2"></a>
<a id="heading-163-installation"></a>

## Cài đặt

```bash
sudo apt install net-tools          # Debian/Ubuntu
sudo dnf install net-tools          # RHEL/Fedora
```

<a id="viewing-the-arp-cache"></a>
<a id="heading-164-viewing-the-arp-cache"></a>

## Xem bộ đệm ARP

```bash
# Hiển thị bộ đệm ARP (có độ phân giải tên)
arp

# Hiển thị số (không có DNS, rõ ràng hơn)
arp -n

# Hiển thị cho một giao diện cụ thể
arp -n -i eth0

# Hiển thị đầu ra dài dòng
arp -v -n

# Hiển thị TẤT CẢ các mục bao gồm cả mục không đầy đủ
arp -a -n

# Hiển thị mục nhập cho một máy chủ cụ thể
arp -n 192.168.1.1
```

<a id="reading-arp--n-output"></a>
<a id="heading-165-reading-arp-n-output"></a>

### Đọc đầu ra `arp -n`

```
Address          HWtype  HWaddress           Flags Mask  Iface
192.168.1.1      ether   00:11:22:33:44:55   C           eth0
192.168.1.50     ether   aa:bb:cc:dd:ee:ff   C           eth0
```

| Cờ | Ý nghĩa |
|------|---------|
| `C` | Hoàn thành (đã giải quyết) |
| `M` | Vĩnh viễn (tĩnh) |
| `P` | Đã xuất bản (proxy ARP) |

<a id="managing-arp-entries"></a>
<a id="heading-166-managing-arp-entries"></a>

## Quản lý các mục ARP

```bash
# Thêm mục nhập ARP tĩnh
sudo arp -s 192.168.1.50 00:11:22:33:44:55

# Thêm mục tĩnh cho một giao diện cụ thể
sudo arp -s 192.168.1.50 00:11:22:33:44:55 -i eth0

# Xóa mục nhập ARP
sudo arp -d 192.168.1.50

# Xóa mục trên một giao diện cụ thể
sudo arp -d 192.168.1.50 -i eth0

# Đặt mục nhập ARP proxy
sudo arp -s 192.168.2.1 00:11:22:33:44:55 pub

# Tải các mục ARP từ /etc/ethers
sudo arp -f /etc/ethers
```

<a id="modern-equivalents-prefer-these-2"></a>
<a id="heading-167-modern-equivalents-prefer-these"></a>

## Tương đương hiện đại (thích những cái này)

| `arp` | Tương đương `ip neigh` |
|-------|-----------------------|
| `arp -n` | `ip neigh show` |
| `arp -n -i eth0` | `ip neigh show dev eth0` |
| `arp -s 1.2.3.4 aa:bb:...` | `ip neigh add 1.2.3.4 lladdr aa:bb:... dev eth0 nud permanent` |
| `arp -d 1.2.3.4` | `ip neigh del 1.2.3.4 dev eth0` |

---



<a id="22-ip-neigh--arpndp-neighbor-management"></a>
<a id="heading-168-22-ip-neigh-arpndp-neighbor-management"></a>

# 22. `ip neigh` — ARP/NDP Quản lý hàng xóm

`ip neigh` quản lý bảng lân cận hạt nhân - các mục nhập IPv4 ARP và IPv6 NDP (Giao thức khám phá lân cận). Nó là sự thay thế hiện đại cho lệnh `arp`.

<a id="viewing-neighbor-entries"></a>
<a id="heading-169-viewing-neighbor-entries"></a>

## Xem các mục hàng xóm

```bash
# Hiển thị tất cả các mục hàng xóm
ip neigh show
ip n             # viết tắt

# Chỉ IPv4 (bộ đệm ARP)
ip -4 neigh show

# Chỉ IPv6 (bộ đệm NDP)
ip -6 neigh show

# Đối với một giao diện cụ thể
ip neigh show dev eth0

# Đối với một IP cụ thể
ip neigh show 192.168.1.1

# dạng ngắn gọn
ip -br neigh show

# Đầu ra JSON
ip -j neigh show

# Chỉ các mục CÓ THỂ TIẾP CẬN
ip neigh show nud reachable

# Chỉ các mục CỨ
ip neigh show nud stale
```

<a id="neighbor-states"></a>
<a id="heading-170-neighbor-states"></a>

### Các quốc gia láng giềng

| tiểu bang | Ý nghĩa |
|-------|---------|
| `REACHABLE` | Gần đây đã xác nhận có thể truy cập được |
| `STALE` | Mục nhập có thể hết hạn; sẽ kiểm chứng vào lần sử dụng tiếp theo |
| `DELAY` | Chờ đợi trước khi thăm dò |
| `PROBE` | Tích cực gửi các gói ARP/NS |
| `FAILED` | Độ phân giải không thành công |
| `PERMANENT` | Được cấu hình tĩnh, không bao giờ hết hạn |
| `NOARP` | Không cần ARP (điểm-điểm, v.v.) |
| `INCOMPLETE` | Đang chờ giải quyết |

<a id="managing-entries"></a>
<a id="heading-171-managing-entries"></a>

## Quản lý mục nhập

```bash
# Thêm mục ARP cố định (tĩnh)
sudo ip neigh add 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0 nud permanent

# Thêm mục nhập có thể truy cập (có thể hết thời gian chờ)
sudo ip neigh add 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0 nud reachable

# Thay đổi mục nhập hiện có
sudo ip neigh change 192.168.1.50 lladdr aa:bb:cc:dd:ee:ff dev eth0

# Thay thế (thêm hoặc cập nhật)
sudo ip neigh replace 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0 nud permanent

# Xóa một mục cụ thể
sudo ip neigh del 192.168.1.50 dev eth0

# Xóa tất cả các mục trên một giao diện
sudo ip neigh flush dev eth0

# Xóa tất cả các mục STALE trên toàn hệ thống
sudo ip neigh flush nud stale

# Mục hàng xóm proxy
sudo ip neigh add proxy 192.168.2.100 dev eth0
sudo ip neigh del proxy 192.168.2.100 dev eth0
```

<a id="ipv6-neighbor-discovery-ndp"></a>
<a id="heading-172-ipv6-neighbor-discovery-ndp"></a>

## Khám phá hàng xóm IPv6 (NDP)

```bash
# Hiển thị hàng xóm IPv6
ip -6 neigh show

# Thêm hàng xóm IPv6 tĩnh
sudo ip -6 neigh add 2001:db8::1 lladdr 00:11:22:33:44:55 dev eth0 nud permanent

# Xóa hàng xóm IPv6
sudo ip -6 neigh del 2001:db8::1 dev eth0
```

<a id="monitor-events"></a>
<a id="heading-173-monitor-events"></a>

## Giám sát sự kiện

```bash
# Xem những thay đổi hàng xóm trong thời gian thực
ip monitor neigh
```

<a id="tuning-arp-cache-sysctl"></a>
<a id="heading-174-tuning-arp-cache-sysctl"></a>

## Điều chỉnh bộ đệm ARP (sysctl)

```bash
# Tăng kích thước bộ đệm ARP (mạng lớn)
sudo sysctl -w net.ipv4.neigh.default.gc_thresh1=1024
sudo sysctl -w net.ipv4.neigh.default.gc_thresh2=2048
sudo sysctl -w net.ipv4.neigh.default.gc_thresh3=4096

# Kích hoạt ARP proxy trên một giao diện
sudo sysctl -w net.ipv4.conf.eth0.proxy_arp=1

# Bật tính năng lọc ARP (chống giả mạo)
sudo sysctl -w net.ipv4.conf.all.arp_filter=1
```

---



<a id="23-ethtool--nic-hardware-settings"></a>
<a id="heading-175-23-ethtool-nic-hardware-settings"></a>

# 23. `ethtool` — Cài đặt phần cứng NIC

<a id="flags"></a>
<a id="heading-176-flags"></a>

## Cờ

| Cờ | Mô tả |
|------|-------------|
| (không có cờ) | Hiển thị cài đặt NIC |
| `-i` | Hiển thị thông tin tài xế |
| `-S` | Hiển thị số liệu thống kê NIC |
| `-a` | Hiển thị thông số tạm dừng |
| `-A` | Thay đổi thông số tạm dừng |
| `-c` | Hiển thị cài đặt hợp nhất |
| `-C` | Thay đổi cài đặt hợp nhất |
| `-g` | Hiển thị kích thước bộ đệm vòng |
| `-G` | Thay đổi kích thước bộ đệm vòng |
| `-k` | Hiển thị cài đặt giảm tải |
| `-K` | Thay đổi cài đặt giảm tải |
| `-l` | Hiển thị số kênh |
| `-L` | Thay đổi số lượng kênh |
| `-m` | Hiển thị thông tin mô-đun thu phát |
| `-n` / `--show-nfc` | Hiển thị quy tắc phân loại luồng mạng |
| `-p` | Xác định giao diện (đèn LED nhấp nháy) |
| `-r` | Khởi động lại tự động đàm phán |
| `-s` | Thay đổi cài đặt NIC |
| `-t` | Tự kiểm tra |
| `-T` | Hiển thị khả năng ghi thời gian |
| `--show-eee` | Hiển thị EEE (Ethernet tiết kiệm năng lượng) |
| `--set-eee` | Thay đổi cài đặt EEE |
| `--show-fec` | Hiển thị FEC (Chuyển tiếp sửa lỗi) |
| `--set-fec` | Thay đổi cài đặt FEC |
| `--show-priv-flags` | Hiển thị cờ riêng tư |
| `--set-priv-flags` | Đặt cờ riêng |

<a id="examples-10"></a>
<a id="heading-177-examples"></a>

## Ví dụ

```bash
# Hiển thị cài đặt NIC
sudo ethtool eth0

# Hiển thị thông tin tài xế
sudo ethtool -i eth0

# Hiển thị số liệu thống kê
sudo ethtool -S eth0

# Đặt speed/duplex
sudo ethtool -s eth0 speed 1000 duplex full autoneg off

# Hiển thị cài đặt giảm tải
sudo ethtool -k eth0

# Tắt tải phân đoạn TCP
sudo ethtool -K eth0 tso off

# Cho phép giảm tải nhận chung
sudo ethtool -K eth0 gro on

# Hiển thị kích thước bộ đệm vòng
sudo ethtool -g eth0

# Tăng bộ đệm vòng
sudo ethtool -G eth0 rx 4096 tx 4096

# Đèn LED NIC nhấp nháy (nhận dạng)
sudo ethtool -p eth0 5                  # Nhấp nháy trong 5 giây

# Hiển thị khung tạm dừng
sudo ethtool -a eth0

# Khởi động lại tự động đàm phán
sudo ethtool -r eth0

# Hiển thị số kênh
sudo ethtool -l eth0

# Hiển thị cài đặt hợp nhất
sudo ethtool -c eth0

# Chạy tự kiểm tra
sudo ethtool -t eth0
```

---

<a id="24-nmcli--networkmanager-cli"></a>
<a id="heading-178-24-nmcli-networkmanager-cli"></a>

# 24. `nmcli` — Trình quản lý mạng CLI

<a id="main-commands"></a>
<a id="heading-179-main-commands"></a>

## Các lệnh chính

```bash
# Tình trạng chung
nmcli general status
nmcli general hostname
nmcli general permissions
nmcli general logging

# Mạng
nmcli networking on
nmcli networking off
nmcli networking connectivity

# Quản lý thiết bị
nmcli device status
nmcli device show
nmcli device show eth0
nmcli device connect eth0
nmcli device disconnect eth0
nmcli device wifi list
nmcli device wifi rescan
nmcli device wifi connect "SSID" password "PASS"
nmcli device wifi hotspot ssid "MyHotspot" password "pass1234"

# Quản lý kết nối
nmcli connection show
nmcli connection show --active
nmcli connection show "My Connection"
nmcli connection up "My Connection"
nmcli connection down "My Connection"
nmcli connection delete "My Connection"
nmcli connection reload
nmcli connection load /etc/NetworkManager/system-connections/myconn.nmconnection

# Tạo kết nối
nmcli connection add type ethernet con-name "static" ifname eth0 \
  ipv4.addresses 192.168.1.100/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns "8.8.8.8 8.8.4.4" \
  ipv4.method manual

nmcli connection add type wifi con-name "home-wifi" ifname wlan0 \
  ssid "MyNetwork" wifi-sec.key-mgmt wpa-psk wifi-sec.psk "password"

nmcli connection add type bond con-name "bond0" ifname bond0 \
  bond.options "mode=802.3ad,miimon=100"

nmcli connection add type bridge con-name "br0" ifname br0

nmcli connection add type vlan con-name "vlan100" ifname eth0.100 \
  dev eth0 id 100

# Sửa đổi kết nối
nmcli connection modify "My Connection" ipv4.dns "1.1.1.1"
nmcli connection modify "My Connection" +ipv4.dns "8.8.8.8"
nmcli connection modify "My Connection" ipv4.addresses "192.168.1.200/24"
nmcli connection modify "My Connection" connection.autoconnect yes

# Màn hình
nmcli monitor
```

---

<a id="25-nmtui--networkmanager-text-ui"></a>
<a id="heading-180-25-nmtui-networkmanager-text-ui"></a>

# 25. `nmtui` — Giao diện người dùng văn bản của Trình quản lý mạng

`nmtui` là menu đầu cuối tương tác, dựa trên ncurses để quản lý kết nối mạng. Nó cung cấp giao diện được hướng dẫn lý tưởng cho các máy chủ không có GUI hoặc người dùng thích menu hơn lệnh CLI.

<a id="launching"></a>
<a id="heading-181-launching"></a>

## Ra mắt

```bash
nmtui                  # Thực đơn chính
nmtui edit             # Chuyển đến Chỉnh sửa kết nối
nmtui connect          # Chuyển đến Kích hoạt Kết nối
nmtui hostname         # Đặt tên máy chủ hệ thống
```

<a id="menu-structure"></a>
<a id="heading-182-menu-structure"></a>

## Cấu trúc thực đơn

```
┌──────────────────────────────────────────┐
│ TUI quản lý mạng                        │
│                                           │
│  Chỉnh sửa kết nối                        │
│  Kích hoạt kết nối                    │
│  Đặt tên máy chủ hệ thống                      │
│                              <Quit>       │
└──────────────────────────────────────────┘
```

<a id="edit-a-connection"></a>
<a id="heading-183-edit-a-connection"></a>

### Chỉnh sửa kết nối
Định cấu hình địa chỉ IP, DNS, cổng, tuyến đường; Kết nối create/delete; thiết lập Wi-Fi, VPN, bond, bridge, VLAN.

<a id="activate-a-connection"></a>
<a id="heading-184-activate-a-connection"></a>

### Kích hoạt kết nối
Chuyển đổi kết nối on/off. Các kết nối đang hoạt động được đánh dấu bằng `*`.

<a id="set-system-hostname"></a>
<a id="heading-185-set-system-hostname"></a>

### Đặt tên máy chủ hệ thống
Đặt vĩnh viễn tên máy chủ (tương đương `hostnamectl set-hostname`).

<a id="navigation-keys"></a>
<a id="heading-186-navigation-keys"></a>

## Phím điều hướng

| Chìa khóa | hành động |
|-----|--------|
| Phím mũi tên | Di chuyển giữa các mục |
| Tab / Shift+Tab | Trường tiếp theo / trước đó |
| Nhập | Chọn/xác nhận |
| không gian | Chuyển đổi hộp kiểm |
| Esc | Hủy/quay lại |
| `<OK>` hoặc F10 | Lưu và thoát |

<a id="common-tasks"></a>
<a id="heading-187-common-tasks"></a>

## Nhiệm vụ chung

<a id="configure-static-ip"></a>
<a id="heading-188-configure-static-ip"></a>

### Định cấu hình IP tĩnh
1. Chạy `nmtui` → **Chỉnh sửa kết nối**
2. Chọn giao diện → thay đổi **CẤU HÌNH IPv4** từ `Automatic` thành `Manual`
3. Thêm địa chỉ (e.g., `192.168.1.100/24`), Gateway (`192.168.1.1`), DNS
4. `<OK>` → **Kích hoạt kết nối** → kích hoạt lại kết nối

<a id="add-a-wi-fi-connection"></a>
<a id="heading-189-add-a-wi-fi-connection"></a>

### Thêm kết nối Wi-Fi
1. Chạy `nmtui` → **Chỉnh sửa kết nối** → **Thêm** → **Wi-Fi**
2. Nhập SSID, loại bảo mật, mật khẩu → `<OK>`

<a id="remove-a-connection"></a>
<a id="heading-190-remove-a-connection"></a>

### Xóa kết nối
1. Chạy `nmtui` → **Chỉnh sửa kết nối**
2. Chọn kết nối → **Xóa** → xác nhận

<a id="nmtui-vs-nmcli"></a>
<a id="heading-191-nmtui-vs-nmcli"></a>

## nmtui vs nmcli

|  | nmtui | nmcli |
|--|-------|-------|
| Giao diện | Menu tương tác | Dòng lệnh |
| Viết kịch bản | Không phù hợp | lý tưởng |
| Sử dụng từ xa | Hoạt động trong mọi thiết bị đầu cuối | Ưu tiên tự động hóa |

---



<a id="26-ssh--secure-shell"></a>
<a id="heading-192-26-ssh-secure-shell"></a>

# 26. `ssh` — Secure Shell

<a id="syntax-14"></a>
<a id="heading-193-syntax"></a>

## Cú pháp

```bash
ssh [OPTIONS] [USER@]HOST [COMMAND]
```

<a id="all-major-flags"></a>
<a id="heading-194-all-major-flags"></a>

## Tất cả các cờ chính

| Cờ | Mô tả |
|------|-------------|
| `-p PORT` | Kết nối với cổng (mặc định: 22) |
| `-l USER` | Đăng nhập với tư cách người dùng |
| `-i KEYFILE` | Tệp nhận dạng (khóa riêng) |
| `-F CONFIG` | Tệp cấu hình (mặc định: `~/.ssh/config`) |
| `-o OPTION` | Tùy chọn SSH (e.g., `-o StrictHostKeyChecking=no`) |
| `-v` | Chi tiết (sử dụng `-vv` hoặc `-vvv` để biết thêm) |
| `-q` | Chế độ im lặng |
| `-N` | Không có lệnh từ xa (hữu ích cho đường hầm) |
| `-f` | Đi tới nền trước khi thực hiện lệnh |
| `-T` | Vô hiệu hóa phân bổ thiết bị đầu cuối giả |
| `-t` | Buộc phân bổ thiết bị đầu cuối giả |
| `-tt` | Buộc TTY ngay cả khi ssh không có TTY cục bộ |
| `-C` | Bật tính năng nén |
| `-X` | Kích hoạt chuyển tiếp X11 |
| `-x` | Vô hiệu hóa chuyển tiếp X11 |
| `-Y` | Bật chuyển tiếp X11 đáng tin cậy |
| `-A` | Cho phép chuyển tiếp đại lý |
| `-a` | Vô hiệu hóa chuyển tiếp đại lý |
| `-L [BIND:]PORT:HOST:PORT` | Chuyển tiếp cổng địa phương |
| `-R [BIND:]PORT:HOST:PORT` | Chuyển tiếp cổng từ xa |
| `-D [BIND:]PORT` | Proxy SOCKS động |
| `-J USER@HOST:PORT` | ProxyJump (máy chủ nhảy) |
| `-W HOST:PORT` | Chuyển tiếp stdin/stdout tới HOST:PORT |
| `-w LOCAL:REMOTE` | Chuyển tiếp thiết bị TUN |
| `-b ADDR` | Địa chỉ ràng buộc |
| `-e CHAR` | Ký tự thoát (mặc định: `~`) |
| `-E LOGFILE` | Nối nhật ký gỡ lỗi vào tệp |
| `-G` | In cấu hình sau khi đánh giá các khối Host |
| `-K` | Kích hoạt xác thực và chuyển tiếp GSSAPI |
| `-k` | Vô hiệu hóa chuyển tiếp GSSAPI |
| `-M` | Chế độ chính để ghép kênh kết nối |
| `-S PATH` | Ổ cắm điều khiển để ghép kênh |
| `-O COMMAND` | Điều khiển bộ ghép kênh chính: `check`, `forward`, `cancel`, `exit`, `stop` |
| `-4` | Buộc IPv4 |
| `-6` | Buộc IPv6 |
| `-1` | Buộc giao thức phiên bản 1 (không dùng nữa) |
| `-2` | Buộc giao thức phiên bản 2 |

<a id="ssh-config-options--o-or-sshconfig"></a>
<a id="heading-195-ssh-config-options-o-or-sshconfig"></a>

## Tùy chọn cấu hình SSH (`-o` hoặc `~/.ssh/config`)

| Tùy chọn | Mô tả |
|--------|-------------|
| `StrictHostKeyChecking yes/no/ask` | Xác minh khóa máy chủ |
| `UserKnownHostsFile FILE` | Tệp máy chủ đã biết |
| `PasswordAuthentication yes/no` | Cho phép xác thực mật khẩu |
| `PubkeyAuthentication yes/no` | Cho phép xác thực khóa công khai |
| `IdentityFile FILE` | Tệp khóa riêng |
| `Port PORT` | Cổng mặc định |
| `User USERNAME` | tên người dùng mặc định |
| `ProxyJump HOST` | Chuyển máy chủ |
| `ProxyCommand CMD` | Lệnh ủy quyền |
| `ServerAliveInterval SEC` | Gửi thủ tục mỗi giây SEC |
| `ServerAliveCountMax NUM` | Ngắt kết nối sau khi NUM lần lưu giữ bị bỏ lỡ |
| `ConnectTimeout SEC` | Thời gian chờ tối đa để kết nối |
| `Compression yes/no` | Bật tính năng nén |
| `ForwardAgent yes/no` | Chuyển tiếp đại lý |
| `ForwardX11 yes/no` | Chuyển tiếp X11 |
| `ControlMaster auto/yes/no` | Ghép kênh kết nối |
| `ControlPath PATH` | Đường dẫn socket đa năng |
| `ControlPersist TIME` | Giữ kết nối đa kênh còn sống |
| `LocalForward PORT HOST:PORT` | Chuyển tiếp cổng địa phương |
| `RemoteForward PORT HOST:PORT` | Chuyển tiếp cổng từ xa |
| `DynamicForward PORT` | proxy VỚ |
| `AddKeysToAgent yes/no` | Tự động thêm chìa khóa vào đại lý |
| `IdentitiesOnly yes/no` | Chỉ sử dụng các tệp nhận dạng được chỉ định |
| `LogLevel QUIET/FATAL/ERROR/INFO/VERBOSE/DEBUG` | Ghi nhật ký chi tiết |
| `Ciphers LIST` | Mật mã được phép |
| `MACs LIST` | MAC được phép |
| `KexAlgorithms LIST` | Thuật toán trao đổi khóa |
| `HostKeyAlgorithms LIST` | Thuật toán khóa máy chủ |
| `BatchMode yes/no` | Chế độ không tương tác |
| `RequestTTY auto/yes/no/force` | Phân bổ TTY |
| `SendEnv PATTERN` | Gửi biến môi trường |
| `SetEnv KEY=VALUE` | Đặt biến môi trường |
| `PermitLocalCommand yes/no` | Cho phép thực thi lệnh cục bộ |
| `LocalCommand CMD` | Lệnh chạy cục bộ sau khi kết nối |
| `TCPKeepAlive yes/no` | TCP được giữ nguyên |
| `ExitOnForwardFailure yes/no` | Thoát nếu chuyển tiếp không thành công |

<a id="ssh-escape-sequences-while-connected"></a>
<a id="heading-196-ssh-escape-sequences-while-connected"></a>

## Trình tự thoát SSH (Khi được kết nối)

Nhấn `Enter` sau đó nhấn ký tự thoát (`~` theo mặc định):

| trình tự | Mô tả |
|----------|-------------|
| `~.` | Ngắt kết nối (chấm dứt kết nối) |
| `~^Z` | Đình chỉ ssh |
| `~#` | Liệt kê các kết nối được chuyển tiếp |
| `~&` | Nền ssh (khi chờ kết nối đóng) |
| `~?` | Liệt kê các chuỗi thoát |
| `~B` | Gửi BREAK |
| `~C` | Mở dòng lệnh (chuyển tiếp cổng add/remove) |
| `~R` | Yêu cầu tạo lại khóa |
| `~V` | Giảm độ chi tiết |
| `~v` | Tăng tính chi tiết |

<a id="examples-11"></a>
<a id="heading-197-examples"></a>

## Ví dụ

```bash
# Kết nối cơ bản
ssh user@192.168.1.50

# Kết nối trên cổng tùy chỉnh
ssh -p 2222 user@192.168.1.50

# Sử dụng khóa cụ thể
ssh -i ~/.ssh/my_key user@192.168.1.50

# Chạy lệnh từ xa
ssh user@192.168.1.50 "uname -a"
ssh user@192.168.1.50 "df -h; free -m"

# Chuyển tiếp cổng cục bộ (truy cập dịch vụ từ xa cục bộ)
ssh -L 8080:localhost:80 user@remote      # localhost:8080 → từ xa:80
ssh -L 3306:db-server:3306 user@bastion   # localhost:3306 → db-server:3306 qua pháo đài

# Chuyển tiếp cổng từ xa (hiển thị dịch vụ cục bộ với điều khiển từ xa)
ssh -R 9090:localhost:3000 user@remote     # từ xa:9090 → localhost:3000

# Proxy SOCKS (chuyển tiếp động)
ssh -D 1080 user@remote                   # localhost: proxy 1080 SOCKS
# Sau đó định cấu hình trình duyệt để sử dụng proxy SOCKS5 tại localhost:1080

# Máy chủ nhảy (ProxyJump)
ssh -J bastion@jump.example.com user@internal-server
ssh -J jump1,jump2 user@internal           # Nhiều lần nhảy

# Chuyển tiếp X11 (chạy ứng dụng GUI từ xa)
ssh -X user@remote
# Sau đó chạy: firefox, gedit, v.v.

# Đường hầm nền
ssh -fNL 8080:localhost:80 user@remote     # Đường hầm ở chế độ nền

# Ghép kênh kết nối
ssh -M -S /tmp/ssh_mux user@remote         # Tạo chủ
ssh -S /tmp/ssh_mux user@remote            # Tái sử dụng kết nối

# Sao chép khóa SSH vào điều khiển từ xa
ssh-copy-id user@192.168.1.50
ssh-copy-id -i ~/.ssh/my_key.pub user@192.168.1.50

# Tạo cặp khóa SSH
ssh-keygen -t ed25519 -C "my-key"
ssh-keygen -t rsa -b 4096 -C "my-key"

# Gỡ lỗi sự cố kết nối
ssh -vvv user@192.168.1.50

# Buộc xác thực mật khẩu
ssh -o PubkeyAuthentication=no user@192.168.1.50

# Tắt tính năng kiểm tra khóa máy chủ (nguy hiểm, sử dụng cho tập lệnh)
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null user@host

# Gắn hệ thống tập tin từ xa
sshfs user@remote:/path /local/mountpoint

# Giữ kết nối còn sống
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 user@remote
```

<a id="ssh-config-example-sshconfig"></a>
<a id="heading-198-ssh-config-example-sshconfig"></a>

### Ví dụ về cấu hình SSH (`~/.ssh/config`)

```
Host bastion
    HostName jump.example.com
    User admin
    Port 22
    IdentityFile ~/.ssh/bastion_key

Host internal
    HostName 10.0.0.50
    User deploy
    ProxyJump bastion
    IdentityFile ~/.ssh/internal_key

Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    AddKeysToAgent yes
    IdentitiesOnly yes
    Compression yes
```

---

<a id="27-scp--secure-copy"></a>
<a id="heading-199-27-scp-secure-copy"></a>

# 27. `scp` — Bản sao an toàn

<a id="syntax-15"></a>
<a id="heading-200-syntax"></a>

## Cú pháp

```bash
scp [OPTIONS] SOURCE DESTINATION
```

<a id="all-flags-2"></a>
<a id="heading-201-all-flags"></a>

## Tất cả các lá cờ

| Cờ | Mô tả |
|------|-------------|
| `-r` | Đệ quy (sao chép thư mục) |
| `-P PORT` | Kết nối với cổng (lưu ý: P viết hoa, không giống ssh) |
| `-i KEYFILE` | Tệp nhận dạng |
| `-p` | Giữ nguyên thời gian sửa đổi, thời gian truy cập, chế độ |
| `-q` | Im lặng (không có thanh tiến trình) |
| `-v` | dài dòng |
| `-C` | Bật tính năng nén |
| `-l LIMIT` | Giới hạn băng thông (Kbit/s) |
| `-o OPTION` | Tùy chọn SSH |
| `-F CONFIG` | Tệp cấu hình SSH |
| `-S PROGRAM` | Sử dụng chương trình để kết nối được mã hóa |
| `-c CIPHER` | Chọn mật mã |
| `-3` | Định tuyến qua máy chủ cục bộ (để sao chép giữa hai điều khiển từ xa) |
| `-4` | Buộc IPv4 |
| `-6` | Buộc IPv6 |
| `-B` | Chế độ hàng loạt (không cần nhắc mật khẩu) |
| `-J DEST` | ProxyNhảy |
| `-O` | Sử dụng giao thức SCP gốc (không phải SFTP) |
| `-D` | Sử dụng giao thức SFTP (mặc định trên các phiên bản mới hơn) |
| `-T` | Vô hiệu hóa việc kiểm tra tên tệp nghiêm ngặt |

<a id="examples-12"></a>
<a id="heading-202-examples"></a>

## Ví dụ

```bash
# Sao chép tập tin cục bộ vào điều khiển từ xa
scp file.txt user@remote:/home/user/

# Sao chép tập tin từ xa vào cục bộ
scp user@remote:/var/log/syslog ./

# Sao chép thư mục đệ quy
scp -r ./mydir user@remote:/home/user/

# Cổng tùy chỉnh
scp -P 2222 file.txt user@remote:/tmp/

# Với khóa cụ thể
scp -i ~/.ssh/my_key file.txt user@remote:/tmp/

# Giữ nguyên dấu thời gian và quyền
scp -p file.txt user@remote:/tmp/

# Giới hạn băng thông ở mức 500 Kbit/s
scp -l 500 largefile.iso user@remote:/tmp/

# Sao chép giữa hai máy chủ từ xa thông qua cục bộ
scp -3 user1@host1:/file user2@host2:/file

# Thông qua máy chủ nhảy
scp -J bastion file.txt user@internal:/tmp/

# Với nén
scp -C largefile.txt user@remote:/tmp/
```

---

<a id="28-sftp--secure-ftp"></a>
<a id="heading-203-28-sftp-secure-ftp"></a>

# 28. `sftp` — FTP an toàn

Truyền tệp an toàn tương tác qua SSH.

<a id="syntax-16"></a>
<a id="heading-204-syntax"></a>

## Cú pháp

```bash
sftp [OPTIONS] [USER@]HOST[:PATH]
```

<a id="flags-1"></a>
<a id="heading-205-flags"></a>

## Cờ

| Cờ | Mô tả |
|------|-------------|
| `-P PORT` | Cảng |
| `-i KEYFILE` | Tệp nhận dạng |
| `-b BATCHFILE` | Chế độ hàng loạt (đọc lệnh từ tập tin) |
| `-B BUFFERSIZE` | Kích thước bộ đệm để chuyển |
| `-l LIMIT` | Giới hạn băng thông (Kbit/s) |
| `-o OPTION` | Tùy chọn SSH |
| `-F CONFIG` | Tệp cấu hình SSH |
| `-r` | Đệ quy (dành cho `put`/`get`) |
| `-R NUM` | Số lượng requests đang tồn đọng |
| `-s SUBSYSTEM` | Hệ thống con SSH2 |
| `-S PROGRAM` | Chương trình kết nối |
| `-C` | nén |
| `-v` | dài dòng |
| `-4` / `-6` | Buộc IPv4/IPv6 |
| `-J HOST` | ProxyNhảy |

<a id="interactive-commands"></a>
<a id="heading-206-interactive-commands"></a>

## Lệnh tương tác

| Lệnh | Mô tả |
|---------|-------------|
| `ls [PATH]` | Liệt kê thư mục từ xa |
| `lls [PATH]` | Liệt kê thư mục địa phương |
| `cd PATH` | Thay đổi thư mục từ xa |
| `lcd PATH` | Thay đổi thư mục cục bộ |
| `pwd` | In thư mục làm việc từ xa |
| `lpwd` | In thư mục làm việc cục bộ |
| `get FILE [LOCAL]` | Tải tập tin xuống |
| `get -r DIR` | Tải xuống thư mục đệ quy |
| `put FILE [REMOTE]` | Tải tập tin lên |
| `put -r DIR` | Tải lên thư mục đệ quy |
| `mget PATTERN` | Tải xuống nhiều tập tin |
| `mput PATTERN` | Tải lên nhiều tập tin |
| `mkdir DIR` | Tạo thư mục từ xa |
| `rmdir DIR` | Xóa thư mục từ xa |
| `rm FILE` | Xóa tập tin từ xa |
| `rename OLD NEW` | Đổi tên tập tin từ xa |
| `chmod MODE FILE` | Thay đổi quyền truy cập tệp từ xa |
| `chown UID FILE` | Thay đổi chủ sở hữu tập tin từ xa |
| `chgrp GID FILE` | Thay đổi nhóm tập tin từ xa |
| `ln SRC DST` | Tạo liên kết tượng trưng từ xa |
| `lumask MASK` | Đặt ô cục bộ |
| `df [-h] [PATH]` | Hiển thị mức sử dụng đĩa từ xa |
| `!COMMAND` | Thực hiện lệnh cục bộ |
| `exit` / `quit` / `bye` | Thoát sftp |
| `help` / `?` | Hiển thị trợ giúp |
| `progress` | Chuyển đổi hiển thị tiến trình |
| `version` | Hiển thị phiên bản SFTP |
| `reget FILE` | Tiếp tục tải xuống |
| `reput FILE` | Tiếp tục tải lên |

---

<a id="29-rsync--remote-file-synchronization"></a>
<a id="heading-207-29-rsync-remote-file-synchronization"></a>

# 29. `rsync` — Đồng bộ hóa tệp từ xa

<a id="syntax-17"></a>
<a id="heading-208-syntax"></a>

## Cú pháp

```bash
rsync [OPTIONS] SOURCE DESTINATION
```

<a id="all-major-flags-1"></a>
<a id="heading-209-all-major-flags"></a>

## Tất cả các cờ chính

| Cờ | Mô tả |
|------|-------------|
| `-a` / `--archive` | Chế độ lưu trữ: `-rlptgoD` (đệ quy, liên kết, perms, thời gian, nhóm, chủ sở hữu, thiết bị) |
| `-r` / `--recursive` | đệ quy |
| `-v` / `--verbose` | dài dòng |
| `-z` / `--compress` | Nén trong khi truyền |
| `-P` | Tương tự như `--partial --progress` |
| `--partial` | Giữ các tập tin được chuyển một phần |
| `--progress` | Hiển thị tiến trình chuyển |
| `-n` / `--dry-run` | Mô phỏng (hiển thị những gì sẽ được thực hiện) |
| `--delete` | Xóa tập tin ở đích không có trong nguồn |
| `--delete-before` | Xóa trước khi chuyển |
| `--delete-during` | Xóa trong khi chuyển |
| `--delete-after` | Xóa sau khi chuyển |
| `--delete-excluded` | Đồng thời xóa các tệp bị loại trừ ở đích |
| `-e COMMAND` | Sử dụng shell từ xa (e.g., `-e "ssh -p 2222"`) |
| `--exclude PATTERN` | Loại trừ mẫu |
| `--exclude-from FILE` | Loại trừ các mẫu khỏi tệp |
| `--include PATTERN` | Bao gồm mẫu |
| `--include-from FILE` | Bao gồm các mẫu từ tập tin |
| `--filter RULE` | Thêm quy tắc lọc tệp |
| `-l` / `--links` | Sao chép liên kết tượng trưng dưới dạng liên kết tượng trưng |
| `-L` / `--copy-links` | Chuyển đổi liên kết tượng trưng thành tập tin |
| `-H` / `--hard-links` | Bảo quản các liên kết cứng |
| `-p` / `--perms` | Giữ quyền |
| `-o` / `--owner` | Bảo quản chủ sở hữu |
| `-g` / `--group` | Nhóm bảo tồn |
| `-t` / `--times` | Giữ nguyên thời gian sửa đổi |
| `-D` | Tương tự như `--devices --specials` |
| `--devices` | Bảo quản tập tin thiết bị |
| `--specials` | Bảo quản các tập tin đặc biệt |
| `-S` / `--sparse` | Xử lý các tập tin thưa thớt một cách hiệu quả |
| `-x` / `--one-file-system` | Không vượt qua ranh giới hệ thống tập tin |
| `-u` / `--update` | Bỏ qua các tập tin mới hơn ở đích |
| `-c` / `--checksum` | Bỏ qua dựa trên tổng kiểm tra thay vì mod-time/size |
| `--size-only` | Bỏ qua chỉ dựa trên kích thước |
| `-b` / `--backup` | Tạo bản sao lưu |
| `--backup-dir DIR` | Thư mục sao lưu |
| `--suffix SUFFIX` | Hậu tố sao lưu (mặc định: `~`) |
| `--bwlimit RATE` | Giới hạn băng thông (KB/s hoặc có hậu tố: K, M, G) |
| `--max-size SIZE` | Bỏ qua các tệp lớn hơn SIZE |
| `--min-size SIZE` | Bỏ qua các tệp nhỏ hơn SIZE |
| `--existing` | Bỏ qua việc tạo tập tin mới trên máy thu |
| `--ignore-existing` | Bỏ qua việc cập nhật các tập tin hiện có |
| `--remove-source-files` | Xóa tập tin nguồn sau khi chuyển |
| `--chmod PERMS` | Đặt quyền ở đích |
| `--chown USER:GROUP` | Đặt owner/group ở đích |
| `-i` / `--itemize-changes` | Hiển thị các thay đổi chi tiết |
| `--info FLAGS` | Đầu ra thông tin chi tiết |
| `--stats` | Hiển thị thống kê truyền dữ liệu |
| `-h` / `--human-readable` | Kích thước con người có thể đọc được |
| `--log-file FILE` | Ghi log vào tệp |
| `--log-file-format FMT` | Chuỗi định dạng nhật ký |
| `-W` / `--whole-file` | Sao chép toàn bộ tập tin (không delta) |
| `--no-whole-file` | Buộc chuyển delta |
| `-I` / `--ignore-times` | Đừng bỏ qua các tập tin của time/size |
| `--list-only` | Liệt kê các tập tin thay vì chuyển |
| `--timeout SEC` | Hết thời gian chờ I/O |
| `--contimeout SEC` | Thời gian chờ tối đa để kết nối |
| `--temp-dir DIR` | Tạo tập tin tạm thời trong DIR |
| `--compare-dest DIR` | So sánh với DIR |
| `--copy-dest DIR` | Sao chép từ DIR nếu không thay đổi |
| `--link-dest DIR` | Liên kết cứng từ DIR nếu không thay đổi |
| `--compress-level NUM` | Mức nén (0-9) |
| `--skip-compress LIST` | Bỏ qua quá trình nén cho các hậu tố này |
| `-4` / `-6` | Buộc IPv4/IPv6 |
| `--address ADDR` | Liên kết với địa chỉ |
| `--port PORT` | Chỉ định cổng daemon |
| `--sockopts OPTIONS` | Tùy chọn socket |
| `--blocking-io` | Sử dụng chặn I/O |
| `--outbuf MODE` | Bộ đệm đầu ra: `N`one, `L`ine, `B`lock |
| `--8-bit-output` | Đừng thoát khỏi ký tự bit cao |
| `--password-file FILE` | Đọc mật khẩu daemon từ tập tin |
| `--early-input FILE` | Đầu vào sẽ được sử dụng trước khi chuyển |

<a id="examples-13"></a>
<a id="heading-210-examples"></a>

## Ví dụ

```bash
# Đồng bộ thư mục với điều khiển từ xa
rsync -avz ./mydir/ user@remote:/backup/mydir/

# Chạy khô (xem trước thay đổi)
rsync -avzn ./mydir/ user@remote:/backup/mydir/

# Đồng bộ hóa với xóa (gương)
rsync -avz --delete ./mydir/ user@remote:/backup/mydir/

# Loại trừ mẫu
rsync -avz --exclude '*.log' --exclude '.git' ./src/ user@remote:/deploy/

# Sử dụng cổng SSH tùy chỉnh
rsync -avz -e "ssh -p 2222" ./mydir/ user@remote:/backup/

# Giới hạn băng thông (1MB/s)
rsync -avz --bwlimit=1M ./mydir/ user@remote:/backup/

# Hiển thị tiến trình
rsync -avzP ./largefile.iso user@remote:/backup/

# Hiển thị các thay đổi được chia thành từng khoản
rsync -avzi ./mydir/ user@remote:/backup/mydir/

# Chỉ những tập tin mới hơn
rsync -avzu ./mydir/ user@remote:/backup/mydir/

# Sao lưu gia tăng với các liên kết cứng
rsync -avz --link-dest=/backup/yesterday/ ./data/ /backup/today/

# Đồng bộ hóa cục bộ
rsync -avz /source/ /destination/

# So sánh dựa trên tổng kiểm tra
rsync -avzc ./mydir/ user@remote:/backup/

# Xóa tập tin nguồn sau khi chuyển
rsync -avz --remove-source-files ./outbox/ user@remote:/inbox/

# Hiển thị số liệu thống kê
rsync -avz --stats ./mydir/ user@remote:/backup/
```

---

<a id="30-nc--netcat--network-swiss-army-knife"></a>
<a id="heading-211-30-nc-netcat-network-swiss-army-knife"></a>

# 30. `nc` / `netcat` — Mạng dao quân đội Thụy Sĩ

<a id="syntax-18"></a>
<a id="heading-212-syntax"></a>

## Cú pháp

```bash
nc [OPTIONS] HOST PORT
nc [OPTIONS] -l [PORT]
```

<a id="flags-gnuopenbsd-netcat"></a>
<a id="heading-213-flags-gnuopenbsd-netcat"></a>

## Cờ (GNU/OpenBSD netcat)

| Cờ | Mô tả |
|------|-------------|
| `-l` | Chế độ nghe |
| `-p PORT` | Cảng địa phương |
| `-s ADDR` | Địa chỉ nguồn |
| `-u` | Chế độ UDP |
| `-v` | dài dòng |
| `-w SEC` | Hết giờ |
| `-z` | Chế độ Zero-I/O (quét) |
| `-n` | Chỉ số (không có DNS) |
| `-k` | Tiếp tục nghe sau khi ngắt kết nối (chấp nhận nhiều kết nối) |
| `-e PROG` | Thực thi chương trình khi kết nối (một số phiên bản) |
| `-c CMD` | Thực thi lệnh shell khi kết nối (một số phiên bản) |
| `-q SEC` | Thoát sau EOF trên stdin, đợi SEC |
| `-d` | Tách khỏi stdin |
| `-i SEC` | Độ trễ giữa các dòng được gửi |
| `-o FILE` | Lưu lượng truy cập kết xuất hex vào tập tin |
| `-r` | Ngẫu nhiên hóa các cổng source/destination |
| `-C` | Gửi kết thúc dòng CRLF |
| `-N` | Tắt mạng sau EOF trên stdin |
| `-4` / `-6` | Buộc IPv4/IPv6 |
| `-U` | Sử dụng socket tên miền Unix |
| `-X PROTO` | Giao thức proxy: `4` (SOCKS4), `5` (SOCKS5), `connect` (HTTP) |
| `-x PROXY:PORT` | Địa chỉ proxy |

<a id="examples-14"></a>
<a id="heading-214-examples"></a>

## Ví dụ

```bash
# Kiểm tra xem một cổng có mở không
nc -zv 192.168.1.1 80
nc -zv 192.168.1.1 20-100              # Phạm vi cổng quét

# Máy chủ TCP đơn giản
nc -l -p 4444

# Máy khách TCP đơn giản
nc 192.168.1.50 4444

# Chế độ UDP
nc -u -l -p 5000                       # Máy chủ UDP
nc -u 192.168.1.50 5000                # Máy khách UDP

# Truyền tập tin
nc -l -p 4444 > received.tar.gz        # Người nhận
nc 192.168.1.50 4444 < file.tar.gz     # Người gửi

# Trò chuyện giữa các máy
nc -l -p 5000                          # Máy A
nc 192.168.1.100 5000                  # Máy B

# Yêu cầu HTTP
echo -e "GET / HTTP/1.1\r\nHost: example.com\r\n\r\n" | nc example.com 80

# Lấy biểu ngữ
echo "" | nc -w 3 192.168.1.1 22       # Biểu ngữ SSH
echo "" | nc -w 3 192.168.1.1 25       # Biểu ngữ SMTP

# Chuyển tiếp cổng (có thay thế quy trình)
nc -l -p 8080 -c "nc 192.168.1.100 80"

# Tiếp tục lắng nghe nhiều kết nối
nc -lk -p 4444

# Ủy quyền thông qua SOCKS5
nc -X 5 -x proxy:1080 target 80

# Với thời gian chờ
nc -w 5 192.168.1.1 80

# Chuyển thư mục bằng tar
tar czf - ./mydir | nc 192.168.1.50 4444         # Người gửi
nc -l -p 4444 | tar xzf -                         # Người nhận

# Backdoor shell (chỉ để thử nghiệm)
nc -l -p 4444 -e /bin/bash                         # Nguy hiểm!
```

---

<a id="31-ncat--modern-netcat-from-nmap"></a>
<a id="heading-215-31-ncat-modern-netcat-from-nmap"></a>

# 31. `ncat` — Netcat hiện đại (từ Nmap)

`ncat` là sự triển khai lại netcat của Nmap với các tính năng bổ sung: hỗ trợ SSL/TLS, IPv6, môi giới kết nối và kiểm soát truy cập. Nó được đi kèm với `nmap`.

<a id="installation-3"></a>
<a id="heading-216-installation"></a>

## Cài đặt

```bash
sudo apt install ncat               # Debian/Ubuntu
sudo dnf install nmap               # RHEL/Fedora (bao gồm ncat)
```

<a id="syntax-19"></a>
<a id="heading-217-syntax"></a>

## Cú pháp

```bash
ncat [options] [hostname] [port]
```

<a id="basic-connection-testing"></a>
<a id="heading-218-basic-connection-testing"></a>

## Kiểm tra kết nối cơ bản

```bash
# Kiểm tra xem cổng TCP có mở không
ncat -zv 192.168.1.1 22

# Kiểm tra cổng UDP
ncat -zuv 192.168.1.1 53

# Kết nối với một dịch vụ (tương tác)
ncat example.com 80

# Kết nối với thời gian chờ (5 giây)
ncat --send-only -w 5 192.168.1.1 80

# Lấy biểu ngữ
echo "" | ncat 192.168.1.1 22
```

<a id="server-mode-listen"></a>
<a id="heading-219-server-mode-listen"></a>

## Chế độ máy chủ (Nghe)

```bash
# Nghe trên một cổng
ncat -l 9090

# Lắng nghe và tiếp tục mở cho nhiều kết nối
ncat -lk 9090

# Nghe theo địa chỉ cụ thể
ncat -l 127.0.0.1 9090

# Thực hiện một lệnh trên mỗi kết nối
ncat -l 9090 -e /bin/bash          # TCP shell (chỉ dành cho thử nghiệm)

# Nghe trên UDP
ncat -lu 9090
```

<a id="file-transfer"></a>
<a id="heading-220-file-transfer"></a>

## Truyền tệp

```bash
# Gửi file (người nhận nghe trước)
ncat -l 9090 > received_file.txt   # Người nhận
ncat 192.168.1.2 9090 < send_file.txt  # Người gửi

# Chuyển theo tiến độ (ống qua pv)
ncat -l 9090 > output.tar.gz       # Người nhận
tar czf - /data | ncat 192.168.1.2 9090  # Người gửi
```

<a id="ssltls-ncats-key-advantage-over-nc"></a>
<a id="heading-221-ssltls-ncats-key-advantage-over-nc"></a>

## SSL/TLS (Lợi thế chính của ncat so với nc)

```bash
# máy chủ SSL
ncat -l 9090 --ssl

# ứng dụng khách SSL
ncat --ssl 192.168.1.1 9090

# SSL có chứng chỉ
ncat -l 9090 --ssl --ssl-cert server.crt --ssl-key server.key

# Ứng dụng khách SSL có xác minh chứng chỉ
ncat --ssl --ssl-verify --ssl-trustfile ca.crt 192.168.1.1 9090

# Lấy tiêu đề HTTPS nhanh chóng
ncat --ssl example.com 443 <<< "HEAD / HTTP/1.0\nHost: example.com\n\n"
```

<a id="connection-brokering"></a>
<a id="heading-222-connection-brokering"></a>

## Môi giới kết nối

```bash
# Nhà môi giới: hai khách hàng kết nối với máy chủ này và nói chuyện với nhau
ncat -l --broker 9090

# Máy chủ trò chuyện (phát tới tất cả các máy khách được kết nối)
ncat -l --chat 9090
```

<a id="access-control"></a>
<a id="heading-223-access-control"></a>

## Kiểm soát truy cập

```bash
# Chỉ cho phép kết nối từ các IP cụ thể
ncat -l 9090 --allow 192.168.1.0/24

# Từ chối IP cụ thể
ncat -l 9090 --deny 10.0.0.5

# Cho phép danh sách từ tập tin
ncat -l 9090 --allowfile /etc/ncat.allow
```

<a id="proxy-and-tunneling"></a>
<a id="heading-224-proxy-and-tunneling"></a>

## Proxy và đường hầm

```bash
# Proxy HTTP kết nối thông qua proxy
ncat --proxy 192.168.1.1:8080 --proxy-type http example.com 80

# Proxy SOCKS5
ncat --proxy 127.0.0.1:1080 --proxy-type socks5 example.com 80

# Chuyển tiếp cổng (chuyển tiếp 8080 cục bộ sang 80 từ xa)
ncat -l 8080 -c "ncat example.com 80"
```

<a id="ipv6"></a>
<a id="heading-225-ipv6"></a>

## IPv6

```bash
# Kết nối với máy chủ IPv6
ncat -6 2001:db8::1 80

# Nghe trên IPv6
ncat -6 -l 9090

# Nghe trên cả IPv4 và IPv6
ncat -46 -l 9090
```

---



<a id="32-socat--multipurpose-bidirectional-relay"></a>
<a id="heading-226-32-socat-multipurpose-bidirectional-relay"></a>

# 32. `socat` - Rơle hai chiều đa năng

`socat` (SOcket CAT) tạo các kênh dữ liệu hai chiều giữa hầu như bất kỳ hai điểm cuối nào: TCP, UDP, socket Unix, tệp, quy trình, cổng nối tiếp, TLS, v.v. Nó là công cụ mạnh nhất trong dòng netcat.

<a id="installation-4"></a>
<a id="heading-227-installation"></a>

## Cài đặt

```bash
sudo apt install socat              # Debian/Ubuntu
sudo dnf install socat              # RHEL/Fedora
```

<a id="syntax-20"></a>
<a id="heading-228-syntax"></a>

## Cú pháp

```bash
socat [options] ADDRESS1 ADDRESS2
```

Dữ liệu chảy hai chiều giữa ADDRESS1 và ADDRESS2. Mỗi địa chỉ sử dụng định dạng `TYPE:params` hoặc một từ khóa.

<a id="common-address-types"></a>
<a id="heading-229-common-address-types"></a>

## Các loại địa chỉ phổ biến

| Địa chỉ | Mô tả |
|---------|-------------|
| `TCP:host:port` | Kết nối máy khách TCP |
| `TCP-LISTEN:port` | Máy chủ TCP |
| `UDP:host:port` | UDP gửi |
| `UDP-LISTEN:port` | Máy chủ UDP |
| `UNIX-CONNECT:path` | Máy khách socket tên miền Unix |
| `UNIX-LISTEN:path` | Máy chủ socket tên miền Unix |
| `OPENSSL:host:port` | Máy khách TLS |
| `OPENSSL-LISTEN:port` | Máy chủ TLS |
| `FILE:path` | Tệp thông thường |
| `STDIN` / `STDOUT` | Tiêu chuẩn I/O |
| `EXEC:cmd` | Thực hiện một lệnh |
| `PTY` | Thiết bị đầu cuối giả |
| `PIPE:path` | Ống được đặt tên |
| `GOPEN:path` | Mở bất kỳ tập tin |

<a id="basic-connections"></a>
<a id="heading-230-basic-connections"></a>

## Kết nối cơ bản

```bash
# Máy khách TCP (tương tác)
socat - TCP:example.com:80

# Máy chủ TCP (phản hồi lại máy khách)
socat TCP-LISTEN:9090,reuseaddr,fork STDIN

# Máy khách UDP
socat - UDP:192.168.1.1:514

# Máy chủ UDP
socat UDP-LISTEN:514,reuseaddr -
```

<a id="port-forwarding"></a>
<a id="heading-231-port-forwarding"></a>

## Chuyển tiếp cổng

```bash
# Chuyển tiếp cổng cục bộ 8080 sang máy chủ từ xa: cổng
socat TCP-LISTEN:8080,reuseaddr,fork TCP:192.168.1.10:80

# Chuyển tiếp với địa chỉ liên kết cụ thể
socat TCP-LISTEN:8080,bind=127.0.0.1,reuseaddr,fork TCP:10.0.0.1:80

# Chuyển tiếp cổng UDP
socat UDP-LISTEN:5353,reuseaddr,fork UDP:8.8.8.8:53
```

<a id="file-transfer-1"></a>
<a id="heading-232-file-transfer"></a>

## Truyền tệp

```bash
# Gửi một tập tin
socat TCP-LISTEN:9090,reuseaddr - > received.tar.gz  # Người nhận (nghe trước)
socat - TCP:192.168.1.2:9090 < send.tar.gz            # Người gửi

# Chuyển giao theo tiến độ
pv file.tar.gz | socat - TCP:192.168.1.2:9090        # Người gửi có tiến trình
```

<a id="unix-socket-proxy"></a>
<a id="heading-233-unix-socket-proxy"></a>

## Proxy socket Unix

```bash
# Proxy socket Unix tới TCP (e.g., hiển thị socket Docker trên TCP - hãy cẩn thận)
socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CONNECT:/var/run/docker.sock

# Proxy TCP tới socket Unix
socat UNIX-LISTEN:/tmp/my.sock,reuseaddr,fork TCP:192.168.1.1:9090
```

<a id="tls--ssl"></a>
<a id="heading-234-tls-ssl"></a>

## TLS / SSL

```bash
# Máy chủ TLS
socat OPENSSL-LISTEN:4443,reuseaddr,fork,cert=server.pem,cafile=ca.pem EXEC:/bin/bash

# Máy khách TLS
socat STDIN OPENSSL:example.com:443,verify=1,cafile=/etc/ssl/certs/ca-certificates.crt

# Tạo chứng chỉ tự ký để thử nghiệm
openssl req -newkey rsa:2048 -nodes -keyout server.key -x509 -days 365 -out server.crt
cat server.key server.crt > server.pem
socat OPENSSL-LISTEN:4443,cert=server.pem,verify=0 STDOUT
```

<a id="shell-and-process-piping"></a>
<a id="heading-235-shell-and-process-piping"></a>

## Vỏ và đường ống xử lý

```bash
# Máy chủ shell từ xa (TCP → bash - chỉ để thử nghiệm)
socat TCP-LISTEN:9090,reuseaddr,fork EXEC:/bin/bash,pty,setsid,ctty

# Thực hiện lệnh và gửi đầu ra tới điều khiển từ xa
socat EXEC:"ps aux" TCP:192.168.1.1:9090

# Đường ống giữa hai quá trình
socat EXEC:"prog1" EXEC:"prog2"
```

<a id="serial-port--pty"></a>
<a id="heading-236-serial-port-pty"></a>

## Cổng nối tiếp / PTY

```bash
# Kết nối với một cổng nối tiếp
socat - /dev/ttyS0,raw,echo=0,crnl,b115200

# Tạo một cặp cổng nối tiếp ảo (để thử nghiệm)
socat -d -d PTY,link=/dev/ttyV0 PTY,link=/dev/ttyV1

# Cổng nối tiếp tới cổng TCP
socat /dev/ttyS0,raw,b9600 TCP-LISTEN:2000,reuseaddr
```

<a id="debugging-options"></a>
<a id="heading-237-debugging-options"></a>

## Tùy chọn gỡ lỗi

```bash
-v            # In dữ liệu theo cả hai hướng (người có thể đọc được)
-x            # In dữ liệu ở dạng hex
-d            # Gỡ lỗi cấp 1
-d -d         # Gỡ lỗi cấp 2 (chi tiết hơn)
-d -d -d      # Đầu ra gỡ lỗi tối đa

# Ví dụ: xem HTTP request/response
socat -v TCP-LISTEN:8080,reuseaddr,fork TCP:example.com:80
```

---



<a id="33-whois--domain-registration-lookup"></a>
<a id="heading-238-33-whois-domain-registration-lookup"></a>

# 33. `whois` — Tra cứu đăng ký tên miền

`whois` truy vấn cơ sở dữ liệu WHOIS để biết thông tin đăng ký tên miền và phân bổ IP.

<a id="installation-5"></a>
<a id="heading-239-installation"></a>

## Cài đặt

```bash
sudo apt install whois              # Debian/Ubuntu
sudo dnf install whois              # RHEL/Fedora
```

<a id="syntax-21"></a>
<a id="heading-240-syntax"></a>

## Cú pháp

```bash
whois [options] QUERY
```

<a id="domain-lookups"></a>
<a id="heading-241-domain-lookups"></a>

## Tra cứu tên miền

```bash
# Thông tin đăng ký tên miền
whois example.com

# Hiển thị nhà đăng ký, ngày tháng, máy chủ tên, trạng thái
whois google.com | grep -E "Registrar:|Creation Date:|Expiry Date:|Name Server:"

# Kiểm tra tính khả dụng của tên miền (tìm "Không khớp" hoặc "KHÔNG TÌM THẤY")
whois somefunkyname123.com | grep -i "no match\|not found"

# WHOIS cho ccTLD (TLD mã quốc gia)
whois example.co.uk
whois example.de

# Truy vấn máy chủ WHOIS cụ thể
whois -h whois.verisign-grs.com example.com

# Hiển thị đầu ra thô mà không loại bỏ nhận xét
whois -r example.com

# Đệ quy theo các giới thiệu đến máy chủ có thẩm quyền
whois -R example.com
```

<a id="ip-address-lookups"></a>
<a id="heading-242-ip-address-lookups"></a>

## Tra cứu địa chỉ IP

```bash
# Tra cứu chủ sở hữu và phân bổ IP
whois 8.8.8.8

# Tra cứu IP thông qua đăng ký khu vực
whois -h whois.arin.net 8.8.8.8         # ARIN (Bắc Mỹ)
whois -h whois.ripe.net 8.8.8.8         # RIPE (Châu Âu, Trung Đông)
whois -h whois.apnic.net 8.8.8.8        # APNIC (Châu Á-Thái Bình Dương)
whois -h whois.lacnic.net 8.8.8.8       # LACNIC (Châu Mỹ Latinh)
whois -h whois.afrinic.net 8.8.8.8      # AFRINIC (Châu Phi)

# Nhận thông tin ASN (Số hệ thống tự động)
whois AS15169                            # ASN của Google
whois -h whois.radb.net AS15169

# Tra cứu toàn bộ khối CIDR
whois 192.0.2.0/24
```

<a id="useful-filters"></a>
<a id="heading-243-useful-filters"></a>

## Bộ lọc hữu ích

```bash
# Chỉ trích xuất thông tin nhà đăng ký
whois example.com | grep -i "registrar"

# Trích xuất máy chủ tên
whois example.com | grep -i "name server"

# Trích xuất ngày hết hạn
whois example.com | grep -iE "expir|expiry|expires"

# Trạng thái trích xuất
whois example.com | grep -i "status"

# Kiểm tra DNSSEC
whois example.com | grep -i "dnssec"
```

<a id="key-fields-in-whois-output"></a>
<a id="heading-244-key-fields-in-whois-output"></a>

## Các trường chính trong đầu ra WHOIS

| trường | Ý nghĩa |
|-------|---------|
| `Registrar` | Công ty đăng ký tên miền |
| `Creation Date` | Khi tên miền được đăng ký lần đầu |
| `Updated Date` | Ngày sửa đổi lần cuối |
| `Registry Expiry Date` | Khi đăng ký hết hạn |
| `Name Server` | Máy chủ DNS có thẩm quyền |
| `Domain Status` | Trạng thái hiện tại (clientTransferProhibited, v.v.) |
| `Registrant` | Thông tin chủ sở hữu (thường được biên tập lại để bảo mật) |
| `DNSSEC` | DNSSEC có được bật hay không |

---



<a id="34-hostname--hostnamectl--hostname-management"></a>
<a id="heading-245-34-hostname-hostnamectl-hostname-management"></a>

# 34. `hostname` / `hostnamectl` — Quản lý tên máy chủ

Linux sử dụng hai lệnh để quản lý tên máy chủ: `hostname` cũ (ngay lập tức, không liên tục) và `hostnamectl` hiện đại (liên tục, dựa trên systemd).

<a id="hostname--view-and-temporarily-set-hostname"></a>
<a id="heading-246-hostname-view-and-temporarily-set-hostname"></a>

## `hostname` - Xem và đặt tên máy chủ tạm thời

```bash
# Hiển thị tên máy chủ hiện tại
hostname

# Hiển thị tên miền đủ điều kiện (FQDN)
hostname -f
hostname --fqdn

# Hiển thị tên máy chủ ngắn (không có tên miền)
hostname -s

# Hiển thị tên miền DNS
hostname -d

# Hiển thị tất cả địa chỉ IP của máy chủ
hostname -I

# Hiển thị địa chỉ IP chính
hostname -i

# Đặt tạm thời tên máy chủ (đặt lại khi khởi động lại)
sudo hostname newhostname

# Đặt tên máy chủ FQDN tạm thời
sudo hostname newhostname.example.com
```

<a id="hostnamectl--persistent-hostname-management-systemd"></a>
<a id="heading-247-hostnamectl-persistent-hostname-management-syst"></a>

## `hostnamectl` — Quản lý tên máy chủ liên tục (systemd)

```bash
# Hiển thị trạng thái tên máy chủ đầy đủ
hostnamectl

# Chỉ hiển thị tên máy chủ tĩnh
hostnamectl hostname

# Đặt tên máy chủ tĩnh (vẫn tồn tại trong các lần khởi động lại)
sudo hostnamectl set-hostname newhostname

# Đặt tên máy chủ đẹp (người dùng có thể đọc được, có thể chứa dấu cách)
sudo hostnamectl set-hostname "My Server 01" --pretty

# Đặt tên máy chủ tạm thời (chỉ thời gian chạy, bị DHCP ghi đè)
sudo hostnamectl set-hostname temp-name --transient

# Xóa tên máy chủ đẹp
sudo hostnamectl set-hostname "" --pretty
```

<a id="hostnamectl-status-output"></a>
<a id="heading-248-hostnamectl-status-output"></a>

### Đầu ra trạng thái tên máy chủ

```
 Static hostname: server01.example.com
 Pretty hostname: Production Server 01
       Icon name: computer-server
      Machine ID: a1b2c3d4e5f6...
         Boot ID: f6e5d4c3b2a1...
Operating System: Ubuntu 24.04 LTS
          Kernel: Linux 6.8.0-36-generic
    Architecture: x86-64
```

<a id="hostname-types"></a>
<a id="heading-249-hostname-types"></a>

## Các loại tên máy chủ

| Loại | Mô tả | Kiên trì |
|------|-------------|-------------|
| **Tĩnh** | Được đặt bởi quản trị viên, tên máy chủ chính | Vĩnh viễn (trong `/etc/hostname`) |
| **Đẹp** | Thân thiện với con người, có thể có ký tự spaces/special | Vĩnh viễn (trong `/etc/machine-info`) |
| **Tạm thời** | Tạm thời, được đặt bởi kernel/DHCP | Bị mất khi khởi động lại |

<a id="configuration-files"></a>
<a id="heading-250-configuration-files"></a>

## Tệp cấu hình

```bash
# Xem /etc/hostname (tên máy chủ tĩnh)
cat /etc/hostname

# Chỉnh sửa tên máy chủ trực tiếp
sudo nano /etc/hostname

# /etc/hosts cũng cần được cập nhật để có độ phân giải cục bộ
sudo nano /etc/hosts
# Thêm hoặc cập nhật: 127.0.1.1 newhostname.example.com newhostname

# /etc/machine-info chứa tên máy chủ khá đẹp
cat /etc/machine-info

# Xác minh tên máy chủ được giải quyết
getent hosts $(hostname)
```

<a id="dhcp-and-hostname"></a>
<a id="heading-251-dhcp-and-hostname"></a>

## DHCP và tên máy chủ

```bash
# Kiểm tra xem DHCP có ghi đè tên máy chủ của bạn không
hostnamectl status | grep Transient

# Ngăn NetworkManager thay đổi tên máy chủ qua DHCP
# Chỉnh sửa /etc/NetworkManager/NetworkManager.conf:
# [chính]
# tên máy chủ-mode=none
```

---



<a id="35-ipcalc--ip-address-calculator"></a>
<a id="heading-252-35-ipcalc-ip-address-calculator"></a>

# 35. `ipcalc` — Máy tính địa chỉ IP

`ipcalc` tính toán thông tin mạng từ địa chỉ IP và tiền tố hoặc mặt nạ mạng. Cần thiết cho việc tính toán mạng con.

<a id="installation-6"></a>
<a id="heading-253-installation"></a>

## Cài đặt

```bash
sudo apt install ipcalc             # Debian/Ubuntu
sudo dnf install ipcalc             # RHEL/Fedora
```

<a id="basic-usage"></a>
<a id="heading-254-basic-usage"></a>

## Cách sử dụng cơ bản

```bash
# Tính toán thông tin mạng từ ký hiệu CIDR
ipcalc 192.168.1.100/24

# Sử dụng netmask thay vì tiền tố
ipcalc 192.168.1.100 255.255.255.0

# Tính toán IPv6
ipcalc 2001:db8::1/48
```

<a id="reading-ipcalc-output"></a>
<a id="heading-255-reading-ipcalc-output"></a>

### Đọc đầu ra ipcalc

```
Address:   192.168.1.100        11000000.10101000.00000001. 01100100
Netmask:   255.255.255.0 = 24   11111111.11111111.11111111. 00000000
Wildcard:  0.0.0.255            00000000.00000000.00000000. 11111111
=>
Network:   192.168.1.0/24       11000000.10101000.00000001. 00000000
HostMin:   192.168.1.1          11000000.10101000.00000001. 00000001
HostMax:   192.168.1.254        11000000.10101000.00000001. 11111110
Broadcast: 192.168.1.255        11000000.10101000.00000001. 11111111
Hosts/Net: 254                   Class C, Private Internet
```

| trường | Mô tả |
|-------|-------------|
| `Address` | Địa chỉ IP đầu vào |
| `Netmask` | Mặt nạ mạng con có độ dài tiền tố |
| `Wildcard` | Mặt nạ nghịch đảo (được sử dụng trong ACLs/nmap) |
| `Network` | Địa chỉ mạng (địa chỉ đầu tiên trong khối) |
| `HostMin` | Địa chỉ máy chủ có thể sử dụng đầu tiên |
| `HostMax` | Địa chỉ máy chủ có thể sử dụng lần cuối |
| `Broadcast` | Địa chỉ quảng bá (cuối cùng trong khối) |
| `Hosts/Net` | Số lượng địa chỉ máy chủ có thể sử dụng |

<a id="subnetting"></a>
<a id="heading-256-subnetting"></a>

## Mạng con

```bash
# Chia mạng thành các mạng con có kích thước cụ thể
# Chia 192.168.1.0/24 thành các mạng con cho 200, 100 và 50 máy chủ
ipcalc 192.168.1.0/24 -s 200 100 50

# Yêu cầu mạng con tối thiểu cần thiết cho N máy chủ
ipcalc 10.0.0.0/8 -s 1000 500 250

# Hiển thị phân tách: tất cả các mạng con /26 bên trong /24
ipcalc 192.168.1.0/24 -b | head -20
```

<a id="output-formatting-options"></a>
<a id="heading-257-output-formatting-options"></a>

## Tùy chọn định dạng đầu ra

```bash
# Chỉ hiển thị địa chỉ mạng
ipcalc -n 192.168.1.100/24
# Đầu ra: 192.168.1.0

# Chỉ hiển thị chương trình phát sóng
ipcalc -b 192.168.1.100/24
# Đầu ra: 192.168.1.255

# Chỉ hiển thị độ dài tiền tố
ipcalc -p 192.168.1.100 255.255.255.0
# Đầu ra: 24

# Chỉ hiển thị mặt nạ mạng
ipcalc -m 192.168.1.100/24
# Đầu ra: 255.255.255.0

# Kiểm tra xem địa chỉ có hợp lệ không
ipcalc -c 192.168.1.100/24 ; echo $?   # 0=hợp lệ, 1=không hợp lệ

# Hiển thị đầu ra tối thiểu (không có giải thích)
ipcalc -s 0 192.168.1.0/24

# Không có đầu ra màu
ipcalc --nocolor 192.168.1.100/24
```

<a id="quick-reference-common-prefix-lengths"></a>
<a id="heading-258-quick-reference-common-prefix-lengths"></a>

## Tham khảo nhanh: Độ dài tiền tố phổ biến

| Tiền tố | Mặt nạ mạng | Máy chủ | Cách sử dụng |
|--------|---------|-------|-------|
| `/30` | 255.255.255.252 | 2 | Liên kết điểm-điểm |
| `/29` | 255.255.255.248 | 6 | Phân đoạn nhỏ |
| `/28` | 255.255.255.240 | 14 | Văn phòng nhỏ |
| `/27` | 255.255.255.224 | 30 | Mạng con nhỏ |
| `/26` | 255.255.255.192 | 62 | Mạng con trung bình |
| `/25` | 255.255.255.128 | 126 | Nửa /24 |
| `/24` | 255.255.255.0 | 254 | Mạng LAN tiêu chuẩn |
| `/23` | 255.255.254.0 | 510 |  |
| `/22` | 255.255.252.0 | 1022 |  |
| `/16` | 255.255.0.0 | 65534 | Lớp B |
| `/8` | 255.0.0.0 | 16M | Lớp A |

---



<a id="36-lsof--list-open-network-sockets"></a>
<a id="heading-259-36-lsof-list-open-network-sockets"></a>

# 36. `lsof` — Liệt kê các socket mạng mở

`lsof` (Liệt kê các tệp đang mở) liệt kê tất cả các tệp đang mở, bao gồm cả socket mạng. Đây là một trong những công cụ mạnh mẽ nhất để tìm ra tiến trình nào đang sử dụng cổng hoặc kết nối mạng.

<a id="syntax-22"></a>
<a id="heading-260-syntax"></a>

## Cú pháp

```bash
lsof [options] [names]
```

<a id="network-specific-options"></a>
<a id="heading-261-network-specific-options"></a>

## Tùy chọn dành riêng cho mạng

```bash
# Hiển thị TẤT CẢ các kết nối mạng (IPv4 và IPv6)
sudo lsof -i

# Chỉ hiển thị IPv4
sudo lsof -i 4

# Chỉ hiển thị IPv6
sudo lsof -i 6

# Hiển thị kết nối trên một cổng cụ thể
sudo lsof -i :80
sudo lsof -i :443

# Hiển thị kết nối đến một máy chủ cụ thể
sudo lsof -i @192.168.1.1

# Hiển thị kết nối với máy chủ trên một cổng cụ thể
sudo lsof -i @192.168.1.1:22

# Hiển thị phạm vi cổng
sudo lsof -i :1-1024

# Chỉ hiển thị các kết nối TCP
sudo lsof -i tcp

# Chỉ hiển thị các kết nối UDP
sudo lsof -i udp

# Chỉ hiển thị socket LẮNG NGHE
sudo lsof -iTCP -sTCP:LISTEN

# Chỉ hiển thị các kết nối THÀNH LẬP
sudo lsof -iTCP -sTCP:ESTABLISHED

# Chỉ hiển thị CLOSE_WAIT
sudo lsof -iTCP -sTCP:CLOSE_WAIT
```

<a id="process-and-user-filtering"></a>
<a id="heading-262-process-and-user-filtering"></a>

## Lọc quy trình và người dùng

```bash
# Hiển thị kết nối mạng cho một PID cụ thể
sudo lsof -p 1234 -i

# Hiển thị kết nối mạng cho một tên quy trình cụ thể
sudo lsof -c nginx -i

# Hiển thị kết nối cho một người dùng cụ thể
sudo lsof -u www-data -i

# Hiển thị kết nối cho tất cả người dùng ngoại trừ root
sudo lsof -u ^root -i

# Hiển thị kết nối cho nhiều PID
sudo lsof -p 1234,5678 -i
```

<a id="output-control"></a>
<a id="heading-263-output-control"></a>

## Kiểm soát đầu ra

```bash
# Địa chỉ và cổng số (không có phân giải DNS - nhanh hơn)
sudo lsof -i -P -n

# Chỉ cổng số (giải quyết máy chủ)
sudo lsof -i -P

# Lặp lại sau mỗi 2 giây
sudo lsof -i -r 2

# Chỉ hiển thị các trường cụ thể
sudo lsof -i -F pcn      # ID tiến trình, lệnh, chỉ tên

# Một dòng trên mỗi tệp (mặc định là nhiều dòng đối với một số loại)
sudo lsof -i -l
```

<a id="reading-lsof--i-output"></a>
<a id="heading-264-reading-lsof-i-output"></a>

### Đọc đầu ra lsof -i

```
COMMAND   PID   USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
nginx     1234  root   6u  IPv4   12345      0t0  TCP  *:80 (LISTEN)
sshd      5678  root   3u  IPv4   67890      0t0  TCP  0.0.0.0:22 (LISTEN)
chrome    9012  user   45u IPv4  111111      0t0  TCP  192.168.1.100:54321->93.184.216.34:443 (ESTABLISHED)
```

| Cột | Ý nghĩa |
|--------|---------|
| `COMMAND` | Tên quy trình |
| `PID` | ID tiến trình |
| `USER` | Người dùng đang chạy tiến trình |
| `FD` | Bộ mô tả tập tin (u=read+write) |
| `TYPE` | IPv4, IPv6, unix, v.v. |
| `NAME` | Địa chỉ: cổng → từ xa: cổng (trạng thái) |

<a id="common-use-cases"></a>
<a id="heading-265-common-use-cases"></a>

## Các trường hợp sử dụng phổ biến

```bash
# Ai đang nghe trên cổng 8080?
sudo lsof -i :8080

# Một PID cụ thể đang sử dụng những cổng nào?
sudo lsof -p 1234 -i

# Tìm quá trình chặn một cổng trước khi tắt nó
sudo lsof -i :3000
sudo kill -9 $(sudo lsof -ti :3000)

# Hiển thị tất cả các socket tên miền Unix đang mở
sudo lsof -U

# Hiển thị tất cả hoạt động mạng cho một tên quy trình
sudo lsof -c sshd -i

# Đếm kết nối theo trạng thái
sudo lsof -i TCP | awk '{print $10}' | sort | uniq -c | sort -rn
```

---



<a id="37-fuser--identify-processes-using-files-or-sockets"></a>
<a id="heading-266-37-fuser-identify-processes-using-files-or-sock"></a>

# 37. `fuser` - Xác định các quy trình sử dụng tệp hoặc socket

`fuser` xác định quy trình nào đang sử dụng tệp, thư mục hoặc cổng mạng. Nó là một phần của gói `psmisc`.

<a id="installation-7"></a>
<a id="heading-267-installation"></a>

## Cài đặt

```bash
sudo apt install psmisc             # Debian/Ubuntu
sudo dnf install psmisc             # RHEL/Fedora
```

<a id="syntax-23"></a>
<a id="heading-268-syntax"></a>

## Cú pháp

```bash
fuser [options] name
```

<a id="network-port-usage"></a>
<a id="heading-269-network-port-usage"></a>

## Sử dụng cổng mạng

```bash
# Tìm quy trình sử dụng cổng TCP 80
sudo fuser 80/tcp

# Đầu ra: 80/tcp: 1234
# Điều này có nghĩa là PID 1234 đang sử dụng cổng TCP 80

# Đầu ra dài dòng (hiển thị chi tiết quy trình)
sudo fuser -v 80/tcp

# Tìm quy trình sử dụng cổng UDP 53
sudo fuser 53/udp

# Kiểm tra nhiều cổng cùng một lúc
sudo fuser 80/tcp 443/tcp 22/tcp

# Tìm tất cả các quy trình sử dụng bất kỳ cổng TCP nào (chậm)
sudo fuser -v -n tcp 0-65535 2>/dev/null

# Kiểm tra xem cổng có đang được sử dụng không (mã thoát 0=có, 1=không)
sudo fuser 8080/tcp &>/dev/null && echo "Port in use" || echo "Port free"
```

<a id="file-and-directory-usage"></a>
<a id="heading-270-file-and-directory-usage"></a>

## Cách sử dụng tệp và thư mục

```bash
# Tìm quy trình bằng tệp
fuser /var/log/syslog

# Tìm các tiến trình sử dụng một thư mục (và tất cả các tệp bên trong)
fuser -m /var/log/

# Tìm quy trình sử dụng socket Unix
sudo fuser -v /var/run/docker.sock

# Tìm những gì được gắn trên device/filesystem
fuser -m /dev/sda1

# Tìm tất cả các quy trình sử dụng tệp theo một đường dẫn
fuser -m -v /path/to/dir
```

<a id="verbose-output"></a>
<a id="heading-271-verbose-output"></a>

## Đầu ra dài dòng

```bash
sudo fuser -v 80/tcp

# Đầu ra:
#                      USER        PID ACCESS COMMAND
# 80/tcp: root 1234 F.... nginx
#                      www-data 1235 F.... nginx
```

| Mã TRUY CẬP | Ý nghĩa |
|-------------|---------|
| `c` | Thư mục hiện tại |
| `e` | Có thể thực thi được |
| `f` | Mở tệp (bỏ qua trong đầu ra mặc định) |
| `F` | Mở file để viết |
| `r` | Thư mục gốc |
| `m` | tập tin mmap'd hoặc thư viện chia sẻ |

<a id="killing-processes"></a>
<a id="heading-272-killing-processes"></a>

## Quá trình tiêu diệt

```bash
# Giết tiến trình bằng cổng 80
sudo fuser -k 80/tcp

# Tiêu diệt bằng SIGTERM trước (nhẹ nhàng hơn)
sudo fuser -k -TERM 80/tcp

# Giết bằng một tín hiệu cụ thể
sudo fuser -k -HUP 80/tcp           # SIGHUP (tải lại cấu hình)
sudo fuser -k -9 80/tcp             # SIGKILL (buộc giết)

# Tiêu diệt tất cả các tiến trình bằng cách sử dụng một thư mục (e.g., trước khi ngắt kết nối)
sudo fuser -k -m /mnt/data

# Tiêu diệt tương tác (hỏi trước mỗi cái)
sudo fuser -i -k 80/tcp
```

<a id="useful-combinations"></a>
<a id="heading-273-useful-combinations"></a>

## Sự kết hợp hữu ích

```bash
# Chỉ tìm PID (đối với tập lệnh)
sudo fuser 80/tcp 2>/dev/null

# Nhận PID dưới dạng số sạch
PID=$(sudo fuser 3000/tcp 2>/dev/null | tr -d ' ')
echo "Killing PID $PID"
sudo kill -9 $PID

# Liệt kê tất cả các tiến trình sử dụng mạng
sudo fuser -v -n tcp 22 80 443 2>/dev/null
```

---



<a id="38-iftop--real-time-bandwidth-monitor"></a>
<a id="heading-274-38-iftop-real-time-bandwidth-monitor"></a>

# 38. `iftop` — Giám sát băng thông thời gian thực

`iftop` hiển thị mức sử dụng băng thông theo thời gian thực trên giao diện mạng, hiển thị các kết nối hàng đầu theo lưu lượng truy cập. Hãy coi nó như `top` cho lưu lượng mạng.

<a id="installation-8"></a>
<a id="heading-275-installation"></a>

## Cài đặt

```bash
sudo apt install iftop              # Debian/Ubuntu
sudo dnf install iftop              # RHEL/Fedora
```

<a id="basic-usage-1"></a>
<a id="heading-276-basic-usage"></a>

## Cách sử dụng cơ bản

```bash
# Màn hình giao diện mặc định (yêu cầu root)
sudo iftop

# Giám sát một giao diện cụ thể
sudo iftop -i eth0
sudo iftop -i ens3

# Chạy trong 10 giây rồi in tóm tắt và thoát
sudo iftop -t -s 10 -i eth0
```

<a id="options-1"></a>
<a id="heading-277-options"></a>

## Tùy chọn

```bash
# Không phân giải tên máy chủ (IP số, nhanh hơn nhiều)
sudo iftop -n

# Không giải quyết tên cổng (hiển thị số cổng)
sudo iftop -N

# Hiển thị số cổng
sudo iftop -P

# Hiển thị byte thay vì bit (mặc định là bits/sec)
sudo iftop -B

# Áp dụng bộ lọc BPF (cú pháp tương tự như tcpdump)
sudo iftop -f "port 80 or port 443"
sudo iftop -f "src net 192.168.1.0/24"
sudo iftop -f "dst host 8.8.8.8"

# Lọc theo mạng (chỉ hiển thị lưu lượng truy cập to/from mạng con này)
sudo iftop -F 192.168.1.0/24

# Hiển thị lưu lượng IPv6
sudo iftop -6

# Sử dụng tệp bộ lọc pcap cụ thể
sudo iftop -c ~/.iftoprc

# Kết hợp: giao diện cụ thể, số, cổng, byte
sudo iftop -i eth0 -n -N -P -B
```

<a id="interactive-keys-while-iftop-is-running"></a>
<a id="heading-278-interactive-keys-while-iftop-is-running"></a>

## Phím tương tác (trong khi iftop đang chạy)

| Chìa khóa | hành động |
|-----|--------|
| `h` | Chuyển đổi trợ giúp |
| `n` | Chuyển đổi phân giải DNS |
| `N` | Chuyển đổi độ phân giải số cổng |
| `p` | Chuyển đổi hiển thị cổng |
| `s` | Chuyển đổi hiển thị máy chủ nguồn |
| `d` | Chuyển đổi hiển thị máy chủ đích |
| `t` | Chuyển qua các chế độ hiển thị (2-line/1-line/ports) |
| `l` | Chuyển đổi chế độ giữ đỉnh |
| `b` | Chuyển đổi hiển thị biểu đồ thanh |
| `B` | Chuyển đổi bytes/bits |
| `j` / `k` | Cuộn up/down qua các kết nối |
| `f` | Chỉnh sửa biểu thức bộ lọc BPF |
| `1` `2` `3` | Sắp xếp theo cột 2s/10s/40s |
| `<` | Sắp xếp theo địa chỉ nguồn |
| `>` | Sắp xếp theo địa chỉ đích |
| `q` | Thoát |

<a id="reading-iftop-output"></a>
<a id="heading-279-reading-iftop-output"></a>

## Đọc đầu ra iftop

```
                 12.5Kb          25.0Kb         37.5Kb         50.0Kb   62.5Kb
┌───────────────────────────────────────────────────────────────────────────────┐
│ 192.168.1.5                          =>      8.8.8.8                          │
│                                      <=                            234Kb       │
│ 192.168.1.5                          =>      93.184.216.34                    │
│                                      <=                             45Kb       │
├───────────────────────────────────────────────────────────────────────────────┤
│ TX: tốc độ cao nhất tích lũy: 2.56Kb 1.24Kb 0.98Kb         │
│ RX:                                          289Kb    145Kb   98Kb            │
│ TOTAL:                                       292Kb    146Kb   99Kb            │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **Phần trên cùng:** Các kết nối riêng lẻ có tỷ lệ gửi (=>) và nhận (<=)
- **Ba cột tỷ lệ:** Trung bình trong 2 giây, 10 giây, 40 giây qua
- **Phần dưới cùng:** Tổng tỷ lệ TX/RX/combined và tổng tích lũy

<a id="non-interactive--script-mode"></a>
<a id="heading-280-non-interactive-script-mode"></a>

## Chế độ không tương tác / tập lệnh

```bash
# Chạy trong 10 giây và xuất ra văn bản tóm tắt
sudo iftop -t -s 10 -n -N -i eth0 2>/dev/null

# Ghi lại đầu ra vào tập tin
sudo iftop -t -s 30 -n -i eth0 > /tmp/iftop-report.txt 2>&1
```

---



<a id="39-vnstat--network-traffic-monitor-historical"></a>
<a id="heading-281-39-vnstat-network-traffic-monitor-historical"></a>

# 39. `vnstat` — Giám sát lưu lượng mạng (Lịch sử)

`vnstat` là trình giám sát lưu lượng truy cập mạng dựa trên bảng điều khiển, ghi lại và hiển thị số liệu thống kê lưu lượng truy cập lịch sử mà không cần root để xem. Dữ liệu được lưu trữ trong cơ sở dữ liệu và tồn tại trong suốt quá trình khởi động lại.

<a id="installation-9"></a>
<a id="heading-282-installation"></a>

## Cài đặt

```bash
sudo apt install vnstat              # Debian/Ubuntu
sudo dnf install vnstat              # RHEL/Fedora
```

<a id="service-setup"></a>
<a id="heading-283-service-setup"></a>

## Cài đặt Service

```bash
# Kích hoạt và khởi động daemon vnstat (bắt buộc để thu thập dữ liệu)
sudo systemctl enable --now vnstatd

# Kiểm tra trạng thái daemon
sudo systemctl status vnstatd
```

<a id="viewing-traffic-statistics"></a>
<a id="heading-284-viewing-traffic-statistics"></a>

## Xem thống kê lưu lượng truy cập

```bash
# Tóm tắt cho tất cả các giao diện được giám sát
vnstat

# Tóm tắt cho một giao diện cụ thể
vnstat -i eth0

# Tỷ lệ trực tiếp (cập nhật mỗi giây)
vnstat -l
vnstat -l -i eth0

# Thống kê hàng giờ (ngày hiện tại)
vnstat -h
vnstat -hg              # Với đồ thị ASCII

# Thống kê hàng ngày (30 ngày qua)
vnstat -d

# Thống kê hàng tháng (12 tháng qua)
vnstat -m

# Thống kê hàng năm
vnstat -y

# Top 10 ngày theo lưu lượng truy cập
vnstat -t
vnstat -t 20            # 20 ngày hàng đầu

# Khoảng thời gian 5 phút cho giờ hiện tại
vnstat -5
vnstat -5 30            # 30 khoảng thời gian năm phút cuối cùng

# Hiển thị lưu lượng truy cập cho một phạm vi ngày cụ thể
vnstat --begin 2024-01-01 --end 2024-01-31

# Đầu ra JSON (để viết kịch bản)
vnstat --json
vnstat --json d         # Hàng ngày trong JSON
vnstat --json m         # Hàng tháng trong JSON

# đầu ra XML
vnstat --xml
```

<a id="database-management"></a>
<a id="heading-285-database-management"></a>

## Quản lý cơ sở dữ liệu

```bash
# Liệt kê các giao diện được giám sát
vnstat --iflist

# Liệt kê các giao diện trong cơ sở dữ liệu
vnstat --dbiflist

# Thêm giao diện giám sát
sudo vnstat --add -i eth0

# Xóa giao diện khỏi giám sát
sudo vnstat --remove -i eth0

# Đổi tên giao diện trong cơ sở dữ liệu
sudo vnstat --rename oldname newname

# Hiển thị vị trí tệp cơ sở dữ liệu
vnstat --config

# Đặt lại số liệu thống kê cho một giao diện
sudo vnstat --reset -i eth0

# Xóa tất cả dữ liệu cho một giao diện
sudo vnstat --delete -i eth0

# Xóa tất cả cơ sở dữ liệu
sudo vnstat --delete --force
```

<a id="configuration"></a>
<a id="heading-286-configuration"></a>

## Cấu hình

```bash
# Xem cấu hình
cat /etc/vnstat.conf

# Các cài đặt chính trong /etc/vnstat.conf:
# Cơ sở dữ liệuDir "/var/lib/vnstat"
# Giao diện "eth0"
# MaxBandwidth 1000 # Tốc độ giao diện trong Mbit/s
# UpdateInterval 20 # Tần suất cập nhật (giây)
# PollInterval 5 # Khoảng thời gian bỏ phiếu (giây)
# ThángXoay 1 # Ngày để bắt đầu đếm tháng

# Áp dụng thay đổi cấu hình
sudo systemctl restart vnstatd
```

<a id="useful-examples"></a>
<a id="heading-287-useful-examples"></a>

## Ví dụ hữu ích

```bash
# Tóm tắt băng thông nhanh cho tất cả các giao diện
vnstat --short

# Hiển thị lưu lượng truy cập kể từ một ngày cụ thể
vnstat -i eth0 --begin 2024-06-01

# So sánh hai giao diện
vnstat -i eth0 && vnstat -i eth1

# Chỉ hiển thị lưu lượng truy cập ngày hôm nay
vnstat -d 1

# Chỉ hiển thị lưu lượng truy cập của tháng này
vnstat -m 1

# Kiểm tra tổng số dữ liệu được chuyển trong tháng này
vnstat -m | grep "$(date +%Y-%m)"
```

---



<a id="40-nethogs--per-process-bandwidth-monitor"></a>
<a id="heading-288-40-nethogs-per-process-bandwidth-monitor"></a>

# 40. `nethogs` — Giám sát băng thông trên mỗi quá trình

`nethogs` hiển thị mức sử dụng băng thông mạng theo thời gian thực **trên mỗi quy trình**, không giống như `iftop` (hiển thị trên mỗi kết nối) hoặc `vnstat` (hiển thị trên mỗi giao diện). Nó nhóm các kết nối theo PID và tên chương trình.

<a id="installation-10"></a>
<a id="heading-289-installation"></a>

## Cài đặt

```bash
sudo apt install nethogs             # Debian/Ubuntu
sudo dnf install nethogs             # RHEL/Fedora
```

<a id="usage"></a>
<a id="heading-290-usage"></a>

## Cách sử dụng

```bash
# Giám sát tất cả các giao diện (yêu cầu root)
sudo nethogs

# Giám sát một giao diện cụ thể
sudo nethogs eth0
sudo nethogs ens3

# Giám sát nhiều giao diện
sudo nethogs eth0 eth1

# Đặt khoảng thời gian làm mới tính bằng giây (mặc định: 1)
sudo nethogs -d 5

# Tracemode: không tương tác, ghi lại từng thay đổi vào stdout
sudo nethogs -t eth0

# Đặt khoảng thời gian làm mới trong tracemode
sudo nethogs -t -d 2 eth0

# Hiển thị byte sent/received (chi tiết cấp 3 hiển thị cả TX và RX)
sudo nethogs -v 3

# Byte trên giây thay vì kilobyte
sudo nethogs -v 0                    # kB/s (mặc định)
sudo nethogs -v 1                    # Tổng số B
sudo nethogs -v 2                    # Tổng số kB
sudo nethogs -v 3                    # kB/s TX và RX riêng biệt

# Đánh hơi một thiết bị cụ thể bằng bộ lọc pcap
sudo nethogs -f "port 443" eth0
```

<a id="interactive-keys"></a>
<a id="heading-291-interactive-keys"></a>

## Phím tương tác

| Chìa khóa | hành động |
|-----|--------|
| `q` | Thoát |
| `s` | Sắp xếp theo băng thông đã gửi |
| `r` | Sắp xếp theo băng thông nhận được |
| `m` | Chế độ hiển thị chu kỳ (kB/s → tổng kB → tổng B → kB/s) |

<a id="reading-nethogs-output"></a>
<a id="heading-292-reading-nethogs-output"></a>

## Đọc đầu ra nethogs

```
NetHogs version 0.8.5

    PID USER     PROGRAM                      DEV        SENT      RECEIVED
  12345 root     /usr/bin/wget                eth0       0.000     145.230 KB/sec
  23456 www-data /usr/sbin/nginx              eth0       2.354       0.123 KB/sec
   5678 user     /usr/bin/chrome              eth0       0.045      23.456 KB/sec
  ......                                                ======    ========
                                                         2.399     168.809 KB/sec
```

| Cột | Ý nghĩa |
|--------|---------|
| `PID` | ID tiến trình |
| `USER` | Người dùng đang chạy tiến trình |
| `PROGRAM` | Đường dẫn đầy đủ của tệp thực thi |
| `DEV` | Giao diện mạng |
| `SENT` | Băng thông đi |
| `RECEIVED` | Băng thông vào |

<a id="non-interactive--logging"></a>
<a id="heading-293-non-interactive-logging"></a>

## Không tương tác / Ghi nhật ký

```bash
# Ghi nhật ký băng thông vào tệp (một dòng trên mỗi bản cập nhật cho mỗi quy trình)
sudo nethogs -t eth0 2>/dev/null | tee /tmp/nethogs.log

# Phân tích đầu ra tracemode của nethogs cho một chương trình cụ thể
sudo nethogs -t eth0 2>/dev/null | grep nginx

# Chạy trong 60 giây rồi thoát
sudo timeout 60 nethogs -t eth0 2>/dev/null
```

---



<a id="41-bmon--bandwidth-monitor"></a>
<a id="heading-294-41-bmon-bandwidth-monitor"></a>

# 41. `bmon` — Giám sát băng thông

`bmon` (Giám sát băng thông) là công cụ ước tính tốc độ và giám sát băng thông mạng thời gian thực. Nó hiển thị số liệu thống kê trên mỗi giao diện với biểu đồ tốc độ ASCII trực quan và bộ đếm chi tiết.

<a id="installation-11"></a>
<a id="heading-295-installation"></a>

## Cài đặt

```bash
sudo apt install bmon               # Debian/Ubuntu
sudo dnf install bmon               # RHEL/Fedora
```

<a id="basic-usage-2"></a>
<a id="heading-296-basic-usage"></a>

## Cách sử dụng cơ bản

```bash
# Giám sát tất cả các giao diện
bmon

# Giám sát một giao diện cụ thể
bmon -p eth0

# Giám sát nhiều giao diện
bmon -p eth0,lo

# Giám sát bằng mẫu (regex)
bmon -p "eth.*"

# Đặt khoảng thời gian cập nhật tính bằng mili giây (mặc định: 1000)
bmon -r 500                         # Cập nhật cứ sau 500 mili giây

# Hiển thị chi tiết giao diện ngay khi khởi động
bmon -p eth0 -s 1

# Chế độ đầu ra: văn bản đơn giản (không có TUI)
bmon -o simple

# Chế độ đầu ra: chuỗi định dạng
bmon -p eth0 -o "format:$(attr:name) rx:$(attr:rx:bytes)"

# Sử dụng lời nguyền TUI (mặc định)
bmon -o curses
```

<a id="interactive-keys-1"></a>
<a id="heading-297-interactive-keys"></a>

## Phím tương tác

| Chìa khóa | hành động |
|-----|--------|
| Phím mũi tên | Giao diện điều hướng |
| `d` | Chuyển đổi bảng chi tiết |
| `g` | Chuyển đổi hiển thị tỷ lệ đồ họa |
| `i` | Hiển thị danh sách giao diện |
| `h` | Hiển thị trợ giúp |
| `q` | Thoát |
| `1` | Chuyển đổi biểu đồ RX |
| `2` | Chuyển đổi biểu đồ TX |
| Trang Up/Down | Chi tiết cuộn |

<a id="reading-bmon-output"></a>
<a id="heading-298-reading-bmon-output"></a>

## Đọc đầu ra bmon

```
 Interface   RX bps       pps      RX bytes    RX pkts  TX bps       pps      TX bytes    TX pkts
 lo          0             0        12.3 KiB      123    0             0        12.3 KiB      123
 eth0        1.23 Mibit/s  920      567.8 MiB  1234567  234.5 Kibit/s  105      45.6 MiB   456789

 (RX rate graph — last 60 seconds)
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ 1.23M ┤ ███████████████████████                                              │
 │  614K ┤                        ████████████████                              │
 │    0  └──────────────────────────────────────────────────────────────────────┘
```

<a id="scripting--non-interactive"></a>
<a id="heading-299-scripting-non-interactive"></a>

## Viết kịch bản / Không tương tác

```bash
# Xuất văn bản đơn giản, chạy 10 chu kỳ rồi thoát
bmon -p eth0 -o simple -c 10

# Phân tích các giá trị bộ đếm cụ thể
bmon -p eth0 -o "format:(attr:name) rxrate:$(attr:rx:rate) txrate:$(attr:tx:rate)" -c 5

# Ghi lại băng thông mỗi giây trong 60 giây
bmon -p eth0 -o simple -c 60 -r 1000 | tee /tmp/bmon.log

# Chỉ hiển thị một giao diện, tất cả các quầy, TUI yên tĩnh
bmon -p eth0 -s 1 -o curses:quitafter=30
```

<a id="attributes-available-in-format-output"></a>
<a id="heading-300-attributes-available-in-format-output"></a>

## Các thuộc tính có sẵn ở định dạng đầu ra

| Thuộc tính | Mô tả |
|-----------|-------------|
| `rx:bytes` | Tổng số byte nhận được |
| `tx:bytes` | Tổng số byte được truyền |
| `rx:packets` | Tổng số gói nhận được |
| `tx:packets` | Tổng số gói được truyền |
| `rx:errors` | Nhận lỗi |
| `tx:errors` | Truyền lỗi |
| `rx:rate` | Tốc độ nhận hiện tại (bytes/sec) |
| `tx:rate` | Tốc độ truyền hiện tại (bytes/sec) |

---



<a id="42-iperf3--network-performance-testing"></a>
<a id="heading-301-42-iperf3-network-performance-testing"></a>

# 42. `iperf3` — Kiểm tra hiệu suất mạng

<a id="syntax-24"></a>
<a id="heading-302-syntax"></a>

## Cú pháp

```bash
iperf3 -s [OPTIONS]          # Máy chủ
iperf3 -c HOST [OPTIONS]     # khách hàng
```

<a id="server-flags"></a>
<a id="heading-303-server-flags"></a>

## Cờ máy chủ

| Cờ | Mô tả |
|------|-------------|
| `-s` | Chạy như máy chủ |
| `-p PORT` | Cổng nghe (mặc định: 5201) |
| `-D` | Chế độ daemon |
| `-1` | Một lần: xử lý một khách hàng rồi thoát |
| `-I FILE` | Viết PID vào tập tin |
| `--idle-timeout SEC` | Hết thời gian chờ |

<a id="client-flags"></a>
<a id="heading-304-client-flags"></a>

## Cờ khách hàng

| Cờ | Mô tả |
|------|-------------|
| `-c HOST` | Chạy với tư cách máy khách kết nối với HOST |
| `-p PORT` | Cổng máy chủ (mặc định: 5201) |
| `-t SEC` | Thời lượng thử nghiệm (mặc định: 10) |
| `-n SIZE` | Chuyển nhiều byte này |
| `-b RATE` | Băng thông mục tiêu (e.g., `100M`) |
| `-P NUM` | Luồng song song |
| `-R` | Chế độ đảo ngược (máy chủ gửi, máy khách nhận) |
| `--bidir` | Kiểm tra hai chiều |
| `-u` | Chế độ UDP |
| `-l LENGTH` | Chiều dài Buffer/packet |
| `-w SIZE` | Kích thước socket buffer/window |
| `-M MSS` | TCP MSS |
| `-N` | Đặt TCP không có độ trễ |
| `-4` / `-6` | Buộc IPv4/IPv6 |
| `-B ADDR` | Liên kết với địa chỉ |
| `-i SEC` | Khoảng thời gian báo cáo |
| `-f FORMAT` | Định dạng: `k` Kbit, `m` Mbit, `g` Gbit, `K` KBytes, `M` MByte |
| `-J` | Đầu ra JSON |
| `--logfile FILE` | Ghi log vào tệp |
| `-T TITLE` | Đầu ra tiền tố với tiêu đề |
| `--connect-timeout MS` | Thời gian chờ tối đa để kết nối |
| `-A CPU` | Mối quan hệ CPU |
| `--get-server-output` | Nhận đầu ra máy chủ trên máy khách |
| `--udp-counters-64bit` | Bộ đếm UDP 64-bit |
| `--repeating-payload` | Sử dụng mẫu lặp lại |
| `-S TOS` | Đặt TOS/DSCP |
| `--dont-fragment` | Đặt bit DF |
| `-Z` | Không sử dụng bản sao nào |
| `--timestamps[=FORMAT]` | Thêm dấu thời gian |

<a id="examples-15"></a>
<a id="heading-305-examples"></a>

## Ví dụ

```bash
# Máy chủ
iperf3 -s

# Kiểm tra khách hàng cơ bản
iperf3 -c 192.168.1.1

# Kiểm tra trong 30 giây
iperf3 -c 192.168.1.1 -t 30

# 4 luồng song song
iperf3 -c 192.168.1.1 -P 4

# Đảo ngược (kiểm tra tốc độ tải xuống)
iperf3 -c 192.168.1.1 -R

# hai chiều
iperf3 -c 192.168.1.1 --bidir

# Kiểm tra UDP ở tốc độ 100 Mbps
iperf3 -c 192.168.1.1 -u -b 100M

# Đầu ra JSON
iperf3 -c 192.168.1.1 -J > result.json

# Kích thước cửa sổ tùy chỉnh
iperf3 -c 192.168.1.1 -w 256K

# Máy chủ trên cổng tùy chỉnh
iperf3 -s -p 9999
iperf3 -c 192.168.1.1 -p 9999
```

---

<a id="43-tc--traffic-control-qos--network-emulation"></a>
<a id="heading-306-43-tc-traffic-control-qos-network-emulation"></a>

# 43. `tc` — Kiểm soát lưu lượng (QoS / Mô phỏng mạng)

`tc` (kiểm soát lưu lượng) là công cụ của hạt nhân Linux để quản lý các nguyên tắc xếp hàng mạng (qdiscs), bộ phân loại và bộ lọc. Nó được sử dụng để giới hạn băng thông, định hình lưu lượng và mô phỏng mạng (thêm độ trễ, mất gói, v.v.).

<a id="syntax-25"></a>
<a id="heading-307-syntax"></a>

## Cú pháp

```bash
tc [ OPTIONS ] OBJECT { COMMAND | help }
OBJECT := { qdisc | class | filter | action }
```

<a id="viewing-current-configuration"></a>
<a id="heading-308-viewing-current-configuration"></a>

## Xem cấu hình hiện tại

```bash
# Hiển thị qdiscs trên tất cả các giao diện
tc qdisc show

# Hiển thị qdiscs trên một giao diện cụ thể
tc qdisc show dev eth0

# Hiển thị các lớp giao thông
tc class show dev eth0

# Hiển thị bộ lọc
tc filter show dev eth0

# Hiển thị với số liệu thống kê
tc -s qdisc show dev eth0
tc -s class show dev eth0

# Hiển thị ở định dạng JSON
tc -j qdisc show dev eth0
```

<a id="network-emulation-with-netem"></a>
<a id="heading-309-network-emulation-with-netem"></a>

## Giả lập mạng với `netem`

`netem` (Trình mô phỏng mạng) bổ sung các khiếm khuyết nhân tạo — cần thiết để kiểm tra hành vi của ứng dụng trong điều kiện mạng kém.

```bash
# Thêm độ trễ (100ms)
sudo tc qdisc add dev eth0 root netem delay 100ms

# Thêm độ trễ với jitter (100ms ± 20ms)
sudo tc qdisc add dev eth0 root netem delay 100ms 20ms

# Thêm độ trễ với jitter và tương quan (tương quan 25%)
sudo tc qdisc add dev eth0 root netem delay 100ms 20ms 25%

# Thêm mất gói (5%)
sudo tc qdisc add dev eth0 root netem loss 5%

# Mất gói có tương quan (tương quan 10% - mô phỏng mất gói)
sudo tc qdisc add dev eth0 root netem loss 5% 25%

# Thêm bản sao gói
sudo tc qdisc add dev eth0 root netem duplicate 1%

# Thêm gói bị hỏng (lỗi bit)
sudo tc qdisc add dev eth0 root netem corrupt 0.1%

# Thêm sắp xếp lại gói (sắp xếp lại 5% với tương quan 50ms)
sudo tc qdisc add dev eth0 root netem delay 10ms reorder 5% 50%

# Kết hợp: độ trễ + mất + trùng lặp
sudo tc qdisc add dev eth0 root netem delay 50ms 10ms loss 2% duplicate 1%

# Thay thế (thay đổi) cài đặt netem hiện có
sudo tc qdisc change dev eth0 root netem delay 200ms

# Xóa tất cả qdiscs (khôi phục mặc định)
sudo tc qdisc del dev eth0 root

# Mô phỏng kết nối chậm (tốc độ + độ trễ)
sudo tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms
```

<a id="bandwidth-limiting-with-token-bucket-filter-tbf"></a>
<a id="heading-310-bandwidth-limiting-with-token-bucket-filter-tbf"></a>

## Giới hạn băng thông với Bộ lọc nhóm mã thông báo (`tbf`)

```bash
# Giới hạn ở 1 Mbit/s
sudo tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms

# Giới hạn ở 10 Mbit/s
sudo tc qdisc add dev eth0 root tbf rate 10mbit burst 64kbit latency 200ms

# Giới hạn ở 100 Kbit/s (rất chậm - mô phỏng trên thiết bị di động)
sudo tc qdisc add dev eth0 root tbf rate 100kbit burst 8kbit latency 1000ms

# Xóa giới hạn băng thông
sudo tc qdisc del dev eth0 root
```

<a id="hierarchical-token-bucket-htb--per-class-rate-limiting"></a>
<a id="heading-311-hierarchical-token-bucket-htb-per-class-rate-l"></a>

## Nhóm mã thông báo phân cấp (`htb`) — Giới hạn tỷ lệ trên mỗi lớp

```bash
# Tạo qdisc gốc với một lớp mặc định
sudo tc qdisc add dev eth0 root handle 1: htb default 10

# Thêm lớp gốc (trần = tốc độ liên kết đầy đủ)
sudo tc class add dev eth0 parent 1: classid 1:1 htb rate 100mbit

# Thêm lớp con cho lưu lượng "đảm bảo" (10 Mbit/s, có thể tăng lên 100)
sudo tc class add dev eth0 parent 1:1 classid 1:10 htb rate 10mbit ceil 100mbit

# Thêm lớp con cho lưu lượng "giới hạn" (tối đa 1 Mbit/s)
sudo tc class add dev eth0 parent 1:1 classid 1:20 htb rate 1mbit ceil 1mbit

# Thêm bộ lọc: Lưu lượng SSH (dport 22) → lớp 1:10 (nhanh)
sudo tc filter add dev eth0 protocol ip parent 1: prio 1 u32   match ip dport 22 0xffff flowid 1:10

# Thêm bộ lọc: Lưu lượng HTTP → lớp 1:20 (có giới hạn)
sudo tc filter add dev eth0 protocol ip parent 1: prio 2 u32   match ip dport 80 0xffff flowid 1:20
```

<a id="quick-network-impairment-examples"></a>
<a id="heading-312-quick-network-impairment-examples"></a>

## Ví dụ về suy giảm mạng nhanh

```bash
# Mô phỏng mạng di động 3G
sudo tc qdisc add dev eth0 root netem delay 100ms 20ms loss 2% rate 2mbit

# Mô phỏng liên kết vệ tinh (độ trễ cao, băng thông hạn chế)
sudo tc qdisc add dev eth0 root netem delay 600ms 100ms rate 5mbit

# Giả lập WiFi khủng
sudo tc qdisc add dev eth0 root netem delay 50ms 30ms loss 10% duplicate 2%

# Kiểm tra cài đặt đã áp dụng
tc qdisc show dev eth0

# Xóa mọi thứ
sudo tc qdisc del dev eth0 root
```

---



<a id="44-iwconfig--wireless-interface-configuration-legacy"></a>
<a id="heading-313-44-iwconfig-wireless-interface-configuration-l"></a>

# 44. `iwconfig` — Cấu hình giao diện không dây (Cũ)

`iwconfig` định cấu hình giao diện mạng không dây bằng Tiện ích mở rộng không dây API. Nó đã được **thay thế bởi `iw`** để quản lý 802.11 (Wi-Fi) trên Linux hiện đại và bởi `nmcli`/`nmtui` để quản lý kết nối đầy đủ. Nó là một phần của gói `wireless-tools`.

<a id="installation-12"></a>
<a id="heading-314-installation"></a>

## Cài đặt

```bash
sudo apt install wireless-tools      # Debian/Ubuntu
sudo dnf install wireless-tools      # RHEL/Fedora
```

<a id="viewing-wireless-information"></a>
<a id="heading-315-viewing-wireless-information"></a>

## Xem thông tin không dây

```bash
# Hiển thị cài đặt không dây cho tất cả các giao diện không dây
iwconfig

# Hiển thị cài đặt cho một giao diện cụ thể
iwconfig wlan0

# Chỉ hiển thị các giao diện có tiện ích mở rộng không dây
iwconfig 2>/dev/null | grep -v "no wireless"
```

<a id="reading-iwconfig-output"></a>
<a id="heading-316-reading-iwconfig-output"></a>

### Đọc đầu ra iwconfig

```
wlan0     IEEE 802.11  ESSID:"MyNetwork"
          Mode:Managed  Frequency:5.18 GHz  Access Point: AA:BB:CC:DD:EE:FF
          Bit Rate=300 Mb/s   Tx-Power=20 dBm
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Power Management:on
          Link Quality=65/70  Signal level=-45 dBm  Noise level=-95 dBm
          Rx invalid nwid:0  Rx invalid crypt:0  Rx invalid frag:0
          Tx excessive retries:0  Invalid misc:0   Missed beacon:0
```

| trường | Ý nghĩa |
|-------|---------|
| `ESSID` | Tên mạng (SSID) |
| `Mode` | Được quản lý (khách hàng), Ad-Hoc, Giám sát, Chính |
| `Frequency` | Tần số kênh |
| `Access Point` | BSSID của AP được kết nối |
| `Bit Rate` | Tốc độ kết nối hiện tại |
| `Tx-Power` | Công suất truyền tính bằng dBm |
| `Link Quality` | Chất lượng tín hiệu (càng cao càng tốt) |
| `Signal level` | RSSI tính bằng dBm (ít âm hơn = mạnh hơn) |
| `Noise level` | Tầng tiếng ồn nền |

<a id="configuring-wireless"></a>
<a id="heading-317-configuring-wireless"></a>

## Định cấu hình không dây

```bash
# Đặt SSID (tên mạng)
sudo iwconfig wlan0 essid "MyNetwork"

# Kết nối với mạng ẩn
sudo iwconfig wlan0 essid "HiddenNet" ap any

# Đặt kênh
sudo iwconfig wlan0 channel 6

# Đặt tần số
sudo iwconfig wlan0 freq 2.437G

# Đặt công suất phát (tính bằng mW hoặc dBm)
sudo iwconfig wlan0 txpower 20
sudo iwconfig wlan0 txpower 100mW

# Đặt khóa mã hóa (WEP - cũ, không an toàn)
sudo iwconfig wlan0 key s:mypassword

# Tắt mã hóa
sudo iwconfig wlan0 key off

# Đặt chế độ giao diện
sudo iwconfig wlan0 mode Managed   # Chế độ máy khách (mặc định)
sudo iwconfig wlan0 mode Monitor   # Chụp tất cả các gói (yêu cầu root)
sudo iwconfig wlan0 mode Ad-Hoc    # Ngang hàng

# Đặt tốc độ bit
sudo iwconfig wlan0 rate 54M
sudo iwconfig wlan0 rate auto      # Hãy để tài xế quyết định

# Kích hoạt quản lý năng lượng
sudo iwconfig wlan0 power on

# Tắt quản lý nguồn (hữu ích cho các ứng dụng nhạy cảm với độ trễ)
sudo iwconfig wlan0 power off

# Đặt ngưỡng RTS/CTS
sudo iwconfig wlan0 rts 500        # Kích hoạt RTS cho các gói> 500 byte
sudo iwconfig wlan0 rts off        # Vô hiệu hóa

# Cam kết thay đổi thẻ
sudo iwconfig wlan0 commit
```

<a id="modern-equivalent"></a>
<a id="heading-318-modern-equivalent"></a>

## Tương đương hiện đại

Đối với các hệ thống hiện đại, hãy sử dụng `iw` (phần 45) để quản lý Wi-Fi cấp thấp và `nmcli` (phần 24) để quản lý kết nối.

| `iwconfig` | Tương đương `iw` |
|------------|-----------------|
| `iwconfig wlan0` | `iw dev wlan0 info` |
| `iwconfig wlan0 essid "Net"` | `iw dev wlan0 connect "Net"` |
| `iwconfig wlan0 mode Monitor` | `iw dev wlan0 set type monitor` |
| `iwconfig wlan0 channel 6` | `iw dev wlan0 set channel 6` |
| `iwconfig wlan0 txpower 20` | `iw dev wlan0 set txpower fixed 2000` |

---



<a id="45-iw--wireless-configuration-modern"></a>
<a id="heading-319-45-iw-wireless-configuration-modern"></a>

# 45. `iw` — Cấu hình không dây (Hiện đại)

`iw` là công cụ dòng lệnh hiện đại để quản lý các thiết bị không dây và cấu hình của chúng. Nó sử dụng giao diện netlink nl80211 và thay thế `iwconfig` để quản lý không dây 802.11.

<a id="installation-13"></a>
<a id="heading-320-installation"></a>

## Cài đặt

```bash
sudo apt install iw                 # Debian/Ubuntu
sudo dnf install iw                 # RHEL/Fedora
```

<a id="viewing-information"></a>
<a id="heading-321-viewing-information"></a>

## Xem thông tin

```bash
# Liệt kê tất cả các thiết bị và giao diện không dây
iw dev

# Hiển thị thông tin giao diện (chế độ, kênh, SSID, BSSID)
iw dev wlan0 info

# Hiển thị khả năng của thiết bị vật lý (radio)
iw phy

# Hiển thị thông tin phy cụ thể
iw phy phy0 info

# Hiển thị các chế độ giao diện được hỗ trợ
iw phy phy0 info | grep "Supported interface modes" -A 10

# Hiển thị trạng thái connection/link
iw dev wlan0 link

# Hiển thị thông tin trạm (chi tiết AP được kết nối)
iw dev wlan0 station dump

# Hiển thị kết quả quét (được lưu trong bộ nhớ đệm)
iw dev wlan0 scan dump

# Kích hoạt quét mới và hiển thị kết quả
sudo iw dev wlan0 scan

# Hiển thị SSID/BSSID/signal của các mạng hiển thị
sudo iw dev wlan0 scan | grep -E "SSID:|BSS |signal:"

# Hiển thị miền quy định
iw reg get

# Hiển thị các kênh được hỗ trợ cho miền quy định hiện tại
iw phy phy0 channels
```

<a id="connecting-to-a-network"></a>
<a id="heading-322-connecting-to-a-network"></a>

## Kết nối với mạng

```bash
# Kết nối với mạng mở (không được mã hóa)
sudo iw dev wlan0 connect "NetworkName"

# Kết nối với mạng mở bằng BSSID
sudo iw dev wlan0 connect "NetworkName" 00:11:22:33:44:55

# Kết nối trên frequency/channel cụ thể
sudo iw dev wlan0 connect "NetworkName" 2412            # 2.4GHz kênh 1

# Ngắt kết nối
sudo iw dev wlan0 disconnect
```

> **Lưu ý:** Đối với mạng WPA/WPA2, `iw connect` không xử lý mã hóa. Sử dụng `wpa_supplicant` + `wpa_cli` hoặc `nmcli`/`nmtui` cho mạng bảo mật.

<a id="interface-management"></a>
<a id="heading-323-interface-management"></a>

## Quản lý giao diện

```bash
# Tạo giao diện không dây mới
sudo iw dev wlan0 interface add wlan0mon type monitor    # Chế độ giám sát iface
sudo iw phy phy0 interface add wlan1 type managed       # Iface được quản lý bổ sung

# Xóa một giao diện
sudo iw dev wlan0mon del

# Đặt loại giao diện
sudo ip link set wlan0 down
sudo iw dev wlan0 set type monitor        # Chế độ giám sát
sudo iw dev wlan0 set type managed        # Chế độ được quản lý (khách hàng)
sudo ip link set wlan0 up

# Đặt kênh
sudo iw dev wlan0 set channel 6           # 2.4GHz kênh 6
sudo iw dev wlan0 set channel 36          # kênh 5GHz 36
sudo iw dev wlan0 set channel 6 HT40+    # Kênh rộng 40 MHz

# Đặt tần số trực tiếp (tính bằng MHz)
sudo iw dev wlan0 set freq 2437           # Kênh 6
sudo iw dev wlan0 set freq 5180           # kênh 5GHz 36

# Đặt công suất phát (tính bằng mBm = dBm × 100)
sudo iw dev wlan0 set txpower fixed 2000  # 20 dBm
sudo iw dev wlan0 set txpower auto        # Để tài xế quản lý

# Bật tiết kiệm điện
sudo iw dev wlan0 set power_save on
sudo iw dev wlan0 set power_save off

# Nhận trạng thái tiết kiệm năng lượng
iw dev wlan0 get power_save
```

<a id="regulatory-domain"></a>
<a id="heading-324-regulatory-domain"></a>

## Miền quy định

```bash
# Đặt miền quy định (mã quốc gia)
sudo iw reg set US
sudo iw reg set DE
sudo iw reg set JP

# Hiển thị thông tin quy định hiện tại
iw reg get
```

<a id="statistics-and-monitoring"></a>
<a id="heading-325-statistics-and-monitoring"></a>

## Thống kê và giám sát

```bash
# Hiển thị cường độ tín hiệu nhận được và số liệu thống kê TX/RX
iw dev wlan0 link

# Hiển thị số liệu thống kê chi tiết cho trạm được kết nối (AP)
iw dev wlan0 station dump

# Hiển thị số liệu thống kê trên mỗi gói
iw dev wlan0 survey dump

# Theo dõi các sự kiện trong thời gian thực
iw event
iw event -f          # Với thời gian
iw event -t          # Với dấu thời gian
```

---



<a id="46-brctl--bridge-control-legacy"></a>
<a id="heading-326-46-brctl-bridge-control-legacy"></a>

# 46. `brctl` — Điều khiển cầu (Di sản)

`brctl` quản lý cầu nối Ethernet — kết nối nhiều phân đoạn mạng ở Lớp 2. Nó đã được **thay thế bởi `bridge`** và `ip link` trên Linux hiện đại. Một phần của gói `bridge-utils`.

<a id="installation-14"></a>
<a id="heading-327-installation"></a>

## Cài đặt

```bash
sudo apt install bridge-utils        # Debian/Ubuntu
sudo dnf install bridge-utils        # RHEL/Fedora
```

<a id="viewing-bridge-configuration"></a>
<a id="heading-328-viewing-bridge-configuration"></a>

## Xem cấu hình cầu

```bash
# Liệt kê tất cả các cây cầu
brctl show

# Hiển thị một cây cầu cụ thể
brctl show br0

# Hiển thị trạng thái giao thức cây bao trùm (STP)
brctl showstp br0

# Hiển thị bảng địa chỉ MAC (cơ sở dữ liệu chuyển tiếp)
brctl showmacs br0
```

<a id="reading-brctl-show-output"></a>
<a id="heading-329-reading-brctl-show-output"></a>

### Đọc chương trình brctl Đầu ra

```
bridge name  bridge id          STP enabled  interfaces
br0          8000.000c29abc123  no           eth0
                                             eth1
virbr0       8000.525400123456  yes          virbr0-nic
```

<a id="creating-and-managing-bridges"></a>
<a id="heading-330-creating-and-managing-bridges"></a>

## Tạo và quản lý cầu

```bash
# Tạo một cây cầu mới
sudo brctl addbr br0

# Xóa một cây cầu (phải hạ xuống trước)
sudo ip link set br0 down
sudo brctl delbr br0

# Thêm giao diện vào cây cầu
sudo brctl addif br0 eth0
sudo brctl addif br0 eth1

# Xóa giao diện khỏi cầu nối
sudo brctl delif br0 eth0

# Mang lên cây cầu
sudo ip link set br0 up

# Gán IP cho bridge
sudo ip addr add 192.168.1.1/24 dev br0
```

<a id="spanning-tree-protocol-stp"></a>
<a id="heading-331-spanning-tree-protocol-stp"></a>

## Giao thức cây kéo dài (STP)

```bash
# Kích hoạt STP trên cầu (ngăn vòng lặp)
sudo brctl stp br0 on

# Tắt STP
sudo brctl stp br0 off

# Đặt mức độ ưu tiên của cầu nối (thấp hơn = nhiều khả năng là cầu nối gốc hơn)
sudo brctl setbridgeprio br0 32768

# Đặt mức độ ưu tiên của cổng
sudo brctl setportprio br0 eth0 128

# Đặt thời gian chào (giây giữa các gói xin chào)
sudo brctl sethello br0 2

# Đặt tuổi tối đa (giây trước khi cổng chuyển sang trạng thái chuyển tiếp)
sudo brctl setmaxage br0 20

# Đặt độ trễ chuyển tiếp (giây trước khi vào trạng thái chuyển tiếp)
sudo brctl setfd br0 15

# Đặt chi phí đường dẫn cho một cổng (thấp hơn = đường dẫn ưa thích)
sudo brctl setpathcost br0 eth0 100
```

<a id="modern-equivalents-prefer-these-3"></a>
<a id="heading-332-modern-equivalents-prefer-these"></a>

## Tương đương hiện đại (thích những cái này)

```bash
# Tạo cầu
sudo ip link add br0 type bridge

# Thêm giao diện vào cầu
sudo ip link set eth0 master br0

# Xóa giao diện
sudo ip link set eth0 nomaster

# Hiển thị cầu
bridge link show

# Hiển thị FDB (cơ sở dữ liệu chuyển tiếp)
bridge fdb show
```

| `brctl` | Hiện đại tương đương |
|---------|------------------|
| `brctl show` | `bridge link show` |
| `brctl addbr br0` | `ip link add br0 type bridge` |
| `brctl delbr br0` | `ip link del br0` |
| `brctl addif br0 eth0` | `ip link set eth0 master br0` |
| `brctl delif br0 eth0` | `ip link set eth0 nomaster` |
| `brctl showmacs br0` | `bridge fdb show br br0` |
| `brctl stp br0 on` | `ip link set br0 type bridge stp_state 1` |

---



<a id="47-bridge--bridge-management-modern"></a>
<a id="heading-333-47-bridge-bridge-management-modern"></a>

# 47. `bridge` — Quản lý cầu (Hiện đại)

Lệnh `bridge` từ gói `iproute2` quản lý cầu nối Ethernet, cơ sở dữ liệu chuyển tiếp (FDB), lọc Vlan và phát đa hướng. Nó là sự thay thế hiện đại cho `brctl`.

<a id="viewing-bridge-state"></a>
<a id="heading-334-viewing-bridge-state"></a>

## Xem trạng thái cầu

```bash
# Hiển thị tất cả các cổng cầu và trạng thái của chúng
bridge link show

# Hiển thị liên kết cầu nối cho một giao diện cụ thể
bridge link show dev eth0

# Hiển thị cơ sở dữ liệu chuyển tiếp (FDB - MAC → ánh xạ cổng)
bridge fdb show

# Hiển thị FDB cho một cây cầu cụ thể
bridge fdb show br br0

# Hiển thị FDB cho một giao diện cụ thể
bridge fdb show dev eth0

# Hiển thị cơ sở dữ liệu Vlan
bridge vlan show

# Hiển thị Vlan cho một giao diện cụ thể
bridge vlan show dev eth0

# Hiển thị các cổng của bộ định tuyến multicast
bridge mdb show

# Hiển thị cơ sở dữ liệu multicast cho một cây cầu cụ thể
bridge mdb show dev br0

# Hiển thị thông tin STP (cây bao trùm)
bridge link show | grep -i state

# đầu ra dài dòng
bridge -d link show
bridge -d fdb show
```

<a id="managing-fdb-entries"></a>
<a id="heading-335-managing-fdb-entries"></a>

## Quản lý các mục nhập FDB

```bash
# Thêm mục nhập FDB tĩnh (MAC → cổng)
sudo bridge fdb add 00:11:22:33:44:55 dev eth0

# Thêm dưới dạng mục nhập vĩnh viễn (sẽ không bị lỗi thời)
sudo bridge fdb add 00:11:22:33:44:55 dev eth0 permanent

# Thêm làm mục nhập bên ngoài (được sử dụng trong mạng VXLAN/overlay)
sudo bridge fdb add 00:11:22:33:44:55 dev vxlan0 dst 192.168.1.10

# Xóa mục nhập FDB
sudo bridge fdb del 00:11:22:33:44:55 dev eth0

# Xóa tất cả các mục cho một giao diện
sudo bridge fdb flush dev eth0
```

<a id="vlan-management-vlan-aware-bridge"></a>
<a id="heading-336-vlan-management-vlan-aware-bridge"></a>

## Quản lý Vlan (Cầu nhận biết Vlan)

```bash
# Hiển thị tất cả VLAN
bridge vlan show

# Thêm VLAN 10 vào cổng cầu (cổng truy cập - không được gắn thẻ)
sudo bridge vlan add dev eth1 vid 10 pvid untagged

# Thêm VLAN 20 dưới dạng được gắn thẻ (cổng trung kế)
sudo bridge vlan add dev eth2 vid 20

# Thêm phạm vi Vlan
sudo bridge vlan add dev eth2 vid 10-20

# Đặt Vlan gốc (PVID) cho lưu lượng không được gắn thẻ
sudo bridge vlan add dev eth1 vid 100 pvid untagged master

# Xóa Vlan khỏi một cổng
sudo bridge vlan del dev eth1 vid 10

# Xóa phạm vi Vlan
sudo bridge vlan del dev eth2 vid 10-20
```

<a id="multicast-database-mdb"></a>
<a id="heading-337-multicast-database-mdb"></a>

## Cơ sở dữ liệu đa hướng (MDB)

```bash
# Hiển thị cơ sở dữ liệu đa hướng
bridge mdb show

# Thêm một mục multicast tĩnh
sudo bridge mdb add dev br0 port eth1 grp 224.0.0.1

# Xóa mục phát đa hướng
sudo bridge mdb del dev br0 port eth1 grp 224.0.0.1
```

<a id="monitor-bridge-events"></a>
<a id="heading-338-monitor-bridge-events"></a>

## Giám sát sự kiện cầu

```bash
# Giám sát các sự kiện cầu trong thời gian thực
bridge monitor all

# Chỉ theo dõi các sự kiện liên kết
bridge monitor link

# Chỉ giám sát các sự kiện FDB
bridge monitor fdb

# Chỉ giám sát các sự kiện VLAN
bridge monitor vlan
```

<a id="bridge-setup-using-ip--bridge-together"></a>
<a id="heading-339-bridge-setup-using-ip-bridge-together"></a>

## Thiết lập cầu nối (Sử dụng ip + bridge cùng nhau)

```bash
# Ví dụ về thiết lập cầu đầy đủ
sudo ip link add name br0 type bridge
sudo ip link set br0 up

# Add STP
sudo ip link set br0 type bridge stp_state 1

# Thêm giao diện vào cầu nối
sudo ip link set eth0 master br0
sudo ip link set eth1 master br0

# Gán IP cho bridge
sudo ip addr add 192.168.1.100/24 dev br0

# Xác minh
bridge link show
ip addr show br0
```

---



<a id="48-tunctl--ip-tuntap--tuntap-devices"></a>
<a id="heading-340-48-tunctl-ip-tuntap-tuntap-devices"></a>

# 48. `tunctl` / `ip tuntap` — Thiết bị TUN/TAP

TUN và TAP là các thiết bị mạng ảo:
- **TUN** (đường hầm): Hoạt động ở Lớp 3 (gói IP). Được sử dụng bởi VPN (OpenVPN, WireGuard).
- **TAP** (chạm): Hoạt động ở Lớp 2 (khung Ethernet). Được sử dụng cho mạng và cầu nối VM.

`tunctl` là công cụ kế thừa; `ip tuntap` từ `iproute2` là cách tiếp cận hiện đại.

<a id="installation-tunctl"></a>
<a id="heading-341-installation-tunctl"></a>

## Cài đặt (tunctl)

```bash
sudo apt install uml-utilities       # Debian/Ubuntu
```

<a id="creating-tuntap-devices-with-ip-tuntap"></a>
<a id="heading-342-creating-tuntap-devices-with-ip-tuntap"></a>

## Tạo thiết bị TUN/TAP với `ip tuntap`

```bash
# Tạo thiết bị TUN
sudo ip tuntap add dev tun0 mode tun

# Tạo thiết bị TAP
sudo ip tuntap add dev tap0 mode tap

# Tạo và cho phép một người dùng cụ thể sử dụng nó (không cần root)
sudo ip tuntap add dev tun0 mode tun user username
sudo ip tuntap add dev tap0 mode tap user username group groupname

# Tạo với các cờ cụ thể
sudo ip tuntap add dev tun0 mode tun one_queue   # Hàng đợi gói đơn
sudo ip tuntap add dev tun0 mode tun pi           # Bao gồm tiêu đề thông tin gói
sudo ip tuntap add dev tun0 mode tun vnet_hdr     # Cú đánh đầu vào lưới của Virtio

# Xóa thiết bị TUN/TAP
sudo ip tuntap del dev tun0 mode tun
sudo ip tuntap del dev tap0 mode tap

# Liệt kê tất cả các thiết bị TUN/TAP
ip tuntap show

# Đưa máy lên và gán IP
sudo ip link set tun0 up
sudo ip addr add 10.8.0.1/24 dev tun0
```

<a id="legacy-tunctl-commands"></a>
<a id="heading-343-legacy-tunctl-commands"></a>

## Các lệnh `tunctl` kế thừa

```bash
# Tạo giao diện TUN
sudo tunctl -t tun0

# Tạo cho một người dùng cụ thể
sudo tunctl -t tun0 -u username

# Tạo giao diện TAP
sudo tunctl -t tap0 -n       # -n không có chế độ liên tục

# Xóa giao diện TUN/TAP
sudo tunctl -d tun0

# Liệt kê các giao diện TUN/TAP
cat /proc/net/dev | grep -E "tun|tap"
```

<a id="persistent-vs-ephemeral"></a>
<a id="heading-344-persistent-vs-ephemeral"></a>

## Cấu hình lâu dài và cấu hình tạm thời

- **Liên tục:** Thiết bị vẫn tồn tại sau khi tạo các lần thoát quá trình (mặc định với `ip tuntap`)
- **Vô thời:** Thiết bị bị xóa khi quá trình tạo đóng fd (được sử dụng bởi daemon VPN)

```bash
# Tạo liên tục (tồn tại sau khi thoát shell này)
sudo ip tuntap add dev tun0 mode tun

# Xác minh tính kiên trì
ip link show tun0

# Xóa thủ công khi hoàn tất
sudo ip tuntap del dev tun0 mode tun
```

<a id="manual-vpn-tunnel-point-to-point"></a>
<a id="heading-345-manual-vpn-tunnel-point-to-point"></a>

## Đường hầm VPN thủ công (Điểm-điểm)

```bash
# ── Phía máy chủ ──
sudo ip tuntap add dev tun0 mode tun
sudo ip link set tun0 up
sudo ip addr add 10.8.0.1 peer 10.8.0.2 dev tun0

# ── Phía khách hàng ──
sudo ip tuntap add dev tun0 mode tun
sudo ip link set tun0 up
sudo ip addr add 10.8.0.2 peer 10.8.0.1 dev tun0

# Định tuyến giao thông qua đường hầm
sudo ip route add 192.168.0.0/16 dev tun0
```

<a id="attach-tap-to-a-bridge-vm-networking"></a>
<a id="heading-346-attach-tap-to-a-bridge-vm-networking"></a>

## Đính kèm TAP vào cầu nối (Mạng VM)

```bash
# Tạo thiết bị TAP cho VM
sudo ip tuntap add dev tap-vm1 mode tap

# Thêm vào một cây cầu
sudo ip link set tap-vm1 master br0
sudo ip link set tap-vm1 up

# Xác minh
bridge link show dev tap-vm1
```

---



<a id="49-vconfig--ip-link--vlan-management"></a>
<a id="heading-347-49-vconfig-ip-link-vlan-management"></a>

# 49. `vconfig` / `ip link` — Quản lý Vlan

Vlan (mạng LAN ảo) phân đoạn lưu lượng mạng bằng cách gắn thẻ các khung Ethernet bằng ID Vlan (802.1Q). `vconfig` là công cụ kế thừa; `ip link` với `type vlan` là cách tiếp cận hiện đại.

<a id="installation-vconfig"></a>
<a id="heading-348-installation-vconfig"></a>

## Cài đặt (vconfig)

```bash
sudo apt install vlan                # Debian/Ubuntu
sudo dnf install vconfig             # RHEL/Fedora
```

<a id="creating-vlan-interfaces-with-ip-link-modern"></a>
<a id="heading-349-creating-vlan-interfaces-with-ip-link-modern"></a>

## Tạo giao diện Vlan với `ip link` (Hiện đại)

```bash
# Tạo giao diện Vlan (Vlan ID 100 trên eth0)
sudo ip link add link eth0 name eth0.100 type vlan id 100

# Mang nó lên
sudo ip link set eth0.100 up

# Gán địa chỉ IP
sudo ip addr add 192.168.100.1/24 dev eth0.100

# Xóa giao diện Vlan
sudo ip link delete eth0.100

# Hiển thị chi tiết VLAN
ip -d link show eth0.100

# Liệt kê tất cả các giao diện VLAN
ip link show type vlan

# Hiển thị chi tiết VLAN
ip -d link show type vlan
```

<a id="vlan-options"></a>
<a id="heading-350-vlan-options"></a>

## Tùy chọn Vlan

```bash
# Vlan với giao thức cụ thể (mặc định 802.1Q, 802.1ad cho Q-in-Q)
sudo ip link add link eth0 name eth0.100 type vlan id 100 proto 802.1Q
sudo ip link add link eth0 name eth0.200 type vlan id 200 proto 802.1ad

# Liên kết lỏng lẻo (không kiểm tra xem giao diện vật lý có hoạt động không)
sudo ip link add link eth0 name eth0.100 type vlan id 100 loose_binding on

# Tắt tính năng lọc Vlan trên Rx (chấp nhận tất cả các thẻ Vlan)
sudo ip link add link eth0 name eth0.100 type vlan id 100 reorder_hdr off
```

<a id="legacy-vconfig-commands"></a>
<a id="heading-351-legacy-vconfig-commands"></a>

## Các lệnh `vconfig` kế thừa

```bash
# Tải mô-đun 8021q
sudo modprobe 8021q

# Thêm giao diện VLAN
sudo vconfig add eth0 100           # Tạo eth0.100

# Xóa giao diện Vlan
sudo vconfig rem eth0.100

# Đặt ánh xạ ưu tiên đầu ra
sudo vconfig set_egress_map eth0.100 0 7

# Đặt ánh xạ ưu tiên xâm nhập
sudo vconfig set_ingress_map eth0.100 7 0

# Đặt cờ (e.g., REORDER_HDR)
sudo vconfig set_flag eth0.100 1 1
```

<a id="persistent-vlan-configuration"></a>
<a id="heading-352-persistent-vlan-configuration"></a>

## Cấu hình VLAN liên tục

<a id="netplan-ubuntu-2004"></a>
<a id="heading-353-netplan-ubuntu-2004"></a>

### Kế hoạch mạng (Ubuntu 20.04+)

```yaml
# /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: false
  vlans:
    eth0.100:
      id: 100
      link: eth0
      addresses: [192.168.100.1/24]
      gateway4: 192.168.100.254
      nameservers:
        addresses: [8.8.8.8]
    eth0.200:
      id: 200
      link: eth0
      dhcp4: true
```

```bash
# Áp dụng cấu hình Netplan
sudo netplan apply
```

<a id="networkmanager-nmcli"></a>
<a id="heading-354-networkmanager-nmcli"></a>

### Trình quản lý mạng (nmcli)

```bash
# Tạo kết nối VLAN
nmcli con add type vlan   con-name "vlan100"   ifname eth0.100   dev eth0   id 100   ip4 192.168.100.1/24   gw4 192.168.100.254

# Đưa lên
nmcli con up vlan100

# Xóa
nmcli con del vlan100
```

<a id="verifying-vlans"></a>
<a id="heading-355-verifying-vlans"></a>

## Xác minh Vlan

```bash
# Hiển thị tất cả các giao diện VLAN
ip link show type vlan

# Hiển thị thông tin Vlan (kernel nhìn thấy)
cat /proc/net/vlan/config

# Nắm bắt lưu lượng truy cập được gắn thẻ Vlan
sudo tcpdump -i eth0 -e -n vlan

# Chụp Vlan cụ thể
sudo tcpdump -i eth0 -e vlan 100
```

---



<a id="50-dhclient--dhcp-client"></a>
<a id="heading-356-50-dhclient-dhcp-client"></a>

# 50. `dhclient` — Máy khách DHCP

`dhclient` (ISC DHCP client) requests và quản lý việc gán địa chỉ IP từ máy chủ DHCP. Nó được bao gồm trong `isc-dhcp-client`. Thay vào đó, nhiều hệ thống hiện đại sử dụng `NetworkManager` hoặc `systemd-networkd` cho DHCP.

<a id="installation-15"></a>
<a id="heading-357-installation"></a>

## Cài đặt

```bash
sudo apt install isc-dhcp-client     # Debian/Ubuntu
sudo dnf install dhcp-client         # RHEL/Fedora
```

<a id="basic-usage-3"></a>
<a id="heading-358-basic-usage"></a>

## Cách sử dụng cơ bản

```bash
# Yêu cầu địa chỉ DHCP trên một giao diện
sudo dhclient eth0

# Yêu cầu và đi tới nền (daemonize)
sudo dhclient -q eth0

# Giải phóng hợp đồng thuê hiện tại (thông báo với máy chủ rằng bạn đã hoàn tất)
sudo dhclient -r eth0

# Phát hành và yêu cầu lại
sudo dhclient -r eth0 && sudo dhclient eth0

# Buộc gia hạn (yêu cầu lại mà không giải phóng)
sudo dhclient -1 eth0

# Yêu cầu trên tất cả các giao diện
sudo dhclient
```

<a id="verbose-and-debug"></a>
<a id="heading-359-verbose-and-debug"></a>

## Dài dòng và gỡ lỗi

```bash
# Đầu ra dài dòng (hiển thị cuộc hội thoại DHCP)
sudo dhclient -v eth0

# Chế độ gỡ lỗi (rất dài dòng)
sudo dhclient -d -v eth0

# Đừng thực sự cấu hình - chỉ hiển thị những gì sẽ xảy ra
sudo dhclient -n eth0
```

<a id="lease-files"></a>
<a id="heading-360-lease-files"></a>

## Tập tin cho thuê

Hợp đồng thuê DHCP được lưu trữ trong `/var/lib/dhclient/` hoặc `/var/lib/NetworkManager/`:

```bash
# Xem hợp đồng thuê hiện tại
cat /var/lib/dhclient/dhclient.leases

# Xem hợp đồng thuê cho một giao diện cụ thể
cat /var/lib/dhclient/dhclient.eth0.leases

# Các trường tệp cho thuê
# thuê {
#   giao diện "eth0";
#   địa chỉ cố định 192.168.1.100;
#   tùy chọn mặt nạ mạng con 255.255.255.0;
#   bộ định tuyến tùy chọn 192.168.1.1;
#   tùy chọn máy chủ tên miền 8.8.8.8, 8.8.4.4;
#   tên miền tùy chọn "example.local";
#   gia hạn 2 2024/06/04 12:00:00;
#   buộc lại 2 2024/06/04 21:00:00;
#   hết hạn 2 2024/06/04 23:00:00;
# }
```

<a id="configuration-file"></a>
<a id="heading-361-configuration-file"></a>

## Tệp cấu hình

```bash
# View/edit dhclient.conf
cat /etc/dhcp/dhclient.conf

# Cài đặt dhclient.conf phổ biến:
# thời gian chờ 60;                          # Đợi 60 giây để có phản hồi DHCP
# thử lại 60;                            # Thử lại sau mỗi 60 giây
# khởi động lại 10;                           # Cố gắng lấy cùng một IP trong 10 giây khi khởi động lại
# chọn thời gian chờ 5;                    # Chờ phản hồi trước khi chọn

# Chỉ định tên máy chủ để gửi đến máy chủ DHCP
# gửi tên máy chủ "myserver";

# Yêu cầu các tùy chọn cụ thể
# yêu cầu mặt nạ mạng con, địa chỉ quảng bá, bộ định tuyến,
#         máy chủ tên miền, tên miền, tên máy chủ;

# Thay thế DNS (sử dụng của riêng bạn bất kể DHCP nói gì)
# thay thế máy chủ tên miền 8.8.8.8, 1.1.1.1;

# Thêm máy chủ DNS trước máy chủ do DHCP cung cấp
# thêm vào máy chủ tên miền 127.0.0.1;

# Từ chối lời đề nghị từ máy chủ DHCP xấu
# từ chối 192.168.1.50;

# Yêu cầu một IP cụ thể
# gửi địa chỉ được yêu cầu dhcp 192.168.1.100;
```

<a id="script-hooks"></a>
<a id="heading-362-script-hooks"></a>

## Móc tập lệnh

dhclient chạy tập lệnh `/etc/dhcp/dhclient-exit-hooks.d/` trong các sự kiện:

```bash
# Liệt kê các hook có sẵn
ls /etc/dhcp/dhclient-exit-hooks.d/

# Tạo hook tùy chỉnh (chạy khi được gán IP)
cat > /etc/dhcp/dhclient-exit-hooks.d/my-hook << 'EOF'
#!/bin/bash
if [ "$reason" = "BOUND" ] || [ "$reason" = "RENEW" ]; then
    echo "Got IP: $new_ip_address" >> /var/log/dhclient-events.log
fi
EOF
chmod +x /etc/dhcp/dhclient-exit-hooks.d/my-hook
```

<a id="modern-alternatives"></a>
<a id="heading-363-modern-alternatives"></a>

## Các lựa chọn thay thế hiện đại

Trên các hệ thống được quản lý bởi NetworkManager:

```bash
# Gia hạn DHCP qua nmcli
nmcli device reapply eth0

# Hoặc trả lại kết nối
nmcli con down "Wired connection 1" && nmcli con up "Wired connection 1"
```

Trên các hệ thống được quản lý bởi systemd-networkd:

```bash
# Gia hạn DHCP
sudo networkctl renew eth0

# Buộc kết nối lại
sudo networkctl down eth0 && sudo networkctl up eth0
```

---



<a id="51-resolvectl--systemd-resolve--dns-resolution-management"></a>
<a id="heading-364-51-resolvectl-systemd-resolve-dns-resolution-"></a>

# 51. `resolvectl` / `systemd-resolve` — Quản lý phân giải DNS

`resolvectl` (trước đây là `systemd-resolve`) kiểm soát và truy vấn `systemd-resolved`, trình nền trình phân giải sơ khai DNS cục bộ được sử dụng trên hầu hết các bản phân phối Linux dựa trên systemd hiện đại.

<a id="status-and-diagnostics"></a>
<a id="heading-365-status-and-diagnostics"></a>

## Trạng thái và chẩn đoán

```bash
# Hiển thị trạng thái tổng thể của tất cả các giao diện
resolvectl status

# Hiển thị trạng thái cho một giao diện cụ thể
resolvectl status eth0

# Hiển thị số liệu thống kê DNS (lượt truy cập bộ đệm, truy vấn, lỗi)
resolvectl statistics

# Đặt lại số liệu thống kê
resolvectl reset-statistics

# Hiển thị máy chủ DNS hiện tại trên mỗi giao diện
resolvectl dns

# Hiển thị miền tìm kiếm hiện tại trên mỗi giao diện
resolvectl domain
```

<a id="querying-dns"></a>
<a id="heading-366-querying-dns"></a>

## Truy vấn DNS

```bash
# Giải quyết tên máy chủ (Bản ghi)
resolvectl query example.com

# Chỉ giải quyết địa chỉ IPv4
resolvectl query -4 example.com

# Chỉ giải quyết địa chỉ IPv6
resolvectl query -6 example.com

# Tra cứu ngược DNS
resolvectl query 8.8.8.8

# Tra cứu một loại bản ghi cụ thể
resolvectl query --type=MX example.com
resolvectl query --type=AAAA example.com
resolvectl query --type=TXT example.com
resolvectl query --type=NS example.com
resolvectl query --type=SOA example.com
resolvectl query --type=SRV _http._tcp.example.com

# Trạng thái xác thực DNSSEC
resolvectl query --validate example.com

# Tra cứu một dịch vụ (bản ghi SRV)
resolvectl service _http._tcp example.com

# Mở bản ghi TLSA (DANE)
resolvectl tlsa tcp example.com:443
```

<a id="configuring-per-interface-dns"></a>
<a id="heading-367-configuring-per-interface-dns"></a>

## Định cấu hình trên mỗi giao diện DNS

```bash
# Đặt máy chủ DNS cho giao diện
resolvectl dns eth0 8.8.8.8 8.8.4.4

# Đặt máy chủ DNS + miền tìm kiếm
resolvectl dns eth0 8.8.8.8
resolvectl domain eth0 example.com example.local

# Thêm miền DNS (dành cho DNS có đường chân trời chia đôi)
resolvectl domain eth0 ~corporate.internal

# Đặt cờ định tuyến mặc định (sử dụng giao diện này cho tất cả DNS)
resolvectl default-route eth0 yes

# Xóa cài đặt trên mỗi giao diện (hoàn nguyên về cấu hình chung)
resolvectl revert eth0
```

<a id="flushing-and-resetting"></a>
<a id="heading-368-flushing-and-resetting"></a>

## Xả và đặt lại

```bash
# Xóa tất cả bộ đệm DNS
resolvectl flush-caches

# Đặt lại tất cả cài đặt DNS
resolvectl reset-server-features

# Tải lại tất cả cài đặt từ tập tin cấu hình
sudo systemctl reload systemd-resolved
```

<a id="configuration-files-1"></a>
<a id="heading-369-configuration-files"></a>

## Tệp cấu hình

```bash
# Tập tin cấu hình chính
cat /etc/systemd/resolved.conf

# Cấu hình dành riêng cho giao diện (thả vào)
ls /etc/systemd/resolved.conf.d/

# Các cài đặt chính trong resolved.conf:
# [Giải quyết]
# DNS=8.8.8.8 1.1.1.1 # Máy chủ DNS toàn cầu
# FallbackDNS=8.8.4.4 1.0.0.1 # Máy chủ dự phòng
# Tên miền=example.com # Tên miền tìm kiếm mặc định
# DNSSEC=cho phép hạ cấp # Chế độ DNSSEC (yes/no/allow-downgrade)
# DNSOverTLS=chế độ # DoT cơ hội (yes/no/opportunistic)
# Cache=yes # Kích hoạt bộ đệm DNS
# DNSStubListener=yes # Nghe trên 127.0.0.53:53
# ReadEtcHosts=yes # Bao gồm /etc/hosts
```

<a id="etcresolvconf-integration"></a>
<a id="heading-370-etcresolvconf-integration"></a>

## Tích hợp /etc/resolv.conf

```bash
# Kiểm tra liên kết tượng trưng resolv.conf hiện tại
ls -la /etc/resolv.conf

# Trên hệ thống systemd, nó sẽ trỏ đến:
# /run/systemd/resolve/stub-resolv.conf (sơ khai: 127.0.0.53)
# hoặc: /run/systemd/resolve/resolv.conf (DNS ngược dòng thực tế)

# Tạo lại liên kết tượng trưng tới trình phân giải sơ khai
sudo ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf

# Kiểm tra xem trình giải quyết sơ khai nào đang sử dụng
cat /run/systemd/resolve/stub-resolv.conf
```

<a id="service-management"></a>
<a id="heading-371-service-management"></a>

## Quản lý Service

```bash
# Kiểm tra trạng thái
sudo systemctl status systemd-resolved

# Khởi động lại
sudo systemctl restart systemd-resolved

# Kiểm tra nhật ký
sudo journalctl -u systemd-resolved -f
```

---



<a id="52-telnet--remote-connection-and-port-testing-legacy"></a>
<a id="heading-372-52-telnet-remote-connection-and-port-testing-l"></a>

# 52. `telnet` — Kiểm tra cổng và kết nối từ xa (Cũ)

`telnet` là giao thức cũ để truy cập thiết bị đầu cuối từ xa, hiện được thay thế bởi SSH. Tuy nhiên, ứng dụng khách `telnet` vẫn cực kỳ hữu ích như một **công cụ lấy biểu ngữ và kiểm tra cổng TCP nhanh chóng** — kết nối thủ công với bất kỳ cổng TCP nào để gửi văn bản thô.

<a id="installation-16"></a>
<a id="heading-373-installation"></a>

## Cài đặt

```bash
sudo apt install telnet              # Debian/Ubuntu
sudo dnf install telnet             # RHEL/Fedora
```

<a id="port-testing-primary-modern-use"></a>
<a id="heading-374-port-testing-primary-modern-use"></a>

## Kiểm tra cổng (Sử dụng cơ bản hiện đại)

```bash
# Kiểm tra xem cổng TCP có mở không (sử dụng phổ biến nhất hiện nay)
telnet 192.168.1.1 22
# Đầu ra nếu mở: Đang thử 192.168.1.1... Đã kết nối với 192.168.1.1.
# Đầu ra nếu đóng: Kết nối bị từ chối
# Đầu ra nếu được lọc: (treo cho đến khi hết thời gian chờ)

# Kiểm tra các cổng nổi tiếng
telnet example.com 80               # HTTP
telnet example.com 443              # HTTPS (TLS thô - có thể là rác)
telnet smtp.example.com 25          # SMTP
telnet smtp.example.com 587         # gửi SMTP
telnet pop.example.com 110          # POP3
telnet imap.example.com 143         # IMAP

# Ctrl+] nhanh rồi 'thoát' để thoát sau khi kiểm tra
```

<a id="manual-http-request"></a>
<a id="heading-375-manual-http-request"></a>

## Yêu cầu HTTP thủ công

```bash
# Kết nối và nhập yêu cầu HTTP theo cách thủ công
telnet example.com 80
# Loại: NHẬN / HTTP/1.0
# Nhấn Enter hai lần để gửi
```

<a id="smtp-testing-classic-use"></a>
<a id="heading-376-smtp-testing-classic-use"></a>

## Kiểm tra SMTP (Sử dụng cổ điển)

```bash
telnet smtp.example.com 25
# Sau đó gõ thủ công:
# EHLO test.example.com
# THƯ TỪ:<test@example.com>
# RCPT ĐẾN:<user@example.com>
# DATA
# Chủ đề: Kiểm tra
# Đây là một bài kiểm tra.
# .
# QUIT
```

<a id="remote-login-legacy--insecure-avoid-on-production"></a>
<a id="heading-377-remote-login-legacy-insecure-avoid-on-producti"></a>

## Đăng nhập từ xa (Cũ - Không an toàn, Tránh sản xuất)

```bash
# Kết nối với máy chủ từ xa (máy chủ telnet phải đang chạy)
telnet 192.168.1.1
telnet hostname.example.com

# Kết nối trên một cổng cụ thể
telnet 192.168.1.1 2323

# Kết nối với các tùy chọn rõ ràng
telnet -l username 192.168.1.1      # Chỉ định tên người dùng đăng nhập

# Liên kết với một địa chỉ địa phương cụ thể
telnet -b 192.168.1.100 remote-host 23
```

<a id="escape-commands-while-connected"></a>
<a id="heading-378-escape-commands-while-connected"></a>

## Lệnh thoát (Trong khi kết nối)

Sau khi nhấn ký tự thoát (mặc định là `Ctrl+]`) bạn vào chế độ lệnh telnet:

| Lệnh | hành động |
|---------|--------|
| `close` | Đóng kết nối hiện tại |
| `quit` | Thoát hoàn toàn telnet |
| `open host port` | Mở một kết nối mới |
| `status` | Hiển thị trạng thái kết nối |
| `set escape X` | Thay đổi ký tự thoát |
| `?` hoặc `help` | Hiển thị tất cả các lệnh |

<a id="alternatives"></a>
<a id="heading-379-alternatives"></a>

## Lựa chọn thay thế

| Công cụ | Lợi thế hơn telnet |
|------|-----------------------|
| `nc 192.168.1.1 22` | Dễ viết hơn, không bị treo lâu |
| `ncat 192.168.1.1 22` | Hỗ trợ SSL |
| `curl telnet://host:port` | Tốt cho tự động hóa |
| `openssl s_client -connect host:443` | Để thử nghiệm HTTPS |
| `ssh` | Đăng nhập từ xa được mã hóa (luôn thích hơn telnet) |

---



<a id="53-ab--apache-http-benchmarking-tool"></a>
<a id="heading-380-53-ab-apache-http-benchmarking-tool"></a>

# 53. `ab` - Công cụ đo điểm chuẩn Apache HTTP

`ab` (ApacheBench) là một công cụ kiểm tra tải HTTP đơn giản, gửi một số lượng lớn requests đến máy chủ web và báo cáo thống kê thông lượng, độ trễ và lỗi.

<a id="installation-17"></a>
<a id="heading-381-installation"></a>

## Cài đặt

```bash
sudo apt install apache2-utils       # Debian/Ubuntu
sudo dnf install httpd-tools         # RHEL/Fedora
```

<a id="syntax-26"></a>
<a id="heading-382-syntax"></a>

## Cú pháp

```bash
ab [options] [http[s]://]hostname[:port]/path
```

> **Lưu ý:** URL phải kết thúc bằng `/` hoặc một đường dẫn. `http://example.com/` hợp lệ; `http://example.com` thì không.

<a id="basic-usage-4"></a>
<a id="heading-383-basic-usage"></a>

## Cách sử dụng cơ bản

```bash
# Gửi 100 requests, 10 lần một lúc (10 kết nối đồng thời)
ab -n 100 -c 10 http://example.com/

# 1000 requests, 50 đồng thời (kiểm tra ánh sáng thông thường)
ab -n 1000 -c 50 http://example.com/

# 10000 requests, 100 đồng thời (kiểm tra tải)
ab -n 10000 -c 100 http://example.com/

# HTTPS (yêu cầu hỗ trợ SSL)
ab -n 100 -c 10 https://example.com/
```

<a id="request-options"></a>
<a id="heading-384-request-options"></a>

## Tùy chọn yêu cầu

```bash
# Gửi yêu cầu POST HTTP với dữ liệu biểu mẫu
ab -n 100 -c 10 -p post_data.txt -T "application/x-www-form-urlencoded" http://example.com/submit

# Gửi BÀI ĐĂNG HTTP với nội dung JSON
echo '{"key":"value"}' > data.json
ab -n 100 -c 10 -p data.json -T "application/json" http://api.example.com/endpoint

# Yêu cầu PUT
ab -n 100 -c 10 -u put_data.txt -T "application/json" http://api.example.com/resource/1

# Đặt tiêu đề yêu cầu tùy chỉnh
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" http://api.example.com/

# Gửi cookie
ab -n 100 -c 10 -C "sessionid=abc123; csrftoken=xyz789" http://example.com/

# Đặt phương thức HTTP
ab -n 100 -c 10 -m DELETE http://api.example.com/resource/1

# Theo dõi chuyển hướng (ab KHÔNG theo dõi chuyển hướng theo mặc định)
# Sử dụng curl cho các bài kiểm tra yêu cầu chuyển hướng sau
```

<a id="connection-options"></a>
<a id="heading-385-connection-options"></a>

## Tùy chọn kết nối

```bash
# Kết nối duy trì (kết nối liên tục HTTP/1.1)
ab -n 1000 -c 50 -k http://example.com/

# Đặt thời gian chờ (giây) cho phản hồi
ab -n 100 -c 10 -s 60 http://example.com/

# Sử dụng HTTP/1.0 thay vì HTTP/1.1
ab -n 100 -c 10 -1 http://example.com/

# Sử dụng phiên bản HTTP cụ thể
ab -n 100 -c 10 -P http://example.com/     # Proxy HTTPS
```

<a id="output-options"></a>
<a id="heading-386-output-options"></a>

## Tùy chọn đầu ra

```bash
# Đầu ra dài dòng (hiển thị các tiêu đề request/response)
ab -n 10 -c 1 -v 4 http://example.com/

# Lưu kết quả vào CSV (tương thích với gnuplot)
ab -n 1000 -c 50 -e output.csv http://example.com/

# Lưu thời gian hoàn thành yêu cầu vào tệp (mỗi dòng một lần)
ab -n 1000 -c 50 -g gnuplot.tsv http://example.com/

# Kết hợp: kiểm tra chi tiết với đầu ra
ab -n 1000 -c 100 -k -e results.csv -g times.tsv http://example.com/
```

<a id="reading-ab-output"></a>
<a id="heading-387-reading-ab-output"></a>

### Đọc đầu ra ab

```
Server Software:        nginx/1.25.0
Server Hostname:        example.com
Server Port:            80

Concurrency Level:      50
Time taken for tests:   2.345 seconds
Complete requests:      1000
Failed requests:        0
Keep-Alive requests:    990
Total transferred:      1234567 bytes
HTML transferred:       890123 bytes
Requests per second:    426.65 [#/sec] (mean)         ← Throughput
Time per request:       117.2  [ms]    (mean)          ← Avg latency
Time per request:       2.344  [ms]    (mean across all concurrent)
Transfer rate:          514.0  [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        1    2   0.9      2       8
Processing:    45  115  25.3    112     350
Waiting:       44  114  25.2    111     349
Total:         47  117  25.2    114     352

Percentage of the requests served within a certain time (ms)
  50%    114    ← Median
  66%    120
  75%    125
  80%    128
  90%    140
  95%    155
  98%    185
  99%    210
 100%    352 (longest request)
```

| Số liệu | Xem gì |
|--------|--------------|
| `Requests per second` | Thông lượng máy chủ - càng cao càng tốt |
| `Time per request` (trung bình) | Độ trễ trung bình - càng thấp càng tốt |
| `Failed requests` | Phải là 0; khác không có nghĩa là quá tải hoặc lỗi |
| `99th percentile` | Độ trễ đuôi dài - ảnh hưởng đến 1% người dùng |
| `max` | Thời gian đáp ứng trong trường hợp xấu nhất |

---



<a id="54-openssl-s_client--ssltls-testing"></a>
<a id="heading-388-54-openssl-sclient-ssltls-testing"></a>

# 54. `openssl s_client` — Thử nghiệm SSL/TLS

`openssl s_client` là công cụ chẩn đoán để kiểm tra các kết nối TLS, kiểm tra chứng chỉ và khắc phục sự cố SSL/TLS. Nó là một phần của gói `openssl`, được cài đặt theo mặc định trên hầu hết các hệ thống Linux.

<a id="basic-connection-testing-1"></a>
<a id="heading-389-basic-connection-testing"></a>

## Kiểm tra kết nối cơ bản

```bash
# Kết nối với máy chủ HTTPS
openssl s_client -connect example.com:443

# Kết nối với SNI (Chỉ định tên máy chủ) - cần thiết cho dịch vụ lưu trữ hiện đại
openssl s_client -connect example.com:443 -servername example.com

# Kiểm tra nhanh: chỉ cần xuất trình chứng chỉ (thoát ngay)
echo | openssl s_client -connect example.com:443 -servername example.com

# Chỉ hiển thị chứng chỉ
echo | openssl s_client -connect example.com:443 2>/dev/null |   openssl x509 -noout -text

# Đầu ra yên tĩnh (không có tiếng ồn chẩn đoán)
echo | openssl s_client -connect example.com:443 -quiet 2>/dev/null
```

<a id="certificate-inspection"></a>
<a id="heading-390-certificate-inspection"></a>

## Kiểm tra chứng chỉ

```bash
# Hiển thị chi tiết chứng chỉ đầy đủ
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null | openssl x509 -noout -text

# Chỉ hiển thị ngày hiệu lực
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -dates

# Hiển thị chủ đề (CN, SAN)
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -subject

# Hiển thị nhà phát hành
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -issuer

# Hiển thị tên thay thế chủ đề (tất cả tên máy chủ hợp lệ)
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -ext subjectAltName

# Hiển thị dấu vân tay (SHA-256)
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -fingerprint -sha256

# Hiển thị chuỗi chứng chỉ đầy đủ
openssl s_client -connect example.com:443   -servername example.com -showcerts 2>/dev/null
```

<a id="tls-version-and-cipher-testing"></a>
<a id="heading-391-tls-version-and-cipher-testing"></a>

## Kiểm tra mật mã và phiên bản TLS

```bash
# Chỉ buộc TLS 1.2
openssl s_client -connect example.com:443 -tls1_2

# Chỉ buộc TLS 1.3
openssl s_client -connect example.com:443 -tls1_3

# Buộc TLS 1.1 (hiển thị nếu máy chủ chấp nhận các phiên bản cũ hơn, không an toàn)
openssl s_client -connect example.com:443 -tls1_1

# Kiểm tra bộ mật mã cụ thể
openssl s_client -connect example.com:443 -cipher AES128-SHA

# Liệt kê các mật mã hoạt động trên máy chủ (yêu cầu tập lệnh)
for cipher in $(openssl ciphers 'ALL:eNULL' | tr ':' ' '); do
  result=$(echo | openssl s_client -connect example.com:443     -cipher "$cipher" 2>/dev/null | grep -c "Cipher is")
  [ $result -eq 1 ] && echo "$cipher: ACCEPTED" || echo "$cipher: REJECTED"
done

# Hiển thị bộ mật mã đã thương lượng
echo | openssl s_client -connect example.com:443 2>/dev/null | grep "Cipher is"
```

<a id="starttls-testing"></a>
<a id="heading-392-starttls-testing"></a>

## Kiểm tra STARTTLS

```bash
# SMTP với STARTTLS (cổng 587)
openssl s_client -connect smtp.example.com:587 -starttls smtp

# IMAP với STARTTLS (cổng 143)
openssl s_client -connect imap.example.com:143 -starttls imap

# POP3 với STARTTLS (cổng 110)
openssl s_client -connect pop3.example.com:110 -starttls pop3

# FTP với STARTTLS
openssl s_client -connect ftp.example.com:21 -starttls ftp

# LDAP với STARTTLS
openssl s_client -connect ldap.example.com:389 -starttls ldap

# XMPP
openssl s_client -connect xmpp.example.com:5222 -starttls xmpp
```

<a id="client-certificates-and-verification"></a>
<a id="heading-393-client-certificates-and-verification"></a>

## Chứng chỉ và xác minh của khách hàng

```bash
# Sử dụng chứng chỉ ứng dụng khách cho TLS (mTLS) chung
openssl s_client -connect api.example.com:443   -cert client.crt   -key client.key

# Xác minh chứng chỉ đối với tệp CA
openssl s_client -connect example.com:443   -CAfile /etc/ssl/certs/ca-certificates.crt   -verify 5

# Kiểm tra xem chứng chỉ có khớp với khóa không
openssl x509 -noout -modulus -in cert.pem | md5sum
openssl rsa  -noout -modulus -in key.pem  | md5sum
# Cả hai md5sum phải khớp
```

<a id="debugging-and-advanced-options"></a>
<a id="heading-394-debugging-and-advanced-options"></a>

## Tùy chọn gỡ lỗi và nâng cao

```bash
# Kết nối qua proxy
openssl s_client -connect example.com:443   -proxy proxy.example.com:8080

# Hiển thị trạng thái bên trong (gỡ lỗi bắt tay TLS)
openssl s_client -connect example.com:443 -state

# Hiển thị thông tin gỡ lỗi cho cái bắt tay
openssl s_client -connect example.com:443 -debug

# Kết nối với một IP nhưng hiển thị SNI khác
openssl s_client -connect 1.2.3.4:443 -servername example.com

# Kiểm tra việc dập ghim OCSP
echo | openssl s_client -connect example.com:443   -servername example.com -status 2>/dev/null | grep -A 20 "OCSP response"

# Kiểm tra thời hạn chứng chỉ theo ngày (có thể viết được)
EXPIRY=$(echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -enddate | cut -d= -f2)
DAYS=$(( ($(date -d "$EXPIRY" +%s) - $(date +%s)) / 86400 ))
echo "Certificate expires in $DAYS days"
```

---



<a id="55-tcpflow--tcp-stream-reconstruction"></a>
<a id="heading-395-55-tcpflow-tcp-stream-reconstruction"></a>

# 55. `tcpflow` — Tái tạo luồng TCP

`tcpflow` ghi lại các kết nối TCP và tái cấu trúc từng luồng thành các tệp riêng biệt, giúp dễ dàng đọc dữ liệu thực tế được trao đổi trong phiên TCP. Không giống như `tcpdump`, nó tập trung vào nội dung hơn là chi tiết ở cấp độ gói.

<a id="installation-18"></a>
<a id="heading-396-installation"></a>

## Cài đặt

```bash
sudo apt install tcpflow             # Debian/Ubuntu
sudo dnf install tcpflow             # RHEL/Fedora
```

<a id="basic-usage-5"></a>
<a id="heading-397-basic-usage"></a>

## Cách sử dụng cơ bản

```bash
# Ghi lại tất cả các luồng TCP trên giao diện mặc định
sudo tcpflow -i eth0

# Chụp trên tất cả các giao diện
sudo tcpflow -i any

# Chụp và in ra bảng điều khiển thay vì tập tin
sudo tcpflow -c -i eth0

# Chụp với dấu thời gian ở đầu ra
sudo tcpflow -c -t -i eth0

# Chụp với đầu ra dài dòng (hiển thị thông tin kết nối)
sudo tcpflow -c -v -i eth0
```

<a id="filtering"></a>
<a id="heading-398-filtering"></a>

## Lọc

tcpflow sử dụng cú pháp bộ lọc BPF giống như tcpdump:

```bash
# Chỉ ghi lại lưu lượng truy cập HTTP (cổng 80)
sudo tcpflow -c -i eth0 port 80

# Chỉ thu thập lưu lượng truy cập to/from một máy chủ cụ thể
sudo tcpflow -c -i eth0 host 192.168.1.1

# Chụp máy chủ và cổng cụ thể
sudo tcpflow -c -i eth0 host 192.168.1.1 and port 80

# Chụp một mạng con
sudo tcpflow -c -i eth0 net 192.168.1.0/24

# Chụp DNS (TCP DNS, thường dành cho phản hồi lớn)
sudo tcpflow -c -i eth0 port 53

# Nắm bắt tất cả lưu lượng truy cập ngoại trừ SSH (tránh chụp phiên của riêng bạn)
sudo tcpflow -c -i eth0 not port 22
```

<a id="output-to-files"></a>
<a id="heading-399-output-to-files"></a>

## Xuất ra tập tin

Theo mặc định, tcpflow lưu từng luồng TCP vào một tệp riêng biệt được đặt tên theo điểm cuối kết nối:

```bash
# Lưu vào thư mục hiện tại (hành vi mặc định)
sudo tcpflow -i eth0 port 80

# Các tập tin được tạo:
# 192.168.001.100.54321-093.184.216.034.00080 (máy khách → máy chủ)
# 093.184.216.034.00080-192.168.001.100.54321 (máy chủ → máy khách)

# Chỉ định thư mục đầu ra
sudo tcpflow -o /tmp/captures/ -i eth0 port 80

# Chụp vào thư mục có hậu tố dấu thời gian
sudo tcpflow -o /tmp/captures/ -t -i eth0

# Giới hạn chụp ở N byte trên mỗi luồng
sudo tcpflow -m 10000 -o /tmp/caps/ -i eth0

# Đọc từ tệp pcap thay vì chụp trực tiếp
sudo tcpflow -r capture.pcap

# Đọc pcap và in ra console
sudo tcpflow -c -r capture.pcap

# Xử lý tất cả các tệp pcap trong một thư mục
sudo tcpflow -c -r /tmp/pcaps/*.pcap
```

<a id="reading-reconstructed-streams"></a>
<a id="heading-400-reading-reconstructed-streams"></a>

## Đọc các luồng được xây dựng lại

```bash
# Sau khi chụp HTTP trên cổng 80:
ls *.00080* 2>/dev/null

# Đọc yêu cầu (máy khách → máy chủ)
cat 192.168.001.100.54321-093.184.216.034.00080
# Đầu ra: NHẬN/HTTP/1.1
#         Máy chủ: example.com
#         ...

# Đọc phản hồi (máy chủ → máy khách)
cat 093.184.216.034.00080-192.168.001.100.54321
# Đầu ra: HTTP/1.1 200 OK
#         Loại nội dung: text/html
#         ...

# Tìm kiếm mật khẩu trong lưu lượng HTTP đã ghi lại (để kiểm tra bảo mật)
grep -r "password\|passwd\|secret" *.00080* 2>/dev/null
```

<a id="xmlmetadata-report"></a>
<a id="heading-401-xmlmetadata-report"></a>

## Báo cáo XML/Metadata

```bash
# Tạo báo cáo XML với siêu dữ liệu kết nối
sudo tcpflow -r capture.pcap -Fk -X report.xml

# Báo cáo bao gồm:
# - IP và cổng Source/destination
# - Dấu thời gian Start/end
# - Số byte theo hướng
# - Băm MD5 của mỗi luồng
```

<a id="combining-with-tcpdump"></a>
<a id="heading-402-combining-with-tcpdump"></a>

## Kết hợp với tcpdump

```bash
# Capture vào pcap bằng tcpdump, phân tích bằng tcpflow
sudo tcpdump -i eth0 -w capture.pcap port 80 &
sleep 30
kill %1
sudo tcpflow -c -r capture.pcap

# Chuyển tcpdump sang tcpflow trong thời gian thực
sudo tcpdump -i eth0 -w - port 80 | sudo tcpflow -r -
```

---



<a id="56-tshark--terminal-wireshark-cli-packet-analyzer"></a>
<a id="heading-403-56-tshark-terminal-wireshark-cli-packet-analyz"></a>

# 56. `tshark` — Terminal Wireshark (Trình phân tích gói CLI)

`tshark` là phiên bản dòng lệnh của Wireshark — một công cụ phân tích giao thức mạnh mẽ giúp thu thập và giải mã các gói bằng thư viện phân tích đầy đủ của Wireshark. Nó hỗ trợ hàng trăm giao thức và lý tưởng cho môi trường tập lệnh và không có GUI.

<a id="installation-19"></a>
<a id="heading-404-installation"></a>

## Cài đặt

```bash
sudo apt install tshark              # Debian/Ubuntu
sudo dnf install wireshark-cli       # RHEL/Fedora
# Thêm người dùng của bạn vào nhóm Wireshark để chụp mà không cần root:
sudo usermod -aG wireshark $USER
```

<a id="basic-capture"></a>
<a id="heading-405-basic-capture"></a>

## Chụp cơ bản

```bash
# Chụp trên một giao diện cụ thể
tshark -i eth0

# Chụp trên mọi giao diện
tshark -i any

# Liệt kê các giao diện có sẵn
tshark -D

# Chụp trong 30 giây
tshark -i eth0 -a duration:30

# Chụp N gói rồi dừng
tshark -i eth0 -c 100

# Chụp cho đến khi tệp đạt 10 MB
tshark -i eth0 -a filesize:10240

# Ghi lại bằng lời nói (giải mã giao thức đầy đủ)
tshark -i eth0 -V
```

<a id="saving-and-reading-files"></a>
<a id="heading-406-saving-and-reading-files"></a>

## Lưu và đọc tập tin

```bash
# Lưu ảnh chụp vào tập tin pcap
tshark -i eth0 -w capture.pcap

# Đọc từ tập tin pcap
tshark -r capture.pcap

# Đọc và giải mã bằng lời nói
tshark -r capture.pcap -V

# Xoay tệp: tối đa 5 tệp, mỗi tệp 100 MB
tshark -i eth0 -b filesize:102400 -b files:5 -w /tmp/cap.pcap

# Đọc 100 gói đầu tiên từ pcap
tshark -r capture.pcap -c 100

# Giải nén pcap được nén bằng gzipped
tshark -r capture.pcap.gz
```

<a id="capture-filters-bpf--applied-during-capture"></a>
<a id="heading-407-capture-filters-bpf-applied-during-capture"></a>

## Bộ lọc chụp (BPF - Được áp dụng trong quá trình chụp)

```bash
# Chỉ chụp HTTP
tshark -i eth0 -f "port 80"

# Chỉ ghi lại lưu lượng truy cập máy chủ cụ thể to/from
tshark -i eth0 -f "host 192.168.1.1"

# Chụp DNS
tshark -i eth0 -f "port 53"

# Chụp mà không cần phiên SSH của bạn
tshark -i eth0 -f "not port 22"

# Chụp ICMP
tshark -i eth0 -f "icmp"
```

<a id="display-filters-wireshark-dsl--applied-after-decode"></a>
<a id="heading-408-display-filters-wireshark-dsl-applied-after-dec"></a>

## Bộ lọc hiển thị (Wireshark DSL - Được áp dụng sau khi giải mã)

Bộ lọc hiển thị mạnh hơn nhiều so với bộ lọc BPF - chúng hiểu các giao thức:

```bash
# Lọc theo giao thức
tshark -r capture.pcap -Y "http"
tshark -r capture.pcap -Y "dns"
tshark -r capture.pcap -Y "tls"
tshark -r capture.pcap -Y "tcp"

# HTTP NHẬN requests chỉ
tshark -r capture.pcap -Y "http.request.method == GET"

# Chỉ truy vấn DNS (không phản hồi)
tshark -r capture.pcap -Y "dns.flags.response == 0"

# Những cái bắt tay TLS
tshark -r capture.pcap -Y "ssl.record.content_type == 22"

# TCP có cờ RST
tshark -r capture.pcap -Y "tcp.flags.reset == 1"

# Các gói lớn hơn 1400 byte
tshark -r capture.pcap -Y "frame.len > 1400"

# Lưu lượng giữa hai máy chủ cụ thể
tshark -r capture.pcap -Y "ip.addr == 192.168.1.1 && ip.addr == 10.0.0.1"

# Mã phản hồi HTTP ≥ 400 (lỗi)
tshark -r capture.pcap -Y "http.response.code >= 400"

# Chụp trực tiếp với bộ lọc hiển thị
tshark -i eth0 -Y "http.request"
```

<a id="extracting-specific-fields"></a>
<a id="heading-409-extracting-specific-fields"></a>

## Trích xuất các trường cụ thể

```bash
# Trích xuất IP nguồn và IP đích
tshark -r capture.pcap -T fields -e ip.src -e ip.dst

# Trích xuất URL yêu cầu HTTP
tshark -r capture.pcap -Y "http.request" -T fields   -e ip.src -e http.host -e http.request.uri

# Trích xuất tên truy vấn DNS
tshark -r capture.pcap -Y "dns.flags.response == 0" -T fields   -e frame.time -e ip.src -e dns.qry.name

# Trích xuất TLS SNI (tên máy chủ)
tshark -r capture.pcap -Y "ssl.handshake.extensions_server_name" -T fields   -e ip.src -e ssl.handshake.extensions_server_name

# Trích xuất bằng dấu phân cách tab và dòng tiêu đề
tshark -r capture.pcap -T fields   -e ip.src -e ip.dst -e tcp.dstport   -E header=y -E separator=\t
```

<a id="statistics"></a>
<a id="heading-410-statistics"></a>

## Thống kê

```bash
# Phân cấp giao thức (phân tích theo %) giao thức
tshark -r capture.pcap -q -z io,phs

# Cuộc hội thoại kết nối (cặp IP)
tshark -r capture.pcap -q -z conv,ip

# Cuộc hội thoại TCP
tshark -r capture.pcap -q -z conv,tcp

# Thống kê Endpoint (lưu lượng truy cập trên mỗi IP)
tshark -r capture.pcap -q -z endpoints,ip

# Thống kê HTTP
tshark -r capture.pcap -q -z http,stat

# Thống kê DNS
tshark -r capture.pcap -q -z dns,tree

# Thông tin chuyên gia (cảnh báo, lỗi, ghi chú)
tshark -r capture.pcap -q -z expert
```

<a id="output-formats"></a>
<a id="heading-411-output-formats"></a>

## Định dạng đầu ra

```bash
# Đầu ra văn bản mặc định
tshark -r capture.pcap

# Đầu ra JSON
tshark -r capture.pcap -T json

# PDML (Ngôn ngữ đánh dấu chi tiết gói - XML)
tshark -r capture.pcap -T pdml

# EK (JSON tương thích với Elaticsearch)
tshark -r capture.pcap -T ek

# CSV của các trường cụ thể
tshark -r capture.pcap -T fields -e ip.src -e ip.dst -E separator=,

# Tab (chế độ trường)
tshark -r capture.pcap -T fields -e ip.src -e tcp.dstport -E separator=\t
```

---



---

<a id="system-network-configuration-files"></a>
<a id="heading-412-system-network-configuration-files"></a>

# Tệp cấu hình mạng hệ thống

| tập tin | Mục đích |
|------|---------|
| `/etc/hostname` | Tên máy chủ hệ thống |
| `/etc/hosts` | Ánh xạ tên máy chủ tĩnh tới IP |
| `/etc/resolv.conf` | Cấu hình trình phân giải DNS (máy chủ tên, miền tìm kiếm) |
| `/etc/nsswitch.conf` | Chuyển đổi dịch vụ tên (thứ tự phân giải tên) |
| `/etc/network/interfaces` | Cấu hình mạng Debian/Ubuntu (truyền thống) |
| `/etc/netplan/*.yaml` | Cấu hình Netplan Ubuntu (hiện đại) |
| `/etc/sysconfig/network-scripts/ifcfg-*` | Cấu hình mạng RHEL/CentOS |
| `/etc/NetworkManager/` | Thư mục cấu hình NetworkManager |
| `/etc/systemd/network/*.network` | Cấu hình mạng systemd |
| `/etc/iptables/rules.v4` | Đã lưu các quy tắc IPv4 iptables |
| `/etc/iptables/rules.v6` | Đã lưu các quy tắc IPv6 iptables |
| `/proc/sys/net/ipv4/ip_forward` | Cờ chuyển tiếp IPv4 |
| `/proc/sys/net/ipv6/conf/all/forwarding` | Cờ chuyển tiếp IPv6 |
| `/etc/sysctl.conf` | Cấu hình tham số hạt nhân |
| `/etc/ssh/sshd_config` | Cấu hình máy chủ SSH |
| `/etc/ssh/ssh_config` | Cấu hình máy khách SSH |
| `~/.ssh/config` | Cấu hình máy khách SSH cho mỗi người dùng |
| `~/.ssh/known_hosts` | Khóa máy chủ SSH đã biết |
| `~/.ssh/authorized_keys` | Khóa công khai được ủy quyền để đăng nhập SSH |

---

<a id="kernel-network-parameters-sysctl"></a>
<a id="heading-413-kernel-network-parameters-sysctl"></a>

# Tham số mạng hạt nhân (sysctl)

```bash
# Kích hoạt chuyển tiếp IP
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -w net.ipv6.conf.all.forwarding=1

# Tắt chuyển hướng ICMP
sudo sysctl -w net.ipv4.conf.all.accept_redirects=0
sudo sysctl -w net.ipv4.conf.all.send_redirects=0

# Kích hoạt cookie SYN (bảo vệ DDoS)
sudo sysctl -w net.ipv4.tcp_syncookies=1

# Tăng bảng theo dõi kết nối
sudo sysctl -w net.netfilter.nf_conntrack_max=262144

# Tăng kích thước bộ đệm socket
sudo sysctl -w net.core.rmem_max=16777216
sudo sysctl -w net.core.wmem_max=16777216

# Điều chỉnh TCP
sudo sysctl -w net.ipv4.tcp_window_scaling=1
sudo sysctl -w net.ipv4.tcp_timestamps=1
sudo sysctl -w net.ipv4.tcp_sack=1
sudo sysctl -w net.ipv4.tcp_fin_timeout=30
sudo sysctl -w net.ipv4.tcp_keepalive_time=600
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=4096

# Tăng phạm vi cổng
sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"

# Vô hiệu hóa IPv6 (nếu không cần thiết)
sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1

# Ngăn chặn giả mạo IP
sudo sysctl -w net.ipv4.conf.all.rp_filter=1

# Không chấp nhận định tuyến nguồn
sudo sysctl -w net.ipv4.conf.all.accept_source_route=0

# Ghi log gói có địa chỉ nguồn bất thường (martian packets)
sudo sysctl -w net.ipv4.conf.all.log_martians=1

# Làm vĩnh viễn
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p                        # Tải lại
```

---

*Kết thúc phần tham khảo lệnh mạng Linux hoàn chỉnh*
