# Complete Linux Network Commands Reference
## Every Command, Every Flag, Every Option — With Examples & Explanations

---

#### TABLE OF CONTENTS

1. ip — Network Interface, Routing & Tunnel Management
2. ping — ICMP Connectivity Testing
3. traceroute — Route Tracing
4. tracepath — Route Tracing Without Root
5. mtr — Combined Traceroute + Ping
6. ss — Socket Statistics
7. netstat — Network Statistics (Legacy)
8. curl — Data Transfer Tool
9. wget — Non-Interactive Downloader
10. dig — DNS Lookup Utility
11. nslookup — DNS Query Tool
12. host — Simple DNS Lookup
13. nmap — Network Scanner
14. tcpdump — Packet Capture & Analysis
15. iptables — Firewall (Netfilter)
16. nftables — Modern Firewall
17. firewall-cmd — Firewalld CLI
18. ufw — Uncomplicated Firewall
19. ifconfig — Interface Configuration (Legacy)
20. route — Routing Table (Legacy)
21. arp — ARP Cache Management
22. ip neigh — ARP/NDP Management (Modern)
23. ethtool — NIC Hardware Settings
24. nmcli — NetworkManager CLI
25. nmtui — NetworkManager Text UI
26. ssh — Secure Shell
27. scp — Secure Copy
28. sftp — Secure FTP
29. rsync — Remote File Sync
30. nc / netcat — Network Swiss Army Knife
31. ncat — Modern Netcat (Nmap)
32. socat — Multipurpose Relay
33. whois — Domain Registration Lookup
34. hostname / hostnamectl — Hostname Management
35. ipcalc — IP Address Calculator
36. lsof — List Open Network Sockets
37. fuser — Identify Processes Using Ports
38. iftop — Real-Time Bandwidth Monitor
39. vnstat — Traffic Monitor (Historical)
40. nethogs — Per-Process Bandwidth Monitor
41. bmon — Bandwidth Monitor
42. iperf3 — Network Performance Testing
43. tc — Traffic Control (QoS)
44. iwconfig — Wireless Configuration (Legacy)
45. iw — Wireless Configuration (Modern)
46. brctl — Bridge Control (Legacy)
47. bridge — Bridge Management (Modern)
48. tunctl / ip tuntap — TUN/TAP Devices
49. vconfig / ip link — VLAN Management
50. dhclient — DHCP Client
51. resolvectl / systemd-resolve — DNS Resolution
52. telnet — Remote Connection (Legacy)
53. ab — Apache HTTP Benchmarking
54. openssl s_client — SSL/TLS Testing
55. tcpflow — TCP Stream Reconstruction
56. tshark — Terminal Wireshark

---

# 1. `ip` — Network Interface, Routing & Tunnel Management

The `ip` command (from the `iproute2` package) is the primary tool for managing network interfaces, addresses, routing, tunnels, and neighbor entries on modern Linux. It replaces the older `ifconfig`, `route`, `arp`, and `vconfig` commands.

## General Syntax

```bash
ip [ OPTIONS ] OBJECT { COMMAND | help }
```

## Global Options (Apply to All Subcommands)

