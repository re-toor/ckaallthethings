# CKA Mind Map

An interactive mind map for the **Certified Kubernetes Administrator (CKA)** exam, covering all 5 domains of the latest CNCF curriculum (February 2025 update, Kubernetes v1.34).

**Live Site:** [compufreq.github.io/cka-mindmap](https://compufreq.github.io/cka-mindmap/)

## Features

- **Interactive Mind Map** — D3.js-powered radial mind map with click-to-navigate drill-down across 3 levels: Domains > Sub-topics > Leaf nodes
- **5 Exam Domains** — Cluster Architecture (25%), Workloads & Scheduling (15%), Services & Networking (20%), Storage (10%), Troubleshooting (30%)
- **Leaf Node Detail Panels** — Click any leaf node to see key concepts, kubectl commands, and links to relevant study guide chapters
- **8 Comprehensive Study Guides:**
  - **Kubernetes CKA Guide** — 30 chapters, 13,000+ lines covering every exam topic in depth
  - **Linux Networking Guide** — 56 sections, 4,600+ lines of network commands reference
  - **Gateway API Complete Guide** — 20 sections on modern ingress traffic management
  - **Gateway API Step-By-Step Guide** — 10 hands-on tasks for CKA practice
  - **Ingress Complete Guide** — 14 sections on HTTP routing & TLS termination
  - **Ingress Step-By-Step Guide** — 8 hands-on tasks for CKA practice
  - **CoreDNS Complete Guide** — 12 sections on DNS & service discovery
  - **CoreDNS Step-By-Step Guide** — 8 hands-on tasks for CKA practice
- **Study Guide Viewer** — Sidebar table of contents, scroll spy, session caching for instant repeat visits
- **Dark Theme** — Kubernetes-branded design with color-coded domain branches
- **Responsive** — Works on desktop and tablet

## Exam Domains Covered

| Domain | Weight | Sub-topics |
|--------|:------:|:----------:|
| Cluster Architecture, Installation & Configuration | 25% | RBAC, Kubeadm, HA Control Planes, CNI/CSI/CRI, CRDs & Operators, Helm & Kustomize, Cluster Lifecycle |
| Workloads & Scheduling | 15% | Deployments, ConfigMaps & Secrets, Autoscaling, Self-healing, Pod Admission & Scheduling |
| Services & Networking | 20% | Pod Connectivity, Service Types, Gateway API, Ingress, Network Policies, CoreDNS |
| Storage | 10% | StorageClasses, Volume Types & Access Modes, Persistent Volumes & Claims |
| Troubleshooting | 30% | Cluster & Node, Cluster Components, Monitoring, Container Logs, Network Troubleshooting |

## Tech Stack

- Pure **HTML**, **CSS**, **JavaScript** — no frameworks, no build tools
- **D3.js v7** for SVG mind map rendering
- **marked.js** for markdown-to-HTML guide rendering
- **GitHub Pages** for hosting

## Project Structure

```
cka_mindmap_website/
├── index.html              # Main mind map page
├── pages/
│   └── guide.html          # Study guide viewer
├── css/
│   ├── style.css           # Shared styles (dark theme, header, panels)
│   └── guide.css           # Guide page styles (sidebar, article, TOC)
├── js/
│   ├── data.js             # Mind map data (all 3 levels + guide links)
│   ├── mindmap.js          # D3.js mind map engine
│   └── guide.js            # Guide loader (fetch, parse, cache)
├── guides/
│   ├── kubernetes-complete-guide.md    # 30-chapter CKA reference
│   ├── linux-network-commands.md       # Linux networking reference
│   ├── gateway-api-complete-guide.md   # Gateway API complete guide
│   ├── gateway-api-cka-guide.md        # Gateway API step-by-step
│   ├── ingress-complete-guide.md       # Ingress complete guide
│   ├── ingress-cka-guide.md            # Ingress step-by-step
│   ├── coredns-complete-guide.md       # CoreDNS complete guide
│   └── coredns-cka-guide.md            # CoreDNS step-by-step
├── lib/
│   └── marked.min.js       # Markdown parser
├── Kubernetes installation/
│   ├── guide.md                        # HA cluster setup guide
│   └── scripts/                        # 12 automation scripts
│       ├── env.sh                      # Shared environment variables
│       ├── 01-setup-hosts.sh           # /etc/hosts & hostnames
│       ├── 02-setup-firewall.sh        # UFW firewall rules
│       ├── 03-setup-haproxy.sh         # HAProxy load balancer
│       ├── 04-install-k8s-packages.sh  # containerd + kubeadm
│       ├── 05-init-cluster.sh          # kubeadm init (CP1)
│       ├── 06-join-controlplane.sh     # Join control plane 2
│       ├── 07-join-workers.sh          # Join worker nodes
│       ├── 08-install-calico.sh        # Calico CNI
│       ├── 09-verify.sh               # Cluster verification
│       ├── 10-setup-certs.sh           # TLS certificates
│       └── deploy-all.sh              # Full orchestrator
├── LICENSE                 # CC BY-NC-ND 4.0
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Pages auto-deploy
```

## Kubernetes HA Cluster Installation

A complete guide and automation scripts for deploying a highly available Kubernetes cluster from scratch using kubeadm.

**Architecture:**
- 1 HAProxy load balancer (`10.10.10.10`)
- 2 control plane nodes (`10.10.10.11`, `10.10.10.12`)
- 2 worker nodes (`10.10.10.14`, `10.10.10.15`)

**What's included:**
- Step-by-step guide (`Kubernetes installation/guide.md`) covering the full setup from bare Ubuntu servers to a production-ready HA cluster
- 12 automation scripts that handle host configuration, firewall rules, HAProxy setup, kubeadm installation, cluster initialization, node joining, Calico CNI, verification, and TLS certificate management
- A `deploy-all.sh` orchestrator script that runs the entire setup end-to-end

## How to Use

### Online
Visit [compufreq.github.io/cka-mindmap](https://compufreq.github.io/cka-mindmap/) — no installation needed.

### Local
```bash
git clone https://github.com/compufreq/cka-mindmap.git
cd cka-mindmap
# Serve with any static server:
python3 -m http.server 8080
# Open http://localhost:8080
```

## Navigation

1. **Main page** — Click any of the 5 domain nodes to drill into sub-topics
2. **Sub-topic page** — Click a branch to drill into leaf nodes
3. **Leaf nodes** — Click to open a detail panel with key concepts, commands, and study guide links
4. **Study Guides** — Use the "Study Guides" dropdown in the header, or click guide links from leaf node panels
5. **Breadcrumbs** — Navigate back up the hierarchy via the breadcrumb trail in the header

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International](https://creativecommons.org/licenses/by-nc-nd/4.0/) license.

You are free to share this work with attribution, but you may not use it commercially or distribute modified versions.

## Author

Created by **Alaa Alhorani** ([@compufreq](https://github.com/compufreq)) — February 2026