| Flag        | Long Form        | Description                                                                        |
| ----------- | ---------------- | ---------------------------------------------------------------------------------- |
| `-c`        | `-color`         | Enable color output for readability                                                |
| `-s`        | `-stats`         | Output more statistics; use `-s -s` for even more                                  |
| `-d`        | `-details`       | Output more detailed information                                                   |
| `-h`        | `-human`         | Output human-readable statistics (with units like K, M, G)                         |
| `-j`        | `-json`          | Output in JSON format (machine-parseable)                                          |
| `-p`        | `-pretty`        | Pretty-print JSON output (use with `-j`)                                           |
| `-f FAMILY` | `-family FAMILY` | Protocol family: `inet` (IPv4), `inet6` (IPv6), `link` (layer 2), `bridge`, `mpls` |
| `-4`        |                  | Shorthand for `-f inet` (IPv4 only)                                                |
| `-6`        |                  | Shorthand for `-f inet6` (IPv6 only)                                               |
| `-B`        |                  | Shorthand for `-f bridge`                                                          |
| `-0`        |                  | Shorthand for `-f link` (layer 2)                                                  |
| `-o`        | `-oneline`       | Output each record on a single line (replacing newlines with `\`)                  |
| `-r`        | `-resolve`       | Resolve DNS names for IP addresses                                                 |
| `-n NETNS`  | `-netns NETNS`   | Switch to the specified network namespace before running the command               |
| `-a NETNS`  | `-all`           | Execute command across all network namespaces                                      |
| `-t`        | `-timestamp`     | Display timestamps when monitoring                                                 |
| `-br`       | `-brief`         | Print brief output (compact table format)                                          |
| `-rc`       | `-rcvbuf`        | Set netlink socket receive buffer size                                             |
| `-l`        | `-loops COUNT`   | Maximum number of loops for `ip addr flush`                                        |
| `-b`        | `-batch FILE`    | Read commands from batch file                                                      |

## `ip link` — Manage Network Interfaces

### `ip link show` — Display Interface Information

```bash
# Show all interfaces
ip link show

# Show a specific interface
ip link show dev eth0

# Show only UP interfaces
ip link show up

# Show only interfaces of a specific type
ip link show type bridge
ip link show type vlan
ip link show type veth
ip link show type bond

# Show with statistics
ip -s link show

# Show in brief format
ip -br link show

# Show in JSON format
ip -j link show | jq .

# Filter by group
ip link show group default
```

**Output fields explained:**
- `<BROADCAST,MULTICAST,UP,LOWER_UP>` — Interface flags showing capabilities and state
  - `BROADCAST` — Can send broadcast frames
  - `MULTICAST` — Supports multicast
  - `UP` — Admin-enabled (turned on)
  - `LOWER_UP` — Physical link detected (cable plugged in)
  - `NO-CARRIER` — No physical link detected
  - `PROMISC` — Promiscuous mode enabled
  - `LOOPBACK` — Loopback device
- `mtu 1500` — Maximum Transmission Unit (bytes)
- `qdisc fq_codel` — Queueing discipline (traffic scheduler)
- `state UP` — Operational state
- `mode DEFAULT` — Interface mode
- `group default` — Interface group
- `qlen 1000` — Transmit queue length
- `link/ether 00:11:22:33:44:55` — MAC address
- `brd ff:ff:ff:ff:ff:ff` — Broadcast address

### `ip link set` — Modify Interface Properties

```bash
# Bring interface up
sudo ip link set eth0 up

# Bring interface down
sudo ip link set eth0 down

# Change the MTU (Maximum Transmission Unit)
sudo ip link set eth0 mtu 9000          # Jumbo frames

# Change the MAC address
sudo ip link set eth0 down
sudo ip link set eth0 address 00:11:22:33:44:66
sudo ip link set eth0 up

# Rename an interface (must be down first)
sudo ip link set eth0 down
sudo ip link set eth0 name lan0
sudo ip link set lan0 up

# Enable promiscuous mode (capture all traffic on the segment)
sudo ip link set eth0 promisc on

# Disable promiscuous mode
sudo ip link set eth0 promisc off

# Set transmit queue length
sudo ip link set eth0 txqueuelen 2000

# Set the interface to multicast
sudo ip link set eth0 multicast on

# Assign to a network namespace
sudo ip link set eth0 netns my_namespace

# Set interface master (attach to bridge/bond)
sudo ip link set eth0 master br0

# Remove from master
sudo ip link set eth0 nomaster

# Set interface group
sudo ip link set eth0 group 42

# Set ARP on/off
sudo ip link set eth0 arp off          # Disable ARP
sudo ip link set eth0 arp on           # Enable ARP

# Set dynamic flag
sudo ip link set eth0 dynamic on
```

**All `ip link set` flags:**

| Flag | Description |
|------|-------------|
| `up` / `down` | Enable/disable the interface |
| `arp on/off` | Enable/disable ARP on the interface |
| `multicast on/off` | Enable/disable multicast |
| `promisc on/off` | Enable/disable promiscuous mode |
| `dynamic on/off` | Enable/disable dynamic flag |
| `allmulticast on/off` | Receive all multicast frames |
| `mtu MTU` | Set Maximum Transmission Unit |
| `name NAME` | Rename interface (must be down) |
| `address LLADDR` | Set MAC/hardware address |
| `broadcast LLADDR` | Set broadcast address |
| `peer LLADDR` | Set peer address (point-to-point) |
| `txqueuelen NUM` | Set transmit queue length |
| `netns NETNS` | Move to network namespace |
| `master DEVICE` | Attach to master device (bridge/bond) |
| `nomaster` | Detach from master device |
| `group GROUP` | Set interface group |
| `alias NAME` | Set interface alias string |
| `vf NUM` | Virtual Function settings (SR-IOV) |
| `xdp` | Set XDP (eXpress Data Path) program |
| `type TYPE ARGS` | Set type-specific attributes |

### `ip link add` — Create Virtual Interfaces

```bash
# Create a bridge
sudo ip link add br0 type bridge

# Create a VLAN interface (VLAN ID 100 on eth0)
sudo ip link add link eth0 name eth0.100 type vlan id 100

# Create a veth pair (virtual ethernet pair)
sudo ip link add veth0 type veth peer name veth1

# Create a bond
sudo ip link add bond0 type bond mode 802.3ad

# Create a dummy interface
sudo ip link add dummy0 type dummy

# Create a macvlan interface
sudo ip link add macvlan0 link eth0 type macvlan mode bridge

# Create a TUN device
sudo ip tuntap add dev tun0 mode tun

# Create a TAP device
sudo ip tuntap add dev tap0 mode tap

# Create a GRE tunnel
sudo ip link add gre1 type gre remote 203.0.113.1 local 198.51.100.1 ttl 255

# Create a VXLAN interface
sudo ip link add vxlan0 type vxlan id 42 remote 203.0.113.1 dstport 4789 dev eth0

# Create a WireGuard interface
sudo ip link add wg0 type wireguard

# Create a GENEVE tunnel
sudo ip link add geneve0 type geneve id 100 remote 10.0.0.1

# Create an IPIP tunnel
sudo ip link add ipip1 type ipip remote 203.0.113.1 local 198.51.100.1
```

**Supported interface types:**

| Type | Description |
|------|-------------|
| `bridge` | Ethernet bridge |
| `bond` | Bonding (link aggregation) |
| `vlan` | 802.1Q VLAN |
| `veth` | Virtual Ethernet pair |
| `dummy` | Dummy interface |
| `macvlan` | MAC-based VLAN |
| `macvtap` | MAC-based VLAN with TAP |
| `ipvlan` | IP-based VLAN |
| `vxlan` | Virtual eXtensible LAN |
| `gre` / `gretap` | GRE tunnel |
| `ip6gre` / `ip6gretap` | IPv6 GRE tunnel |
| `ipip` | IPv4 in IPv4 tunnel |
| `sit` | IPv6 in IPv4 tunnel |
| `ip6tnl` | IPv6 tunnel |
| `vti` / `vti6` | Virtual Tunnel Interface |
| `wireguard` | WireGuard VPN |
| `geneve` | GENEVE tunnel |
| `erspan` | ERSPAN tunnel |
| `xfrm` | Transform (IPsec) |
| `netdevsim` | Network device simulator |
| `nlmon` | Netlink monitor |
| `ifb` | Intermediate Functional Block |
| `can` | CAN bus |

### `ip link delete` — Remove Virtual Interfaces

```bash
sudo ip link delete br0
sudo ip link delete eth0.100
sudo ip link delete veth0          # Also deletes peer veth1
```

---

## `ip addr` / `ip address` — Manage IP Addresses

### `ip addr show` — Display IP Addresses

```bash
# Show all addresses
ip addr show
ip addr                             # Shorthand
ip a                                # Even shorter

# Show for a specific interface
ip addr show dev eth0

# Show only IPv4 addresses
ip -4 addr show

# Show only IPv6 addresses
ip -6 addr show

# Show brief format
ip -br addr show

# Show with scope filter
ip addr show scope global           # Only globally routable addresses
ip addr show scope link             # Only link-local addresses
ip addr show scope host             # Only host addresses (loopback)

# Show only primary addresses
ip addr show primary

# Show only secondary addresses
ip addr show secondary

# Show addresses matching a label
ip addr show label "eth0:*"

# Show for a specific type
ip addr show type bridge

# Show temporary (privacy) IPv6 addresses
ip addr show temporary

# Show deprecated addresses
ip addr show deprecated

# Show tentative addresses (DAD in progress)
ip addr show tentative
```

**Output fields explained:**
- `inet 192.168.1.100/24` — IPv4 address with prefix length
- `brd 192.168.1.255` — Broadcast address
- `scope global` — Address scope (global, link, host)
- `dynamic` — Assigned by DHCP
- `noprefixroute` — No automatic prefix route
- `valid_lft forever` — Valid lifetime (or seconds remaining)
- `preferred_lft forever` — Preferred lifetime

### `ip addr add` — Assign IP Addresses

```bash
# Add an IPv4 address
sudo ip addr add 192.168.1.100/24 dev eth0

# Add an IPv4 address with broadcast
sudo ip addr add 192.168.1.100/24 brd 192.168.1.255 dev eth0

# Add an IPv4 address with a label (alias)
sudo ip addr add 192.168.1.101/24 dev eth0 label eth0:1

# Add an IPv6 address
sudo ip addr add 2001:db8::1/64 dev eth0

# Add a point-to-point address
sudo ip addr add 10.0.0.1 peer 10.0.0.2/32 dev tun0

# Add with specific valid and preferred lifetimes (seconds)
sudo ip addr add 192.168.1.100/24 dev eth0 valid_lft 3600 preferred_lft 1800

# Prevent automatic prefix route creation
sudo ip addr add 192.168.1.100/24 dev eth0 noprefixroute

# Add without DAD (Duplicate Address Detection) for IPv6
sudo ip addr add 2001:db8::1/64 dev eth0 nodad

# Add with home flag (Mobile IPv6)
sudo ip addr add 2001:db8::1/64 dev eth0 home
```

**`ip addr add` flags:**

| Flag | Description |
|------|-------------|
| `dev DEVICE` | Interface to add address to |
| `local ADDRESS` | The address (can omit `local` keyword) |
| `peer ADDRESS` | Peer address (point-to-point) |
| `broadcast ADDRESS` | Broadcast address (`+` for auto-calculate) |
| `label LABEL` | Interface label/alias (e.g., `eth0:1`) |
| `scope SCOPE` | `global`, `link`, `host`, or numeric |
| `valid_lft SECONDS` | Valid lifetime (`forever` or seconds) |
| `preferred_lft SECONDS` | Preferred lifetime |
| `noprefixroute` | Don't add prefix route automatically |
| `home` | Home address (Mobile IPv6) |
| `nodad` | Skip Duplicate Address Detection |
| `mngtmpaddr` | Manage temporary addresses |

### `ip addr del` — Remove IP Addresses

```bash
# Remove a specific address
sudo ip addr del 192.168.1.100/24 dev eth0

# Remove an IPv6 address
sudo ip addr del 2001:db8::1/64 dev eth0
```

### `ip addr flush` — Remove All Addresses from an Interface

```bash
# Flush all addresses from an interface
sudo ip addr flush dev eth0

# Flush only IPv4 addresses
sudo ip -4 addr flush dev eth0

# Flush only link-local addresses
sudo ip addr flush dev eth0 scope link

# Flush with label filter
sudo ip addr flush label "eth0:*"
```

---

## `ip route` — Manage the Routing Table

### `ip route show` — Display Routes

```bash
# Show all routes (main table)
ip route show
ip route                             # Shorthand
ip r                                 # Even shorter

# Show only IPv6 routes
ip -6 route show

# Show a specific routing table
ip route show table local
ip route show table all              # All tables

# Show the route for a specific destination
ip route get 8.8.8.8                 # Shows which route would be used
ip route get 8.8.8.8 from 192.168.1.100 iif eth0

# Show routes matching a prefix
ip route show match 10.0.0.0/8

# Show routes exactly matching a prefix
ip route show exact 10.0.0.0/24

# Show routes via a specific gateway
ip route show via 192.168.1.1

# Show routes on a specific device
ip route show dev eth0

# Show routes with a specific protocol
ip route show proto static
ip route show proto dhcp
ip route show proto kernel
ip route show proto bird            # BGP/OSPF via BIRD

# Show cached routes
ip route show cache

# Show routes with a specific scope
ip route show scope link

# Show routes in a specific type
ip route show type local
ip route show type broadcast
ip route show type unreachable
```

**Output fields explained:**
- `default via 192.168.1.1 dev eth0` — Default route through gateway
- `proto kernel` — Route origin: `kernel` (auto), `boot` (startup), `static` (manual), `dhcp`
- `scope link` — Route scope
- `src 192.168.1.100` — Preferred source address
- `metric 100` — Route metric (priority; lower = preferred)
- `mtu 1500` — Path MTU
- `advmss 1460` — Advertised MSS

### `ip route add` — Add Routes

```bash
# Add a default gateway
sudo ip route add default via 192.168.1.1 dev eth0

# Add a network route
sudo ip route add 10.0.0.0/8 via 192.168.1.1

# Add a network route via a specific device
sudo ip route add 10.0.0.0/8 via 192.168.1.1 dev eth0

# Add a route with a specific metric
sudo ip route add 10.0.0.0/8 via 192.168.1.1 metric 100

# Add a route with a specific source address
sudo ip route add 10.0.0.0/8 via 192.168.1.1 src 192.168.1.100

# Add a host route (to a single IP)
sudo ip route add 10.0.0.5/32 via 192.168.1.1

# Add a route with MTU
sudo ip route add 10.0.0.0/8 via 192.168.1.1 mtu 1400

# Add an unreachable route (packets are rejected with ICMP)
sudo ip route add unreachable 10.99.0.0/16

# Add a blackhole route (packets are silently dropped)
sudo ip route add blackhole 10.99.0.0/16

# Add a prohibit route (packets rejected with ICMP admin-prohibited)
sudo ip route add prohibit 10.99.0.0/16

# Add a throw route (no route to destination in this table)
sudo ip route add throw 10.99.0.0/16

# Add to a specific routing table
sudo ip route add 10.0.0.0/8 via 192.168.1.1 table 100

# Add a multipath (ECMP) route with weights
sudo ip route add 10.0.0.0/8 \
  nexthop via 192.168.1.1 weight 1 \
  nexthop via 192.168.2.1 weight 2

# Add route with specific protocol tag
sudo ip route add 10.0.0.0/8 via 192.168.1.1 proto static

# Add route with window/rtt/rttvar hints
sudo ip route add 10.0.0.0/8 via 192.168.1.1 window 65535 rtt 100ms

# Add route with congestion control
sudo ip route add 10.0.0.0/8 via 192.168.1.1 congctl bbr

# Add route with advanced MSS
sudo ip route add 10.0.0.0/8 via 192.168.1.1 advmss 1400

# Add route with realm
sudo ip route add 10.0.0.0/8 via 192.168.1.1 realm 5

# Add a route with onlink (gateway is directly connected even without matching subnet)
sudo ip route add 10.0.0.0/8 via 192.168.1.1 dev eth0 onlink

# Replace a route (add or update)
sudo ip route replace default via 192.168.1.1 dev eth0

# Change route attributes (route must exist)
sudo ip route change 10.0.0.0/8 via 192.168.1.1 mtu 1400
```

**All `ip route add` parameters:**

| Parameter | Description |
|-----------|-------------|
| `via ADDRESS` | Next-hop gateway address |
| `dev DEVICE` | Output interface |
| `src ADDRESS` | Preferred source address |
| `metric NUM` / `preference NUM` | Route priority (lower = preferred) |
| `mtu NUM` | Path MTU |
| `mtu lock NUM` | Path MTU locked (don't do PMTUD) |
| `advmss NUM` | Advertised MSS for TCP connections |
| `table TABLE` | Routing table name or number |
| `proto PROTO` | Route protocol: `static`, `boot`, `kernel`, `dhcp`, etc. |
| `scope SCOPE` | `global`, `link`, `host` |
| `type TYPE` | `unicast`, `local`, `broadcast`, `multicast`, `throw`, `unreachable`, `prohibit`, `blackhole`, `nat` |
| `weight NUM` | Multipath weight |
| `onlink` | Gateway is directly connected |
| `nexthop` | Multi-hop specification |
| `window NUM` | TCP window hint |
| `rtt TIME` | Initial RTT estimate |
| `rttvar TIME` | Initial RTT variance |
| `ssthresh NUM` | Slow start threshold |
| `cwnd NUM` | Congestion window size |
| `initcwnd NUM` | Initial congestion window |
| `initrwnd NUM` | Initial receive window |
| `quickack BOOL` | Enable/disable quick ACK |
| `congctl NAME` | Congestion control algorithm |
| `features FEATURES` | Route features (`ecn`) |
| `realm REALM` | Routing realm |
| `expires SECONDS` | Route expiration time |
| `pref PREFERENCE` | IPv6 route preference: `low`, `medium`, `high` |

### `ip route del` — Delete Routes

```bash
# Delete a route
sudo ip route del 10.0.0.0/8 via 192.168.1.1

# Delete the default route
sudo ip route del default

# Delete from a specific table
sudo ip route del 10.0.0.0/8 table 100
```

### `ip route flush` — Remove Multiple Routes

```bash
# Flush all routes via a specific gateway
sudo ip route flush via 192.168.1.1

# Flush all routes in a table
sudo ip route flush table 100

# Flush the routing cache
sudo ip route flush cache

# Flush routes matching a protocol
sudo ip route flush proto dhcp
```

---

## `ip neigh` — Manage ARP/NDP Cache (Neighbor Table)

```bash
# Show the neighbor table (ARP for IPv4, NDP for IPv6)
ip neigh show
ip neigh                             # Shorthand
ip n                                 # Even shorter

# Show for a specific interface
ip neigh show dev eth0

# Show only reachable entries
ip neigh show nud reachable

# Show entries with a specific state
ip neigh show nud stale
ip neigh show nud failed
ip neigh show nud permanent

# Add a static ARP entry
sudo ip neigh add 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0

# Add a permanent ARP entry
sudo ip neigh add 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0 nud permanent

# Delete an entry
sudo ip neigh del 192.168.1.50 dev eth0

# Change an entry
sudo ip neigh change 192.168.1.50 lladdr 00:11:22:33:44:66 dev eth0

# Replace an entry (add or update)
sudo ip neigh replace 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0

# Flush the ARP cache
sudo ip neigh flush all
sudo ip neigh flush dev eth0
sudo ip neigh flush nud stale

# Show proxy ARP entries
ip neigh show proxy
```

**NUD (Neighbor Unreachability Detection) states:**

| State | Description |
|-------|-------------|
| `permanent` | Manually configured, never expires |
| `noarp` | Valid but no ARP needed (e.g., loopback) |
| `reachable` | Valid, recently confirmed reachable |
| `stale` | Valid but possibly unreachable |
| `delay` | Waiting to send probe |
| `probe` | Actively probing |
| `failed` | Resolution failed |
| `incomplete` | ARP request sent, waiting for reply |
| `none` | Pseudo state |

---

## `ip rule` — Policy-Based Routing Rules

```bash
# Show all routing rules
ip rule show
ip rule list

# Add a rule: traffic from 192.168.1.0/24 uses table 100
sudo ip rule add from 192.168.1.0/24 table 100

# Add a rule with priority
sudo ip rule add from 192.168.1.0/24 table 100 priority 100

# Route traffic to a specific destination through table 200
sudo ip rule add to 10.0.0.0/8 table 200

# Route based on firewall mark
sudo ip rule add fwmark 1 table 100

# Route based on incoming interface
sudo ip rule add iif eth0 table 100

# Route based on outgoing interface
sudo ip rule add oif eth1 table 200

# Route based on TOS (Type of Service)
sudo ip rule add tos 0x10 table 100

# Route based on IP protocol
sudo ip rule add ipproto tcp table 100

# Route based on source port range
sudo ip rule add sport 1024-65535 table 100

# Route based on destination port range
sudo ip rule add dport 80 table 100

# Add an unreachable rule
sudo ip rule add from 10.99.0.0/16 unreachable

# Delete a rule
sudo ip rule del from 192.168.1.0/24 table 100

# Flush all rules (DANGEROUS - removes all policy rules)
sudo ip rule flush
```

---

## `ip tunnel` — Manage IP Tunnels

```bash
# Show all tunnels
ip tunnel show

# Create an IPIP tunnel
sudo ip tunnel add tun0 mode ipip remote 203.0.113.1 local 198.51.100.1

# Create a GRE tunnel
sudo ip tunnel add gre1 mode gre remote 203.0.113.1 local 198.51.100.1 ttl 255

# Create a SIT tunnel (IPv6 over IPv4)
sudo ip tunnel add sit1 mode sit remote 203.0.113.1 local 198.51.100.1

# Change tunnel parameters
sudo ip tunnel change gre1 ttl 128

# Delete a tunnel
sudo ip tunnel del tun0
```

**Tunnel modes:**

| Mode | Description |
|------|-------------|
| `ipip` | IPv4 in IPv4 |
| `gre` | Generic Routing Encapsulation |
| `sit` | IPv6 in IPv4 (Simple Internet Transition) |
| `isatap` | Intra-Site Automatic Tunnel Addressing Protocol |
| `vti` | Virtual Tunnel Interface (for IPsec) |
| `ip6ip6` | IPv6 in IPv6 |
| `ipip6` | IPv4 in IPv6 |
| `ip6gre` | GRE over IPv6 |
| `any` | Any encapsulation |

---

## `ip netns` — Manage Network Namespaces

```bash
# List all named network namespaces
ip netns list

# Create a new namespace
sudo ip netns add my_ns

# Delete a namespace
sudo ip netns delete my_ns

# Execute a command in a namespace
sudo ip netns exec my_ns ip addr show
sudo ip netns exec my_ns bash        # Open a shell in the namespace

# Identify the namespace of a process
ip netns identify PID

# Attach a process to a namespace
ip netns attach my_ns PID

# Monitor namespace events
ip netns monitor

# Set a namespace as current (for subsequent ip commands)
sudo ip -n my_ns addr show           # -n shorthand for -netns
```

---

## `ip maddr` — Manage Multicast Addresses

```bash
# Show all multicast addresses
ip maddr show

# Show for a specific interface
ip maddr show dev eth0

# Add a multicast address
sudo ip maddr add 01:00:5e:00:00:01 dev eth0

# Delete a multicast address
sudo ip maddr del 01:00:5e:00:00:01 dev eth0
```

---

## `ip mroute` — Multicast Routing Cache

```bash
# Show multicast routing cache
ip mroute show
```

---

## `ip monitor` — Real-Time Monitoring

```bash
# Monitor all changes (addresses, routes, links, etc.)
ip monitor all

# Monitor only link changes
ip monitor link

# Monitor only address changes
ip monitor address

# Monitor only route changes
ip monitor route

# Monitor only neighbor changes
ip monitor neigh

# Monitor with timestamps
ip -t monitor all

# Monitor in a specific namespace
sudo ip -n my_ns monitor all
```

---

## `ip xfrm` — IPsec / Security Association Management

```bash
# Show IPsec Security Associations
ip xfrm state list

# Show IPsec Security Policies
ip xfrm policy list

# Monitor IPsec events
ip xfrm monitor

# Flush all SAs
sudo ip xfrm state flush

# Flush all policies
sudo ip xfrm policy flush
```

---

## `ip tcp_metrics` — TCP Metrics Cache

```bash
# Show cached TCP metrics
ip tcp_metrics show

# Show for a specific destination
ip tcp_metrics show 8.8.8.8

# Flush cached metrics
sudo ip tcp_metrics flush

# Delete metrics for a specific destination
sudo ip tcp_metrics delete 8.8.8.8
```

---

## `ip token` — IPv6 Tokenized Interface Identifiers

```bash
# Show current token
ip token show

# Set a token for an interface
sudo ip token set ::1234:5678:90ab:cdef dev eth0
```

---

## `ip l2tp` — L2TPv3 Management

```bash
# Show L2TP tunnels
ip l2tp show tunnel

# Show L2TP sessions
ip l2tp show session

# Add a tunnel
sudo ip l2tp add tunnel tunnel_id 1 peer_tunnel_id 1 encap udp \
  local 198.51.100.1 remote 203.0.113.1 udp_sport 5000 udp_dport 5000

# Add a session
sudo ip l2tp add session tunnel_id 1 session_id 1 peer_session_id 1

# Delete a session
sudo ip l2tp del session tunnel_id 1 session_id 1

# Delete a tunnel
sudo ip l2tp del tunnel tunnel_id 1
```

---

# 2. `ping` — ICMP Connectivity Testing

Sends ICMP Echo Request packets to test whether a host is reachable and measure round-trip time.

## Syntax

```bash
ping [OPTIONS] DESTINATION
```

## All Flags and Options

| Flag | Description |
|------|-------------|
| `-c COUNT` | Stop after sending COUNT packets |
| `-i INTERVAL` | Seconds between packets (default: 1). Intervals < 0.2 require root |
| `-w DEADLINE` | Timeout in seconds; ping exits after this many seconds regardless of packets sent/received |
| `-W TIMEOUT` | Time to wait for each response in seconds |
| `-s SIZE` | Payload size in bytes (default: 56, total ICMP = 64 with header) |
| `-t TTL` | Set the IP Time To Live |
| `-I INTERFACE` | Bind to a specific interface or source IP address |
| `-f` | Flood ping — sends packets as fast as possible (root only). Prints `.` for sent and backspace for received |
| `-l PRELOAD` | Send PRELOAD packets before waiting for replies (root only) |
| `-n` | Numeric output only (don't resolve hostnames) |
| `-q` | Quiet mode — only show summary at the end |
| `-v` | Verbose output |
| `-a` | Audible ping — beep on each reply |
| `-A` | Adaptive ping — adjust interval to RTT |
| `-b` | Allow pinging a broadcast address |
| `-B` | Do not allow ping to change source address |
| `-d` | Set SO_DEBUG socket option |
| `-D` | Print timestamp (Unix time + microseconds) before each line |
| `-F FLOW` | Set IPv6 flow label (IPv6 only) |
| `-L` | Suppress loopback of multicast packets |
| `-m MARK` | Set the routing mark on outgoing packets |
| `-M HINT` | Path MTU discovery strategy: `do` (set DF), `want` (try DF), `dont` (don't set DF) |
| `-N` | Use ICMP Node Information Queries (IPv6) |
| `-O` | Report outstanding ICMP ECHO replies before sending next |
| `-p PATTERN` | Fill padding bytes with hex pattern (e.g., `-p ff`) |
| `-Q TOS` | Set Quality of Service / DSCP bits in IP header |
| `-r` | Bypass routing table (send directly on attached network) |
| `-R` | Record route (IPv4; limited to 9 hops) |
| `-S SNDBUF` | Set socket send buffer size |
| `-T OPTION` | Set special IP timestamp options: `tsonly`, `tsandaddr`, `tsprespec` |
| `-U` | Print full user-to-user latency |
| `-4` | Force IPv4 |
| `-6` | Force IPv6 |

## Examples

```bash
# Basic ping
ping google.com
# Output: 64 bytes from 142.250.80.46: icmp_seq=1 ttl=118 time=11.2 ms

# Ping 5 times then stop
ping -c 5 192.168.1.1

# Ping with 0.2 second interval
ping -i 0.2 192.168.1.1

# Ping with a 10-second deadline (exit after 10s)
ping -w 10 192.168.1.1

# Ping with large packet size (test MTU)
ping -s 1472 -M do 192.168.1.1
# If packet is too large, you'll see: "Frag needed and DF set"
# This helps find the maximum MTU on the path

# Flood ping (root only, test stress/packet loss)
sudo ping -f -c 1000 192.168.1.1

# Ping from a specific source IP
ping -I 192.168.1.100 8.8.8.8

# Ping from a specific interface
ping -I eth0 8.8.8.8

# Ping with timestamps
ping -D -c 3 google.com

# Quiet mode (summary only)
ping -q -c 10 google.com
# Output:
# 10 packets transmitted, 10 received, 0% packet loss, time 9012ms
# rtt min/avg/max/mdev = 10.123/11.456/14.789/1.234 ms

# Ping with audible beep
ping -a google.com

# Set TTL to 10 (will fail if destination is >10 hops away)
ping -t 10 google.com

# Ping a broadcast address (discover hosts on LAN)
ping -b 192.168.1.255

# Numeric output (skip DNS resolution)
ping -n -c 3 8.8.8.8

# Adaptive ping (adjusts interval to match RTT)
ping -A -c 20 google.com

# Record route option
ping -R -c 1 google.com

# Set TOS/DSCP
ping -Q 0x10 google.com

# IPv6 ping
ping -6 ipv6.google.com
ping6 ipv6.google.com               # Alternative command
```

**Understanding ping output:**

```
PING google.com (142.250.80.46) 56(84) bytes of data.
64 bytes from lax17s55-in-f14.1e100.net (142.250.80.46): icmp_seq=1 ttl=118 time=11.2 ms
```

- `56(84)` — 56 bytes payload + 8 bytes ICMP header + 20 bytes IP header = 84 bytes total
- `icmp_seq=1` — Sequence number (gaps indicate packet loss)
- `ttl=118` — Remaining hops (started at 128, so ~10 hops away)
- `time=11.2 ms` — Round-trip time

**Summary statistics:**

```
--- google.com ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 4006ms
rtt min/avg/max/mdev = 10.123/11.456/14.789/1.234 ms
```

- `min` — Fastest round trip
- `avg` — Average round trip
- `max` — Slowest round trip
- `mdev` — Standard deviation (jitter)

---

# 3. `traceroute` — Trace the Route to a Host

Maps every router (hop) between your machine and a destination by sending packets with incrementally increasing TTL values. When TTL expires at a router, it sends back an ICMP Time Exceeded message.

## Syntax

```bash
traceroute [OPTIONS] DESTINATION [PACKET_LENGTH]
```

## All Flags and Options

| Flag | Description |
|------|-------------|
| `-4` | Force IPv4 |
| `-6` | Force IPv6 |
| `-I` | Use ICMP ECHO instead of UDP (root required) |
| `-T` | Use TCP SYN instead of UDP (root required; good for firewalled hosts) |
| `-U` | Use UDP (default) |
| `-d` | Enable socket debugging |
| `-F` | Set Don't Fragment flag |
| `-f FIRST_TTL` | Start with this TTL (default: 1) |
| `-g GATEWAY` | Use loose source routing through this gateway |
| `-i INTERFACE` | Bind to a specific interface |
| `-m MAX_TTL` | Maximum TTL / number of hops (default: 30) |
| `-n` | Numeric output only (don't resolve hostnames) |
| `-p PORT` | Destination port (default: 33434 for UDP, 80 for TCP) |
| `-q NQUERIES` | Number of probes per hop (default: 3) |
| `-r` | Bypass routing table |
| `-s SOURCE` | Use this source address |
| `-t TOS` | Set Type of Service / DSCP |
| `-w WAITTIME` | Seconds to wait for response per probe (default: 5) |
| `-z SENDWAIT` | Minimum time interval between probes in ms (default: 0) |
| `-A` | Perform AS path lookups (show ASN for each hop) |
| `-e` | Display ICMP extensions (MPLS labels, etc.) |
| `-M METHOD` | Method: `default`, `icmp`, `tcp`, `udp`, `udplite`, `dccp`, `raw` |
| `-N SQUERIES` | Simultaneous probes (default: 16) |
| `-O OPTION` | Module-specific option |
| `--mtu` | Discover and display path MTU |
| `--back` | Display backward route TTL |
| `--sport PORT` | Source port |

## Examples

```bash
# Basic traceroute
traceroute google.com
# Output:
#  1  gateway (192.168.1.1)  0.543 ms  0.397 ms  0.456 ms
#  2  isp-router (10.0.0.1)  5.234 ms  5.178 ms  5.312 ms
#  3  * * *                                                       # No response (firewall)
#  4  lax17s55-in-f14.1e100.net (142.250.80.46)  11.234 ms  11.456 ms  11.123 ms

# Use ICMP (better success through some firewalls)
sudo traceroute -I google.com

# Use TCP on port 443 (best for firewalled destinations)
sudo traceroute -T -p 443 google.com

# Numeric only (faster, no DNS resolution delay)
traceroute -n google.com

# Limit to 15 hops
traceroute -m 15 google.com

# Start from hop 5 (skip known initial hops)
traceroute -f 5 google.com

# Only 1 probe per hop (faster but less reliable)
traceroute -q 1 google.com

# Show AS numbers
traceroute -A google.com

# Use a specific source address
traceroute -s 192.168.1.100 google.com

# Discover path MTU
traceroute --mtu google.com

# Increase wait time per probe to 10 seconds
traceroute -w 10 google.com

# Use ICMP with Don't Fragment flag
sudo traceroute -I -F google.com

# Traceroute from a specific interface
traceroute -i eth0 google.com
```

**Understanding the output:**

Each line represents one hop. `*` means no response was received for that probe (the router may be configured to not respond, or a firewall is blocking).

---

# 4. `tracepath` — Route Tracing Without Root

Similar to `traceroute` but does not require root privileges. Also discovers the Path MTU.

## Syntax

```bash
tracepath [OPTIONS] DESTINATION[/PORT]
```

## All Flags

| Flag | Description |
|------|-------------|
| `-4` | Force IPv4 |
| `-6` | Force IPv6 |
| `-n` | Numeric output (don't resolve names) |
| `-b` | Print both hostname and IP |
| `-l LENGTH` | Initial packet length (default: 65535 for IPv4, 128000 for IPv6) |
| `-m MAX_HOPS` | Maximum hops (default: 30) |
| `-p PORT` | Destination port |

## Examples

```bash
# Basic tracepath
tracepath google.com

# Tracepath to a specific port
tracepath google.com/443

# Numeric output
tracepath -n google.com

# Set max hops
tracepath -m 20 google.com

# IPv6
tracepath -6 ipv6.google.com
```

---

# 5. `mtr` — Combined Traceroute + Ping

`mtr` combines `traceroute` and `ping` into a single real-time diagnostic tool. It continuously probes each hop and updates statistics live.

## Syntax

```bash
mtr [OPTIONS] DESTINATION
```

## All Flags and Options

| Flag | Description |
|------|-------------|
| `-r` / `--report` | Report mode — run then print final report (non-interactive) |
| `-w` / `--report-wide` | Wide report (don't truncate hostnames) |
| `-c COUNT` | Number of pings per hop (default: 10 in report mode, unlimited in interactive) |
| `-s SIZE` | Packet size in bytes |
| `-n` / `--no-dns` | Numeric output (no DNS resolution) |
| `-b` / `--show-ips` | Show both hostnames and IPs |
| `-o FIELDS` | Select output fields (see below) |
| `-i INTERVAL` | Interval between probes in seconds (default: 1) |
| `-m MAX_TTL` | Maximum TTL (default: 30) |
| `-f FIRST_TTL` | Starting TTL (default: 1) |
| `-4` | Force IPv4 |
| `-6` | Force IPv6 |
| `-u` | Use UDP instead of ICMP |
| `-T` | Use TCP SYN |
| `-P PORT` | Target port (for TCP/UDP) |
| `-L LOCALPORT` | Source port |
| `-e` | Display ICMP extensions |
| `-a ADDRESS` | Bind to source address |
| `-I INTERFACE` | Bind to interface |
| `-M MARK` | Set routing mark |
| `-Q TOS` | Set TOS/DSCP |
| `-z` | Show AS numbers |
| `-y NUM` | Show AS number in specific format: 0=none, 1=number, 2=name, 3=both |
| `--csv` | Output in CSV format |
| `--raw` | Output in raw format |
| `--xml` | Output in XML format |
| `--json` | Output in JSON format |
| `--gtk` | Use GTK interface |
| `--curses` | Use ncurses interface (default) |
| `--split` | Split output format |
| `--no-dns` | Same as `-n` |

**Output fields (`-o` flag):**

| Code | Field |
|------|-------|
| `L` | Loss ratio |
| `D` | Dropped packets |
| `R` | Received packets |
| `S` | Sent packets |
| `N` | Newest RTT (ms) |
| `B` | Min/Best RTT (ms) |
| `A` | Average RTT (ms) |
| `W` | Max/Worst RTT (ms) |
| `V` | Standard deviation |
| `G` | Geometric mean |
| `J` | Current jitter |
| `M` | Jitter mean/avg |
| `X` | Worst jitter |
| `I` | Inter-arrival jitter |

## Examples

```bash
# Interactive mode (real-time updates)
mtr google.com

# Report mode (run then print summary)
mtr -r -c 100 google.com

# Wide report with 50 probes
mtr -rw -c 50 google.com

# Show IPs and hostnames
mtr -b google.com

# Use TCP on port 443
mtr -T -P 443 google.com

# JSON output for scripting
mtr --json -c 10 google.com

# Show AS numbers
mtr -z google.com

# Custom output fields (loss, sent, received, best, avg, worst, stdev)
mtr -o "LSRBAWV" google.com

# Numeric only with 0.5s interval
mtr -n -i 0.5 google.com

# Start from hop 3, max 20 hops
mtr -f 3 -m 20 google.com

# CSV output for later analysis
mtr --csv -c 100 google.com > mtr_report.csv

# Bind to specific source
mtr -a 192.168.1.100 google.com
```

---

# 6. `ss` — Socket Statistics

`ss` is the modern replacement for `netstat`. It retrieves socket information directly from the kernel and is significantly faster.

## Syntax

```bash
ss [OPTIONS] [FILTER]
```

## All Flags and Options

| Flag | Description |
|------|-------------|
| `-t` | Show TCP sockets |
| `-u` | Show UDP sockets |
| `-w` | Show RAW sockets |
| `-x` | Show Unix domain sockets |
| `-d` | Show DCCP sockets |
| `-S` | Show SCTP sockets |
| `-l` | Show only listening sockets |
| `-a` | Show all sockets (listening + non-listening) |
| `-n` | Numeric output (don't resolve service names) |
| `-r` | Resolve IP addresses to hostnames |
| `-p` | Show process using the socket |
| `-e` | Show detailed socket info (uid, inode, cookie) |
| `-m` | Show socket memory usage |
| `-i` | Show TCP internal information (congestion control, RTT, etc.) |
| `-K` | Force kill sockets matching the filter (root required) |
| `-s` | Print socket statistics summary |
| `-o` | Show timer information |
| `-E` | Continuously display socket events |
| `-Z` | Display SELinux security context |
| `-z` | Display socket context (similar to `-Z`) |
| `-N NSNAME` | Switch to network namespace |
| `-b` | Show BPF filter socket option |
| `-4` | Show IPv4 sockets only |
| `-6` | Show IPv6 sockets only |
| `-0` | Show PACKET sockets |
| `-f FAMILY` | Filter by address family: `unix`, `inet`, `inet6`, `link`, `netlink`, `vsock`, `tipc`, `xdp` |
| `-A QUERY` | Socket tables to dump: `all`, `inet`, `tcp`, `udp`, `raw`, `unix`, `packet`, `netlink`, `unix_dgram`, `unix_stream`, `unix_seqpacket`, `packet_raw`, `packet_dgram`, `dccp`, `sctp`, `vsock_stream`, `vsock_dgram`, `xdp` |
| `-D FILE` | Dump raw TCP socket data to FILE |
| `-F FILE` | Read filter from FILE |
| `-H` | Suppress header line |
| `--no-header` | Same as `-H` |
| `--tos` | Show TOS value |
| `--cgroup` | Show cgroup |
| `--tipcinfo` | Show TIPC socket info |
| `-V` | Show version |

## State Filters

```bash
# Filter by connection state
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

# Exclude a state
ss exclude LISTEN
ss exclude TIME-WAIT

# Combined state groups
ss state connected           # All except LISTEN and CLOSED
ss state synchronized        # ESTABLISHED + derivatives
ss state bucket              # TIME-WAIT + SYN-RECV
ss state big                 # Everything except bucket
```

## Address/Port Filters

```bash
# Filter by source port
ss sport = :80
ss sport = :http
ss sport gt :1024
ss sport lt :1024
ss sport != :22

# Filter by destination port
ss dport = :443
ss dport = :https

# Filter by source address
ss src 192.168.1.100
ss src 192.168.1.0/24

# Filter by destination address
ss dst 8.8.8.8
ss dst 10.0.0.0/8

# Combine filters with 'and' / 'or'
ss -tn 'src 192.168.1.0/24 and dport = :443'
ss -tn '( dport = :80 or dport = :443 ) and src 192.168.1.0/24'

# Filter operators
# =  eq   : Equal
# != ne   : Not equal
# >  gt   : Greater than
# <  lt   : Less than
# >= ge   : Greater than or equal
# <= le   : Less than or equal
```

## Examples

```bash
# Show all listening TCP sockets with process names
ss -tlnp
# Output:
# State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process
# LISTEN  0       128     0.0.0.0:22          0.0.0.0:*          users:(("sshd",pid=1234,fd=3))
# LISTEN  0       511     0.0.0.0:80          0.0.0.0:*          users:(("nginx",pid=5678,fd=8))

# Show all established connections
ss -tn state established

# Show all sockets with timer info
ss -to

# Show TCP internal info (congestion window, RTT, etc.)
ss -ti

# Show socket memory usage
ss -tm

# Show summary
ss -s
# Output:
# Total: 356
# TCP:   15 (estab 3, closed 0, orphaned 0, timewait 0)
# Transport    Total     IP        IPv6
# RAW          1         0         1
# UDP          8         5         3
# TCP          15        10        5
# INET         24        15        9
# FRAG         0         0         0

# Show UDP sockets
ss -ulnp

# Show Unix domain sockets
ss -x

# Show all sockets on port 443
ss -tn dport = :443

# Show connections from a specific subnet
ss -tn src 10.0.0.0/8

# Kill all TIME-WAIT sockets to port 80
sudo ss -K dport = :80 state time-wait

# Monitor socket events in real time
ss -E

# Show sockets in JSON format (via filter to jq)
ss -tn | head

# Show SELinux context
ss -Ztn

# Show all SCTP sockets
ss -S

# Show detailed info (uid, inode)
ss -teln
```

---

# 7. `netstat` — Network Statistics (Legacy)

`netstat` is the older tool for displaying connections, routing tables, and interface statistics. Replaced by `ss` and `ip` but still commonly used.

## Syntax

```bash
netstat [OPTIONS]
```

## All Flags and Options

| Flag | Description |
|------|-------------|
| `-t` | Show TCP connections |
| `-u` | Show UDP connections |
| `-l` | Show only listening sockets |
| `-a` | Show all sockets (listening + established) |
| `-n` | Numeric addresses and ports (don't resolve) |
| `-p` | Show PID/program name (root required for all processes) |
| `-r` | Show routing table |
| `-i` | Show interface statistics |
| `-g` | Show multicast group memberships |
| `-s` | Show per-protocol statistics |
| `-c` | Continuous mode (update every second) |
| `-e` | Show additional info (user, inode) |
| `-o` | Show timers |
| `-w` | Show RAW sockets |
| `-x` | Show Unix sockets |
| `-W` | Don't truncate IP addresses |
| `-v` | Verbose |
| `--numeric-hosts` | Don't resolve hostnames |
| `--numeric-ports` | Don't resolve port names |
| `--numeric-users` | Don't resolve usernames |
| `-A FAMILY` | Address families: `inet`, `inet6`, `unix`, `ipx`, `ax25`, `netrom`, `econet`, `ddp`, `bluetooth` |
| `-C` | Print routing info from route cache |
| `-F` | Print routing info from FIB |
| `-M` | Show masqueraded connections |
| `-Z` | Show SELinux security context |

## Examples

```bash
# Show all listening TCP/UDP ports with process names
netstat -tulnp

# Show all connections (listening + established)
netstat -an

# Show only TCP connections
netstat -tn

# Show routing table
netstat -rn

# Show interface statistics
netstat -i

# Show extended interface statistics
netstat -ie               # Similar to ifconfig

# Show per-protocol statistics (TCP/UDP/ICMP)
netstat -s

# Show TCP statistics only
netstat -st

# Show multicast group memberships
netstat -g

# Continuous monitoring
netstat -c -tn

# Show all Unix sockets
netstat -x

# Show timers
netstat -to

# Wide output (don't truncate addresses)
netstat -Wtn

# Show with SELinux context
netstat -Ztn

# Count connections by state
netstat -tn | awk '{print $6}' | sort | uniq -c | sort -rn

# Show masqueraded connections
netstat -M
```

---

# 8. `curl` — Data Transfer Tool

`curl` transfers data to or from a server using URLs. Supports HTTP, HTTPS, FTP, FTPS, SCP, SFTP, TFTP, LDAP, TELNET, MQTT, and many more protocols.

## Syntax

```bash
curl [OPTIONS] URL [URL...]
```

## All Major Flags and Options

### HTTP Method and Request Control

| Flag | Description |
|------|-------------|
| `-X METHOD` / `--request METHOD` | Set HTTP method: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS` |
| `-d DATA` / `--data DATA` | Send POST data (implies `-X POST`). Use `@filename` to read from file |
| `--data-raw DATA` | Send POST data without interpreting `@` |
| `--data-urlencode DATA` | URL-encode the data before sending |
| `--data-binary DATA` | Send binary data with no processing |
| `--data-ascii DATA` | Same as `--data` |
| `-F "field=value"` / `--form` | Multipart form data (file upload). Use `@filename` for files |
| `-G` / `--get` | Force GET method even with `-d` data (appends to URL as query params) |
| `-I` / `--head` | Send HEAD request (headers only) |

### Headers and Authentication

| Flag | Description |
|------|-------------|
| `-H "Header: Value"` / `--header` | Add/replace HTTP header. Use `-H "Header:"` to remove |
| `-A "Agent"` / `--user-agent` | Set User-Agent header |
| `-e URL` / `--referer` | Set Referer header |
| `-u user:pass` / `--user` | HTTP Basic authentication |
| `--basic` | Use HTTP Basic auth (default) |
| `--digest` | Use HTTP Digest auth |
| `--ntlm` | Use HTTP NTLM auth |
| `--negotiate` | Use HTTP Negotiate (SPNEGO/Kerberos) auth |
| `--anyauth` | Auto-select best auth method |
| `-b "cookies"` / `--cookie` | Send cookies (string or `@file`) |
| `-c FILE` / `--cookie-jar` | Save cookies to file |
| `-j` / `--junk-session-cookies` | Discard session cookies from cookie jar |
| `--oauth2-bearer TOKEN` | OAuth 2.0 Bearer token |
| `--aws-sigv4 PROVIDER` | AWS Signature Version 4 signing |

### Output and Verbosity

| Flag | Description |
|------|-------------|
| `-o FILE` / `--output` | Write output to FILE |
| `-O` / `--remote-name` | Save with remote filename |
| `-J` / `--remote-header-name` | Use Content-Disposition filename |
| `-s` / `--silent` | Silent mode (no progress, no errors) |
| `-S` / `--show-error` | Show errors even in silent mode |
| `-v` / `--verbose` | Verbose output (shows request/response headers) |
| `--trace FILE` | Full hex trace to FILE |
| `--trace-ascii FILE` | Full ASCII trace to FILE |
| `--trace-time` | Add timestamps to trace |
| `-w FORMAT` / `--write-out` | Print info after transfer (see format variables below) |
| `-i` / `--include` | Include response headers in output |
| `-D FILE` / `--dump-header` | Save response headers to FILE |
| `--no-progress-meter` | Hide progress bar but still show output and errors |
| `--progress-bar` | Simple progress bar instead of statistics |
| `-#` | Same as `--progress-bar` |

### Redirects and Retries

| Flag | Description |
|------|-------------|
| `-L` / `--location` | Follow redirects |
| `--max-redirs NUM` | Maximum number of redirects (default: 50) |
| `--post301` | Keep POST method after 301 redirect |
| `--post302` | Keep POST method after 302 redirect |
| `--post303` | Keep POST method after 303 redirect |
| `--retry NUM` | Retry on transient failures |
| `--retry-delay SECONDS` | Wait between retries |
| `--retry-max-time SECONDS` | Maximum total retry time |
| `--retry-all-errors` | Retry on all errors (not just transient) |

### SSL/TLS

| Flag | Description |
|------|-------------|
| `-k` / `--insecure` | Skip SSL certificate verification |
| `--cacert FILE` | Use this CA certificate bundle |
| `--capath DIR` | CA certificate directory |
| `--cert FILE` | Client certificate |
| `--cert-type TYPE` | Certificate type: `PEM`, `DER`, `ENG` |
| `--key FILE` | Private key |
| `--key-type TYPE` | Key type: `PEM`, `DER`, `ENG` |
| `--pass PHRASE` | Private key passphrase |
| `--ciphers LIST` | SSL ciphers to use |
| `--tls-max VERSION` | Maximum TLS version: `1.0`, `1.1`, `1.2`, `1.3` |
| `--tlsv1` | Force TLS 1.x |
| `--tlsv1.0` / `--tlsv1.1` / `--tlsv1.2` / `--tlsv1.3` | Force specific TLS version |
| `--ssl` | Try SSL/TLS |
| `--ssl-reqd` | Require SSL/TLS |
| `--crl-file FILE` | Certificate Revocation List |
| `--cert-status` | Verify server certificate via OCSP |
| `--pinnedpubkey FILE` | Pin public key (file or hash) |
| `--ssl-allow-beast` | Allow BEAST vulnerability |
| `--ssl-no-revoke` | Disable cert revocation checks (Windows) |
| `--ssl-revoke-best-effort` | Best-effort revocation check |

### Connection Control

| Flag | Description |
|------|-------------|
| `--connect-timeout SECONDS` | Maximum time for connection phase |
| `-m SECONDS` / `--max-time` | Maximum total transfer time |
| `--speed-limit BYTES` | Minimum speed in bytes/sec before aborting |
| `--speed-time SECONDS` | Time to measure speed-limit |
| `--limit-rate RATE` | Limit transfer speed (e.g., `100K`, `1M`) |
| `--keepalive-time SECONDS` | TCP keepalive interval |
| `--no-keepalive` | Disable TCP keepalive |
| `--interface IFACE` | Use this interface |
| `--local-port RANGE` | Local port range |
| `--dns-servers SERVERS` | Use custom DNS servers |
| `--resolve HOST:PORT:ADDR` | Custom DNS resolution |
| `--connect-to HOST:PORT:CONNECT_HOST:CONNECT_PORT` | Connect to alternative host |
| `--happy-eyeballs-timeout-ms MS` | Happy Eyeballs timeout |
| `--tcp-nodelay` | Enable TCP_NODELAY |
| `--tcp-fastopen` | Enable TCP Fast Open |

### Proxy

| Flag | Description |
|------|-------------|
| `-x PROXY` / `--proxy` | Use proxy `[protocol://]host[:port]` |
| `--proxy-user user:pass` | Proxy authentication |
| `--proxy-basic` | Proxy Basic auth |
| `--proxy-digest` | Proxy Digest auth |
| `--proxy-ntlm` | Proxy NTLM auth |
| `--proxy-header "H: V"` | Proxy-only header |
| `--noproxy HOSTS` | Comma-separated list of hosts to skip proxy |
| `--socks4 HOST:PORT` | SOCKS4 proxy |
| `--socks4a HOST:PORT` | SOCKS4a proxy (resolve DNS remotely) |
| `--socks5 HOST:PORT` | SOCKS5 proxy |
| `--socks5-hostname HOST:PORT` | SOCKS5 proxy (resolve DNS remotely) |

### Miscellaneous

| Flag | Description |
|------|-------------|
| `-C OFFSET` / `--continue-at` | Resume transfer at offset (`-` for auto) |
| `-T FILE` / `--upload-file` | Upload file |
| `-K FILE` / `--config` | Read config from file |
| `-q` | Do not read `.curlrc` |
| `--compressed` | Request compressed response (auto decompress) |
| `--create-dirs` | Create parent directories for output file |
| `--crlf` | Convert LF to CRLF |
| `-Z` / `--parallel` | Perform transfers in parallel |
| `--parallel-max NUM` | Maximum parallel transfers |
| `--url URL` | Specify URL (alternative to positional) |
| `-: ` / `--next` | Reset state for next URL |
| `--path-as-is` | Don't squash `..` in URL path |
| `--raw` | Disable HTTP decoding |
| `--no-alpn` | Disable ALPN TLS extension |
| `--no-npn` | Disable NPN TLS extension |
| `--no-sessionid` | Disable SSL session ID reuse |
| `--no-buffer` | Disable output buffering |
| `--stderr FILE` | Redirect stderr to file |
| `--fail-early` | Fail on first error in batch |
| `-f` / `--fail` | Fail silently on HTTP errors (no output on 4xx/5xx) |
| `--fail-with-body` | Fail on HTTP errors but still output body |
| `-N` / `--no-buffer` | Disable buffering |
| `--globoff` | Disable URL globbing (brackets) |
| `--remote-time` | Set local file time to remote file time |
| `--xattr` | Store metadata in extended file attributes |

### `--write-out` Format Variables

```bash
curl -w "HTTP %{http_code}, Time: %{time_total}s, Size: %{size_download} bytes\n" -so /dev/null URL
```

| Variable | Description |
|----------|-------------|
| `%{http_code}` | HTTP response code |
| `%{http_version}` | HTTP version used |
| `%{url_effective}` | Last effective URL (after redirects) |
| `%{redirect_url}` | URL of redirect |
| `%{num_redirects}` | Number of redirects |
| `%{time_total}` | Total transfer time (seconds) |
| `%{time_namelookup}` | DNS resolution time |
| `%{time_connect}` | TCP connect time |
| `%{time_appconnect}` | TLS handshake time |
| `%{time_pretransfer}` | Time until transfer started |
| `%{time_starttransfer}` | Time to first byte (TTFB) |
| `%{time_redirect}` | Time spent in redirects |
| `%{size_download}` | Bytes downloaded |
| `%{size_upload}` | Bytes uploaded |
| `%{size_header}` | Header size in bytes |
| `%{size_request}` | Request size in bytes |
| `%{speed_download}` | Download speed (bytes/sec) |
| `%{speed_upload}` | Upload speed (bytes/sec) |
| `%{content_type}` | Content-Type header |
| `%{filename_effective}` | Filename used for output |
| `%{local_ip}` | Local IP used |
| `%{local_port}` | Local port used |
| `%{remote_ip}` | Remote IP connected to |
| `%{remote_port}` | Remote port connected to |
| `%{ssl_verify_result}` | SSL verification result |
| `%{scheme}` | URL scheme used |
| `%{method}` | HTTP method used |

## Comprehensive Examples

```bash
# Simple GET request
curl https://example.com

# GET with headers shown
curl -i https://example.com

# HEAD request (headers only)
curl -I https://example.com

# Verbose output (debug)
curl -v https://example.com

# POST with form data
curl -X POST -d "user=alice&pass=secret" https://example.com/login

# POST with JSON
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","age":30}' \
  https://api.example.com/users

# POST with JSON from file
curl -X POST \
  -H "Content-Type: application/json" \
  -d @data.json \
  https://api.example.com/users

# PUT request
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob"}' \
  https://api.example.com/users/1

# DELETE request
curl -X DELETE https://api.example.com/users/1

# PATCH request
curl -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie"}' \
  https://api.example.com/users/1

# Upload a file with multipart form
curl -F "file=@photo.jpg" -F "description=My Photo" https://example.com/upload

# Download a file with original name
curl -O https://example.com/file.tar.gz

# Download with a custom filename
curl -o myfile.tar.gz https://example.com/file.tar.gz

# Resume a partial download
curl -C - -O https://example.com/largefile.iso

# Follow redirects
curl -L https://example.com/redirect

# Download with progress bar
curl -# -O https://example.com/file.tar.gz

# Silent download (no output except errors)
curl -sS -O https://example.com/file.tar.gz

# Basic authentication
curl -u admin:password https://api.example.com/data

# Bearer token authentication
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/data

# Set custom User-Agent
curl -A "MyApp/1.0" https://example.com

# Set cookies
curl -b "session=abc123" https://example.com

# Save and send cookies across requests
curl -c cookies.txt https://example.com/login -d "user=alice&pass=secret"
curl -b cookies.txt https://example.com/dashboard

# Use a proxy
curl -x http://proxy.example.com:8080 https://example.com
curl -x socks5://proxy.example.com:1080 https://example.com

# Skip SSL verification (for self-signed certs)
curl -k https://self-signed.example.com

# Client certificate authentication
curl --cert client.pem --key client.key https://secure.example.com

# Limit download speed
curl --limit-rate 500K -O https://example.com/file.tar.gz

# Set connection timeout
curl --connect-timeout 5 --max-time 30 https://example.com

# Custom DNS resolution
curl --resolve example.com:443:1.2.3.4 https://example.com

# HTTP/2 (enabled by default when available)
curl --http2 https://example.com

# HTTP/3 (if compiled with support)
curl --http3 https://example.com

# Timing breakdown
curl -o /dev/null -s -w "\
  DNS:        %{time_namelookup}s\n\
  Connect:    %{time_connect}s\n\
  TLS:        %{time_appconnect}s\n\
  TTFB:       %{time_starttransfer}s\n\
  Total:      %{time_total}s\n\
  Size:       %{size_download} bytes\n\
  Speed:      %{speed_download} bytes/sec\n\
  HTTP Code:  %{http_code}\n" https://example.com

# Parallel downloads
curl -Z -O https://example.com/file1.tar.gz -O https://example.com/file2.tar.gz

# Send from stdin
echo "Hello World" | curl -X POST -d @- https://example.com/api

# Request compressed response
curl --compressed https://example.com

# Retry on failure
curl --retry 3 --retry-delay 5 https://example.com

# FTP download
curl -u user:pass ftp://ftp.example.com/file.txt

# FTP upload
curl -u user:pass -T localfile.txt ftp://ftp.example.com/

# SCP download
curl -u user: --key ~/.ssh/id_rsa scp://example.com/~/file.txt

# SFTP download
curl -u user: --key ~/.ssh/id_rsa sftp://example.com/home/user/file.txt
```

---

# 9. `wget` — Non-Interactive Network Downloader

`wget` specializes in downloading files. Supports HTTP, HTTPS, FTP. Key strengths: recursive downloads, resuming, and background operation.

## Syntax

```bash
wget [OPTIONS] URL [URL...]
```

## All Major Flags and Options

### Download Control

| Flag | Description |
|------|-------------|
| `-O FILE` | Save to FILE (use `-` for stdout) |
| `-o LOGFILE` | Log output to LOGFILE |
| `-a LOGFILE` | Append to LOGFILE |
| `-c` / `--continue` | Resume partial download |
| `-N` / `--timestamping` | Only download if remote file is newer |
| `-T SECONDS` / `--timeout` | Set all timeout values |
| `--connect-timeout SECONDS` | Connection timeout |
| `--read-timeout SECONDS` | Read timeout |
| `--dns-timeout SECONDS` | DNS timeout |
| `-t NUM` / `--tries` | Number of retries (0 = infinite) |
| `--retry-connrefused` | Retry on connection refused |
| `--retry-on-http-error CODES` | Retry on specific HTTP codes |
| `-w SECONDS` / `--wait` | Wait between retrievals |
| `--waitretry SECONDS` | Wait between retries |
| `--random-wait` | Randomize wait time (0.5x to 1.5x of `-w`) |
| `-Q SIZE` / `--quota` | Download quota (e.g., `100m`) |
| `--limit-rate RATE` | Limit download speed (e.g., `200k`) |
| `--bind-address ADDR` | Bind to local address |
| `-b` / `--background` | Go to background after startup |
| `--progress TYPE` | Progress type: `bar`, `dot`, `dot:mega`, `dot:giga` |
| `--show-progress` | Always show progress bar |
| `--no-verbose` | Turn off verbose without being silent |
| `-q` / `--quiet` | Quiet mode |
| `-v` / `--verbose` | Verbose mode |
| `-d` / `--debug` | Debug mode |
| `-nv` | Non-verbose (only errors and basic info) |
| `-i FILE` / `--input-file` | Read URLs from FILE |
| `-B URL` / `--base` | Base URL for relative links |

### HTTP Options

| Flag | Description |
|------|-------------|
| `--header "H: V"` | Add custom header |
| `--user-agent STRING` / `-U` | Set User-Agent |
| `--referer URL` | Set Referer header |
| `--http-user USER` | HTTP username |
| `--http-password PASS` | HTTP password |
| `--post-data STRING` | Send POST data |
| `--post-file FILE` | POST data from file |
| `--method METHOD` | HTTP method to use |
| `--body-data STRING` | Request body |
| `--body-file FILE` | Request body from file |
| `--no-cookies` | Disable cookies |
| `--load-cookies FILE` | Load cookies from file |
| `--save-cookies FILE` | Save cookies to file |
| `--keep-session-cookies` | Save session cookies too |
| `--content-disposition` | Honor Content-Disposition filename |
| `--content-on-error` | Save content on HTTP errors |
| `--no-http-keep-alive` | Disable HTTP keepalive |
| `--no-cache` | Don't use cached versions |
| `--auth-no-challenge` | Send auth without 401 challenge |
| `--compression auto` | Request compression |
| `--max-redirect NUM` | Maximum redirects (default: 20; 0 to disable) |

### SSL/TLS

| Flag | Description |
|------|-------------|
| `--no-check-certificate` | Skip SSL verification |
| `--certificate FILE` | Client certificate |
| `--certificate-type TYPE` | Certificate type |
| `--private-key FILE` | Private key |
| `--private-key-type TYPE` | Key type |
| `--ca-certificate FILE` | CA bundle |
| `--ca-directory DIR` | CA directory |
| `--crl-file FILE` | CRL file |
| `--secure-protocol PROTO` | TLS version: `auto`, `SSLv2`, `SSLv3`, `TLSv1`, `TLSv1_1`, `TLSv1_2`, `TLSv1_3`, `PFS` |
| `--https-only` | Only follow HTTPS links |
| `--no-hsts` | Disable HSTS |

### Recursive Download

| Flag | Description |
|------|-------------|
| `-r` / `--recursive` | Enable recursive download |
| `-l DEPTH` / `--level` | Maximum recursion depth (default: 5; 0 = infinite) |
| `-k` / `--convert-links` | Convert links for local viewing |
| `-p` / `--page-requisites` | Download all resources needed to display page (CSS, JS, images) |
| `-m` / `--mirror` | Shorthand for `-r -N -l inf --no-remove-listing` |
| `-E` / `--adjust-extension` | Add `.html` extension to HTML files |
| `-H` / `--span-hosts` | Allow spanning across hosts |
| `-D DOMAINS` / `--domains` | Comma-separated list of allowed domains |
| `--exclude-domains DOMAINS` | Domains to exclude |
| `-np` / `--no-parent` | Don't ascend to parent directory |
| `-A PATTERN` / `--accept` | Accept only files matching pattern (e.g., `*.pdf`) |
| `-R PATTERN` / `--reject` | Reject files matching pattern |
| `--accept-regex REGEX` | Accept URLs matching regex |
| `--reject-regex REGEX` | Reject URLs matching regex |
| `-I LIST` / `--include-directories` | Include only these directories |
| `-X LIST` / `--exclude-directories` | Exclude these directories |
| `--follow-ftp` | Follow FTP links from HTML |
| `--follow-tags LIST` | HTML tags to follow (e.g., `a,area`) |
| `--ignore-tags LIST` | HTML tags to ignore |
| `--ignore-case` | Case-insensitive pattern matching |
| `--no-host-directories` | Don't create host directories |
| `--cut-dirs NUM` | Skip NUM directory components |
| `-nH` | Same as `--no-host-directories` |
| `--protocol-directories` | Use protocol name in directories |
| `-nd` / `--no-directories` | Don't create any directories |
| `-x` / `--force-directories` | Force directory creation |
| `--robots on/off` | Respect robots.txt (default: on) |
| `--no-clobber` | Don't overwrite existing files |
| `--backups NUM` | Keep NUM backups of files |

### FTP Options

| Flag | Description |
|------|-------------|
| `--ftp-user USER` | FTP username |
| `--ftp-password PASS` | FTP password |
| `--no-passive-ftp` | Use active FTP mode |
| `--no-remove-listing` | Keep `.listing` files |
| `--retr-symlinks` | Retrieve symlinks as files |
| `--no-glob` | Disable FTP globbing |
| `--preserve-permissions` | Preserve permissions |

### Proxy

| Flag | Description |
|------|-------------|
| `-e http_proxy=URL` | Set HTTP proxy |
| `-e https_proxy=URL` | Set HTTPS proxy |
| `-e ftp_proxy=URL` | Set FTP proxy |
| `-e no_proxy=LIST` | No proxy list |
| `--no-proxy` | Don't use any proxy |
| `--proxy-user USER:PASS` | Proxy authentication |

## Examples

```bash
# Download a single file
wget https://example.com/file.tar.gz

# Download with a custom filename
wget -O custom_name.tar.gz https://example.com/file.tar.gz

# Resume interrupted download
wget -c https://example.com/largefile.iso

# Download in background
wget -b https://example.com/largefile.iso
# Check progress: tail -f wget-log

# Download multiple files from a list
wget -i urls.txt

# Mirror an entire website
wget -m -k -p -E -np https://example.com/docs/

# Download only PDFs from a site
wget -r -l 2 -A "*.pdf" https://example.com/docs/

# Limit download speed
wget --limit-rate=200k https://example.com/file.tar.gz

# Download with retry
wget -t 5 --waitretry=30 https://example.com/file.tar.gz

# Download with authentication
wget --http-user=admin --http-password=secret https://example.com/protected/file.txt

# Download through a proxy
wget -e http_proxy=http://proxy:8080 https://example.com/file.tar.gz

# Skip SSL verification
wget --no-check-certificate https://self-signed.example.com/file.txt

# Download only if newer than local file
wget -N https://example.com/file.tar.gz

# Quiet download (only errors)
wget -q https://example.com/file.tar.gz

# Download with custom User-Agent
wget -U "MyApp/1.0" https://example.com

# Download with custom headers
wget --header="Authorization: Bearer TOKEN" https://api.example.com/data

# Spider mode (check links without downloading)
wget --spider https://example.com

# Download only pages under a specific directory, no parent traversal
wget -r -np -l 3 https://example.com/docs/tutorials/

# Save cookies and reuse them
wget --save-cookies cookies.txt --post-data "user=alice&pass=secret" https://example.com/login
wget --load-cookies cookies.txt https://example.com/dashboard

# FTP download
wget ftp://ftp.example.com/pub/file.tar.gz

# FTP with credentials
wget --ftp-user=user --ftp-password=pass ftp://ftp.example.com/file.txt

# Convert links for offline browsing
wget -r -k -p -l 2 https://example.com
```

---

# 10. `dig` — DNS Lookup Utility

`dig` (Domain Information Groper) is the most powerful DNS query tool. It queries DNS servers and returns detailed records.

## Syntax

```bash
dig [@SERVER] NAME [TYPE] [CLASS] [OPTIONS]
```

## All Flags and Options

| Flag | Description |
|------|-------------|
| `@SERVER` | DNS server to query (IP or hostname) |
| `-b ADDRESS` | Source IP address to bind to |
| `-p PORT` | Query port (default: 53) |
| `-q NAME` | Query name (can also be positional) |
| `-t TYPE` | Query type (can also be positional) |
| `-c CLASS` | Query class: `IN` (Internet), `CH` (Chaos), `HS` (Hesiod), `ANY` |
| `-f FILE` | Batch mode — read queries from file |
| `-k KEYFILE` | TSIG key file for signed queries |
| `-y [hmac:]name:key` | TSIG key directly |
| `-x ADDRESS` | Reverse DNS lookup (PTR) |
| `-4` | Force IPv4 |
| `-6` | Force IPv6 |
| `-m` | Enable memory usage debugging |
| `-r` | Do not read `~/.digrc` |
| `-v` | Print version |

### Query Options (Prefixed with `+` to enable, `+no` to disable)

| Option | Description |
|--------|-------------|
| `+short` | Terse output (just the answer) |
| `+noall +answer` | Show only the answer section |
| `+verbose` / `+multiline` | Verbose multi-line output (SOA in human-readable format) |
| `+trace` | Trace delegation path from root servers |
| `+nssearch` | Find authoritative nameservers and show SOA from each |
| `+search` | Use search list from resolv.conf |
| `+nosearch` | Don't use search list |
| `+recurse` / `+norecurse` | Enable/disable recursive query (RD bit) |
| `+tcp` | Use TCP instead of UDP |
| `+notcp` | Use UDP (default) |
| `+dnssec` | Request DNSSEC records (DO bit) |
| `+nodnssec` | Don't request DNSSEC |
| `+cd` | Set CD (Checking Disabled) flag |
| `+nocd` | Clear CD flag |
| `+aaflag` / `+noaaflag` | Set/clear AA (Authoritative Answer) flag |
| `+adflag` / `+noadflag` | Set/clear AD (Authentic Data) flag |
| `+all` | Show all sections and flags |
| `+noall` | Clear all display flags |
| `+answer` / `+noanswer` | Show/hide answer section |
| `+authority` / `+noauthority` | Show/hide authority section |
| `+additional` / `+noadditional` | Show/hide additional section |
| `+question` / `+noquestion` | Show/hide question section |
| `+comments` / `+nocomments` | Show/hide comment lines |
| `+stats` / `+nostats` | Show/hide statistics section |
| `+qr` | Show outgoing query |
| `+cmd` / `+nocmd` | Show/hide initial comment showing dig version |
| `+time=SECONDS` | Query timeout per try |
| `+tries=NUM` | Number of query attempts |
| `+retry=NUM` | Number of retries (tries = retry + 1) |
| `+bufsize=BYTES` | UDP message buffer size (EDNS0) |
| `+edns=VERSION` | Set EDNS version |
| `+noedns` | Disable EDNS |
| `+subnet ADDR/PREFIX` | Set EDNS Client Subnet (ECS) |
| `+cookie` | Send DNS cookie |
| `+nocookie` | Don't send cookie |
| `+nsid` | Request NSID (Name Server IDentifier) |
| `+identify` | Show IP of server that answered (with `+short`) |
| `+split=BYTES` | Split hex/base64 output (default: 56) |
| `+keepopen` | Keep TCP connection open between queries |
| `+ttlid` / `+nottlid` | Show/hide TTL |
| `+ttlunits` | Show TTL in human-readable units |
| `+class` / `+noclass` | Show/hide class |
| `+rrcomments` / `+norrcomments` | Show/hide per-record comments |
| `+onesoa` | Show only one SOA in AXFR |
| `+zflag` | Set Z flag |
| `+ignore` | Ignore truncation (don't retry with TCP) |
| `+fail` | Return SERVFAIL on timeout |
| `+besteffort` | Show partial results on timeout |
| `+domain=NAME` | Set search domain |
| `+mapped` | Allow IPv4-mapped IPv6 addresses |

### DNS Record Types

| Type | Description |
|------|-------------|
| `A` | IPv4 address |
| `AAAA` | IPv6 address |
| `CNAME` | Canonical name (alias) |
| `MX` | Mail exchange |
| `NS` | Name server |
| `PTR` | Pointer (reverse DNS) |
| `SOA` | Start of Authority |
| `TXT` | Text record |
| `SRV` | Service locator |
| `CAA` | Certification Authority Authorization |
| `NAPTR` | Naming Authority Pointer |
| `DNSKEY` | DNSSEC public key |
| `DS` | Delegation Signer (DNSSEC) |
| `RRSIG` | Resource Record Signature (DNSSEC) |
| `NSEC` / `NSEC3` | Next Secure (DNSSEC) |
| `TLSA` | TLS Authentication (DANE) |
| `SSHFP` | SSH Fingerprint |
| `LOC` | Location |
| `HINFO` | Host information |
| `SPF` | Sender Policy Framework (deprecated, use TXT) |
| `AXFR` | Full zone transfer |
| `IXFR` | Incremental zone transfer |
| `ANY` | All record types |

## Examples

```bash
# Basic A record lookup
dig example.com
# The output contains: QUESTION, ANSWER, AUTHORITY, ADDITIONAL sections

# Just the IP address
dig +short example.com

# Query specific record types
dig example.com A
dig example.com AAAA
dig example.com MX
dig example.com NS
dig example.com TXT
dig example.com SOA
dig example.com CNAME
dig example.com SRV
dig example.com CAA

# Query a specific DNS server
dig @8.8.8.8 example.com
dig @1.1.1.1 example.com
dig @9.9.9.9 example.com

# Reverse DNS lookup
dig -x 8.8.8.8
# Returns: 8.8.8.8.in-addr.arpa.  PTR  dns.google.

# Trace the full delegation chain from root
dig +trace example.com

# Only show the answer section
dig +noall +answer example.com

# Show answer with TTL in human-readable units
dig +noall +answer +ttlunits example.com

# Multi-line verbose SOA
dig +multiline example.com SOA

# Test DNSSEC
dig +dnssec example.com

# Check if domain is signed with DNSSEC
dig +short example.com DNSKEY

# Find all authoritative nameservers
dig +nssearch example.com

# Zone transfer (if permitted)
dig @ns1.example.com example.com AXFR

# Query with EDNS Client Subnet
dig +subnet=1.2.3.0/24 example.com @8.8.8.8

# TCP mode (for large responses)
dig +tcp example.com ANY

# Batch queries from file
# queries.txt contains one query per line:
#   example.com A
#   example.org MX
dig -f queries.txt

# Show only specific sections
dig +noall +answer +authority example.com NS

# Request NSID
dig +nsid @8.8.8.8 example.com

# Set timeout and retries
dig +time=2 +tries=3 example.com

# Query SRV records (e.g., for SIP, XMPP, LDAP)
dig _sip._tcp.example.com SRV
dig _xmpp-server._tcp.example.com SRV
dig _ldap._tcp.dc._msdcs.example.com SRV

# Check SPF record
dig +short example.com TXT | grep spf

# Check DMARC record
dig +short _dmarc.example.com TXT

# Check DKIM record
dig +short selector._domainkey.example.com TXT

# Show outgoing query
dig +qr example.com

# Compare results from multiple servers
dig @8.8.8.8 +short example.com
dig @1.1.1.1 +short example.com
dig @9.9.9.9 +short example.com
```

---

# 11. `nslookup` — DNS Query Tool

`nslookup` is an older, simpler DNS query tool. Less detailed than `dig` but still commonly used.

## Syntax

```bash
nslookup [OPTIONS] [NAME] [SERVER]
```

## Options

| Flag | Description |
|------|-------------|
| `-type=TYPE` | Query type (A, AAAA, MX, NS, SOA, TXT, SRV, PTR, ANY, etc.) |
| `-debug` | Show debugging info |
| `-port=PORT` | Query port |
| `-timeout=SECONDS` | Query timeout |
| `-retry=NUM` | Number of retries |
| `-domain=NAME` | Default domain |
| `-search` | Use search list |
| `-class=CLASS` | Query class |

## Interactive Mode Commands

```bash
nslookup                            # Enter interactive mode
> server 8.8.8.8                    # Change DNS server
> set type=MX                       # Set query type
> example.com                       # Perform query
> set debug                         # Enable debug output
> set nodebug                       # Disable debug output
> set all                           # Show current settings
> exit                              # Exit
```

## Examples

```bash
# Basic lookup
nslookup example.com

# Use a specific DNS server
nslookup example.com 8.8.8.8

# MX record lookup
nslookup -type=MX example.com

# NS record lookup
nslookup -type=NS example.com

# TXT record lookup
nslookup -type=TXT example.com

# SOA record lookup
nslookup -type=SOA example.com

# Reverse DNS
nslookup 8.8.8.8

# AAAA (IPv6) lookup
nslookup -type=AAAA example.com

# With debug info
nslookup -debug example.com

# SRV record
nslookup -type=SRV _sip._tcp.example.com
```

---

# 12. `host` — Simple DNS Lookup

`host` provides clean, human-readable DNS output.

## Syntax

```bash
host [OPTIONS] NAME [SERVER]
```

## All Flags

| Flag | Description |
|------|-------------|
| `-t TYPE` | Query type |
| `-a` | Same as `-t ANY` |
| `-d` | Verbose (same as `-v`) |
| `-l ZONE` | Zone transfer |
| `-r` | Non-recursive query |
| `-T` | Use TCP |
| `-4` | Force IPv4 |
| `-6` | Force IPv6 |
| `-v` | Verbose output (similar to dig) |
| `-w` | Wait forever for response |
| `-W SECONDS` | Query timeout |
| `-R NUM` | Number of retries |
| `-m FLAG` | Memory debugging: `record`, `usage`, `trace` |
| `-c CLASS` | Query class |
| `-C` | Check SOA consistency on all authoritative nameservers |
| `-N NUM` | Number of dots that must appear to be considered absolute name |
| `-s` | Do NOT send query to next nameserver on SERVFAIL |

## Examples

```bash
# Basic lookup
host example.com
# Output:
# example.com has address 93.184.216.34
# example.com has IPv6 address 2606:2800:220:1:248:1893:25c8:1946
# example.com mail is handled by 0 .

# Reverse lookup
host 8.8.8.8
# Output: 8.8.8.8.in-addr.arpa domain name pointer dns.google.

# MX records
host -t MX example.com

# NS records
host -t NS example.com

# TXT records
host -t TXT example.com

# SOA record
host -t SOA example.com

# Use a specific DNS server
host example.com 8.8.8.8

# Verbose output (dig-like)
host -v example.com

# All record types
host -a example.com

# SOA consistency check
host -C example.com

# Zone transfer
host -l example.com ns1.example.com

# TCP mode
host -T example.com
```

---

# 13. `nmap` — Network Scanner

`nmap` (Network Mapper) is the industry-standard tool for network discovery and security auditing.

## Syntax

```bash
nmap [SCAN TYPE] [OPTIONS] TARGET
```

## Target Specification

```bash
nmap 192.168.1.1                    # Single host
nmap 192.168.1.1 192.168.1.2       # Multiple hosts
nmap 192.168.1.0/24                 # CIDR subnet
nmap 192.168.1.1-254               # IP range
nmap 192.168.1.*                    # Wildcard
nmap 192.168.1,2.0-255             # Octet ranges
nmap -iL targets.txt               # Read from file
nmap --exclude 192.168.1.1         # Exclude hosts
nmap --excludefile exclude.txt     # Exclude from file
nmap 192.168.1.0/24 --exclude 192.168.1.1
```

## Host Discovery

| Flag | Description |
|------|-------------|
| `-sn` | Ping scan (no port scan) — host discovery only |
| `-Pn` | Skip host discovery (treat all as online) |
| `-PS PORTLIST` | TCP SYN ping on given ports |
| `-PA PORTLIST` | TCP ACK ping on given ports |
| `-PU PORTLIST` | UDP ping on given ports |
| `-PY PORTLIST` | SCTP INIT ping |
| `-PE` | ICMP Echo ping |
| `-PP` | ICMP Timestamp ping |
| `-PM` | ICMP Address Mask ping |
| `-PO PROTOCOLS` | IP Protocol ping |
| `-PR` | ARP ping (local network) |
| `--disable-arp-ping` | Disable ARP ping |
| `-n` | Never do DNS resolution |
| `-R` | Always resolve DNS |
| `--dns-servers SERVERS` | Custom DNS servers |
| `--system-dns` | Use OS DNS resolver |
| `--traceroute` | Trace hop path |

## Scan Techniques

| Flag | Description |
|------|-------------|
| `-sS` | TCP SYN scan (default, stealthy, root required) |
| `-sT` | TCP Connect scan (full 3-way handshake, no root needed) |
| `-sU` | UDP scan |
| `-sA` | TCP ACK scan (detect filtered ports/firewalls) |
| `-sW` | TCP Window scan (like ACK but detects open ports on some systems) |
| `-sM` | TCP Maimon scan (FIN/ACK) |
| `-sN` | TCP Null scan (no flags set) |
| `-sF` | TCP FIN scan |
| `-sX` | TCP Xmas scan (FIN+PSH+URG) |
| `-sI ZOMBIE` | Idle scan (extremely stealthy, uses zombie host) |
| `-sY` | SCTP INIT scan |
| `-sZ` | SCTP COOKIE-ECHO scan |
| `-sO` | IP Protocol scan (detect supported IP protocols) |
| `-b FTP_HOST` | FTP bounce scan |
| `--scanflags FLAGS` | Custom TCP flags |

## Port Specification

| Flag | Description |
|------|-------------|
| `-p PORTS` | Scan these ports. E.g.: `-p 22`, `-p 1-65535`, `-p 80,443`, `-p U:53,T:22` |
| `-p-` | Scan all 65535 ports |
| `--top-ports N` | Scan N most common ports |
| `-F` | Fast scan (100 most common ports) |
| `-r` | Scan ports sequentially (don't randomize) |
| `--port-ratio RATIO` | Scan ports with ratio ≥ RATIO |

## Service/Version Detection

| Flag | Description |
|------|-------------|
| `-sV` | Probe open ports for service/version info |
| `--version-intensity LEVEL` | 0 (light) to 9 (try all probes) |
| `--version-light` | Same as `--version-intensity 2` |
| `--version-all` | Same as `--version-intensity 9` |
| `--version-trace` | Show detailed version scan activity |

## OS Detection

| Flag | Description |
|------|-------------|
| `-O` | Enable OS detection |
| `--osscan-limit` | Only try OS detection on promising hosts |
| `--osscan-guess` | Guess OS more aggressively |
| `--max-os-tries N` | Maximum OS detection tries |

## Timing and Performance

| Flag | Description |
|------|-------------|
| `-T0` | Paranoid (very slow, IDS evasion) |
| `-T1` | Sneaky (slow, IDS evasion) |
| `-T2` | Polite (slowed down) |
| `-T3` | Normal (default) |
| `-T4` | Aggressive (faster) |
| `-T5` | Insane (fastest, may miss ports) |
| `--min-hostgroup N` | Minimum hosts to scan in parallel |
| `--max-hostgroup N` | Maximum hosts to scan in parallel |
| `--min-parallelism N` | Minimum probe parallelism |
| `--max-parallelism N` | Maximum probe parallelism |
| `--min-rtt-timeout MS` | Minimum probe RTT timeout |
| `--max-rtt-timeout MS` | Maximum probe RTT timeout |
| `--initial-rtt-timeout MS` | Initial probe RTT timeout |
| `--max-retries N` | Maximum probe retransmissions |
| `--host-timeout MS` | Give up on host after this time |
| `--scan-delay MS` | Adjust delay between probes |
| `--max-scan-delay MS` | Maximum delay between probes |
| `--min-rate N` | Minimum packets per second |
| `--max-rate N` | Maximum packets per second |

## Firewall/IDS Evasion

| Flag | Description |
|------|-------------|
| `-f` | Fragment packets |
| `--mtu VALUE` | Set custom MTU |
| `-D DECOYS` | Cloak scan with decoys (e.g., `-D RND:5`) |
| `-S SOURCE` | Spoof source address |
| `-e INTERFACE` | Use specified interface |
| `--source-port PORT` | Use specified source port |
| `--proxies URL` | Relay connections through proxies |
| `--data HEX` | Append custom hex data |
| `--data-string STRING` | Append custom ASCII data |
| `--data-length NUM` | Append random data of given length |
| `--ip-options OPTIONS` | Set IP options |
| `--ttl VALUE` | Set IP TTL |
| `--spoof-mac MAC` | Spoof MAC address |
| `--badsum` | Send with bad checksums |
| `--adler32` | Use Adler32 for SCTP checksums |

## Scripts (NSE — Nmap Scripting Engine)

| Flag | Description |
|------|-------------|
| `-sC` | Run default scripts (same as `--script=default`) |
| `--script SCRIPTS` | Run specified scripts. Categories: `auth`, `broadcast`, `brute`, `default`, `discovery`, `dos`, `exploit`, `external`, `fuzzer`, `intrusive`, `malware`, `safe`, `version`, `vuln` |
| `--script-args ARGS` | Script arguments (e.g., `user=admin,pass=secret`) |
| `--script-args-file FILE` | Load script args from file |
| `--script-trace` | Show all sent/received script data |
| `--script-updatedb` | Update the script database |
| `--script-help SCRIPTS` | Show help for scripts |

## Output

| Flag | Description |
|------|-------------|
| `-oN FILE` | Normal output |
| `-oX FILE` | XML output |
| `-oG FILE` | Grepable output |
| `-oS FILE` | ScRiPt KiDDi3 output |
| `-oA BASENAME` | Output in all major formats |
| `-v` | Increase verbosity (use `-vv` for more) |
| `-d` | Increase debugging (use `-dd` for more) |
| `--reason` | Display reason for port state |
| `--open` | Show only open ports |
| `--packet-trace` | Show all packets sent/received |
| `--iflist` | Print host interfaces and routes |
| `--append-output` | Append to output files |
| `--resume FILE` | Resume aborted scan |
| `--stylesheet FILE` | XSL stylesheet for XML output |
| `--webxml` | Use Nmap.org stylesheet |
| `--no-stylesheet` | No XSL stylesheet |
| `--stats-every TIME` | Print stats periodically |

## Miscellaneous

| Flag | Description |
|------|-------------|
| `-6` | Enable IPv6 scanning |
| `-A` | Aggressive scan: OS detection + version + scripts + traceroute |
| `-V` | Print version number |
| `-h` | Help |
| `--datadir DIR` | Nmap data directory |
| `--send-eth` | Send using raw Ethernet frames |
| `--send-ip` | Send using raw IP packets |
| `--privileged` | Assume user is privileged |
| `--unprivileged` | Assume user is not privileged |
| `--release-memory` | Release memory before quitting |

## Comprehensive Examples

```bash
# Quick scan of common ports
nmap 192.168.1.1

# Scan all 65535 ports
nmap -p- 192.168.1.1

# Scan specific ports
nmap -p 22,80,443,3306,5432,8080 192.168.1.1

# Scan port range
nmap -p 1-1000 192.168.1.1

# Fast scan (100 most common ports)
nmap -F 192.168.1.0/24

# Ping sweep (discover live hosts only)
nmap -sn 192.168.1.0/24

# SYN scan with version detection
sudo nmap -sS -sV 192.168.1.1

# Full aggressive scan
sudo nmap -A 192.168.1.1

# OS detection
sudo nmap -O 192.168.1.1

# UDP scan
sudo nmap -sU -p 53,67,68,69,123,161,162,514 192.168.1.1

# Combined TCP + UDP scan
sudo nmap -sS -sU -p T:80,443,U:53,161 192.168.1.1

# Run default NSE scripts
nmap -sC 192.168.1.1

# Scan + version + default scripts
nmap -sV -sC 192.168.1.1

# Run vulnerability scripts
nmap --script vuln 192.168.1.1

# Run specific scripts
nmap --script http-title,http-headers 192.168.1.1
nmap --script "http-*" 192.168.1.1
nmap --script "not intrusive" 192.168.1.1
nmap --script "safe and discovery" 192.168.1.1

# Brute force SSH
nmap --script ssh-brute -p 22 192.168.1.1

# Detect SSL vulnerabilities
nmap --script ssl-heartbleed,ssl-poodle -p 443 192.168.1.1

# Enumerate HTTP
nmap --script http-enum -p 80 192.168.1.1

# Service banner grabbing
nmap -sV --version-intensity 5 192.168.1.1

# Stealth scan with decoys
sudo nmap -sS -D RND:5 192.168.1.1

# Scan using a specific source port (bypass some firewalls)
sudo nmap --source-port 53 192.168.1.1

# Fragment packets (evade IDS)
sudo nmap -f 192.168.1.1

# Timing: aggressive
nmap -T4 192.168.1.0/24

# Timing: paranoid (IDS evasion)
nmap -T0 192.168.1.1

# Output to all formats
nmap -oA scan_results 192.168.1.0/24

# XML output
nmap -oX scan.xml 192.168.1.0/24

# Show only open ports
nmap --open 192.168.1.0/24

# Show reason for port state
nmap --reason 192.168.1.1

# Idle scan (extremely stealthy)
sudo nmap -sI zombie.example.com 192.168.1.1

# Scan IPv6
nmap -6 2001:db8::1

# Scan top 20 ports on entire subnet, fast
nmap --top-ports 20 -T4 10.0.0.0/24

# List network interfaces
nmap --iflist

# Rate-limited scan
nmap --max-rate 100 192.168.1.0/24

# Resume an interrupted scan
nmap --resume scan_results.gnmap
```

---

# 14. `tcpdump` — Packet Capture & Analysis

`tcpdump` captures packets from a network interface. It is the standard command-line packet analyzer.

## Syntax

```bash
tcpdump [OPTIONS] [EXPRESSION]
```

## All Flags and Options

| Flag | Description |
|------|-------------|
| `-i INTERFACE` | Capture on specific interface. Use `any` for all interfaces |
| `-c COUNT` | Capture COUNT packets then stop |
| `-w FILE` | Write raw packets to file (pcap format) |
| `-r FILE` | Read packets from file |
| `-n` | Don't resolve hostnames |
| `-nn` | Don't resolve hostnames OR port names |
| `-v` | Verbose output |
| `-vv` | More verbose |
| `-vvv` | Maximum verbosity |
| `-q` | Quiet (less protocol info) |
| `-e` | Print link-layer (MAC) header |
| `-A` | Print packet payload in ASCII |
| `-X` | Print packet payload in hex and ASCII |
| `-XX` | Print packet with link-level header in hex and ASCII |
| `-D` | List available interfaces |
| `-l` | Line-buffered (useful for piping) |
| `-t` | Don't print timestamp |
| `-tt` | Print Unix timestamp |
| `-ttt` | Print delta between packets |
| `-tttt` | Print date + time |
| `-ttttt` | Print delta from first packet |
| `-s SNAPLEN` | Capture SNAPLEN bytes per packet (default: 262144). Use `-s 0` for full packet |
| `-S` | Print absolute TCP sequence numbers |
| `-C FILESIZE` | Rotate capture files at FILESIZE (MB) |
| `-G SECONDS` | Rotate capture files every SECONDS |
| `-W COUNT` | Keep only COUNT rotation files |
| `-Z USER` | Drop privileges to USER |
| `-K` | Don't verify checksums |
| `-p` | Don't set promiscuous mode |
| `-U` | Packet-buffered output (write each packet immediately) |
| `-B BUFFER` | Set kernel capture buffer size (KB) |
| `-F FILE` | Read BPF filter from file |
| `-Q DIRECTION` | Capture direction: `in`, `out`, `inout` |
| `--direction DIRECTION` | Same as `-Q` |
| `-j TSTAMP_TYPE` | Timestamp type |
| `--list-time-stamp-types` | List available timestamp types |
| `--time-stamp-precision PREC` | `micro` or `nano` |
| `--immediate-mode` | Deliver packets as captured |
| `--print` | Print parsed output even with `-w` |
| `--version` | Print version |
| `--count` | Print only a count of packets |

## BPF Filter Expressions

BPF (Berkeley Packet Filter) expressions define which packets to capture.

### Protocol Filters

```bash
tcpdump tcp                          # TCP only
tcpdump udp                          # UDP only
tcpdump icmp                         # ICMP only
tcpdump arp                          # ARP only
tcpdump ip                           # IPv4 only
tcpdump ip6                          # IPv6 only
tcpdump vlan                         # VLAN tagged
```

### Host Filters

```bash
tcpdump host 192.168.1.100           # Traffic to/from host
tcpdump src host 192.168.1.100       # Traffic FROM host
tcpdump dst host 192.168.1.100       # Traffic TO host
tcpdump net 192.168.1.0/24           # Traffic to/from network
tcpdump src net 10.0.0.0/8           # Traffic FROM network
tcpdump dst net 10.0.0.0/8           # Traffic TO network
```

### Port Filters

```bash
tcpdump port 80                      # Traffic on port 80
tcpdump src port 443                 # Traffic FROM port 443
tcpdump dst port 22                  # Traffic TO port 22
tcpdump portrange 1024-65535         # Port range
tcpdump tcp port 80                  # TCP traffic on port 80
tcpdump udp port 53                  # UDP traffic on port 53
```

### Logical Operators

```bash
tcpdump host 192.168.1.1 and port 80          # AND
tcpdump host 192.168.1.1 or host 192.168.1.2  # OR
tcpdump not port 22                             # NOT
tcpdump '(host 192.168.1.1 or host 192.168.1.2) and port 80'  # Grouping
```

### TCP Flag Filters

```bash
tcpdump 'tcp[tcpflags] & tcp-syn != 0'        # SYN packets
tcpdump 'tcp[tcpflags] & tcp-ack != 0'        # ACK packets
tcpdump 'tcp[tcpflags] & tcp-fin != 0'        # FIN packets
tcpdump 'tcp[tcpflags] & tcp-rst != 0'        # RST packets
tcpdump 'tcp[tcpflags] & tcp-push != 0'       # PSH packets
tcpdump 'tcp[tcpflags] & (tcp-syn|tcp-ack) = (tcp-syn|tcp-ack)'  # SYN-ACK
tcpdump 'tcp[tcpflags] = tcp-syn'             # SYN only (no other flags)
```

### Size Filters

```bash
tcpdump greater 1000                  # Packets larger than 1000 bytes
tcpdump less 64                       # Packets smaller than 64 bytes
tcpdump 'len > 500'                   # Same as greater
```

### Advanced Filters

```bash
# VLAN tagged traffic
tcpdump vlan

# Specific VLAN ID
tcpdump 'vlan 100'

# Broadcast/multicast
tcpdump broadcast
tcpdump multicast
tcpdump ether broadcast

# Specific MAC address
tcpdump ether host 00:11:22:33:44:55
tcpdump ether src 00:11:22:33:44:55
tcpdump ether dst ff:ff:ff:ff:ff:ff

# IP fragment
tcpdump 'ip[6:2] & 0x1fff != 0'

# TTL = 1 (traceroute detection)
tcpdump 'ip[8] = 1'

# HTTP GET requests
tcpdump -A 'tcp port 80 and tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x47455420'

# DNS queries
tcpdump -n udp port 53
```

## Comprehensive Examples

```bash
# Capture all traffic on eth0
sudo tcpdump -i eth0

# Capture with no DNS/port resolution, verbose
sudo tcpdump -i eth0 -nn -vv

# Capture first 100 packets on any interface
sudo tcpdump -i any -c 100

# Save capture to file
sudo tcpdump -i eth0 -w capture.pcap

# Read from saved file
tcpdump -r capture.pcap

# Capture only HTTP traffic
sudo tcpdump -i eth0 tcp port 80

# Capture HTTP and HTTPS
sudo tcpdump -i eth0 'tcp port 80 or tcp port 443'

# Capture DNS traffic
sudo tcpdump -i eth0 udp port 53

# Capture all traffic to/from a host
sudo tcpdump -i eth0 host 192.168.1.100

# Capture SSH traffic
sudo tcpdump -i eth0 tcp port 22

# Capture with packet content in ASCII
sudo tcpdump -i eth0 -A port 80

# Capture with hex+ASCII dump
sudo tcpdump -i eth0 -X port 80

# Capture with MAC addresses shown
sudo tcpdump -i eth0 -e

# Capture full packets (no truncation)
sudo tcpdump -i eth0 -s 0

# Capture with timestamps and write to file
sudo tcpdump -i eth0 -tttt -w timestamped.pcap

# Capture traffic between two specific hosts
sudo tcpdump -i eth0 'host 192.168.1.1 and host 192.168.1.2'

# Capture non-SSH traffic (exclude SSH)
sudo tcpdump -i eth0 'not port 22'

# Capture SYN packets only (new connections)
sudo tcpdump -i eth0 'tcp[tcpflags] = tcp-syn'

# Capture RST packets (connection resets)
sudo tcpdump -i eth0 'tcp[tcpflags] & tcp-rst != 0'

# Line-buffered output for piping
sudo tcpdump -i eth0 -l port 80 | grep "GET"

# Rotate files every 100MB, keep 10 files
sudo tcpdump -i eth0 -w capture.pcap -C 100 -W 10

# Rotate files every 3600 seconds (1 hour)
sudo tcpdump -i eth0 -w 'capture_%Y%m%d_%H%M%S.pcap' -G 3600

# Capture only incoming traffic
sudo tcpdump -i eth0 -Q in

# Capture only outgoing traffic
sudo tcpdump -i eth0 -Q out

# Capture ICMP (ping)
sudo tcpdump -i eth0 icmp

# Capture ARP
sudo tcpdump -i eth0 arp

# Capture DHCP
sudo tcpdump -i eth0 udp port 67 or udp port 68

# Count packets matching filter
sudo tcpdump -i eth0 --count tcp port 80

# Print delta between packets
sudo tcpdump -i eth0 -ttt port 443

# List available interfaces
tcpdump -D
```

---

# 15. `iptables` — Firewall (Netfilter)

`iptables` manages the Linux kernel's packet filtering framework (Netfilter). It operates on chains of rules organized in tables.

## Tables

| Table | Purpose |
|-------|---------|
| `filter` | Default. Packet filtering (accept/drop/reject) |
| `nat` | Network Address Translation |
| `mangle` | Packet alteration (TOS, TTL, mark) |
| `raw` | Exemptions from connection tracking |
| `security` | SELinux security marking |

## Chains

| Chain | Table | Description |
|-------|-------|-------------|
| `INPUT` | filter, mangle, security | Incoming packets destined for the local machine |
| `FORWARD` | filter, mangle, security | Packets being routed through the machine |
| `OUTPUT` | filter, nat, mangle, raw, security | Outgoing packets from the local machine |
| `PREROUTING` | nat, mangle, raw | Before routing decision |
| `POSTROUTING` | nat, mangle | After routing decision |

## Syntax

```bash
iptables [-t TABLE] COMMAND CHAIN [MATCH] [TARGET]
```

## Commands

| Flag | Description |
|------|-------------|
| `-A CHAIN` | Append rule to chain |
| `-I CHAIN [NUM]` | Insert rule at position (default: 1) |
| `-D CHAIN RULE` | Delete rule by specification |
| `-D CHAIN NUM` | Delete rule by number |
| `-R CHAIN NUM RULE` | Replace rule at position |
| `-L [CHAIN]` | List rules |
| `-S [CHAIN]` | Print rules as iptables commands |
| `-F [CHAIN]` | Flush (delete all rules) in chain |
| `-Z [CHAIN]` | Zero packet/byte counters |
| `-N CHAIN` | Create new user-defined chain |
| `-X [CHAIN]` | Delete empty user-defined chain |
| `-P CHAIN TARGET` | Set default policy for built-in chain |
| `-E OLD NEW` | Rename user-defined chain |
| `-C CHAIN RULE` | Check if rule exists |

## Match Options

| Flag | Description |
|------|-------------|
| `-p PROTO` | Protocol: `tcp`, `udp`, `icmp`, `icmpv6`, `esp`, `ah`, `sctp`, `udplite`, `all` |
| `-s SOURCE` | Source address/network (e.g., `192.168.1.0/24`) |
| `-d DEST` | Destination address/network |
| `-i IFACE` | Input interface (for INPUT/FORWARD/PREROUTING) |
| `-o IFACE` | Output interface (for OUTPUT/FORWARD/POSTROUTING) |
| `-f` | Match second and further fragments |
| `!` | Negate the match (e.g., `! -s 10.0.0.0/8`) |

## TCP Match Extensions (`-p tcp`)

| Flag | Description |
|------|-------------|
| `--sport PORT[:PORT]` | Source port or range |
| `--dport PORT[:PORT]` | Destination port or range |
| `--tcp-flags MASK COMP` | Match TCP flags (e.g., `SYN,ACK,FIN,RST SYN`) |
| `--syn` | Match SYN packets (new connections) |
| `--tcp-option NUM` | Match TCP option |

## UDP Match Extensions (`-p udp`)

| Flag | Description |
|------|-------------|
| `--sport PORT[:PORT]` | Source port or range |
| `--dport PORT[:PORT]` | Destination port or range |

## ICMP Match Extensions (`-p icmp`)

| Flag | Description |
|------|-------------|
| `--icmp-type TYPE` | ICMP type: `echo-request`, `echo-reply`, `destination-unreachable`, `time-exceeded`, etc. |

## Match Modules (`-m MODULE`)

| Module | Flags | Description |
|--------|-------|-------------|
| `state` | `--state NEW,ESTABLISHED,RELATED,INVALID` | Connection tracking state |
| `conntrack` | `--ctstate`, `--ctproto`, `--ctorigsrc`, etc. | Advanced connection tracking |
| `multiport` | `--sports`, `--dports`, `--ports` | Match multiple ports (up to 15) |
| `iprange` | `--src-range IP-IP`, `--dst-range IP-IP` | Match IP range |
| `mac` | `--mac-source MAC` | Match source MAC address |
| `limit` | `--limit RATE`, `--limit-burst NUM` | Rate limiting |
| `hashlimit` | `--hashlimit-upto`, `--hashlimit-name`, etc. | Per-address rate limiting |
| `recent` | `--name`, `--set`, `--rcheck`, `--update`, `--seconds`, `--hitcount` | Track recent connections |
| `string` | `--string PATTERN`, `--algo {bm,kmp}` | Match packet content |
| `comment` | `--comment "TEXT"` | Add comment to rule |
| `mark` | `--mark VALUE[/MASK]` | Match packet mark |
| `owner` | `--uid-owner`, `--gid-owner` | Match packet owner (OUTPUT only) |
| `length` | `--length MIN:MAX` | Match packet length |
| `ttl` | `--ttl-eq`, `--ttl-gt`, `--ttl-lt` | Match TTL |
| `tos` | `--tos VALUE` | Match TOS field |
| `dscp` | `--dscp VALUE`, `--dscp-class CLASS` | Match DSCP field |
| `time` | `--timestart`, `--timestop`, `--days`, `--monthdays` | Time-based matching |
| `connlimit` | `--connlimit-above N`, `--connlimit-mask BITS` | Limit concurrent connections |
| `set` | `--match-set NAME FLAGS` | Match against ipset |
| `geoip` | `--src-cc`, `--dst-cc` | Match by country (xt_geoip) |
| `addrtype` | `--src-type TYPE`, `--dst-type TYPE` | Match address type (LOCAL, UNICAST, etc.) |
| `physdev` | `--physdev-in`, `--physdev-out` | Match bridge physical device |
| `policy` | `--pol`, `--dir`, `--strict` | Match IPsec policy |
| `u32` | `--u32 TEST` | Match arbitrary bytes |

## Targets (`-j TARGET`)

| Target | Description |
|--------|-------------|
| `ACCEPT` | Accept the packet |
| `DROP` | Silently drop the packet |
| `REJECT` | Reject with ICMP error (configurable with `--reject-with`) |
| `LOG` | Log the packet (continues processing) |
| `RETURN` | Return from user chain to calling chain |
| `QUEUE` | Queue to userspace |
| `NFQUEUE` | Queue to userspace via nfnetlink |
| `MASQUERADE` | NAT masquerade (dynamic SNAT, nat/POSTROUTING) |
| `SNAT` | Source NAT (`--to-source IP[:PORT]`, nat/POSTROUTING) |
| `DNAT` | Destination NAT (`--to-destination IP[:PORT]`, nat/PREROUTING) |
| `REDIRECT` | Redirect to local port (`--to-ports PORT`, nat/PREROUTING) |
| `MARK` | Set packet mark (`--set-mark VALUE`) |
| `CONNMARK` | Set connection mark |
| `TOS` | Set TOS field |
| `DSCP` | Set DSCP field |
| `TTL` | Modify TTL |
| `TCPMSS` | Clamp MSS (`--clamp-mss-to-pmtu`) |
| `NOTRACK` | Skip connection tracking (raw table) |
| `CLASSIFY` | Set packet priority |
| `TPROXY` | Transparent proxy |
| `CT` | Connection tracking helper assignment |
| `AUDIT` | Audit logging |
| `SECMARK` | Set security mark |

## Display Options

| Flag | Description |
|------|-------------|
| `-L` | List rules |
| `-n` | Numeric output |
| `-v` | Verbose (show counters, interface) |
| `--line-numbers` | Show rule numbers |
| `-x` | Exact byte/packet counters |

## Comprehensive Examples

```bash
# List all rules (verbose, numeric, with line numbers)
sudo iptables -L -n -v --line-numbers

# List rules as commands (easy to save/restore)
sudo iptables -S

# List NAT rules
sudo iptables -t nat -L -n -v

# Set default policies (secure baseline)
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# Allow loopback
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A OUTPUT -o lo -j ACCEPT

# Allow established and related connections
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow SSH
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP and HTTPS
sudo iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT

# Allow DNS
sudo iptables -A INPUT -p udp --dport 53 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 53 -j ACCEPT

# Allow ICMP (ping)
sudo iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# Block a specific IP
sudo iptables -A INPUT -s 10.0.0.5 -j DROP

# Block a subnet
sudo iptables -A INPUT -s 10.99.0.0/16 -j DROP

# Reject (send ICMP unreachable) instead of silent drop
sudo iptables -A INPUT -s 10.0.0.5 -j REJECT --reject-with icmp-port-unreachable

# Rate limit incoming connections (anti-DDoS)
sudo iptables -A INPUT -p tcp --dport 80 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT

# Limit SSH connections (prevent brute force)
sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH
sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP

# Limit concurrent connections from a single IP
sudo iptables -A INPUT -p tcp --dport 80 -m connlimit --connlimit-above 50 -j REJECT

# Log dropped packets
sudo iptables -A INPUT -j LOG --log-prefix "IPTables-Dropped: " --log-level 4
sudo iptables -A INPUT -j DROP

# NAT / Masquerading (enable internet sharing)
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo sysctl -w net.ipv4.ip_forward=1

# SNAT (static source NAT)
sudo iptables -t nat -A POSTROUTING -s 192.168.1.0/24 -o eth0 -j SNAT --to-source 203.0.113.1

# DNAT / Port forwarding
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 8080 -j DNAT --to-destination 192.168.1.100:80
sudo iptables -A FORWARD -p tcp -d 192.168.1.100 --dport 80 -j ACCEPT

# Redirect port (local port forwarding)
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8080

# Allow traffic from specific MAC
sudo iptables -A INPUT -m mac --mac-source 00:11:22:33:44:55 -j ACCEPT

# Match IP range
sudo iptables -A INPUT -m iprange --src-range 192.168.1.100-192.168.1.200 -j ACCEPT

# Time-based rule (allow HTTP only during business hours)
sudo iptables -A INPUT -p tcp --dport 80 -m time --timestart 08:00 --timestop 18:00 --days Mon,Tue,Wed,Thu,Fri -j ACCEPT

# Match by owner (OUTPUT chain only)
sudo iptables -A OUTPUT -m owner --uid-owner nobody -j DROP

# Clamp MSS for VPN/tunnel issues
sudo iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu

# Mark packets for policy routing
sudo iptables -t mangle -A PREROUTING -s 192.168.1.0/24 -j MARK --set-mark 1

# Match string in packet content
sudo iptables -A INPUT -m string --string "X-Malicious" --algo bm -j DROP

# Insert rule at position 1
sudo iptables -I INPUT 1 -p tcp --dport 22 -j ACCEPT

# Delete rule by number
sudo iptables -D INPUT 3

# Delete rule by specification
sudo iptables -D INPUT -p tcp --dport 80 -j ACCEPT

# Flush all rules
sudo iptables -F

# Flush NAT rules
sudo iptables -t nat -F

# Zero counters
sudo iptables -Z

# Create custom chain
sudo iptables -N MY_CHAIN
sudo iptables -A MY_CHAIN -p tcp --dport 80 -j ACCEPT
sudo iptables -A MY_CHAIN -j RETURN
sudo iptables -A INPUT -j MY_CHAIN

# Save rules
sudo iptables-save > /etc/iptables/rules.v4

# Restore rules
sudo iptables-restore < /etc/iptables/rules.v4

# IPv6 rules (use ip6tables)
sudo ip6tables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo ip6tables -L -n -v
```

---

# 16. `nftables` — Modern Firewall (Replaces iptables)

`nftables` is the modern Linux packet filtering framework that supersedes `iptables`, `ip6tables`, `arptables`, and `ebtables` in a single unified tool. Default on Debian 10+, Ubuntu 22.04+, RHEL 8+, and Fedora 32+.

## General Syntax

```bash
nft [ options ] COMMAND OBJECT
nft -f /path/to/rules.nft       # Load rules from file
```

## Address Families

| Family | Handles |
|--------|---------|
| `ip` | IPv4 |
| `ip6` | IPv6 |
| `inet` | IPv4 + IPv6 (recommended for most rules) |
| `arp` | ARP |
| `bridge` | Ethernet bridge |
| `netdev` | Ingress/egress per-device |

## Listing and Inspecting

```bash
# List everything (tables, chains, rules, sets)
sudo nft list ruleset

# List a specific table
sudo nft list table inet filter

# List a chain
sudo nft list chain inet filter input

# Show handles (needed for rule deletion)
sudo nft -a list ruleset

# JSON output
sudo nft -j list ruleset

# Monitor events in real time
sudo nft monitor
```

## Tables

```bash
# Create table
sudo nft add table inet filter

# Delete table (removes all chains and rules)
sudo nft delete table inet filter

# Flush table (remove all rules, keep structure)
sudo nft flush table inet filter
```

## Chains

Chains attach to **hooks** in the network stack: `prerouting`, `input`, `forward`, `output`, `postrouting`.

```bash
# Create a base chain (with hook, type, and default policy)
sudo nft add chain inet filter input \
  '{ type filter hook input priority 0; policy drop; }'

# Create a regular chain (called from rules, no hook)
sudo nft add chain inet filter my_chain

# Delete a chain
sudo nft delete chain inet filter my_chain

# Flush a chain (remove its rules)
sudo nft flush chain inet filter input
```

## Rules

```bash
# Allow loopback
sudo nft add rule inet filter input iif lo accept

# Allow established and related
sudo nft add rule inet filter input ct state established,related accept

# Allow SSH (with rate limit)
sudo nft add rule inet filter input tcp dport 22 ct state new limit rate 5/minute accept

# Allow HTTP and HTTPS
sudo nft add rule inet filter input tcp dport { 80, 443 } accept

# Allow DNS (UDP + TCP)
sudo nft add rule inet filter input meta l4proto { tcp, udp } th dport 53 accept

# Allow ICMP (ping)
sudo nft add rule inet filter input icmp type echo-request accept
sudo nft add rule inet filter input icmpv6 type echo-request accept

# Drop and log everything else
sudo nft add rule inet filter input log prefix "INPUT DROP: " drop

# Block a specific IP
sudo nft add rule inet filter input ip saddr 192.168.1.50 drop

# Block a subnet
sudo nft add rule inet filter input ip saddr 10.0.0.0/8 drop

# Insert rule at position 0 (before all others)
sudo nft insert rule inet filter input iif lo accept

# Delete rule by handle (get handle with nft -a list)
sudo nft delete rule inet filter input handle 5

# Replace all rules atomically from a file
sudo nft -f /etc/nftables.conf
```

## Sets (Named Groups)

```bash
# Create a named IP set
sudo nft add set inet filter blacklist '{ type ipv4_addr; }'

# Add IPs to the set
sudo nft add element inet filter blacklist { 192.168.1.50, 10.0.0.1 }

# Reference set in a rule
sudo nft add rule inet filter input ip saddr @blacklist drop

# Delete element from set
sudo nft delete element inet filter blacklist { 192.168.1.50 }

# Interval set for port ranges
sudo nft add set inet filter allowed_ports '{ type inet_service; flags interval; }'
sudo nft add element inet filter allowed_ports { 80, 443, 8000-8100 }
```

## NAT

```bash
# Create NAT table and chains
sudo nft add table nat
sudo nft add chain nat prerouting  '{ type nat hook prerouting priority -100; }'
sudo nft add chain nat postrouting '{ type nat hook postrouting priority 100; }'

# Masquerade (internet sharing / SNAT for outbound)
sudo nft add rule nat postrouting oif eth0 masquerade

# Static SNAT
sudo nft add rule nat postrouting ip saddr 192.168.1.0/24 snat to 203.0.113.1

# DNAT / Port forwarding (redirect inbound port 80 to internal host)
sudo nft add rule nat prerouting tcp dport 80 dnat to 192.168.1.10:8080

# Redirect port locally
sudo nft add rule nat prerouting tcp dport 80 redirect to :8080
```

## Complete Rule File Example

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

## Saving and Loading

```bash
# Save current ruleset
sudo nft list ruleset > /etc/nftables.conf

# Load from file
sudo nft -f /etc/nftables.conf

# Enable service (auto-loads at boot)
sudo systemctl enable --now nftables
sudo systemctl reload nftables
```

---

# 17. `firewall-cmd` — Firewalld CLI (RHEL/CentOS/Fedora)

## Commands

```bash
# Status
sudo firewall-cmd --state
sudo firewall-cmd --get-active-zones
sudo firewall-cmd --get-zones
sudo firewall-cmd --get-default-zone
sudo firewall-cmd --list-all
sudo firewall-cmd --list-all-zones

# Zone management
sudo firewall-cmd --set-default-zone=public
sudo firewall-cmd --zone=public --list-all
sudo firewall-cmd --zone=trusted --add-interface=eth1

# Services
sudo firewall-cmd --list-services
sudo firewall-cmd --get-services                        # All available services
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --remove-service=http
sudo firewall-cmd --permanent --zone=public --add-service=ssh

# Ports
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=5000-5100/tcp
sudo firewall-cmd --permanent --remove-port=8080/tcp
sudo firewall-cmd --list-ports

# Rich rules (complex rules)
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" service name="ssh" accept'
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="10.0.0.5" drop'
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.100" port protocol="tcp" port="3306" accept'

# Port forwarding
sudo firewall-cmd --permanent --add-forward-port=port=80:proto=tcp:toport=8080
sudo firewall-cmd --permanent --add-forward-port=port=80:proto=tcp:toaddr=192.168.1.100:toport=80

# Masquerading (NAT)
sudo firewall-cmd --permanent --add-masquerade
sudo firewall-cmd --permanent --remove-masquerade

# Direct rules (raw iptables)
sudo firewall-cmd --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 9000 -j ACCEPT

# ICMP
sudo firewall-cmd --permanent --add-icmp-block=echo-reply
sudo firewall-cmd --permanent --remove-icmp-block=echo-reply

# Reload
sudo firewall-cmd --reload

# Runtime vs permanent
# Without --permanent: applies immediately but lost on reload
# With --permanent: saved but requires --reload to take effect
```

---

# 18. `ufw` — Uncomplicated Firewall

A user-friendly frontend for `iptables`, commonly used on Ubuntu/Debian.

## All Commands

```bash
# Enable/Disable
sudo ufw enable                      # Enable firewall
sudo ufw disable                     # Disable firewall
sudo ufw reset                       # Reset to defaults

# Status
sudo ufw status                      # Show status and rules
sudo ufw status verbose              # Verbose status
sudo ufw status numbered             # Show rules with numbers

# Default policies
sudo ufw default deny incoming       # Block all incoming
sudo ufw default allow outgoing      # Allow all outgoing
sudo ufw default deny forward        # Block forwarding

# Allow/Deny by port
sudo ufw allow 22                    # Allow port 22 (TCP+UDP)
sudo ufw allow 22/tcp                # Allow port 22 TCP only
sudo ufw allow 80,443/tcp            # Allow multiple ports
sudo ufw allow 6000:6007/tcp         # Allow port range
sudo ufw deny 23                     # Deny port 23

# Allow/Deny by service name
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 'Apache Full'

# Allow/Deny by IP
sudo ufw allow from 192.168.1.100
sudo ufw deny from 10.0.0.5
sudo ufw allow from 192.168.1.0/24

# Allow from IP to specific port
sudo ufw allow from 192.168.1.100 to any port 22
sudo ufw allow from 192.168.1.0/24 to any port 80 proto tcp

# Allow to specific interface
sudo ufw allow in on eth0 to any port 80

# Rate limiting (prevent brute force)
sudo ufw limit ssh                   # Limit SSH connections

# Delete rules
sudo ufw delete allow 80
sudo ufw delete 3                    # Delete by number

# Application profiles
sudo ufw app list                    # List available profiles
sudo ufw app info 'OpenSSH'         # Show profile details
sudo ufw allow 'OpenSSH'

# Logging
sudo ufw logging on                  # Enable logging
sudo ufw logging off                 # Disable logging
sudo ufw logging low                 # Log blocked
sudo ufw logging medium              # Log blocked + invalid
sudo ufw logging high                # Log all
sudo ufw logging full                # Log everything

# Routing/Forwarding
sudo ufw route allow in on eth0 out on eth1 to 10.0.0.0/24
```

---

# 19. `ifconfig` — Interface Configuration (Legacy)

`ifconfig` is the classic tool for configuring network interfaces, part of `net-tools`. It has been **replaced by `ip addr` and `ip link`** on all modern Linux systems and may not be installed by default.

## Installation

```bash
sudo apt install net-tools          # Debian/Ubuntu
sudo dnf install net-tools          # RHEL/Fedora
```

## Viewing Interfaces

```bash
# Show all active (UP) interfaces
ifconfig

# Show ALL interfaces including down
ifconfig -a

# Show a specific interface
ifconfig eth0

# Show statistics (errors, drops)
ifconfig -v eth0

# Short summary table
ifconfig -s
```

### Reading ifconfig Output

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

| Field | Meaning |
|-------|---------|
| `flags` | Interface state (UP, BROADCAST, RUNNING, MULTICAST) |
| `mtu` | Maximum Transmission Unit |
| `inet` | IPv4 address |
| `netmask` | Subnet mask |
| `broadcast` | Broadcast address |
| `inet6` | IPv6 address |
| `ether` | MAC address |
| `RX/TX packets` | Received/sent packet counts |
| `errors` | Error count (CRC, frame, etc.) |
| `dropped` | Dropped packets (buffer overflow) |

## Configuring Interfaces

```bash
# Assign IPv4 address
sudo ifconfig eth0 192.168.1.100 netmask 255.255.255.0

# Assign with explicit broadcast
sudo ifconfig eth0 192.168.1.100 netmask 255.255.255.0 broadcast 192.168.1.255

# Add an IPv6 address
sudo ifconfig eth0 add fe80::1/64

# Remove an IPv6 address
sudo ifconfig eth0 del fe80::1/64

# Bring interface UP
sudo ifconfig eth0 up

# Bring interface DOWN
sudo ifconfig eth0 down

# Change MTU
sudo ifconfig eth0 mtu 9000

# Change MAC address (interface must be down first)
sudo ifconfig eth0 down
sudo ifconfig eth0 hw ether 00:11:22:33:44:55
sudo ifconfig eth0 up

# Enable promiscuous mode
sudo ifconfig eth0 promisc

# Disable promiscuous mode
sudo ifconfig eth0 -promisc

# Disable ARP
sudo ifconfig eth0 -arp

# Create virtual alias (secondary IP)
sudo ifconfig eth0:0 10.0.0.1 netmask 255.255.255.0
sudo ifconfig eth0:1 10.0.0.2 netmask 255.255.255.0

# Set transmit queue length
sudo ifconfig eth0 txqueuelen 2000
```

## Modern Equivalents (prefer these)

| `ifconfig` | `ip` equivalent |
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



# 20. `route` — Routing Table Management (Legacy)

The `route` command displays and modifies the IP routing table. It has been **replaced by `ip route`** on modern Linux systems and is part of the `net-tools` package.

## Installation

```bash
sudo apt install net-tools          # Debian/Ubuntu
sudo dnf install net-tools          # RHEL/Fedora
```

## Viewing the Routing Table

```bash
# Show routing table (with hostname resolution)
route

# Show numeric (no DNS, faster and clearer)
route -n

# Show IPv6 routing table
route -6 -n

# Extended format
route -e -n
```

### Reading `route -n` Output

```
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.1.1     0.0.0.0         UG    100    0        0 eth0
192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0
127.0.0.0       0.0.0.0         255.0.0.0       U     0      0        0 lo
```

| Flag | Meaning |
|------|---------|
| `U` | Route is Up |
| `G` | Uses a Gateway |
| `H` | Host route (single IP) |
| `R` | Reinstated by routing daemon |
| `D` | Dynamically installed |
| `M` | Modified by routing daemon |
| `!` | Reject route |

## Adding Routes

```bash
# Add default gateway
sudo route add default gw 192.168.1.1

# Add default gateway via specific interface
sudo route add default gw 192.168.1.1 dev eth0

# Add a network route
sudo route add -net 10.0.0.0/8 gw 192.168.1.254

# Add a network route via interface (no gateway)
sudo route add -net 192.168.2.0/24 dev eth1

# Add a host route (specific IP)
sudo route add -host 203.0.113.1 gw 192.168.1.254

# Add a reject (blackhole) route
sudo route add -net 10.0.0.0/8 reject
```

## Deleting Routes

```bash
# Delete the default gateway
sudo route del default

# Delete default via specific gateway
sudo route del default gw 192.168.1.1

# Delete a network route
sudo route del -net 10.0.0.0/8

# Delete a host route
sudo route del -host 203.0.113.1
```

## Modern Equivalents (prefer these)

| `route` | `ip route` equivalent |
|---------|----------------------|
| `route -n` | `ip route show` |
| `route add default gw 1.2.3.4` | `ip route add default via 1.2.3.4` |
| `route add -net 10.0/8 gw 1.2.3.4` | `ip route add 10.0.0.0/8 via 1.2.3.4` |
| `route del default` | `ip route del default` |
| `route del -net 10.0/8` | `ip route del 10.0.0.0/8` |

---



# 21. `arp` — ARP Cache Management (Legacy)

The `arp` command manages the kernel ARP cache — the table that maps IPv4 addresses to MAC addresses. It has been **replaced by `ip neigh`** on modern Linux and is part of `net-tools`.

## Installation

```bash
sudo apt install net-tools          # Debian/Ubuntu
sudo dnf install net-tools          # RHEL/Fedora
```

## Viewing the ARP Cache

```bash
# Show ARP cache (with name resolution)
arp

# Show numeric (no DNS, clearer)
arp -n

# Show for a specific interface
arp -n -i eth0

# Show verbose output
arp -v -n

# Show ALL entries including incomplete
arp -a -n

# Show entry for a specific host
arp -n 192.168.1.1
```

### Reading `arp -n` Output

```
Address          HWtype  HWaddress           Flags Mask  Iface
192.168.1.1      ether   00:11:22:33:44:55   C           eth0
192.168.1.50     ether   aa:bb:cc:dd:ee:ff   C           eth0
```

| Flag | Meaning |
|------|---------|
| `C` | Complete (resolved) |
| `M` | Permanent (static) |
| `P` | Published (proxy ARP) |

## Managing ARP Entries

```bash
# Add a static ARP entry
sudo arp -s 192.168.1.50 00:11:22:33:44:55

# Add static entry for a specific interface
sudo arp -s 192.168.1.50 00:11:22:33:44:55 -i eth0

# Delete an ARP entry
sudo arp -d 192.168.1.50

# Delete entry on a specific interface
sudo arp -d 192.168.1.50 -i eth0

# Set a proxy ARP entry
sudo arp -s 192.168.2.1 00:11:22:33:44:55 pub

# Load ARP entries from /etc/ethers
sudo arp -f /etc/ethers
```

## Modern Equivalents (prefer these)

| `arp` | `ip neigh` equivalent |
|-------|-----------------------|
| `arp -n` | `ip neigh show` |
| `arp -n -i eth0` | `ip neigh show dev eth0` |
| `arp -s 1.2.3.4 aa:bb:...` | `ip neigh add 1.2.3.4 lladdr aa:bb:... dev eth0 nud permanent` |
| `arp -d 1.2.3.4` | `ip neigh del 1.2.3.4 dev eth0` |

---



# 22. `ip neigh` — ARP/NDP Neighbor Management

`ip neigh` manages the kernel neighbor table — IPv4 ARP and IPv6 NDP (Neighbor Discovery Protocol) entries. It is the modern replacement for the `arp` command.

## Viewing Neighbor Entries

```bash
# Show all neighbor entries
ip neigh show
ip n             # shorthand

# IPv4 only (ARP cache)
ip -4 neigh show

# IPv6 only (NDP cache)
ip -6 neigh show

# For a specific interface
ip neigh show dev eth0

# For a specific IP
ip neigh show 192.168.1.1

# Brief format
ip -br neigh show

# JSON output
ip -j neigh show

# Only REACHABLE entries
ip neigh show nud reachable

# Only STALE entries
ip neigh show nud stale
```

### Neighbor States

| State | Meaning |
|-------|---------|
| `REACHABLE` | Recently confirmed reachable |
| `STALE` | Entry may be expired; will verify on next use |
| `DELAY` | Waiting before probing |
| `PROBE` | Actively sending ARP/NS packets |
| `FAILED` | Resolution failed |
| `PERMANENT` | Statically configured, never expires |
| `NOARP` | No ARP needed (point-to-point, etc.) |
| `INCOMPLETE` | Resolution pending |

## Managing Entries

```bash
# Add a permanent (static) ARP entry
sudo ip neigh add 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0 nud permanent

# Add a reachable entry (subject to timeout)
sudo ip neigh add 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0 nud reachable

# Change an existing entry
sudo ip neigh change 192.168.1.50 lladdr aa:bb:cc:dd:ee:ff dev eth0

# Replace (add or update)
sudo ip neigh replace 192.168.1.50 lladdr 00:11:22:33:44:55 dev eth0 nud permanent

# Delete a specific entry
sudo ip neigh del 192.168.1.50 dev eth0

# Flush all entries on an interface
sudo ip neigh flush dev eth0

# Flush all STALE entries system-wide
sudo ip neigh flush nud stale

# Proxy neighbor entry
sudo ip neigh add proxy 192.168.2.100 dev eth0
sudo ip neigh del proxy 192.168.2.100 dev eth0
```

## IPv6 Neighbor Discovery (NDP)

```bash
# Show IPv6 neighbors
ip -6 neigh show

# Add static IPv6 neighbor
sudo ip -6 neigh add 2001:db8::1 lladdr 00:11:22:33:44:55 dev eth0 nud permanent

# Delete IPv6 neighbor
sudo ip -6 neigh del 2001:db8::1 dev eth0
```

## Monitor Events

```bash
# Watch neighbor changes in real time
ip monitor neigh
```

## Tuning ARP Cache (sysctl)

```bash
# Increase ARP cache size (large networks)
sudo sysctl -w net.ipv4.neigh.default.gc_thresh1=1024
sudo sysctl -w net.ipv4.neigh.default.gc_thresh2=2048
sudo sysctl -w net.ipv4.neigh.default.gc_thresh3=4096

# Enable proxy ARP on an interface
sudo sysctl -w net.ipv4.conf.eth0.proxy_arp=1

# Enable ARP filtering (anti-spoofing)
sudo sysctl -w net.ipv4.conf.all.arp_filter=1
```

---



# 23. `ethtool` — NIC Hardware Settings

## Flags

| Flag | Description |
|------|-------------|
| (no flag) | Show NIC settings |
| `-i` | Show driver info |
| `-S` | Show NIC statistics |
| `-a` | Show pause parameters |
| `-A` | Change pause parameters |
| `-c` | Show coalesce settings |
| `-C` | Change coalesce settings |
| `-g` | Show ring buffer sizes |
| `-G` | Change ring buffer sizes |
| `-k` | Show offload settings |
| `-K` | Change offload settings |
| `-l` | Show channel count |
| `-L` | Change channel count |
| `-m` | Show transceiver module info |
| `-n` / `--show-nfc` | Show network flow classification rules |
| `-p` | Identify interface (blink LED) |
| `-r` | Restart auto-negotiation |
| `-s` | Change NIC settings |
| `-t` | Self-test |
| `-T` | Show time stamping capabilities |
| `--show-eee` | Show EEE (Energy Efficient Ethernet) |
| `--set-eee` | Change EEE settings |
| `--show-fec` | Show FEC (Forward Error Correction) |
| `--set-fec` | Change FEC settings |
| `--show-priv-flags` | Show private flags |
| `--set-priv-flags` | Set private flags |

## Examples

```bash
# Show NIC settings
sudo ethtool eth0

# Show driver info
sudo ethtool -i eth0

# Show statistics
sudo ethtool -S eth0

# Set speed/duplex
sudo ethtool -s eth0 speed 1000 duplex full autoneg off

# Show offload settings
sudo ethtool -k eth0

# Disable TCP segmentation offload
sudo ethtool -K eth0 tso off

# Enable generic receive offload
sudo ethtool -K eth0 gro on

# Show ring buffer sizes
sudo ethtool -g eth0

# Increase ring buffer
sudo ethtool -G eth0 rx 4096 tx 4096

# Blink NIC LED (identify)
sudo ethtool -p eth0 5                  # Blink for 5 seconds

# Show pause frames
sudo ethtool -a eth0

# Restart auto-negotiation
sudo ethtool -r eth0

# Show channel count
sudo ethtool -l eth0

# Show coalesce settings
sudo ethtool -c eth0

# Run self-test
sudo ethtool -t eth0
```

---

# 24. `nmcli` — NetworkManager CLI

## Main Commands

```bash
# General status
nmcli general status
nmcli general hostname
nmcli general permissions
nmcli general logging

# Networking
nmcli networking on
nmcli networking off
nmcli networking connectivity

# Device management
nmcli device status
nmcli device show
nmcli device show eth0
nmcli device connect eth0
nmcli device disconnect eth0
nmcli device wifi list
nmcli device wifi rescan
nmcli device wifi connect "SSID" password "PASS"
nmcli device wifi hotspot ssid "MyHotspot" password "pass1234"

# Connection management
nmcli connection show
nmcli connection show --active
nmcli connection show "My Connection"
nmcli connection up "My Connection"
nmcli connection down "My Connection"
nmcli connection delete "My Connection"
nmcli connection reload
nmcli connection load /etc/NetworkManager/system-connections/myconn.nmconnection

# Create connections
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

# Modify connections
nmcli connection modify "My Connection" ipv4.dns "1.1.1.1"
nmcli connection modify "My Connection" +ipv4.dns "8.8.8.8"
nmcli connection modify "My Connection" ipv4.addresses "192.168.1.200/24"
nmcli connection modify "My Connection" connection.autoconnect yes

# Monitor
nmcli monitor
```

---

# 25. `nmtui` — NetworkManager Text UI

`nmtui` is an interactive, ncurses-based terminal menu for managing network connections. It provides a guided interface ideal for servers without a GUI or users who prefer menus over CLI commands.

## Launching

```bash
nmtui                  # Main menu
nmtui edit             # Jump to Edit Connections
nmtui connect          # Jump to Activate a Connection
nmtui hostname         # Set the system hostname
```

## Menu Structure

```
┌──────────────────────────────────────────┐
│ NetworkManager TUI                        │
│                                           │
│  Edit a connection                        │
│  Activate a connection                    │
│  Set system hostname                      │
│                              <Quit>       │
└──────────────────────────────────────────┘
```

### Edit a Connection
Configure IP addresses, DNS, gateway, routes; create/delete connections; set up Wi-Fi, VPN, bond, bridge, VLAN.

### Activate a Connection
Toggle connections on/off. Active connections are marked with `*`.

### Set System Hostname
Permanently set the hostname (equivalent to `hostnamectl set-hostname`).

## Navigation Keys

| Key | Action |
|-----|--------|
| Arrow keys | Move between items |
| Tab / Shift+Tab | Next / previous field |
| Enter | Select / confirm |
| Space | Toggle checkbox |
| Esc | Cancel / go back |
| `<OK>` or F10 | Save and exit |

## Common Tasks

### Configure Static IP
1. Run `nmtui` → **Edit a connection**
2. Select interface → change **IPv4 CONFIGURATION** from `Automatic` to `Manual`
3. Add address (e.g., `192.168.1.100/24`), Gateway (`192.168.1.1`), DNS
4. `<OK>` → **Activate a connection** → reactivate the connection

### Add a Wi-Fi Connection
1. Run `nmtui` → **Edit a connection** → **Add** → **Wi-Fi**
2. Enter SSID, security type, password → `<OK>`

### Remove a Connection
1. Run `nmtui` → **Edit a connection**
2. Select connection → **Delete** → confirm

## nmtui vs nmcli

| | nmtui | nmcli |
|--|-------|-------|
| Interface | Interactive menus | Command line |
| Scripting | Not suitable | Ideal |
| Remote use | Works in any terminal | Preferred for automation |

---



# 26. `ssh` — Secure Shell

## Syntax

```bash
ssh [OPTIONS] [USER@]HOST [COMMAND]
```

## All Major Flags

| Flag | Description |
|------|-------------|
| `-p PORT` | Connect to port (default: 22) |
| `-l USER` | Login as user |
| `-i KEYFILE` | Identity (private key) file |
| `-F CONFIG` | Config file (default: `~/.ssh/config`) |
| `-o OPTION` | SSH option (e.g., `-o StrictHostKeyChecking=no`) |
| `-v` | Verbose (use `-vv` or `-vvv` for more) |
| `-q` | Quiet mode |
| `-N` | No remote command (useful for tunnels) |
| `-f` | Go to background before command execution |
| `-T` | Disable pseudo-terminal allocation |
| `-t` | Force pseudo-terminal allocation |
| `-tt` | Force TTY even if ssh has no local TTY |
| `-C` | Enable compression |
| `-X` | Enable X11 forwarding |
| `-x` | Disable X11 forwarding |
| `-Y` | Enable trusted X11 forwarding |
| `-A` | Enable agent forwarding |
| `-a` | Disable agent forwarding |
| `-L [BIND:]PORT:HOST:PORT` | Local port forwarding |
| `-R [BIND:]PORT:HOST:PORT` | Remote port forwarding |
| `-D [BIND:]PORT` | Dynamic SOCKS proxy |
| `-J USER@HOST:PORT` | ProxyJump (jump host) |
| `-W HOST:PORT` | Forward stdin/stdout to HOST:PORT |
| `-w LOCAL:REMOTE` | TUN device forwarding |
| `-b ADDR` | Bind address |
| `-e CHAR` | Escape character (default: `~`) |
| `-E LOGFILE` | Append debug logs to file |
| `-G` | Print config after evaluating Host blocks |
| `-K` | Enable GSSAPI authentication and forwarding |
| `-k` | Disable GSSAPI forwarding |
| `-M` | Master mode for connection multiplexing |
| `-S PATH` | Control socket for multiplexing |
| `-O COMMAND` | Control multiplex master: `check`, `forward`, `cancel`, `exit`, `stop` |
| `-4` | Force IPv4 |
| `-6` | Force IPv6 |
| `-1` | Force protocol version 1 (deprecated) |
| `-2` | Force protocol version 2 |

## SSH Config Options (`-o` or `~/.ssh/config`)

| Option | Description |
|--------|-------------|
| `StrictHostKeyChecking yes/no/ask` | Host key verification |
| `UserKnownHostsFile FILE` | Known hosts file |
| `PasswordAuthentication yes/no` | Allow password auth |
| `PubkeyAuthentication yes/no` | Allow public key auth |
| `IdentityFile FILE` | Private key file |
| `Port PORT` | Default port |
| `User USERNAME` | Default username |
| `ProxyJump HOST` | Jump host |
| `ProxyCommand CMD` | Proxy command |
| `ServerAliveInterval SEC` | Send keepalive every SEC seconds |
| `ServerAliveCountMax NUM` | Disconnect after NUM missed keepalives |
| `ConnectTimeout SEC` | Connection timeout |
| `Compression yes/no` | Enable compression |
| `ForwardAgent yes/no` | Agent forwarding |
| `ForwardX11 yes/no` | X11 forwarding |
| `ControlMaster auto/yes/no` | Connection multiplexing |
| `ControlPath PATH` | Multiplex socket path |
| `ControlPersist TIME` | Keep multiplex connection alive |
| `LocalForward PORT HOST:PORT` | Local port forward |
| `RemoteForward PORT HOST:PORT` | Remote port forward |
| `DynamicForward PORT` | SOCKS proxy |
| `AddKeysToAgent yes/no` | Auto-add keys to agent |
| `IdentitiesOnly yes/no` | Only use specified identity files |
| `LogLevel QUIET/FATAL/ERROR/INFO/VERBOSE/DEBUG` | Log verbosity |
| `Ciphers LIST` | Allowed ciphers |
| `MACs LIST` | Allowed MACs |
| `KexAlgorithms LIST` | Key exchange algorithms |
| `HostKeyAlgorithms LIST` | Host key algorithms |
| `BatchMode yes/no` | Non-interactive mode |
| `RequestTTY auto/yes/no/force` | TTY allocation |
| `SendEnv PATTERN` | Send environment variable |
| `SetEnv KEY=VALUE` | Set environment variable |
| `PermitLocalCommand yes/no` | Allow local command execution |
| `LocalCommand CMD` | Command to run locally after connect |
| `TCPKeepAlive yes/no` | TCP keepalive |
| `ExitOnForwardFailure yes/no` | Exit if forwarding fails |

## SSH Escape Sequences (While Connected)

Press `Enter` then the escape character (`~` by default):

| Sequence | Description |
|----------|-------------|
| `~.` | Disconnect (terminate connection) |
| `~^Z` | Suspend ssh |
| `~#` | List forwarded connections |
| `~&` | Background ssh (when waiting for connections to close) |
| `~?` | List escape sequences |
| `~B` | Send BREAK |
| `~C` | Open command line (add/remove port forwarding) |
| `~R` | Request rekeying |
| `~V` | Decrease verbosity |
| `~v` | Increase verbosity |

## Examples

```bash
# Basic connection
ssh user@192.168.1.50

# Connection on custom port
ssh -p 2222 user@192.168.1.50

# Use specific key
ssh -i ~/.ssh/my_key user@192.168.1.50

# Run a remote command
ssh user@192.168.1.50 "uname -a"
ssh user@192.168.1.50 "df -h; free -m"

# Local port forwarding (access remote service locally)
ssh -L 8080:localhost:80 user@remote      # localhost:8080 → remote:80
ssh -L 3306:db-server:3306 user@bastion   # localhost:3306 → db-server:3306 via bastion

# Remote port forwarding (expose local service to remote)
ssh -R 9090:localhost:3000 user@remote     # remote:9090 → localhost:3000

# SOCKS proxy (dynamic forwarding)
ssh -D 1080 user@remote                   # localhost:1080 SOCKS proxy
# Then configure browser to use SOCKS5 proxy at localhost:1080

# Jump host (ProxyJump)
ssh -J bastion@jump.example.com user@internal-server
ssh -J jump1,jump2 user@internal           # Multiple jumps

# X11 forwarding (run GUI apps remotely)
ssh -X user@remote
# Then run: firefox, gedit, etc.

# Background tunnel
ssh -fNL 8080:localhost:80 user@remote     # Tunnel in background

# Connection multiplexing
ssh -M -S /tmp/ssh_mux user@remote         # Create master
ssh -S /tmp/ssh_mux user@remote            # Reuse connection

# Copy SSH key to remote
ssh-copy-id user@192.168.1.50
ssh-copy-id -i ~/.ssh/my_key.pub user@192.168.1.50

# Generate SSH key pair
ssh-keygen -t ed25519 -C "my-key"
ssh-keygen -t rsa -b 4096 -C "my-key"

# Debug connection issues
ssh -vvv user@192.168.1.50

# Force password authentication
ssh -o PubkeyAuthentication=no user@192.168.1.50

# Disable host key checking (dangerous, use for scripts)
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null user@host

# Mount remote filesystem
sshfs user@remote:/path /local/mountpoint

# Keep connection alive
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 user@remote
```

### SSH Config Example (`~/.ssh/config`)

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

# 27. `scp` — Secure Copy

## Syntax

```bash
scp [OPTIONS] SOURCE DESTINATION
```

## All Flags

| Flag | Description |
|------|-------------|
| `-r` | Recursive (copy directories) |
| `-P PORT` | Connect to port (note: uppercase P, unlike ssh) |
| `-i KEYFILE` | Identity file |
| `-p` | Preserve modification times, access times, modes |
| `-q` | Quiet (no progress bar) |
| `-v` | Verbose |
| `-C` | Enable compression |
| `-l LIMIT` | Limit bandwidth (Kbit/s) |
| `-o OPTION` | SSH option |
| `-F CONFIG` | SSH config file |
| `-S PROGRAM` | Use program for encrypted connection |
| `-c CIPHER` | Select cipher |
| `-3` | Route through local host (for copying between two remotes) |
| `-4` | Force IPv4 |
| `-6` | Force IPv6 |
| `-B` | Batch mode (no password prompt) |
| `-J DEST` | ProxyJump |
| `-O` | Use original SCP protocol (not SFTP) |
| `-D` | Use SFTP protocol (default on newer versions) |
| `-T` | Disable strict filename checking |

## Examples

```bash
# Copy local file to remote
scp file.txt user@remote:/home/user/

# Copy remote file to local
scp user@remote:/var/log/syslog ./

# Copy directory recursively
scp -r ./mydir user@remote:/home/user/

# Custom port
scp -P 2222 file.txt user@remote:/tmp/

# With specific key
scp -i ~/.ssh/my_key file.txt user@remote:/tmp/

# Preserve timestamps and permissions
scp -p file.txt user@remote:/tmp/

# Limit bandwidth to 500 Kbit/s
scp -l 500 largefile.iso user@remote:/tmp/

# Copy between two remote hosts through local
scp -3 user1@host1:/file user2@host2:/file

# Via jump host
scp -J bastion file.txt user@internal:/tmp/

# With compression
scp -C largefile.txt user@remote:/tmp/
```

---

# 28. `sftp` — Secure FTP

Interactive secure file transfer over SSH.

## Syntax

```bash
sftp [OPTIONS] [USER@]HOST[:PATH]
```

## Flags

| Flag | Description |
|------|-------------|
| `-P PORT` | Port |
| `-i KEYFILE` | Identity file |
| `-b BATCHFILE` | Batch mode (read commands from file) |
| `-B BUFFERSIZE` | Buffer size for transfers |
| `-l LIMIT` | Bandwidth limit (Kbit/s) |
| `-o OPTION` | SSH option |
| `-F CONFIG` | SSH config file |
| `-r` | Recursive (for `put`/`get`) |
| `-R NUM` | Number of outstanding requests |
| `-s SUBSYSTEM` | SSH2 subsystem |
| `-S PROGRAM` | Program for connection |
| `-C` | Compression |
| `-v` | Verbose |
| `-4` / `-6` | Force IPv4/IPv6 |
| `-J HOST` | ProxyJump |

## Interactive Commands

| Command | Description |
|---------|-------------|
| `ls [PATH]` | List remote directory |
| `lls [PATH]` | List local directory |
| `cd PATH` | Change remote directory |
| `lcd PATH` | Change local directory |
| `pwd` | Print remote working directory |
| `lpwd` | Print local working directory |
| `get FILE [LOCAL]` | Download file |
| `get -r DIR` | Download directory recursively |
| `put FILE [REMOTE]` | Upload file |
| `put -r DIR` | Upload directory recursively |
| `mget PATTERN` | Download multiple files |
| `mput PATTERN` | Upload multiple files |
| `mkdir DIR` | Create remote directory |
| `rmdir DIR` | Remove remote directory |
| `rm FILE` | Delete remote file |
| `rename OLD NEW` | Rename remote file |
| `chmod MODE FILE` | Change remote file permissions |
| `chown UID FILE` | Change remote file owner |
| `chgrp GID FILE` | Change remote file group |
| `ln SRC DST` | Create remote symlink |
| `lumask MASK` | Set local umask |
| `df [-h] [PATH]` | Show remote disk usage |
| `!COMMAND` | Execute local command |
| `exit` / `quit` / `bye` | Exit sftp |
| `help` / `?` | Show help |
| `progress` | Toggle progress display |
| `version` | Show SFTP version |
| `reget FILE` | Resume download |
| `reput FILE` | Resume upload |

---

# 29. `rsync` — Remote File Synchronization

## Syntax

```bash
rsync [OPTIONS] SOURCE DESTINATION
```

## All Major Flags

| Flag | Description |
|------|-------------|
| `-a` / `--archive` | Archive mode: `-rlptgoD` (recursive, links, perms, times, group, owner, devices) |
| `-r` / `--recursive` | Recursive |
| `-v` / `--verbose` | Verbose |
| `-z` / `--compress` | Compress during transfer |
| `-P` | Same as `--partial --progress` |
| `--partial` | Keep partially transferred files |
| `--progress` | Show transfer progress |
| `-n` / `--dry-run` | Simulate (show what would be done) |
| `--delete` | Delete files on destination not in source |
| `--delete-before` | Delete before transfer |
| `--delete-during` | Delete during transfer |
| `--delete-after` | Delete after transfer |
| `--delete-excluded` | Also delete excluded files on destination |
| `-e COMMAND` | Remote shell to use (e.g., `-e "ssh -p 2222"`) |
| `--exclude PATTERN` | Exclude pattern |
| `--exclude-from FILE` | Exclude patterns from file |
| `--include PATTERN` | Include pattern |
| `--include-from FILE` | Include patterns from file |
| `--filter RULE` | Add file-filtering rule |
| `-l` / `--links` | Copy symlinks as symlinks |
| `-L` / `--copy-links` | Transform symlinks into files |
| `-H` / `--hard-links` | Preserve hard links |
| `-p` / `--perms` | Preserve permissions |
| `-o` / `--owner` | Preserve owner |
| `-g` / `--group` | Preserve group |
| `-t` / `--times` | Preserve modification times |
| `-D` | Same as `--devices --specials` |
| `--devices` | Preserve device files |
| `--specials` | Preserve special files |
| `-S` / `--sparse` | Handle sparse files efficiently |
| `-x` / `--one-file-system` | Don't cross filesystem boundaries |
| `-u` / `--update` | Skip files newer on destination |
| `-c` / `--checksum` | Skip based on checksum instead of mod-time/size |
| `--size-only` | Skip based on size only |
| `-b` / `--backup` | Make backups |
| `--backup-dir DIR` | Backup directory |
| `--suffix SUFFIX` | Backup suffix (default: `~`) |
| `--bwlimit RATE` | Bandwidth limit (KB/s or with suffix: K, M, G) |
| `--max-size SIZE` | Skip files larger than SIZE |
| `--min-size SIZE` | Skip files smaller than SIZE |
| `--existing` | Skip creating new files on receiver |
| `--ignore-existing` | Skip updating existing files |
| `--remove-source-files` | Delete source files after transfer |
| `--chmod PERMS` | Set permissions on destination |
| `--chown USER:GROUP` | Set owner/group on destination |
| `-i` / `--itemize-changes` | Show detailed changes |
| `--info FLAGS` | Fine-grained info output |
| `--stats` | Show transfer statistics |
| `-h` / `--human-readable` | Human-readable sizes |
| `--log-file FILE` | Log to file |
| `--log-file-format FMT` | Log format string |
| `-W` / `--whole-file` | Copy whole files (don't delta) |
| `--no-whole-file` | Force delta transfer |
| `-I` / `--ignore-times` | Don't skip files by time/size |
| `--list-only` | List files instead of transferring |
| `--timeout SEC` | I/O timeout |
| `--contimeout SEC` | Connection timeout |
| `--temp-dir DIR` | Create temp files in DIR |
| `--compare-dest DIR` | Compare against DIR |
| `--copy-dest DIR` | Copy from DIR if unchanged |
| `--link-dest DIR` | Hardlink from DIR if unchanged |
| `--compress-level NUM` | Compression level (0-9) |
| `--skip-compress LIST` | Skip compression for these suffixes |
| `-4` / `-6` | Force IPv4/IPv6 |
| `--address ADDR` | Bind to address |
| `--port PORT` | Specify daemon port |
| `--sockopts OPTIONS` | Socket options |
| `--blocking-io` | Use blocking I/O |
| `--outbuf MODE` | Output buffering: `N`one, `L`ine, `B`lock |
| `--8-bit-output` | Don't escape high-bit chars |
| `--password-file FILE` | Read daemon password from file |
| `--early-input FILE` | Input to be consumed before transfer |

## Examples

```bash
# Sync directory to remote
rsync -avz ./mydir/ user@remote:/backup/mydir/

# Dry run (preview changes)
rsync -avzn ./mydir/ user@remote:/backup/mydir/

# Sync with delete (mirror)
rsync -avz --delete ./mydir/ user@remote:/backup/mydir/

# Exclude patterns
rsync -avz --exclude '*.log' --exclude '.git' ./src/ user@remote:/deploy/

# Use custom SSH port
rsync -avz -e "ssh -p 2222" ./mydir/ user@remote:/backup/

# Bandwidth limit (1MB/s)
rsync -avz --bwlimit=1M ./mydir/ user@remote:/backup/

# Show progress
rsync -avzP ./largefile.iso user@remote:/backup/

# Show itemized changes
rsync -avzi ./mydir/ user@remote:/backup/mydir/

# Only newer files
rsync -avzu ./mydir/ user@remote:/backup/mydir/

# Incremental backup with hard links
rsync -avz --link-dest=/backup/yesterday/ ./data/ /backup/today/

# Local sync
rsync -avz /source/ /destination/

# Checksum-based comparison
rsync -avzc ./mydir/ user@remote:/backup/

# Remove source files after transfer
rsync -avz --remove-source-files ./outbox/ user@remote:/inbox/

# Show statistics
rsync -avz --stats ./mydir/ user@remote:/backup/
```

---

# 30. `nc` / `netcat` — Network Swiss Army Knife

## Syntax

```bash
nc [OPTIONS] HOST PORT
nc [OPTIONS] -l [PORT]
```

## Flags (GNU/OpenBSD netcat)

| Flag | Description |
|------|-------------|
| `-l` | Listen mode |
| `-p PORT` | Local port |
| `-s ADDR` | Source address |
| `-u` | UDP mode |
| `-v` | Verbose |
| `-w SEC` | Timeout |
| `-z` | Zero-I/O mode (scanning) |
| `-n` | Numeric only (no DNS) |
| `-k` | Keep listening after disconnect (accept multiple connections) |
| `-e PROG` | Execute program on connect (some versions) |
| `-c CMD` | Execute shell command on connect (some versions) |
| `-q SEC` | Quit after EOF on stdin, wait SEC |
| `-d` | Detach from stdin |
| `-i SEC` | Delay between lines sent |
| `-o FILE` | Hex dump traffic to file |
| `-r` | Randomize source/destination ports |
| `-C` | Send CRLF line endings |
| `-N` | Shutdown network after EOF on stdin |
| `-4` / `-6` | Force IPv4/IPv6 |
| `-U` | Use Unix domain sockets |
| `-X PROTO` | Proxy protocol: `4` (SOCKS4), `5` (SOCKS5), `connect` (HTTP) |
| `-x PROXY:PORT` | Proxy address |

## Examples

```bash
# Test if a port is open
nc -zv 192.168.1.1 80
nc -zv 192.168.1.1 20-100              # Scan port range

# Simple TCP server
nc -l -p 4444

# Simple TCP client
nc 192.168.1.50 4444

# UDP mode
nc -u -l -p 5000                       # UDP server
nc -u 192.168.1.50 5000                # UDP client

# File transfer
nc -l -p 4444 > received.tar.gz        # Receiver
nc 192.168.1.50 4444 < file.tar.gz     # Sender

# Chat between machines
nc -l -p 5000                          # Machine A
nc 192.168.1.100 5000                  # Machine B

# HTTP request
echo -e "GET / HTTP/1.1\r\nHost: example.com\r\n\r\n" | nc example.com 80

# Banner grabbing
echo "" | nc -w 3 192.168.1.1 22       # SSH banner
echo "" | nc -w 3 192.168.1.1 25       # SMTP banner

# Port forwarding (with process substitution)
nc -l -p 8080 -c "nc 192.168.1.100 80"

# Keep listening for multiple connections
nc -lk -p 4444

# Proxy through SOCKS5
nc -X 5 -x proxy:1080 target 80

# With timeout
nc -w 5 192.168.1.1 80

# Directory transfer with tar
tar czf - ./mydir | nc 192.168.1.50 4444         # Sender
nc -l -p 4444 | tar xzf -                         # Receiver

# Backdoor shell (for testing only)
nc -l -p 4444 -e /bin/bash                         # Dangerous!
```

---

# 31. `ncat` — Modern Netcat (from Nmap)

`ncat` is Nmap's reimplementation of netcat with added features: SSL/TLS support, IPv6, connection brokering, and access control. It is bundled with `nmap`.

## Installation

```bash
sudo apt install ncat               # Debian/Ubuntu
sudo dnf install nmap               # RHEL/Fedora (includes ncat)
```

## Syntax

```bash
ncat [options] [hostname] [port]
```

## Basic Connection Testing

```bash
# Test if a TCP port is open
ncat -zv 192.168.1.1 22

# Test UDP port
ncat -zuv 192.168.1.1 53

# Connect to a service (interactive)
ncat example.com 80

# Connect with timeout (5 seconds)
ncat --send-only -w 5 192.168.1.1 80

# Banner grabbing
echo "" | ncat 192.168.1.1 22
```

## Server Mode (Listen)

```bash
# Listen on a port
ncat -l 9090

# Listen and keep open for multiple connections
ncat -lk 9090

# Listen on specific address
ncat -l 127.0.0.1 9090

# Execute a command on each connection
ncat -l 9090 -e /bin/bash          # TCP shell (for testing only)

# Listen on UDP
ncat -lu 9090
```

## File Transfer

```bash
# Send file (receiver listens first)
ncat -l 9090 > received_file.txt   # Receiver
ncat 192.168.1.2 9090 < send_file.txt  # Sender

# Transfer with progress (pipe through pv)
ncat -l 9090 > output.tar.gz       # Receiver
tar czf - /data | ncat 192.168.1.2 9090  # Sender
```

## SSL/TLS (ncat's Key Advantage over nc)

```bash
# SSL server
ncat -l 9090 --ssl

# SSL client
ncat --ssl 192.168.1.1 9090

# SSL with certificates
ncat -l 9090 --ssl --ssl-cert server.crt --ssl-key server.key

# SSL client with certificate verification
ncat --ssl --ssl-verify --ssl-trustfile ca.crt 192.168.1.1 9090

# Quick HTTPS header grab
ncat --ssl example.com 443 <<< "HEAD / HTTP/1.0\nHost: example.com\n\n"
```

## Connection Brokering

```bash
# Broker: two clients connect to this host and talk to each other
ncat -l --broker 9090

# Chat server (broadcast to all connected clients)
ncat -l --chat 9090
```

## Access Control

```bash
# Allow connections only from specific IPs
ncat -l 9090 --allow 192.168.1.0/24

# Deny specific IPs
ncat -l 9090 --deny 10.0.0.5

# Allow list from file
ncat -l 9090 --allowfile /etc/ncat.allow
```

## Proxy and Tunneling

```bash
# HTTP proxy connect through proxy
ncat --proxy 192.168.1.1:8080 --proxy-type http example.com 80

# SOCKS5 proxy
ncat --proxy 127.0.0.1:1080 --proxy-type socks5 example.com 80

# Port forwarding (forward local 8080 to remote 80)
ncat -l 8080 -c "ncat example.com 80"
```

## IPv6

```bash
# Connect to IPv6 host
ncat -6 2001:db8::1 80

# Listen on IPv6
ncat -6 -l 9090

# Listen on both IPv4 and IPv6
ncat -46 -l 9090
```

---



# 32. `socat` — Multipurpose Bidirectional Relay

`socat` (SOcket CAT) creates bidirectional data channels between virtually any two endpoints: TCP, UDP, Unix sockets, files, processes, serial ports, TLS, and more. It is the most powerful of the netcat-family tools.

## Installation

```bash
sudo apt install socat              # Debian/Ubuntu
sudo dnf install socat              # RHEL/Fedora
```

## Syntax

```bash
socat [options] ADDRESS1 ADDRESS2
```

Data flows bidirectionally between ADDRESS1 and ADDRESS2. Each address uses the format `TYPE:params` or a keyword.

## Common Address Types

| Address | Description |
|---------|-------------|
| `TCP:host:port` | TCP client connection |
| `TCP-LISTEN:port` | TCP server |
| `UDP:host:port` | UDP send |
| `UDP-LISTEN:port` | UDP server |
| `UNIX-CONNECT:path` | Unix domain socket client |
| `UNIX-LISTEN:path` | Unix domain socket server |
| `OPENSSL:host:port` | TLS client |
| `OPENSSL-LISTEN:port` | TLS server |
| `FILE:path` | Regular file |
| `STDIN` / `STDOUT` | Standard I/O |
| `EXEC:cmd` | Execute a command |
| `PTY` | Pseudo-terminal |
| `PIPE:path` | Named pipe |
| `GOPEN:path` | Open any file |

## Basic Connections

```bash
# TCP client (interactive)
socat - TCP:example.com:80

# TCP server (echo back to client)
socat TCP-LISTEN:9090,reuseaddr,fork STDIN

# UDP client
socat - UDP:192.168.1.1:514

# UDP server
socat UDP-LISTEN:514,reuseaddr -
```

## Port Forwarding

```bash
# Forward local port 8080 to remote host:port
socat TCP-LISTEN:8080,reuseaddr,fork TCP:192.168.1.10:80

# Forward with specific bind address
socat TCP-LISTEN:8080,bind=127.0.0.1,reuseaddr,fork TCP:10.0.0.1:80

# UDP port forwarding
socat UDP-LISTEN:5353,reuseaddr,fork UDP:8.8.8.8:53
```

## File Transfer

```bash
# Send a file
socat TCP-LISTEN:9090,reuseaddr - > received.tar.gz  # Receiver (listens first)
socat - TCP:192.168.1.2:9090 < send.tar.gz            # Sender

# Transfer with progress
pv file.tar.gz | socat - TCP:192.168.1.2:9090        # Sender with progress
```

## Unix Socket Proxy

```bash
# Proxy Unix socket to TCP (e.g., expose Docker socket over TCP — be careful)
socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CONNECT:/var/run/docker.sock

# Proxy TCP to Unix socket
socat UNIX-LISTEN:/tmp/my.sock,reuseaddr,fork TCP:192.168.1.1:9090
```

## TLS / SSL

```bash
# TLS server
socat OPENSSL-LISTEN:4443,reuseaddr,fork,cert=server.pem,cafile=ca.pem EXEC:/bin/bash

# TLS client
socat STDIN OPENSSL:example.com:443,verify=1,cafile=/etc/ssl/certs/ca-certificates.crt

# Generate self-signed cert for testing
openssl req -newkey rsa:2048 -nodes -keyout server.key -x509 -days 365 -out server.crt
cat server.key server.crt > server.pem
socat OPENSSL-LISTEN:4443,cert=server.pem,verify=0 STDOUT
```

## Shell and Process Piping

```bash
# Remote shell server (TCP → bash — for testing only)
socat TCP-LISTEN:9090,reuseaddr,fork EXEC:/bin/bash,pty,setsid,ctty

# Execute a command and send output to remote
socat EXEC:"ps aux" TCP:192.168.1.1:9090

# Pipe between two processes
socat EXEC:"prog1" EXEC:"prog2"
```

## Serial Port / PTY

```bash
# Connect to a serial port
socat - /dev/ttyS0,raw,echo=0,crnl,b115200

# Create a virtual serial port pair (for testing)
socat -d -d PTY,link=/dev/ttyV0 PTY,link=/dev/ttyV1

# Serial port to TCP gateway
socat /dev/ttyS0,raw,b9600 TCP-LISTEN:2000,reuseaddr
```

## Debugging Options

```bash
-v            # Print data flowing in both directions (human-readable)
-x            # Print data in hex
-d            # Debug level 1
-d -d         # Debug level 2 (more verbose)
-d -d -d      # Maximum debug output

# Example: watch HTTP request/response
socat -v TCP-LISTEN:8080,reuseaddr,fork TCP:example.com:80
```

---



# 33. `whois` — Domain Registration Lookup

`whois` queries WHOIS databases for domain registration and IP allocation information.

## Installation

```bash
sudo apt install whois              # Debian/Ubuntu
sudo dnf install whois              # RHEL/Fedora
```

## Syntax

```bash
whois [options] QUERY
```

## Domain Lookups

```bash
# Domain registration information
whois example.com

# Show registrar, dates, nameservers, status
whois google.com | grep -E "Registrar:|Creation Date:|Expiry Date:|Name Server:"

# Check domain availability (look for "No match" or "NOT FOUND")
whois somefunkyname123.com | grep -i "no match\|not found"

# WHOIS for a ccTLD (country-code TLD)
whois example.co.uk
whois example.de

# Query a specific WHOIS server
whois -h whois.verisign-grs.com example.com

# Show raw output without stripping comments
whois -r example.com

# Recursively follow referrals to authoritative server
whois -R example.com
```

## IP Address Lookups

```bash
# Lookup IP owner and allocation
whois 8.8.8.8

# IP lookup via regional registry
whois -h whois.arin.net 8.8.8.8         # ARIN (North America)
whois -h whois.ripe.net 8.8.8.8         # RIPE (Europe, Middle East)
whois -h whois.apnic.net 8.8.8.8        # APNIC (Asia-Pacific)
whois -h whois.lacnic.net 8.8.8.8       # LACNIC (Latin America)
whois -h whois.afrinic.net 8.8.8.8      # AFRINIC (Africa)

# Get ASN (Autonomous System Number) info
whois AS15169                            # Google's ASN
whois -h whois.radb.net AS15169

# Lookup an entire CIDR block
whois 192.0.2.0/24
```

## Useful Filters

```bash
# Extract registrar info only
whois example.com | grep -i "registrar"

# Extract nameservers
whois example.com | grep -i "name server"

# Extract expiry date
whois example.com | grep -iE "expir|expiry|expires"

# Extract status
whois example.com | grep -i "status"

# Check for DNSSEC
whois example.com | grep -i "dnssec"
```

## Key Fields in WHOIS Output

| Field | Meaning |
|-------|---------|
| `Registrar` | Company that registered the domain |
| `Creation Date` | When the domain was first registered |
| `Updated Date` | Last modification date |
| `Registry Expiry Date` | When registration expires |
| `Name Server` | Authoritative DNS servers |
| `Domain Status` | Current status (clientTransferProhibited, etc.) |
| `Registrant` | Owner information (often redacted for privacy) |
| `DNSSEC` | Whether DNSSEC is enabled |

---



# 34. `hostname` / `hostnamectl` — Hostname Management

Linux uses two commands for hostname management: the legacy `hostname` (immediate, non-persistent) and the modern `hostnamectl` (persistent, systemd-based).

## `hostname` — View and Temporarily Set Hostname

```bash
# Show current hostname
hostname

# Show fully qualified domain name (FQDN)
hostname -f
hostname --fqdn

# Show short hostname (without domain)
hostname -s

# Show DNS domain name
hostname -d

# Show all IP addresses of the host
hostname -I

# Show primary IP address
hostname -i

# Temporarily set hostname (resets on reboot)
sudo hostname newhostname

# Set FQDN hostname temporarily
sudo hostname newhostname.example.com
```

## `hostnamectl` — Persistent Hostname Management (systemd)

```bash
# Show full hostname status
hostnamectl

# Show only the static hostname
hostnamectl hostname

# Set static hostname (persists across reboots)
sudo hostnamectl set-hostname newhostname

# Set a pretty hostname (human-readable, can contain spaces)
sudo hostnamectl set-hostname "My Server 01" --pretty

# Set transient hostname (runtime only, overridden by DHCP)
sudo hostnamectl set-hostname temp-name --transient

# Clear pretty hostname
sudo hostnamectl set-hostname "" --pretty
```

### hostnamectl Status Output

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

## Hostname Types

| Type | Description | Persistence |
|------|-------------|-------------|
| **Static** | Set by admin, primary hostname | Permanent (in `/etc/hostname`) |
| **Pretty** | Human-friendly, can have spaces/special chars | Permanent (in `/etc/machine-info`) |
| **Transient** | Temporary, set by kernel/DHCP | Lost on reboot |

## Configuration Files

```bash
# View /etc/hostname (static hostname)
cat /etc/hostname

# Edit hostname directly
sudo nano /etc/hostname

# /etc/hosts should also be updated for local resolution
sudo nano /etc/hosts
# Add or update: 127.0.1.1  newhostname.example.com  newhostname

# /etc/machine-info contains pretty hostname
cat /etc/machine-info

# Verify hostname resolves
getent hosts $(hostname)
```

## DHCP and Hostname

```bash
# Check if DHCP is overriding your hostname
hostnamectl status | grep Transient

# Prevent NetworkManager from changing hostname via DHCP
# Edit /etc/NetworkManager/NetworkManager.conf:
# [main]
# hostname-mode=none
```

---



# 35. `ipcalc` — IP Address Calculator

`ipcalc` computes network information from an IP address and prefix or netmask. Essential for subnetting calculations.

## Installation

```bash
sudo apt install ipcalc             # Debian/Ubuntu
sudo dnf install ipcalc             # RHEL/Fedora
```

## Basic Usage

```bash
# Calculate network info from CIDR notation
ipcalc 192.168.1.100/24

# Using netmask instead of prefix
ipcalc 192.168.1.100 255.255.255.0

# IPv6 calculation
ipcalc 2001:db8::1/48
```

### Reading ipcalc Output

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

| Field | Description |
|-------|-------------|
| `Address` | The input IP address |
| `Netmask` | Subnet mask with prefix length |
| `Wildcard` | Inverse mask (used in ACLs/nmap) |
| `Network` | Network address (first address in block) |
| `HostMin` | First usable host address |
| `HostMax` | Last usable host address |
| `Broadcast` | Broadcast address (last in block) |
| `Hosts/Net` | Number of usable host addresses |

## Subnetting

```bash
# Split a network into subnets of specific sizes
# Divide 192.168.1.0/24 into subnets for 200, 100, and 50 hosts
ipcalc 192.168.1.0/24 -s 200 100 50

# Request minimum subnets needed for N hosts
ipcalc 10.0.0.0/8 -s 1000 500 250

# Show deaggregate: all /26 subnets inside /24
ipcalc 192.168.1.0/24 -b | head -20
```

## Output Formatting Options

```bash
# Show only the network address
ipcalc -n 192.168.1.100/24
# Output: 192.168.1.0

# Show only the broadcast
ipcalc -b 192.168.1.100/24
# Output: 192.168.1.255

# Show only the prefix length
ipcalc -p 192.168.1.100 255.255.255.0
# Output: 24

# Show only the netmask
ipcalc -m 192.168.1.100/24
# Output: 255.255.255.0

# Check if an address is valid
ipcalc -c 192.168.1.100/24 ; echo $?   # 0=valid, 1=invalid

# Show minimal output (no explanations)
ipcalc -s 0 192.168.1.0/24

# No color output
ipcalc --nocolor 192.168.1.100/24
```

## Quick Reference: Common Prefix Lengths

| Prefix | Netmask | Hosts | Usage |
|--------|---------|-------|-------|
| `/30` | 255.255.255.252 | 2 | Point-to-point links |
| `/29` | 255.255.255.248 | 6 | Small segments |
| `/28` | 255.255.255.240 | 14 | Small office |
| `/27` | 255.255.255.224 | 30 | Small subnet |
| `/26` | 255.255.255.192 | 62 | Medium subnet |
| `/25` | 255.255.255.128 | 126 | Half a /24 |
| `/24` | 255.255.255.0 | 254 | Standard LAN |
| `/23` | 255.255.254.0 | 510 | |
| `/22` | 255.255.252.0 | 1022 | |
| `/16` | 255.255.0.0 | 65534 | Class B |
| `/8` | 255.0.0.0 | 16M | Class A |

---



# 36. `lsof` — List Open Network Sockets

`lsof` (List Open Files) lists all open files, including network sockets. It is one of the most powerful tools for finding which process is using a port or network connection.

## Syntax

```bash
lsof [options] [names]
```

## Network-Specific Options

```bash
# Show ALL network connections (IPv4 and IPv6)
sudo lsof -i

# Show only IPv4
sudo lsof -i 4

# Show only IPv6
sudo lsof -i 6

# Show connections on a specific port
sudo lsof -i :80
sudo lsof -i :443

# Show connections to a specific host
sudo lsof -i @192.168.1.1

# Show connections to host on a specific port
sudo lsof -i @192.168.1.1:22

# Show port range
sudo lsof -i :1-1024

# Show TCP connections only
sudo lsof -i tcp

# Show UDP connections only
sudo lsof -i udp

# Show only LISTENING sockets
sudo lsof -iTCP -sTCP:LISTEN

# Show only ESTABLISHED connections
sudo lsof -iTCP -sTCP:ESTABLISHED

# Show only CLOSE_WAIT
sudo lsof -iTCP -sTCP:CLOSE_WAIT
```

## Process and User Filtering

```bash
# Show network connections for a specific PID
sudo lsof -p 1234 -i

# Show network connections for a specific process name
sudo lsof -c nginx -i

# Show connections for a specific user
sudo lsof -u www-data -i

# Show connections for all users except root
sudo lsof -u ^root -i

# Show connections for multiple PIDs
sudo lsof -p 1234,5678 -i
```

## Output Control

```bash
# Numeric addresses and ports (no DNS resolution — faster)
sudo lsof -i -P -n

# Numeric ports only (resolve hosts)
sudo lsof -i -P

# Repeat every 2 seconds
sudo lsof -i -r 2

# Show only specific fields
sudo lsof -i -F pcn      # Process ID, command, name only

# One line per file (default is multi-line for some types)
sudo lsof -i -l
```

### Reading lsof -i Output

```
COMMAND   PID   USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
nginx     1234  root   6u  IPv4   12345      0t0  TCP  *:80 (LISTEN)
sshd      5678  root   3u  IPv4   67890      0t0  TCP  0.0.0.0:22 (LISTEN)
chrome    9012  user   45u IPv4  111111      0t0  TCP  192.168.1.100:54321->93.184.216.34:443 (ESTABLISHED)
```

| Column | Meaning |
|--------|---------|
| `COMMAND` | Process name |
| `PID` | Process ID |
| `USER` | User running the process |
| `FD` | File descriptor (u=read+write) |
| `TYPE` | IPv4, IPv6, unix, etc. |
| `NAME` | Address:port → remote:port (state) |

## Common Use Cases

```bash
# Who is listening on port 8080?
sudo lsof -i :8080

# What ports is a specific PID using?
sudo lsof -p 1234 -i

# Find process blocking a port before killing it
sudo lsof -i :3000
sudo kill -9 $(sudo lsof -ti :3000)

# Show all open Unix domain sockets
sudo lsof -U

# Show all network activity for a process name
sudo lsof -c sshd -i

# Count connections by state
sudo lsof -i TCP | awk '{print $10}' | sort | uniq -c | sort -rn
```

---



# 37. `fuser` — Identify Processes Using Files or Sockets

`fuser` identifies which processes are using files, directories, or network ports. It is part of the `psmisc` package.

## Installation

```bash
sudo apt install psmisc             # Debian/Ubuntu
sudo dnf install psmisc             # RHEL/Fedora
```

## Syntax

```bash
fuser [options] name
```

## Network Port Usage

```bash
# Find process using TCP port 80
sudo fuser 80/tcp

# Output: 80/tcp: 1234
# This means PID 1234 is using TCP port 80

# Verbose output (shows process details)
sudo fuser -v 80/tcp

# Find process using UDP port 53
sudo fuser 53/udp

# Check multiple ports at once
sudo fuser 80/tcp 443/tcp 22/tcp

# Find all processes using any TCP port (slow)
sudo fuser -v -n tcp 0-65535 2>/dev/null

# Check if a port is in use (exit code 0=yes, 1=no)
sudo fuser 8080/tcp &>/dev/null && echo "Port in use" || echo "Port free"
```

## File and Directory Usage

```bash
# Find processes using a file
fuser /var/log/syslog

# Find processes using a directory (and all files within)
fuser -m /var/log/

# Find process using a Unix socket
sudo fuser -v /var/run/docker.sock

# Find what has a device/filesystem mounted
fuser -m /dev/sda1

# Find all processes using files under a path
fuser -m -v /path/to/dir
```

## Verbose Output

```bash
sudo fuser -v 80/tcp

# Output:
#                      USER        PID ACCESS COMMAND
# 80/tcp:              root       1234 F....  nginx
#                      www-data   1235 F....  nginx
```

| ACCESS Code | Meaning |
|-------------|---------|
| `c` | Current directory |
| `e` | Executable being run |
| `f` | Open file (omitted in default output) |
| `F` | Open file for writing |
| `r` | Root directory |
| `m` | mmap'd file or shared library |

## Killing Processes

```bash
# Kill process using port 80
sudo fuser -k 80/tcp

# Kill with SIGTERM first (gentler)
sudo fuser -k -TERM 80/tcp

# Kill with a specific signal
sudo fuser -k -HUP 80/tcp           # SIGHUP (reload config)
sudo fuser -k -9 80/tcp             # SIGKILL (force kill)

# Kill all processes using a directory (e.g., before unmounting)
sudo fuser -k -m /mnt/data

# Interactive kill (ask before each)
sudo fuser -i -k 80/tcp
```

## Useful Combinations

```bash
# Find PID only (for scripting)
sudo fuser 80/tcp 2>/dev/null

# Get PID as a clean number
PID=$(sudo fuser 3000/tcp 2>/dev/null | tr -d ' ')
echo "Killing PID $PID"
sudo kill -9 $PID

# List all processes using network
sudo fuser -v -n tcp 22 80 443 2>/dev/null
```

---



# 38. `iftop` — Real-Time Bandwidth Monitor

`iftop` displays real-time bandwidth usage on a network interface, showing the top connections by traffic volume. Think of it as `top` for network traffic.

## Installation

```bash
sudo apt install iftop              # Debian/Ubuntu
sudo dnf install iftop              # RHEL/Fedora
```

## Basic Usage

```bash
# Monitor default interface (requires root)
sudo iftop

# Monitor a specific interface
sudo iftop -i eth0
sudo iftop -i ens3

# Run for 10 seconds then print summary and exit
sudo iftop -t -s 10 -i eth0
```

## Options

```bash
# Do not resolve hostnames (numeric IPs, much faster)
sudo iftop -n

# Do not resolve port names (show port numbers)
sudo iftop -N

# Show port numbers
sudo iftop -P

# Show bytes instead of bits (default is bits/sec)
sudo iftop -B

# Apply a BPF filter (same syntax as tcpdump)
sudo iftop -f "port 80 or port 443"
sudo iftop -f "src net 192.168.1.0/24"
sudo iftop -f "dst host 8.8.8.8"

# Filter by network (show only traffic to/from this subnet)
sudo iftop -F 192.168.1.0/24

# Show IPv6 traffic
sudo iftop -6

# Use a specific pcap filter file
sudo iftop -c ~/.iftoprc

# Combine: specific interface, numeric, ports, bytes
sudo iftop -i eth0 -n -N -P -B
```

## Interactive Keys (while iftop is running)

| Key | Action |
|-----|--------|
| `h` | Toggle help |
| `n` | Toggle DNS resolution |
| `N` | Toggle port number resolution |
| `p` | Toggle port display |
| `s` | Toggle source host display |
| `d` | Toggle destination host display |
| `t` | Cycle through display modes (2-line/1-line/ports) |
| `l` | Toggle peak hold |
| `b` | Toggle bar graph display |
| `B` | Toggle bytes/bits |
| `j` / `k` | Scroll up/down through connections |
| `f` | Edit BPF filter expression |
| `1` `2` `3` | Sort by 2s/10s/40s column |
| `<` | Sort by source address |
| `>` | Sort by destination address |
| `q` | Quit |

## Reading iftop Output

```
                 12.5Kb          25.0Kb         37.5Kb         50.0Kb   62.5Kb
┌───────────────────────────────────────────────────────────────────────────────┐
│ 192.168.1.5                          =>      8.8.8.8                          │
│                                      <=                            234Kb       │
│ 192.168.1.5                          =>      93.184.216.34                    │
│                                      <=                             45Kb       │
├───────────────────────────────────────────────────────────────────────────────┤
│ TX:             cumulative    peak    rates:  2.56Kb   1.24Kb  0.98Kb         │
│ RX:                                          289Kb    145Kb   98Kb            │
│ TOTAL:                                       292Kb    146Kb   99Kb            │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **Top section:** Individual connections with send (=>) and receive (<=) rates
- **Three rate columns:** Average over last 2 seconds, 10 seconds, 40 seconds
- **Bottom section:** Total TX/RX/combined rates and cumulative totals

## Non-Interactive / Script Mode

```bash
# Run for 10 seconds and output text summary
sudo iftop -t -s 10 -n -N -i eth0 2>/dev/null

# Capture output to file
sudo iftop -t -s 30 -n -i eth0 > /tmp/iftop-report.txt 2>&1
```

---



# 39. `vnstat` — Network Traffic Monitor (Historical)

`vnstat` is a console-based network traffic monitor that records and displays historical traffic statistics without requiring root for viewing. Data is stored in a database and persists across reboots.

## Installation

```bash
sudo apt install vnstat              # Debian/Ubuntu
sudo dnf install vnstat              # RHEL/Fedora
```

## Service Setup

```bash
# Enable and start the vnstat daemon (required for data collection)
sudo systemctl enable --now vnstatd

# Check daemon status
sudo systemctl status vnstatd
```

## Viewing Traffic Statistics

```bash
# Summary for all monitored interfaces
vnstat

# Summary for a specific interface
vnstat -i eth0

# Live rate (updates every second)
vnstat -l
vnstat -l -i eth0

# Hourly statistics (current day)
vnstat -h
vnstat -hg              # With ASCII graph

# Daily statistics (last 30 days)
vnstat -d

# Monthly statistics (last 12 months)
vnstat -m

# Yearly statistics
vnstat -y

# Top 10 days by traffic
vnstat -t
vnstat -t 20            # Top 20 days

# 5-minute intervals for current hour
vnstat -5
vnstat -5 30            # Last 30 five-minute intervals

# Show traffic for a specific date range
vnstat --begin 2024-01-01 --end 2024-01-31

# JSON output (for scripting)
vnstat --json
vnstat --json d         # Daily in JSON
vnstat --json m         # Monthly in JSON

# XML output
vnstat --xml
```

## Database Management

```bash
# List monitored interfaces
vnstat --iflist

# List interfaces in the database
vnstat --dbiflist

# Add an interface to monitoring
sudo vnstat --add -i eth0

# Remove an interface from monitoring
sudo vnstat --remove -i eth0

# Rename an interface in the database
sudo vnstat --rename oldname newname

# Show database file location
vnstat --config

# Reset statistics for an interface
sudo vnstat --reset -i eth0

# Delete all data for an interface
sudo vnstat --delete -i eth0

# Delete all databases
sudo vnstat --delete --force
```

## Configuration

```bash
# View configuration
cat /etc/vnstat.conf

# Key settings in /etc/vnstat.conf:
# DatabaseDir "/var/lib/vnstat"
# Interface "eth0"
# MaxBandwidth 1000        # Interface speed in Mbit/s
# UpdateInterval 20        # How often to update (seconds)
# PollInterval 5           # Polling interval (seconds)
# MonthRotate 1            # Day to start monthly counting

# Apply config changes
sudo systemctl restart vnstatd
```

## Useful Examples

```bash
# Quick bandwidth summary for all interfaces
vnstat --short

# Show traffic since a specific date
vnstat -i eth0 --begin 2024-06-01

# Compare two interfaces
vnstat -i eth0 && vnstat -i eth1

# Show only today's traffic
vnstat -d 1

# Show only this month's traffic
vnstat -m 1

# Check total data transferred this month
vnstat -m | grep "$(date +%Y-%m)"
```

---



# 40. `nethogs` — Per-Process Bandwidth Monitor

`nethogs` shows real-time network bandwidth usage **per process**, unlike `iftop` (which shows per connection) or `vnstat` (which shows per interface). It groups connections by PID and program name.

## Installation

```bash
sudo apt install nethogs             # Debian/Ubuntu
sudo dnf install nethogs             # RHEL/Fedora
```

## Usage

```bash
# Monitor all interfaces (requires root)
sudo nethogs

# Monitor a specific interface
sudo nethogs eth0
sudo nethogs ens3

# Monitor multiple interfaces
sudo nethogs eth0 eth1

# Set refresh interval in seconds (default: 1)
sudo nethogs -d 5

# Tracemode: non-interactive, logs each change to stdout
sudo nethogs -t eth0

# Set refresh interval in tracemode
sudo nethogs -t -d 2 eth0

# Show sent/received bytes (verbose level 3 shows both TX and RX)
sudo nethogs -v 3

# Bytes per second instead of kilobytes
sudo nethogs -v 0                    # kB/s (default)
sudo nethogs -v 1                    # Total B
sudo nethogs -v 2                    # Total kB
sudo nethogs -v 3                    # kB/s TX and RX separately

# Sniff a specific device with pcap filter
sudo nethogs -f "port 443" eth0
```

## Interactive Keys

| Key | Action |
|-----|--------|
| `q` | Quit |
| `s` | Sort by sent bandwidth |
| `r` | Sort by received bandwidth |
| `m` | Cycle display mode (kB/s → total kB → total B → kB/s) |

## Reading nethogs Output

```
NetHogs version 0.8.5

    PID USER     PROGRAM                      DEV        SENT      RECEIVED
  12345 root     /usr/bin/wget                eth0       0.000     145.230 KB/sec
  23456 www-data /usr/sbin/nginx              eth0       2.354       0.123 KB/sec
   5678 user     /usr/bin/chrome              eth0       0.045      23.456 KB/sec
  ......                                                ======    ========
                                                         2.399     168.809 KB/sec
```

| Column | Meaning |
|--------|---------|
| `PID` | Process ID |
| `USER` | User running the process |
| `PROGRAM` | Full path of executable |
| `DEV` | Network interface |
| `SENT` | Outbound bandwidth |
| `RECEIVED` | Inbound bandwidth |

## Non-Interactive / Logging

```bash
# Log bandwidth to file (one line per update per process)
sudo nethogs -t eth0 2>/dev/null | tee /tmp/nethogs.log

# Parse nethogs tracemode output for a specific program
sudo nethogs -t eth0 2>/dev/null | grep nginx

# Run for 60 seconds then exit
sudo timeout 60 nethogs -t eth0 2>/dev/null
```

---



# 41. `bmon` — Bandwidth Monitor

`bmon` (Bandwidth Monitor) is a real-time network bandwidth monitor and rate estimator. It shows per-interface statistics with a visual ASCII rate graph and detailed counters.

## Installation

```bash
sudo apt install bmon               # Debian/Ubuntu
sudo dnf install bmon               # RHEL/Fedora
```

## Basic Usage

```bash
# Monitor all interfaces
bmon

# Monitor a specific interface
bmon -p eth0

# Monitor multiple interfaces
bmon -p eth0,lo

# Monitor with a pattern (regex)
bmon -p "eth.*"

# Set update interval in milliseconds (default: 1000)
bmon -r 500                         # Update every 500ms

# Show interface details immediately on startup
bmon -p eth0 -s 1

# Output mode: simple text (no TUI)
bmon -o simple

# Output mode: format string
bmon -p eth0 -o "format:$(attr:name) rx:$(attr:rx:bytes)"

# Use curses TUI (default)
bmon -o curses
```

## Interactive Keys

| Key | Action |
|-----|--------|
| Arrow keys | Navigate interfaces |
| `d` | Toggle details panel |
| `g` | Toggle graphical rate display |
| `i` | Show interface list |
| `h` | Show help |
| `q` | Quit |
| `1` | Toggle RX graph |
| `2` | Toggle TX graph |
| Page Up/Down | Scroll details |

## Reading bmon Output

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

## Scripting / Non-Interactive

```bash
# Output simple text, run 10 cycles then exit
bmon -p eth0 -o simple -c 10

# Parse specific counter values
bmon -p eth0 -o "format:(attr:name) rxrate:$(attr:rx:rate) txrate:$(attr:tx:rate)" -c 5

# Log bandwidth every second for 60 seconds
bmon -p eth0 -o simple -c 60 -r 1000 | tee /tmp/bmon.log

# Show only one interface, all counters, quiet TUI
bmon -p eth0 -s 1 -o curses:quitafter=30
```

## Attributes Available in Format Output

| Attribute | Description |
|-----------|-------------|
| `rx:bytes` | Total received bytes |
| `tx:bytes` | Total transmitted bytes |
| `rx:packets` | Total received packets |
| `tx:packets` | Total transmitted packets |
| `rx:errors` | Receive errors |
| `tx:errors` | Transmit errors |
| `rx:rate` | Current receive rate (bytes/sec) |
| `tx:rate` | Current transmit rate (bytes/sec) |

---



# 42. `iperf3` — Network Performance Testing

## Syntax

```bash
iperf3 -s [OPTIONS]          # Server
iperf3 -c HOST [OPTIONS]     # Client
```

## Server Flags

| Flag | Description |
|------|-------------|
| `-s` | Run as server |
| `-p PORT` | Listen port (default: 5201) |
| `-D` | Daemon mode |
| `-1` | One-off: handle one client then exit |
| `-I FILE` | Write PID to file |
| `--idle-timeout SEC` | Idle timeout |

## Client Flags

| Flag | Description |
|------|-------------|
| `-c HOST` | Run as client connecting to HOST |
| `-p PORT` | Server port (default: 5201) |
| `-t SEC` | Test duration (default: 10) |
| `-n SIZE` | Transfer this many bytes |
| `-b RATE` | Target bandwidth (e.g., `100M`) |
| `-P NUM` | Parallel streams |
| `-R` | Reverse mode (server sends, client receives) |
| `--bidir` | Bidirectional test |
| `-u` | UDP mode |
| `-l LENGTH` | Buffer/packet length |
| `-w SIZE` | Socket buffer/window size |
| `-M MSS` | TCP MSS |
| `-N` | Set TCP no delay |
| `-4` / `-6` | Force IPv4/IPv6 |
| `-B ADDR` | Bind to address |
| `-i SEC` | Reporting interval |
| `-f FORMAT` | Format: `k` Kbits, `m` Mbits, `g` Gbits, `K` KBytes, `M` MBytes |
| `-J` | JSON output |
| `--logfile FILE` | Log to file |
| `-T TITLE` | Prefix output with title |
| `--connect-timeout MS` | Connection timeout |
| `-A CPU` | CPU affinity |
| `--get-server-output` | Get server output on client |
| `--udp-counters-64bit` | 64-bit UDP counters |
| `--repeating-payload` | Use repeating pattern |
| `-S TOS` | Set TOS/DSCP |
| `--dont-fragment` | Set DF bit |
| `-Z` | Use zero copy |
| `--timestamps[=FORMAT]` | Add timestamps |

## Examples

```bash
# Server
iperf3 -s

# Basic client test
iperf3 -c 192.168.1.1

# Test for 30 seconds
iperf3 -c 192.168.1.1 -t 30

# 4 parallel streams
iperf3 -c 192.168.1.1 -P 4

# Reverse (test download speed)
iperf3 -c 192.168.1.1 -R

# Bidirectional
iperf3 -c 192.168.1.1 --bidir

# UDP test at 100 Mbps
iperf3 -c 192.168.1.1 -u -b 100M

# JSON output
iperf3 -c 192.168.1.1 -J > result.json

# Custom window size
iperf3 -c 192.168.1.1 -w 256K

# Server on custom port
iperf3 -s -p 9999
iperf3 -c 192.168.1.1 -p 9999
```

---

# 43. `tc` — Traffic Control (QoS / Network Emulation)

`tc` (traffic control) is the Linux kernel's tool for managing network queuing disciplines (qdiscs), classifiers, and filters. It is used for bandwidth limiting, traffic shaping, and network emulation (adding delay, packet loss, etc.).

## Syntax

```bash
tc [ OPTIONS ] OBJECT { COMMAND | help }
OBJECT := { qdisc | class | filter | action }
```

## Viewing Current Configuration

```bash
# Show qdiscs on all interfaces
tc qdisc show

# Show qdiscs on a specific interface
tc qdisc show dev eth0

# Show traffic classes
tc class show dev eth0

# Show filters
tc filter show dev eth0

# Show with statistics
tc -s qdisc show dev eth0
tc -s class show dev eth0

# Show in JSON format
tc -j qdisc show dev eth0
```

## Network Emulation with `netem`

`netem` (Network Emulator) adds artificial impairments — essential for testing application behavior under poor network conditions.

```bash
# Add delay (100ms)
sudo tc qdisc add dev eth0 root netem delay 100ms

# Add delay with jitter (100ms ± 20ms)
sudo tc qdisc add dev eth0 root netem delay 100ms 20ms

# Add delay with jitter and correlation (25% correlated)
sudo tc qdisc add dev eth0 root netem delay 100ms 20ms 25%

# Add packet loss (5%)
sudo tc qdisc add dev eth0 root netem loss 5%

# Packet loss with correlation (10% correlated — simulates burst loss)
sudo tc qdisc add dev eth0 root netem loss 5% 25%

# Add packet duplication
sudo tc qdisc add dev eth0 root netem duplicate 1%

# Add packet corruption (bit errors)
sudo tc qdisc add dev eth0 root netem corrupt 0.1%

# Add packet reordering (5% reordered with 50ms correlation)
sudo tc qdisc add dev eth0 root netem delay 10ms reorder 5% 50%

# Combined: delay + loss + duplicate
sudo tc qdisc add dev eth0 root netem delay 50ms 10ms loss 2% duplicate 1%

# Replace (change) existing netem settings
sudo tc qdisc change dev eth0 root netem delay 200ms

# Remove all qdiscs (restore default)
sudo tc qdisc del dev eth0 root

# Simulate slow connection (rate + delay)
sudo tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms
```

## Bandwidth Limiting with Token Bucket Filter (`tbf`)

```bash
# Limit to 1 Mbit/s
sudo tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency 400ms

# Limit to 10 Mbit/s
sudo tc qdisc add dev eth0 root tbf rate 10mbit burst 64kbit latency 200ms

# Limit to 100 Kbit/s (very slow — simulate mobile)
sudo tc qdisc add dev eth0 root tbf rate 100kbit burst 8kbit latency 1000ms

# Remove bandwidth limit
sudo tc qdisc del dev eth0 root
```

## Hierarchical Token Bucket (`htb`) — Per-Class Rate Limiting

```bash
# Create root qdisc with a default class
sudo tc qdisc add dev eth0 root handle 1: htb default 10

# Add root class (ceiling = full link speed)
sudo tc class add dev eth0 parent 1: classid 1:1 htb rate 100mbit

# Add sub-class for "guaranteed" traffic (10 Mbit/s, can burst to 100)
sudo tc class add dev eth0 parent 1:1 classid 1:10 htb rate 10mbit ceil 100mbit

# Add sub-class for "limited" traffic (1 Mbit/s max)
sudo tc class add dev eth0 parent 1:1 classid 1:20 htb rate 1mbit ceil 1mbit

# Add filter: SSH traffic (dport 22) → class 1:10 (fast)
sudo tc filter add dev eth0 protocol ip parent 1: prio 1 u32   match ip dport 22 0xffff flowid 1:10

# Add filter: HTTP traffic → class 1:20 (limited)
sudo tc filter add dev eth0 protocol ip parent 1: prio 2 u32   match ip dport 80 0xffff flowid 1:20
```

## Quick Network Impairment Examples

```bash
# Simulate 3G mobile network
sudo tc qdisc add dev eth0 root netem delay 100ms 20ms loss 2% rate 2mbit

# Simulate satellite link (high latency, limited bandwidth)
sudo tc qdisc add dev eth0 root netem delay 600ms 100ms rate 5mbit

# Simulate terrible WiFi
sudo tc qdisc add dev eth0 root netem delay 50ms 30ms loss 10% duplicate 2%

# Check settings applied
tc qdisc show dev eth0

# Remove everything
sudo tc qdisc del dev eth0 root
```

---



# 44. `iwconfig` — Wireless Interface Configuration (Legacy)

`iwconfig` configures wireless network interfaces using the Wireless Extensions API. It has been **replaced by `iw`** for 802.11 (Wi-Fi) management on modern Linux, and by `nmcli`/`nmtui` for full connection management. It is part of the `wireless-tools` package.

## Installation

```bash
sudo apt install wireless-tools      # Debian/Ubuntu
sudo dnf install wireless-tools      # RHEL/Fedora
```

## Viewing Wireless Information

```bash
# Show wireless settings for all wireless interfaces
iwconfig

# Show settings for a specific interface
iwconfig wlan0

# Show only interfaces with wireless extensions
iwconfig 2>/dev/null | grep -v "no wireless"
```

### Reading iwconfig Output

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

| Field | Meaning |
|-------|---------|
| `ESSID` | Network name (SSID) |
| `Mode` | Managed (client), Ad-Hoc, Monitor, Master |
| `Frequency` | Channel frequency |
| `Access Point` | BSSID of the connected AP |
| `Bit Rate` | Current connection speed |
| `Tx-Power` | Transmit power in dBm |
| `Link Quality` | Signal quality (higher is better) |
| `Signal level` | RSSI in dBm (less negative = stronger) |
| `Noise level` | Background noise floor |

## Configuring Wireless

```bash
# Set the SSID (network name)
sudo iwconfig wlan0 essid "MyNetwork"

# Connect to a hidden network
sudo iwconfig wlan0 essid "HiddenNet" ap any

# Set channel
sudo iwconfig wlan0 channel 6

# Set frequency
sudo iwconfig wlan0 freq 2.437G

# Set transmit power (in mW or dBm)
sudo iwconfig wlan0 txpower 20
sudo iwconfig wlan0 txpower 100mW

# Set encryption key (WEP — legacy, insecure)
sudo iwconfig wlan0 key s:mypassword

# Disable encryption
sudo iwconfig wlan0 key off

# Set interface mode
sudo iwconfig wlan0 mode Managed   # Client mode (default)
sudo iwconfig wlan0 mode Monitor   # Capture all packets (requires root)
sudo iwconfig wlan0 mode Ad-Hoc    # Peer-to-peer

# Set bit rate
sudo iwconfig wlan0 rate 54M
sudo iwconfig wlan0 rate auto      # Let the driver decide

# Enable power management
sudo iwconfig wlan0 power on

# Disable power management (useful for latency-sensitive apps)
sudo iwconfig wlan0 power off

# Set RTS/CTS threshold
sudo iwconfig wlan0 rts 500        # Enable RTS for packets >500 bytes
sudo iwconfig wlan0 rts off        # Disable

# Commit changes to the card
sudo iwconfig wlan0 commit
```

## Modern Equivalent

For modern systems, use `iw` (section 45) for low-level Wi-Fi management and `nmcli` (section 24) for connection management.

| `iwconfig` | `iw` equivalent |
|------------|-----------------|
| `iwconfig wlan0` | `iw dev wlan0 info` |
| `iwconfig wlan0 essid "Net"` | `iw dev wlan0 connect "Net"` |
| `iwconfig wlan0 mode Monitor` | `iw dev wlan0 set type monitor` |
| `iwconfig wlan0 channel 6` | `iw dev wlan0 set channel 6` |
| `iwconfig wlan0 txpower 20` | `iw dev wlan0 set txpower fixed 2000` |

---



# 45. `iw` — Wireless Configuration (Modern)

`iw` is the modern command-line tool for managing wireless devices and their configuration. It uses the nl80211 netlink interface and replaces `iwconfig` for 802.11 wireless management.

## Installation

```bash
sudo apt install iw                 # Debian/Ubuntu
sudo dnf install iw                 # RHEL/Fedora
```

## Viewing Information

```bash
# List all wireless devices and interfaces
iw dev

# Show interface info (mode, channel, SSID, BSSID)
iw dev wlan0 info

# Show physical device (radio) capabilities
iw phy

# Show specific phy info
iw phy phy0 info

# Show supported interface modes
iw phy phy0 info | grep "Supported interface modes" -A 10

# Show connection/link status
iw dev wlan0 link

# Show station info (connected AP details)
iw dev wlan0 station dump

# Show scan results (cached)
iw dev wlan0 scan dump

# Trigger a new scan and show results
sudo iw dev wlan0 scan

# Show SSID/BSSID/signal of visible networks
sudo iw dev wlan0 scan | grep -E "SSID:|BSS |signal:"

# Show regulatory domain
iw reg get

# Show supported channels for current regulatory domain
iw phy phy0 channels
```

## Connecting to a Network

```bash
# Connect to an open (unencrypted) network
sudo iw dev wlan0 connect "NetworkName"

# Connect to an open network by BSSID
sudo iw dev wlan0 connect "NetworkName" 00:11:22:33:44:55

# Connect on a specific frequency/channel
sudo iw dev wlan0 connect "NetworkName" 2412            # 2.4GHz channel 1

# Disconnect
sudo iw dev wlan0 disconnect
```

> **Note:** For WPA/WPA2 networks, `iw connect` does not handle encryption. Use `wpa_supplicant` + `wpa_cli` or `nmcli`/`nmtui` for secured networks.

## Interface Management

```bash
# Create a new wireless interface
sudo iw dev wlan0 interface add wlan0mon type monitor    # Monitor mode iface
sudo iw phy phy0 interface add wlan1 type managed       # Additional managed iface

# Delete an interface
sudo iw dev wlan0mon del

# Set interface type
sudo ip link set wlan0 down
sudo iw dev wlan0 set type monitor        # Monitor mode
sudo iw dev wlan0 set type managed        # Managed (client) mode
sudo ip link set wlan0 up

# Set channel
sudo iw dev wlan0 set channel 6           # 2.4GHz channel 6
sudo iw dev wlan0 set channel 36          # 5GHz channel 36
sudo iw dev wlan0 set channel 6 HT40+    # 40MHz wide channel

# Set frequency directly (in MHz)
sudo iw dev wlan0 set freq 2437           # Channel 6
sudo iw dev wlan0 set freq 5180           # 5GHz channel 36

# Set transmit power (in mBm = dBm × 100)
sudo iw dev wlan0 set txpower fixed 2000  # 20 dBm
sudo iw dev wlan0 set txpower auto        # Let driver manage

# Enable power save
sudo iw dev wlan0 set power_save on
sudo iw dev wlan0 set power_save off

# Get power save state
iw dev wlan0 get power_save
```

## Regulatory Domain

```bash
# Set regulatory domain (country code)
sudo iw reg set US
sudo iw reg set DE
sudo iw reg set JP

# Show current regulatory info
iw reg get
```

## Statistics and Monitoring

```bash
# Show received signal strength and TX/RX stats
iw dev wlan0 link

# Show detailed statistics for connected station (AP)
iw dev wlan0 station dump

# Show per-packet statistics
iw dev wlan0 survey dump

# Monitor events in real time
iw event
iw event -f          # With timing
iw event -t          # With timestamps
```

---



# 46. `brctl` — Bridge Control (Legacy)

`brctl` manages Ethernet bridging — connecting multiple network segments at Layer 2. It has been **replaced by `bridge`** and `ip link` on modern Linux. Part of the `bridge-utils` package.

## Installation

```bash
sudo apt install bridge-utils        # Debian/Ubuntu
sudo dnf install bridge-utils        # RHEL/Fedora
```

## Viewing Bridge Configuration

```bash
# List all bridges
brctl show

# Show a specific bridge
brctl show br0

# Show spanning tree protocol (STP) state
brctl showstp br0

# Show MAC address table (forwarding database)
brctl showmacs br0
```

### Reading brctl show Output

```
bridge name  bridge id          STP enabled  interfaces
br0          8000.000c29abc123  no           eth0
                                             eth1
virbr0       8000.525400123456  yes          virbr0-nic
```

## Creating and Managing Bridges

```bash
# Create a new bridge
sudo brctl addbr br0

# Delete a bridge (must bring down first)
sudo ip link set br0 down
sudo brctl delbr br0

# Add an interface to a bridge
sudo brctl addif br0 eth0
sudo brctl addif br0 eth1

# Remove an interface from a bridge
sudo brctl delif br0 eth0

# Bring up the bridge
sudo ip link set br0 up

# Assign IP to the bridge
sudo ip addr add 192.168.1.1/24 dev br0
```

## Spanning Tree Protocol (STP)

```bash
# Enable STP on a bridge (prevents loops)
sudo brctl stp br0 on

# Disable STP
sudo brctl stp br0 off

# Set bridge priority (lower = more likely to be root bridge)
sudo brctl setbridgeprio br0 32768

# Set port priority
sudo brctl setportprio br0 eth0 128

# Set hello time (seconds between hello packets)
sudo brctl sethello br0 2

# Set max age (seconds before port enters forwarding state)
sudo brctl setmaxage br0 20

# Set forward delay (seconds before entering forwarding state)
sudo brctl setfd br0 15

# Set path cost for a port (lower = preferred path)
sudo brctl setpathcost br0 eth0 100
```

## Modern Equivalents (prefer these)

```bash
# Create bridge
sudo ip link add br0 type bridge

# Add interface to bridge
sudo ip link set eth0 master br0

# Remove interface
sudo ip link set eth0 nomaster

# Show bridges
bridge link show

# Show FDB (forwarding database)
bridge fdb show
```

| `brctl` | Modern equivalent |
|---------|------------------|
| `brctl show` | `bridge link show` |
| `brctl addbr br0` | `ip link add br0 type bridge` |
| `brctl delbr br0` | `ip link del br0` |
| `brctl addif br0 eth0` | `ip link set eth0 master br0` |
| `brctl delif br0 eth0` | `ip link set eth0 nomaster` |
| `brctl showmacs br0` | `bridge fdb show br br0` |
| `brctl stp br0 on` | `ip link set br0 type bridge stp_state 1` |

---



# 47. `bridge` — Bridge Management (Modern)

The `bridge` command from the `iproute2` package manages Ethernet bridges, forwarding databases (FDB), VLAN filtering, and multicast. It is the modern replacement for `brctl`.

## Viewing Bridge State

```bash
# Show all bridge ports and their state
bridge link show

# Show bridge link for a specific interface
bridge link show dev eth0

# Show forwarding database (FDB — MAC → port mapping)
bridge fdb show

# Show FDB for a specific bridge
bridge fdb show br br0

# Show FDB for a specific interface
bridge fdb show dev eth0

# Show VLAN database
bridge vlan show

# Show VLAN for a specific interface
bridge vlan show dev eth0

# Show multicast router ports
bridge mdb show

# Show multicast database for a specific bridge
bridge mdb show dev br0

# Show STP (spanning tree) information
bridge link show | grep -i state

# Verbose output
bridge -d link show
bridge -d fdb show
```

## Managing FDB Entries

```bash
# Add a static FDB entry (MAC → port)
sudo bridge fdb add 00:11:22:33:44:55 dev eth0

# Add as permanent entry (won't age out)
sudo bridge fdb add 00:11:22:33:44:55 dev eth0 permanent

# Add as external entry (used in VXLAN/overlay networks)
sudo bridge fdb add 00:11:22:33:44:55 dev vxlan0 dst 192.168.1.10

# Delete a FDB entry
sudo bridge fdb del 00:11:22:33:44:55 dev eth0

# Flush all entries for an interface
sudo bridge fdb flush dev eth0
```

## VLAN Management (VLAN-aware Bridge)

```bash
# Show all VLANs
bridge vlan show

# Add VLAN 10 to bridge port (access port — untagged)
sudo bridge vlan add dev eth1 vid 10 pvid untagged

# Add VLAN 20 as tagged (trunk port)
sudo bridge vlan add dev eth2 vid 20

# Add range of VLANs
sudo bridge vlan add dev eth2 vid 10-20

# Set native VLAN (PVID) for untagged traffic
sudo bridge vlan add dev eth1 vid 100 pvid untagged master

# Delete a VLAN from a port
sudo bridge vlan del dev eth1 vid 10

# Delete range of VLANs
sudo bridge vlan del dev eth2 vid 10-20
```

## Multicast Database (MDB)

```bash
# Show multicast database
bridge mdb show

# Add a static multicast entry
sudo bridge mdb add dev br0 port eth1 grp 224.0.0.1

# Delete multicast entry
sudo bridge mdb del dev br0 port eth1 grp 224.0.0.1
```

## Monitor Bridge Events

```bash
# Monitor bridge events in real time
bridge monitor all

# Monitor only link events
bridge monitor link

# Monitor only FDB events
bridge monitor fdb

# Monitor only VLAN events
bridge monitor vlan
```

## Bridge Setup (Using ip + bridge Together)

```bash
# Full bridge setup example
sudo ip link add name br0 type bridge
sudo ip link set br0 up

# Add STP
sudo ip link set br0 type bridge stp_state 1

# Add interfaces to bridge
sudo ip link set eth0 master br0
sudo ip link set eth1 master br0

# Assign IP to bridge
sudo ip addr add 192.168.1.100/24 dev br0

# Verify
bridge link show
ip addr show br0
```

---



# 48. `tunctl` / `ip tuntap` — TUN/TAP Devices

TUN and TAP are virtual network devices:
- **TUN** (tunnel): Operates at Layer 3 (IP packets). Used by VPNs (OpenVPN, WireGuard).
- **TAP** (tap): Operates at Layer 2 (Ethernet frames). Used for VM networking and bridges.

`tunctl` is the legacy tool; `ip tuntap` from `iproute2` is the modern approach.

## Installation (tunctl)

```bash
sudo apt install uml-utilities       # Debian/Ubuntu
```

## Creating TUN/TAP Devices with `ip tuntap`

```bash
# Create a TUN device
sudo ip tuntap add dev tun0 mode tun

# Create a TAP device
sudo ip tuntap add dev tap0 mode tap

# Create and allow a specific user to use it (without root)
sudo ip tuntap add dev tun0 mode tun user username
sudo ip tuntap add dev tap0 mode tap user username group groupname

# Create with specific flags
sudo ip tuntap add dev tun0 mode tun one_queue   # Single packet queue
sudo ip tuntap add dev tun0 mode tun pi           # Include packet info header
sudo ip tuntap add dev tun0 mode tun vnet_hdr     # Virtio net header

# Delete a TUN/TAP device
sudo ip tuntap del dev tun0 mode tun
sudo ip tuntap del dev tap0 mode tap

# List all TUN/TAP devices
ip tuntap show

# Bring up the device and assign an IP
sudo ip link set tun0 up
sudo ip addr add 10.8.0.1/24 dev tun0
```

## Legacy `tunctl` Commands

```bash
# Create a TUN interface
sudo tunctl -t tun0

# Create for a specific user
sudo tunctl -t tun0 -u username

# Create TAP interface
sudo tunctl -t tap0 -n       # -n for no persistent mode

# Delete a TUN/TAP interface
sudo tunctl -d tun0

# List TUN/TAP interfaces
cat /proc/net/dev | grep -E "tun|tap"
```

## Persistent vs Ephemeral

- **Persistent:** Device stays after creating process exits (default with `ip tuntap`)
- **Ephemeral:** Device is removed when the creating process closes the fd (used by VPN daemons)

```bash
# Create persistent (survives after this shell exits)
sudo ip tuntap add dev tun0 mode tun

# Verify persistence
ip link show tun0

# Manually delete when done
sudo ip tuntap del dev tun0 mode tun
```

## Manual VPN Tunnel (Point-to-Point)

```bash
# ── Server side ──
sudo ip tuntap add dev tun0 mode tun
sudo ip link set tun0 up
sudo ip addr add 10.8.0.1 peer 10.8.0.2 dev tun0

# ── Client side ──
sudo ip tuntap add dev tun0 mode tun
sudo ip link set tun0 up
sudo ip addr add 10.8.0.2 peer 10.8.0.1 dev tun0

# Route traffic through tunnel
sudo ip route add 192.168.0.0/16 dev tun0
```

## Attach TAP to a Bridge (VM Networking)

```bash
# Create TAP device for a VM
sudo ip tuntap add dev tap-vm1 mode tap

# Add to a bridge
sudo ip link set tap-vm1 master br0
sudo ip link set tap-vm1 up

# Verify
bridge link show dev tap-vm1
```

---



# 49. `vconfig` / `ip link` — VLAN Management

VLANs (Virtual LANs) segment network traffic by tagging Ethernet frames with a VLAN ID (802.1Q). `vconfig` is the legacy tool; `ip link` with `type vlan` is the modern approach.

## Installation (vconfig)

```bash
sudo apt install vlan                # Debian/Ubuntu
sudo dnf install vconfig             # RHEL/Fedora
```

## Creating VLAN Interfaces with `ip link` (Modern)

```bash
# Create VLAN interface (VLAN ID 100 on eth0)
sudo ip link add link eth0 name eth0.100 type vlan id 100

# Bring it up
sudo ip link set eth0.100 up

# Assign an IP address
sudo ip addr add 192.168.100.1/24 dev eth0.100

# Remove VLAN interface
sudo ip link delete eth0.100

# Show VLAN details
ip -d link show eth0.100

# List all VLAN interfaces
ip link show type vlan

# Show with VLAN details
ip -d link show type vlan
```

## VLAN Options

```bash
# VLAN with specific protocol (802.1Q default, 802.1ad for Q-in-Q)
sudo ip link add link eth0 name eth0.100 type vlan id 100 proto 802.1Q
sudo ip link add link eth0 name eth0.200 type vlan id 200 proto 802.1ad

# Loose binding (don't check if physical interface is up)
sudo ip link add link eth0 name eth0.100 type vlan id 100 loose_binding on

# Disable VLAN filtering on Rx (accept all VLAN tags)
sudo ip link add link eth0 name eth0.100 type vlan id 100 reorder_hdr off
```

## Legacy `vconfig` Commands

```bash
# Load the 8021q module
sudo modprobe 8021q

# Add VLAN interface
sudo vconfig add eth0 100           # Creates eth0.100

# Remove VLAN interface
sudo vconfig rem eth0.100

# Set egress priority mapping
sudo vconfig set_egress_map eth0.100 0 7

# Set ingress priority mapping
sudo vconfig set_ingress_map eth0.100 7 0

# Set flag (e.g., REORDER_HDR)
sudo vconfig set_flag eth0.100 1 1
```

## Persistent VLAN Configuration

### Netplan (Ubuntu 20.04+)

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
# Apply Netplan config
sudo netplan apply
```

### NetworkManager (nmcli)

```bash
# Create VLAN connection
nmcli con add type vlan   con-name "vlan100"   ifname eth0.100   dev eth0   id 100   ip4 192.168.100.1/24   gw4 192.168.100.254

# Bring up
nmcli con up vlan100

# Delete
nmcli con del vlan100
```

## Verifying VLANs

```bash
# Show all VLAN interfaces
ip link show type vlan

# Show VLAN info (kernel sees)
cat /proc/net/vlan/config

# Capture VLAN-tagged traffic
sudo tcpdump -i eth0 -e -n vlan

# Capture specific VLAN
sudo tcpdump -i eth0 -e vlan 100
```

---



# 50. `dhclient` — DHCP Client

`dhclient` (ISC DHCP client) requests and manages IP address assignments from DHCP servers. It is included with `isc-dhcp-client`. Many modern systems use `NetworkManager` or `systemd-networkd` for DHCP instead.

## Installation

```bash
sudo apt install isc-dhcp-client     # Debian/Ubuntu
sudo dnf install dhcp-client         # RHEL/Fedora
```

## Basic Usage

```bash
# Request DHCP address on an interface
sudo dhclient eth0

# Request and go to background (daemonize)
sudo dhclient -q eth0

# Release the current lease (tell server you're done)
sudo dhclient -r eth0

# Release and re-request
sudo dhclient -r eth0 && sudo dhclient eth0

# Force renewal (re-request without releasing)
sudo dhclient -1 eth0

# Request on all interfaces
sudo dhclient
```

## Verbose and Debug

```bash
# Verbose output (show DHCP conversation)
sudo dhclient -v eth0

# Debug mode (very verbose)
sudo dhclient -d -v eth0

# Don't actually configure — just show what would happen
sudo dhclient -n eth0
```

## Lease Files

DHCP leases are stored in `/var/lib/dhclient/` or `/var/lib/NetworkManager/`:

```bash
# View current leases
cat /var/lib/dhclient/dhclient.leases

# View leases for a specific interface
cat /var/lib/dhclient/dhclient.eth0.leases

# Lease file fields
# lease {
#   interface "eth0";
#   fixed-address 192.168.1.100;
#   option subnet-mask 255.255.255.0;
#   option routers 192.168.1.1;
#   option domain-name-servers 8.8.8.8, 8.8.4.4;
#   option domain-name "example.local";
#   renew 2 2024/06/04 12:00:00;
#   rebind 2 2024/06/04 21:00:00;
#   expire 2 2024/06/04 23:00:00;
# }
```

## Configuration File

```bash
# View/edit dhclient.conf
cat /etc/dhcp/dhclient.conf

# Common dhclient.conf settings:
# timeout 60;                          # Wait 60s for DHCP response
# retry 60;                            # Retry every 60s
# reboot 10;                           # Try to get same IP for 10s on reboot
# select-timeout 5;                    # Wait for responses before choosing

# Specify hostname to send to DHCP server
# send host-name "myserver";

# Request specific options
# request subnet-mask, broadcast-address, routers,
#         domain-name-servers, domain-name, host-name;

# Supersede DNS (use your own regardless of what DHCP says)
# supersede domain-name-servers 8.8.8.8, 1.1.1.1;

# Prepend DNS servers before DHCP-provided ones
# prepend domain-name-servers 127.0.0.1;

# Reject offers from a bad DHCP server
# reject 192.168.1.50;

# Request a specific IP
# send dhcp-requested-address 192.168.1.100;
```

## Script Hooks

dhclient runs `/etc/dhcp/dhclient-exit-hooks.d/` scripts on events:

```bash
# List available hooks
ls /etc/dhcp/dhclient-exit-hooks.d/

# Create a custom hook (runs when IP is assigned)
cat > /etc/dhcp/dhclient-exit-hooks.d/my-hook << 'EOF'
#!/bin/bash
if [ "$reason" = "BOUND" ] || [ "$reason" = "RENEW" ]; then
    echo "Got IP: $new_ip_address" >> /var/log/dhclient-events.log
fi
EOF
chmod +x /etc/dhcp/dhclient-exit-hooks.d/my-hook
```

## Modern Alternatives

On systems managed by NetworkManager:

```bash
# Renew DHCP via nmcli
nmcli device reapply eth0

# Or bounce the connection
nmcli con down "Wired connection 1" && nmcli con up "Wired connection 1"
```

On systems managed by systemd-networkd:

```bash
# Renew DHCP
sudo networkctl renew eth0

# Force reconnect
sudo networkctl down eth0 && sudo networkctl up eth0
```

---



# 51. `resolvectl` / `systemd-resolve` — DNS Resolution Management

`resolvectl` (formerly `systemd-resolve`) controls and queries `systemd-resolved`, the local DNS stub resolver daemon used on most modern systemd-based Linux distributions.

## Status and Diagnostics

```bash
# Show overall status of all interfaces
resolvectl status

# Show status for a specific interface
resolvectl status eth0

# Show DNS statistics (cache hits, queries, failures)
resolvectl statistics

# Reset statistics
resolvectl reset-statistics

# Show current DNS server per interface
resolvectl dns

# Show current search domains per interface
resolvectl domain
```

## Querying DNS

```bash
# Resolve a hostname (A record)
resolvectl query example.com

# Resolve to an IPv4 address only
resolvectl query -4 example.com

# Resolve to an IPv6 address only
resolvectl query -6 example.com

# Reverse DNS lookup
resolvectl query 8.8.8.8

# Lookup a specific record type
resolvectl query --type=MX example.com
resolvectl query --type=AAAA example.com
resolvectl query --type=TXT example.com
resolvectl query --type=NS example.com
resolvectl query --type=SOA example.com
resolvectl query --type=SRV _http._tcp.example.com

# DNSSEC validation status
resolvectl query --validate example.com

# Lookup a service (SRV record)
resolvectl service _http._tcp example.com

# Open TLSA (DANE) record
resolvectl tlsa tcp example.com:443
```

## Configuring per-Interface DNS

```bash
# Set DNS servers for an interface
resolvectl dns eth0 8.8.8.8 8.8.4.4

# Set DNS servers + search domains
resolvectl dns eth0 8.8.8.8
resolvectl domain eth0 example.com example.local

# Add a DNS domain (for split-horizon DNS)
resolvectl domain eth0 ~corporate.internal

# Set default route flag (use this interface for all DNS)
resolvectl default-route eth0 yes

# Clear per-interface settings (revert to global config)
resolvectl revert eth0
```

## Flushing and Resetting

```bash
# Flush all DNS caches
resolvectl flush-caches

# Reset all DNS settings
resolvectl reset-server-features

# Reload all settings from config files
sudo systemctl reload systemd-resolved
```

## Configuration Files

```bash
# Main config file
cat /etc/systemd/resolved.conf

# Interface-specific config (drop-ins)
ls /etc/systemd/resolved.conf.d/

# Key settings in resolved.conf:
# [Resolve]
# DNS=8.8.8.8 1.1.1.1          # Global DNS servers
# FallbackDNS=8.8.4.4 1.0.0.1  # Fallback servers
# Domains=example.com           # Default search domains
# DNSSEC=allow-downgrade        # DNSSEC mode (yes/no/allow-downgrade)
# DNSOverTLS=opportunistic      # DoT mode (yes/no/opportunistic)
# Cache=yes                     # Enable DNS cache
# DNSStubListener=yes           # Listen on 127.0.0.53:53
# ReadEtcHosts=yes              # Include /etc/hosts
```

## /etc/resolv.conf Integration

```bash
# Check current resolv.conf symlink
ls -la /etc/resolv.conf

# On systemd systems it should point to:
# /run/systemd/resolve/stub-resolv.conf  (stub: 127.0.0.53)
# or: /run/systemd/resolve/resolv.conf   (actual upstream DNS)

# Re-create symlink to stub resolver
sudo ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf

# Check what stub resolver is using
cat /run/systemd/resolve/stub-resolv.conf
```

## Service Management

```bash
# Check status
sudo systemctl status systemd-resolved

# Restart
sudo systemctl restart systemd-resolved

# Check logs
sudo journalctl -u systemd-resolved -f
```

---



# 52. `telnet` — Remote Connection and Port Testing (Legacy)

`telnet` is a legacy protocol for remote terminal access, now superseded by SSH. However, the `telnet` client remains extremely useful as a **quick TCP port test and banner-grabbing tool** — connecting manually to any TCP port to send raw text.

## Installation

```bash
sudo apt install telnet              # Debian/Ubuntu
sudo dnf install telnet             # RHEL/Fedora
```

## Port Testing (Primary Modern Use)

```bash
# Test if a TCP port is open (most common use today)
telnet 192.168.1.1 22
# Output if open:    Trying 192.168.1.1... Connected to 192.168.1.1.
# Output if closed:  Connection refused
# Output if filtered: (hangs until timeout)

# Test well-known ports
telnet example.com 80               # HTTP
telnet example.com 443              # HTTPS (raw TLS — expect garbage)
telnet smtp.example.com 25          # SMTP
telnet smtp.example.com 587         # SMTP submission
telnet pop.example.com 110          # POP3
telnet imap.example.com 143         # IMAP

# Quick Ctrl+] then 'quit' to exit after testing
```

## Manual HTTP Request

```bash
# Connect and type an HTTP request manually
telnet example.com 80
# Type: GET / HTTP/1.0
# Press Enter twice to send
```

## SMTP Testing (Classic Use)

```bash
telnet smtp.example.com 25
# Then type manually:
# EHLO test.example.com
# MAIL FROM:<test@example.com>
# RCPT TO:<user@example.com>
# DATA
# Subject: Test
# This is a test.
# .
# QUIT
```

## Remote Login (Legacy — Insecure, Avoid on Production)

```bash
# Connect to a remote host (telnet server must be running)
telnet 192.168.1.1
telnet hostname.example.com

# Connect on a specific port
telnet 192.168.1.1 2323

# Connect with explicit options
telnet -l username 192.168.1.1      # Specify login username

# Bind to a specific local address
telnet -b 192.168.1.100 remote-host 23
```

## Escape Commands (While Connected)

After pressing the escape character (`Ctrl+]` by default), you enter telnet command mode:

| Command | Action |
|---------|--------|
| `close` | Close current connection |
| `quit` | Exit telnet entirely |
| `open host port` | Open a new connection |
| `status` | Show connection status |
| `set escape X` | Change escape character |
| `?` or `help` | Show all commands |

## Alternatives

| Tool | Advantage over telnet |
|------|-----------------------|
| `nc 192.168.1.1 22` | More scriptable, doesn't hang as long |
| `ncat 192.168.1.1 22` | SSL support |
| `curl telnet://host:port` | Good for automation |
| `openssl s_client -connect host:443` | For HTTPS testing |
| `ssh` | Encrypted remote login (always prefer over telnet) |

---



# 53. `ab` — Apache HTTP Benchmarking Tool

`ab` (ApacheBench) is a simple HTTP load testing tool that sends a large number of requests to a web server and reports throughput, latency, and error statistics.

## Installation

```bash
sudo apt install apache2-utils       # Debian/Ubuntu
sudo dnf install httpd-tools         # RHEL/Fedora
```

## Syntax

```bash
ab [options] [http[s]://]hostname[:port]/path
```

> **Note:** The URL must end with `/` or a path. `http://example.com/` is valid; `http://example.com` is not.

## Basic Usage

```bash
# Send 100 requests, 10 at a time (10 concurrent connections)
ab -n 100 -c 10 http://example.com/

# 1000 requests, 50 concurrent (typical light test)
ab -n 1000 -c 50 http://example.com/

# 10000 requests, 100 concurrent (load test)
ab -n 10000 -c 100 http://example.com/

# HTTPS (requires SSL support)
ab -n 100 -c 10 https://example.com/
```

## Request Options

```bash
# Send HTTP POST request with form data
ab -n 100 -c 10 -p post_data.txt -T "application/x-www-form-urlencoded" http://example.com/submit

# Send HTTP POST with JSON body
echo '{"key":"value"}' > data.json
ab -n 100 -c 10 -p data.json -T "application/json" http://api.example.com/endpoint

# PUT request
ab -n 100 -c 10 -u put_data.txt -T "application/json" http://api.example.com/resource/1

# Set custom request header
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" http://api.example.com/

# Send cookies
ab -n 100 -c 10 -C "sessionid=abc123; csrftoken=xyz789" http://example.com/

# Set HTTP method
ab -n 100 -c 10 -m DELETE http://api.example.com/resource/1

# Follow redirects (ab does NOT follow redirects by default)
# Use curl for tests requiring redirect following
```

## Connection Options

```bash
# Keep-alive connections (HTTP/1.1 persistent connections)
ab -n 1000 -c 50 -k http://example.com/

# Set timeout (seconds) for responses
ab -n 100 -c 10 -s 60 http://example.com/

# Use HTTP/1.0 instead of HTTP/1.1
ab -n 100 -c 10 -1 http://example.com/

# Use specific HTTP version
ab -n 100 -c 10 -P http://example.com/     # HTTPS proxy
```

## Output Options

```bash
# Verbose output (show request/response headers)
ab -n 10 -c 1 -v 4 http://example.com/

# Save results to CSV (gnuplot-compatible)
ab -n 1000 -c 50 -e output.csv http://example.com/

# Save request completion times to file (one per line)
ab -n 1000 -c 50 -g gnuplot.tsv http://example.com/

# Combine: detailed test with output
ab -n 1000 -c 100 -k -e results.csv -g times.tsv http://example.com/
```

### Reading ab Output

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

| Metric | What to Watch |
|--------|--------------|
| `Requests per second` | Server throughput — higher is better |
| `Time per request` (mean) | Average latency — lower is better |
| `Failed requests` | Should be 0; non-zero means overload or errors |
| `99th percentile` | Long-tail latency — affects 1% of users |
| `max` | Worst-case response time |

---



# 54. `openssl s_client` — SSL/TLS Testing

`openssl s_client` is a diagnostic tool for testing TLS connections, inspecting certificates, and troubleshooting SSL/TLS issues. It is part of the `openssl` package, installed by default on most Linux systems.

## Basic Connection Testing

```bash
# Connect to an HTTPS server
openssl s_client -connect example.com:443

# Connect with SNI (Server Name Indication) — required for modern hosting
openssl s_client -connect example.com:443 -servername example.com

# Quick check: just show the certificate (exit immediately)
echo | openssl s_client -connect example.com:443 -servername example.com

# Show only the certificate
echo | openssl s_client -connect example.com:443 2>/dev/null |   openssl x509 -noout -text

# Quiet output (no diagnostic noise)
echo | openssl s_client -connect example.com:443 -quiet 2>/dev/null
```

## Certificate Inspection

```bash
# Show full certificate details
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null | openssl x509 -noout -text

# Show only validity dates
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -dates

# Show subject (CN, SANs)
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -subject

# Show issuer
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -issuer

# Show Subject Alternative Names (all valid hostnames)
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -ext subjectAltName

# Show fingerprint (SHA-256)
echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -fingerprint -sha256

# Show the full certificate chain
openssl s_client -connect example.com:443   -servername example.com -showcerts 2>/dev/null
```

## TLS Version and Cipher Testing

```bash
# Force TLS 1.2 only
openssl s_client -connect example.com:443 -tls1_2

# Force TLS 1.3 only
openssl s_client -connect example.com:443 -tls1_3

# Force TLS 1.1 (shows if server accepts older, insecure versions)
openssl s_client -connect example.com:443 -tls1_1

# Test specific cipher suite
openssl s_client -connect example.com:443 -cipher AES128-SHA

# List ciphers that work against a server (requires a script)
for cipher in $(openssl ciphers 'ALL:eNULL' | tr ':' ' '); do
  result=$(echo | openssl s_client -connect example.com:443     -cipher "$cipher" 2>/dev/null | grep -c "Cipher is")
  [ $result -eq 1 ] && echo "$cipher: ACCEPTED" || echo "$cipher: REJECTED"
done

# Show negotiated cipher suite
echo | openssl s_client -connect example.com:443 2>/dev/null | grep "Cipher is"
```

## STARTTLS Testing

```bash
# SMTP with STARTTLS (port 587)
openssl s_client -connect smtp.example.com:587 -starttls smtp

# IMAP with STARTTLS (port 143)
openssl s_client -connect imap.example.com:143 -starttls imap

# POP3 with STARTTLS (port 110)
openssl s_client -connect pop3.example.com:110 -starttls pop3

# FTP with STARTTLS
openssl s_client -connect ftp.example.com:21 -starttls ftp

# LDAP with STARTTLS
openssl s_client -connect ldap.example.com:389 -starttls ldap

# XMPP
openssl s_client -connect xmpp.example.com:5222 -starttls xmpp
```

## Client Certificates and Verification

```bash
# Use a client certificate for mutual TLS (mTLS)
openssl s_client -connect api.example.com:443   -cert client.crt   -key client.key

# Verify certificate against a CA file
openssl s_client -connect example.com:443   -CAfile /etc/ssl/certs/ca-certificates.crt   -verify 5

# Check if a certificate matches a key
openssl x509 -noout -modulus -in cert.pem | md5sum
openssl rsa  -noout -modulus -in key.pem  | md5sum
# Both md5sums must match
```

## Debugging and Advanced Options

```bash
# Connect via a proxy
openssl s_client -connect example.com:443   -proxy proxy.example.com:8080

# Show internal state (debugging TLS handshake)
openssl s_client -connect example.com:443 -state

# Show debug info for the handshake
openssl s_client -connect example.com:443 -debug

# Connect to an IP but present a different SNI
openssl s_client -connect 1.2.3.4:443 -servername example.com

# Test OCSP stapling
echo | openssl s_client -connect example.com:443   -servername example.com -status 2>/dev/null | grep -A 20 "OCSP response"

# Check certificate expiry in days (scriptable)
EXPIRY=$(echo | openssl s_client -connect example.com:443   -servername example.com 2>/dev/null |   openssl x509 -noout -enddate | cut -d= -f2)
DAYS=$(( ($(date -d "$EXPIRY" +%s) - $(date +%s)) / 86400 ))
echo "Certificate expires in $DAYS days"
```

---



# 55. `tcpflow` — TCP Stream Reconstruction

`tcpflow` captures TCP connections and reconstructs each stream into separate files, making it easy to read the actual data exchanged in a TCP session. Unlike `tcpdump`, it focuses on content rather than packet-level detail.

## Installation

```bash
sudo apt install tcpflow             # Debian/Ubuntu
sudo dnf install tcpflow             # RHEL/Fedora
```

## Basic Usage

```bash
# Capture all TCP streams on default interface
sudo tcpflow -i eth0

# Capture on all interfaces
sudo tcpflow -i any

# Capture and print to console instead of files
sudo tcpflow -c -i eth0

# Capture with timestamp in output
sudo tcpflow -c -t -i eth0

# Capture with verbose output (shows connection info)
sudo tcpflow -c -v -i eth0
```

## Filtering

tcpflow uses the same BPF filter syntax as tcpdump:

```bash
# Capture only HTTP traffic (port 80)
sudo tcpflow -c -i eth0 port 80

# Capture only traffic to/from a specific host
sudo tcpflow -c -i eth0 host 192.168.1.1

# Capture specific host and port
sudo tcpflow -c -i eth0 host 192.168.1.1 and port 80

# Capture a subnet
sudo tcpflow -c -i eth0 net 192.168.1.0/24

# Capture DNS (TCP DNS, usually for large responses)
sudo tcpflow -c -i eth0 port 53

# Capture all traffic except SSH (avoid capturing your own session)
sudo tcpflow -c -i eth0 not port 22
```

## Output to Files

By default, tcpflow saves each TCP stream to a separate file named by the connection endpoints:

```bash
# Save to current directory (default behavior)
sudo tcpflow -i eth0 port 80

# Files created:
# 192.168.001.100.54321-093.184.216.034.00080  (client → server)
# 093.184.216.034.00080-192.168.001.100.54321  (server → client)

# Specify output directory
sudo tcpflow -o /tmp/captures/ -i eth0 port 80

# Capture to directory with timestamp suffix
sudo tcpflow -o /tmp/captures/ -t -i eth0

# Limit capture to N bytes per flow
sudo tcpflow -m 10000 -o /tmp/caps/ -i eth0

# Read from a pcap file instead of live capture
sudo tcpflow -r capture.pcap

# Read pcap and print to console
sudo tcpflow -c -r capture.pcap

# Process all pcap files in a directory
sudo tcpflow -c -r /tmp/pcaps/*.pcap
```

## Reading Reconstructed Streams

```bash
# After capturing HTTP on port 80:
ls *.00080* 2>/dev/null

# Read the request (client → server)
cat 192.168.001.100.54321-093.184.216.034.00080
# Output: GET / HTTP/1.1
#         Host: example.com
#         ...

# Read the response (server → client)
cat 093.184.216.034.00080-192.168.001.100.54321
# Output: HTTP/1.1 200 OK
#         Content-Type: text/html
#         ...

# Search for passwords in captured HTTP traffic (for security audits)
grep -r "password\|passwd\|secret" *.00080* 2>/dev/null
```

## XML/Metadata Report

```bash
# Generate XML report with connection metadata
sudo tcpflow -r capture.pcap -Fk -X report.xml

# Report includes:
# - Source/destination IP and port
# - Start/end timestamps
# - Byte counts per direction
# - MD5 hash of each stream
```

## Combining with tcpdump

```bash
# Capture to pcap with tcpdump, analyze with tcpflow
sudo tcpdump -i eth0 -w capture.pcap port 80 &
sleep 30
kill %1
sudo tcpflow -c -r capture.pcap

# Pipe tcpdump to tcpflow in real time
sudo tcpdump -i eth0 -w - port 80 | sudo tcpflow -r -
```

---



# 56. `tshark` — Terminal Wireshark (CLI Packet Analyzer)

`tshark` is the command-line version of Wireshark — a powerful protocol analyzer that captures and decodes packets using Wireshark's full dissector library. It supports hundreds of protocols and is ideal for scripting and non-GUI environments.

## Installation

```bash
sudo apt install tshark              # Debian/Ubuntu
sudo dnf install wireshark-cli       # RHEL/Fedora
# Add your user to the wireshark group to capture without root:
sudo usermod -aG wireshark $USER
```

## Basic Capture

```bash
# Capture on a specific interface
tshark -i eth0

# Capture on any interface
tshark -i any

# List available interfaces
tshark -D

# Capture for 30 seconds
tshark -i eth0 -a duration:30

# Capture N packets then stop
tshark -i eth0 -c 100

# Capture until file reaches 10 MB
tshark -i eth0 -a filesize:10240

# Capture verbosely (full protocol decode)
tshark -i eth0 -V
```

## Saving and Reading Files

```bash
# Save capture to pcap file
tshark -i eth0 -w capture.pcap

# Read from a pcap file
tshark -r capture.pcap

# Read and decode verbosely
tshark -r capture.pcap -V

# Rotate files: max 5 files of 100MB each
tshark -i eth0 -b filesize:102400 -b files:5 -w /tmp/cap.pcap

# Read first 100 packets from pcap
tshark -r capture.pcap -c 100

# Decompress gzipped pcap
tshark -r capture.pcap.gz
```

## Capture Filters (BPF — Applied During Capture)

```bash
# Capture only HTTP
tshark -i eth0 -f "port 80"

# Capture only traffic to/from specific host
tshark -i eth0 -f "host 192.168.1.1"

# Capture DNS
tshark -i eth0 -f "port 53"

# Capture without your SSH session
tshark -i eth0 -f "not port 22"

# Capture ICMP
tshark -i eth0 -f "icmp"
```

## Display Filters (Wireshark DSL — Applied After Decode)

Display filters are much more powerful than BPF filters — they understand protocols:

```bash
# Filter by protocol
tshark -r capture.pcap -Y "http"
tshark -r capture.pcap -Y "dns"
tshark -r capture.pcap -Y "tls"
tshark -r capture.pcap -Y "tcp"

# HTTP GET requests only
tshark -r capture.pcap -Y "http.request.method == GET"

# DNS queries only (not responses)
tshark -r capture.pcap -Y "dns.flags.response == 0"

# TLS handshakes
tshark -r capture.pcap -Y "ssl.record.content_type == 22"

# TCP with RST flag
tshark -r capture.pcap -Y "tcp.flags.reset == 1"

# Packets larger than 1400 bytes
tshark -r capture.pcap -Y "frame.len > 1400"

# Traffic between two specific hosts
tshark -r capture.pcap -Y "ip.addr == 192.168.1.1 && ip.addr == 10.0.0.1"

# HTTP response codes ≥ 400 (errors)
tshark -r capture.pcap -Y "http.response.code >= 400"

# Capture live with display filter
tshark -i eth0 -Y "http.request"
```

## Extracting Specific Fields

```bash
# Extract source and destination IPs
tshark -r capture.pcap -T fields -e ip.src -e ip.dst

# Extract HTTP request URLs
tshark -r capture.pcap -Y "http.request" -T fields   -e ip.src -e http.host -e http.request.uri

# Extract DNS query names
tshark -r capture.pcap -Y "dns.flags.response == 0" -T fields   -e frame.time -e ip.src -e dns.qry.name

# Extract TLS SNI (server name)
tshark -r capture.pcap -Y "ssl.handshake.extensions_server_name" -T fields   -e ip.src -e ssl.handshake.extensions_server_name

# Extract with tab separator and header line
tshark -r capture.pcap -T fields   -e ip.src -e ip.dst -e tcp.dstport   -E header=y -E separator=\t
```

## Statistics

```bash
# Protocol hierarchy (breakdown by protocol %)
tshark -r capture.pcap -q -z io,phs

# Connection conversations (IP pairs)
tshark -r capture.pcap -q -z conv,ip

# TCP conversations
tshark -r capture.pcap -q -z conv,tcp

# Endpoint statistics (per-IP traffic)
tshark -r capture.pcap -q -z endpoints,ip

# HTTP statistics
tshark -r capture.pcap -q -z http,stat

# DNS statistics
tshark -r capture.pcap -q -z dns,tree

# Expert info (warnings, errors, notes)
tshark -r capture.pcap -q -z expert
```

## Output Formats

```bash
# Default text output
tshark -r capture.pcap

# JSON output
tshark -r capture.pcap -T json

# PDML (Packet Details Markup Language — XML)
tshark -r capture.pcap -T pdml

# EK (Elasticsearch-compatible JSON)
tshark -r capture.pcap -T ek

# CSV of specific fields
tshark -r capture.pcap -T fields -e ip.src -e ip.dst -E separator=,

# Tabs (fields mode)
tshark -r capture.pcap -T fields -e ip.src -e tcp.dstport -E separator=\t
```

---



---

# System Network Configuration Files

| File | Purpose |
|------|---------|
| `/etc/hostname` | System hostname |
| `/etc/hosts` | Static hostname-to-IP mapping |
| `/etc/resolv.conf` | DNS resolver configuration (nameserver, search domains) |
| `/etc/nsswitch.conf` | Name service switch (order of name resolution) |
| `/etc/network/interfaces` | Debian/Ubuntu network config (traditional) |
| `/etc/netplan/*.yaml` | Ubuntu Netplan config (modern) |
| `/etc/sysconfig/network-scripts/ifcfg-*` | RHEL/CentOS network config |
| `/etc/NetworkManager/` | NetworkManager config directory |
| `/etc/systemd/network/*.network` | systemd-networkd config |
| `/etc/iptables/rules.v4` | Saved iptables IPv4 rules |
| `/etc/iptables/rules.v6` | Saved iptables IPv6 rules |
| `/proc/sys/net/ipv4/ip_forward` | IPv4 forwarding flag |
| `/proc/sys/net/ipv6/conf/all/forwarding` | IPv6 forwarding flag |
| `/etc/sysctl.conf` | Kernel parameter configuration |
| `/etc/ssh/sshd_config` | SSH server configuration |
| `/etc/ssh/ssh_config` | SSH client configuration |
| `~/.ssh/config` | Per-user SSH client configuration |
| `~/.ssh/known_hosts` | Known SSH host keys |
| `~/.ssh/authorized_keys` | Authorized public keys for SSH login |

---

# Kernel Network Parameters (sysctl)

```bash
# Enable IP forwarding
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -w net.ipv6.conf.all.forwarding=1

# Disable ICMP redirects
sudo sysctl -w net.ipv4.conf.all.accept_redirects=0
sudo sysctl -w net.ipv4.conf.all.send_redirects=0

# Enable SYN cookies (DDoS protection)
sudo sysctl -w net.ipv4.tcp_syncookies=1

# Increase connection tracking table
sudo sysctl -w net.netfilter.nf_conntrack_max=262144

# Increase socket buffer sizes
sudo sysctl -w net.core.rmem_max=16777216
sudo sysctl -w net.core.wmem_max=16777216

# TCP tuning
sudo sysctl -w net.ipv4.tcp_window_scaling=1
sudo sysctl -w net.ipv4.tcp_timestamps=1
sudo sysctl -w net.ipv4.tcp_sack=1
sudo sysctl -w net.ipv4.tcp_fin_timeout=30
sudo sysctl -w net.ipv4.tcp_keepalive_time=600
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=4096

# Increase port range
sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"

# Disable IPv6 (if not needed)
sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1

# Prevent IP spoofing
sudo sysctl -w net.ipv4.conf.all.rp_filter=1

# Don't accept source routing
sudo sysctl -w net.ipv4.conf.all.accept_source_route=0

# Log martian packets
sudo sysctl -w net.ipv4.conf.all.log_martians=1

# Make permanent
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p                        # Reload
```

---

*End of Complete Linux Network Commands Reference*

---

*End of Complete Linux Network Commands Reference*
