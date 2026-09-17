// Dữ liệu CKA tiếng Việt, mục tiêu Kubernetes 1.35.
const GUIDE_LINKS = {
  "rbac": [
    {
      "title": "Chương 15 - RBAC: Kiểm soát truy cập dựa trên Role",
      "url": "pages/guide.html?id=kubernetes#heading-192-chapter-15-rbac-role-based-access-control",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Chương 16 - Bảo mật: Xác thực, Pod Security & TLS",
      "url": "pages/guide.html?id=kubernetes#heading-200-chapter-16-kubernetes-security-authentication-",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "kubeadm": [
    {
      "title": "Cập nhật CKA Kubernetes 1.35",
      "url": "pages/guide.html?id=kubernetes-1.35",
      "guide": "Phiên bản thi và kiến thức cập nhật"
    },
    {
      "title": "Chương 2 - Cài đặt cụm với kubeadm",
      "url": "pages/guide.html?id=kubernetes#heading-43-chapter-2-cluster-installation-from-scratch-with",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "ha-control-plane": [
    {
      "title": "Cập nhật CKA Kubernetes 1.35",
      "url": "pages/guide.html?id=kubernetes-1.35",
      "guide": "Phiên bản thi và kiến thức cập nhật"
    },
    {
      "title": "Chương 3 - Kiến trúc Control Plane có tính sẵn sàng cao",
      "url": "pages/guide.html?id=kubernetes#heading-56-chapter-3-highly-available-control-plane-archite",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Chương 1 - Tổng quan về kiến trúc Kubernetes",
      "url": "pages/guide.html?id=kubernetes#heading-10-chapter-1-kubernetes-architecture-a-complete-ov",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "extension-interfaces": [
    {
      "title": "Chương 4 - Giao diện mở rộng: CNI, CSI và CRI",
      "url": "pages/guide.html?id=kubernetes#heading-69-chapter-4-extension-interfaces-cni-csi-and-cr",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "crds-operators": [
    {
      "title": "Chương 10 - Định nghĩa và toán tử tài nguyên tùy chỉnh",
      "url": "pages/guide.html?id=kubernetes#heading-144-chapter-10-custom-resource-definitions-and-opera",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "helm-kustomize": [
    {
      "title": "Chương 29 - kubectl Kustomize: Cấu hình ở quy mô",
      "url": "pages/guide.html?id=kubernetes#heading-325-chapter-29-kubectl-kustomize-configuration-mana",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "cluster-lifecycle": [
    {
      "title": "Cập nhật CKA Kubernetes 1.35",
      "url": "pages/guide.html?id=kubernetes-1.35",
      "guide": "Phiên bản thi và kiến thức cập nhật"
    },
    {
      "title": "Chương 30 - CKA 2026: Nghiên cứu hoàn chỉnh & Tham khảo chỉ huy",
      "url": "pages/guide.html?id=kubernetes#heading-357-chapter-30-cka-certification-2026-complete-stud",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Chương 2 - Cài đặt cụm với kubeadm",
      "url": "pages/guide.html?id=kubernetes#heading-43-chapter-2-cluster-installation-from-scratch-with",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "deployments": [
    {
      "title": "Chương 5 - Tìm hiểu Pods và các container",
      "url": "pages/guide.html?id=kubernetes#heading-77-chapter-5-understanding-pods-and-containers",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Chương 23 - Loại bỏ và sửa đổi các container trong Pods",
      "url": "pages/guide.html?id=kubernetes#heading-265-chapter-23-removing-and-modifying-containers-in-",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "configmaps-secrets": [
    {
      "title": "Chương 6 - ConfigMaps và Secrets: Tài liệu tham khảo đầy đủ",
      "url": "pages/guide.html?id=kubernetes#heading-96-chapter-6-configmaps-and-secrets-complete-refer",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "autoscaling": [
    {
      "title": "Cập nhật CKA Kubernetes 1.35",
      "url": "pages/guide.html?id=kubernetes-1.35",
      "guide": "Phiên bản thi và kiến thức cập nhật"
    },
    {
      "title": "Chương 8 - Tự động thay đổi quy mô workload với HPA và VPA",
      "url": "pages/guide.html?id=kubernetes#heading-123-chapter-8-workload-autoscaling-with-hpa-and-vpa",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "self-healing": [
    {
      "title": "Chương 9 - Tự phục hồi: Thăm dò và phá vỡ PodNgân sách",
      "url": "pages/guide.html?id=kubernetes#heading-136-chapter-9-self-healing-primitives-probes-and-po",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "pod-admission-scheduling": [
    {
      "title": "Chương 1 - Kiến trúc Kubernetes (Bộ lập lịch)",
      "url": "pages/guide.html?id=kubernetes#heading-10-chapter-1-kubernetes-architecture-a-complete-ov",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Chương 30 - Tham chiếu đầy đủ của CKA (Lập lịch)",
      "url": "pages/guide.html?id=kubernetes#heading-357-chapter-30-cka-certification-2026-complete-stud",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "pod-connectivity": [
    {
      "title": "Chương 1 - Mô hình mạng và kiến trúc Kubernetes",
      "url": "pages/guide.html?id=kubernetes#heading-10-chapter-1-kubernetes-architecture-a-complete-ov",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "ip - Giao diện mạng, định tuyến và quản lý đường hầm",
      "url": "pages/guide.html?id=linux-networking#heading-2-1-ip-network-interface-routing-tunnel-manage",
      "guide": "Hướng dẫn kết nối mạng Linux"
    }
  ],
  "service-types": [
    {
      "title": "Cập nhật CKA Kubernetes 1.35",
      "url": "pages/guide.html?id=kubernetes-1.35",
      "guide": "Phiên bản thi và kiến thức cập nhật"
    },
    {
      "title": "Chương 12 - Kubernetes Services: ClusterIP, NodePort và hơn thế nữa",
      "url": "pages/guide.html?id=kubernetes#heading-158-chapter-12-kubernetes-services-clusterip-nodep",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "ss — Thống kê ổ cắm",
      "url": "pages/guide.html?id=linux-networking#heading-47-6-ss-socket-statistics",
      "guide": "Hướng dẫn kết nối mạng Linux"
    }
  ],
  "gateway-api": [
    {
      "title": "Cập nhật CKA Kubernetes 1.35",
      "url": "pages/guide.html?id=kubernetes-1.35",
      "guide": "Phiên bản thi và kiến thức cập nhật"
    },
    {
      "title": "Chương 11 - Gateway API: Quản lý Ingress hiện đại",
      "url": "pages/guide.html?id=kubernetes#heading-148-chapter-11-gateway-api-modern-ingress-traffic-m",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Hướng dẫn đầy đủ về Gateway API",
      "url": "pages/guide.html?id=gateway-api",
      "guide": "Hướng dẫn Gateway API"
    },
    {
      "title": "Hướng dẫn từng bước về Gateway API CKA",
      "url": "pages/guide.html?id=gateway-api-cka",
      "guide": "Hướng dẫn từng bước Gateway API"
    }
  ],
  "ingress": [
    {
      "title": "Cập nhật CKA Kubernetes 1.35",
      "url": "pages/guide.html?id=kubernetes-1.35",
      "guide": "Phiên bản thi và kiến thức cập nhật"
    },
    {
      "title": "Chương 13 - Ingress: Định tuyến HTTP và chấm dứt TLS",
      "url": "pages/guide.html?id=kubernetes#heading-169-chapter-13-ingress-http-routing-and-tls-termina",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Hướng dẫn đầy đủ về Ingress",
      "url": "pages/guide.html?id=ingress",
      "guide": "Hướng dẫn Ingress"
    },
    {
      "title": "Hướng dẫn từng bước về Ingress CKA",
      "url": "pages/guide.html?id=ingress-cka",
      "guide": "Hướng dẫn từng bước Ingress"
    },
    {
      "title": "Curl — Công cụ truyền dữ liệu",
      "url": "pages/guide.html?id=linux-networking#heading-57-8-curl-data-transfer-tool",
      "guide": "Hướng dẫn kết nối mạng Linux"
    }
  ],
  "network-policies": [
    {
      "title": "Chương 14 - NetworkPolicy: Kiểm soát giao thông",
      "url": "pages/guide.html?id=kubernetes#heading-179-chapter-14-networkpolicy-traffic-control-and-mi",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "iptables - Tường lửa (Netfilter)",
      "url": "pages/guide.html?id=linux-networking#heading-121-15-iptables-firewall-netfilter",
      "guide": "Hướng dẫn kết nối mạng Linux"
    }
  ],
  "coredns": [
    {
      "title": "Chương 26 - CoreDNS: Kiểm tra, chẩn đoán và xác minh DNS",
      "url": "pages/guide.html?id=kubernetes#heading-295-chapter-26-coredns-testing-diagnosing-and-ver",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Hướng dẫn đầy đủ về CoreDNS",
      "url": "pages/guide.html?id=coredns",
      "guide": "Hướng dẫn CoreDNS"
    },
    {
      "title": "Hướng dẫn từng bước về CoreDNS CKA",
      "url": "pages/guide.html?id=coredns-cka",
      "guide": "Hướng dẫn từng bước CoreDNS"
    },
    {
      "title": "dig — Tiện ích tra cứu DNS",
      "url": "pages/guide.html?id=linux-networking#heading-80-10-dig-dns-lookup-utility",
      "guide": "Hướng dẫn kết nối mạng Linux"
    },
    {
      "title": "nslookup — Công cụ truy vấn DNS",
      "url": "pages/guide.html?id=linux-networking#heading-86-11-nslookup-dns-query-tool",
      "guide": "Hướng dẫn kết nối mạng Linux"
    }
  ],
  "storage-classes": [
    {
      "title": "Chương 7 - StorageClasses và Cung cấp volume động",
      "url": "pages/guide.html?id=kubernetes#heading-112-chapter-7-storageclasses-and-dynamic-volume-prov",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "volume-types": [
    {
      "title": "Cập nhật CKA Kubernetes 1.35",
      "url": "pages/guide.html?id=kubernetes-1.35",
      "guide": "Phiên bản thi và kiến thức cập nhật"
    },
    {
      "title": "Chương 7 - StorageClasses và Cung cấp volume động",
      "url": "pages/guide.html?id=kubernetes#heading-112-chapter-7-storageclasses-and-dynamic-volume-prov",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "persistent-volumes": [
    {
      "title": "Chương 7 - StorageClasses và Cung cấp volume động",
      "url": "pages/guide.html?id=kubernetes#heading-112-chapter-7-storageclasses-and-dynamic-volume-prov",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "cluster-node-troubleshooting": [
    {
      "title": "Chương 1 - Kiến trúc Kubernetes (Khắc phục sự cố)",
      "url": "pages/guide.html?id=kubernetes#heading-10-chapter-1-kubernetes-architecture-a-complete-ov",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "ping - Kiểm tra kết nối ICMP",
      "url": "pages/guide.html?id=linux-networking#heading-31-2-ping-icmp-connectivity-testing",
      "guide": "Hướng dẫn kết nối mạng Linux"
    },
    {
      "title": "ss — Thống kê ổ cắm",
      "url": "pages/guide.html?id=linux-networking#heading-47-6-ss-socket-statistics",
      "guide": "Hướng dẫn kết nối mạng Linux"
    }
  ],
  "cluster-components": [
    {
      "title": "Chương 1 - Tổng quan về kiến trúc Kubernetes",
      "url": "pages/guide.html?id=kubernetes#heading-10-chapter-1-kubernetes-architecture-a-complete-ov",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Chương 30 - Tham khảo lệnh và nghiên cứu hoàn chỉnh của CKA",
      "url": "pages/guide.html?id=kubernetes#heading-357-chapter-30-cka-certification-2026-complete-stud",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "monitoring": [
    {
      "title": "Chương 22 - Giám sát tài nguyên bên trong container",
      "url": "pages/guide.html?id=kubernetes#heading-257-chapter-22-resource-monitoring-inside-containers",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "container-logs": [
    {
      "title": "Chương 18 - Xem và truyền phát nhật ký container",
      "url": "pages/guide.html?id=kubernetes#heading-218-chapter-18-viewing-and-streaming-container-logs",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Chương 17 - Thực thi các lệnh bên trong container",
      "url": "pages/guide.html?id=kubernetes#heading-208-chapter-17-executing-commands-inside-containers",
      "guide": "Hướng dẫn Kubernetes"
    }
  ],
  "network-troubleshooting": [
    {
      "title": "Chương 25 - Kiểm tra mạng từ các container tạm thời",
      "url": "pages/guide.html?id=kubernetes#heading-288-chapter-25-network-testing-from-ephemeral-contai",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Chương 26 - CoreDNS: Kiểm tra và chẩn đoán DNS",
      "url": "pages/guide.html?id=kubernetes#heading-295-chapter-26-coredns-testing-diagnosing-and-ver",
      "guide": "Hướng dẫn Kubernetes"
    },
    {
      "title": "Hướng dẫn từng bước về CoreDNS - Gỡ lỗi các sự cố DNS",
      "url": "pages/guide.html?id=coredns-cka#heading-19-task-06-debug-coredns-pods-crashing",
      "guide": "Hướng dẫn từng bước CoreDNS"
    },
    {
      "title": "Hướng dẫn từng bước về Ingress - Gỡ lỗi Ingress bị hỏng",
      "url": "pages/guide.html?id=ingress-cka#heading-22-task-7-debug-a-broken-ingress",
      "guide": "Hướng dẫn từng bước Ingress"
    },
    {
      "title": "traceroute - Theo dõi tuyến đường đến máy chủ",
      "url": "pages/guide.html?id=linux-networking#heading-35-3-traceroute-trace-the-route-to-a-host",
      "guide": "Hướng dẫn kết nối mạng Linux"
    },
    {
      "title": "tcpdump — Thu thập và phân tích gói",
      "url": "pages/guide.html?id=linux-networking#heading-109-14-tcpdump-packet-capture-analysis",
      "guide": "Hướng dẫn kết nối mạng Linux"
    }
  ]
};

const DOMAIN_COLORS = {
  "cluster-architecture": "#4CAF50",
  "workloads-scheduling": "#FF9800",
  "services-networking": "#2196F3",
  "storage": "#9C27B0",
  "troubleshooting": "#F44336"
};

const MIND_MAP_DATA = {
  "main": {
    "title": "Ôn thi CKA",
    "subtitle": "Certified Kubernetes Administrator | Kubernetes 1.35 | Tiếng Việt",
    "parent": null,
    "parentTitle": null,
    "nodes": [
      {
        "id": "cluster-architecture",
        "name": "Kiến trúc cụm,\ncài đặt và\ncấu hình",
        "weight": "25%",
        "color": "#4CAF50",
        "icon": "🏗"
      },
      {
        "id": "workloads-scheduling",
        "name": "Workload và\nlập lịch",
        "weight": "15%",
        "color": "#FF9800",
        "icon": "⚙"
      },
      {
        "id": "services-networking",
        "name": "Service\nvà mạng",
        "weight": "20%",
        "color": "#2196F3",
        "icon": "🌐"
      },
      {
        "id": "storage",
        "name": "Lưu trữ",
        "weight": "10%",
        "color": "#9C27B0",
        "icon": "💾"
      },
      {
        "id": "troubleshooting",
        "name": "Xử lý sự cố",
        "weight": "30%",
        "color": "#F44336",
        "icon": "🔧"
      }
    ]
  },
  "cluster-architecture": {
    "title": "Kiến trúc, cài đặt và cấu hình cụm",
    "subtitle": "25% nội dung thi CKA",
    "parent": "main",
    "parentTitle": "Ôn thi CKA",
    "domainColor": "#4CAF50",
    "nodes": [
      {
        "id": "rbac",
        "name": "RBAC",
        "description": "Kiểm soát truy cập dựa trên Role"
      },
      {
        "id": "kubeadm",
        "name": "kubeadm",
        "description": "Quản lý & khởi động cụm"
      },
      {
        "id": "ha-control-plane",
        "name": "Control plane\nsẵn sàng cao",
        "description": "Control plane có tính sẵn sàng cao"
      },
      {
        "id": "extension-interfaces",
        "name": "Giao diện\nmở rộng",
        "description": "CNI, CSI, CRI"
      },
      {
        "id": "crds-operators",
        "name": "CRD và\nOperator",
        "description": "Định nghĩa tài nguyên tùy chỉnh"
      },
      {
        "id": "helm-kustomize",
        "name": "Helm và\nKustomize",
        "description": "Quản lý gói & cấu hình"
      },
      {
        "id": "cluster-lifecycle",
        "name": "Vòng đời\ncụm",
        "description": "Nâng cấp, sao lưu và khôi phục"
      }
    ]
  },
  "workloads-scheduling": {
    "title": "Workload và lập lịch",
    "subtitle": "15% nội dung thi CKA",
    "parent": "main",
    "parentTitle": "Ôn thi CKA",
    "domainColor": "#FF9800",
    "nodes": [
      {
        "id": "deployments",
        "name": "Deployment",
        "description": "Cập nhật và khôi phục cuộn"
      },
      {
        "id": "configmaps-secrets",
        "name": "ConfigMap\nvà Secret",
        "description": "Cấu hình ứng dụng"
      },
      {
        "id": "autoscaling",
        "name": "Tự động\nco giãn",
        "description": "HPA, VPA & Số liệu"
      },
      {
        "id": "self-healing",
        "name": "Tự phục hồi",
        "description": "ReplicaSets, DaemonSets, StatefulSets"
      },
      {
        "id": "pod-admission-scheduling",
        "name": "Tiếp nhận và\nlập lịch Pod",
        "description": "Mối quan hệ, vết nhơ và sự dung nạp"
      }
    ]
  },
  "services-networking": {
    "title": "Service và mạng",
    "subtitle": "20% nội dung thi CKA",
    "parent": "main",
    "parentTitle": "Ôn thi CKA",
    "domainColor": "#2196F3",
    "nodes": [
      {
        "id": "pod-connectivity",
        "name": "Kết nối\ngiữa các Pod",
        "description": "Mô hình mạng Pod"
      },
      {
        "id": "service-types",
        "name": "Các loại\nService",
        "description": "ClusterIP, NodePort, LoadBalancer"
      },
      {
        "id": "gateway-api",
        "name": "Gateway API",
        "description": "Quản lý Ingress hiện đại"
      },
      {
        "id": "ingress",
        "name": "Ingress",
        "description": "Bộ điều khiển & Tài nguyên"
      },
      {
        "id": "network-policies",
        "name": "NetworkPolicy",
        "description": "Kiểm soát & An ninh Giao thông"
      },
      {
        "id": "coredns",
        "name": "CoreDNS",
        "description": "DNS & Service Discovery"
      }
    ]
  },
  "storage": {
    "title": "Lưu trữ",
    "subtitle": "10% nội dung thi CKA",
    "parent": "main",
    "parentTitle": "Ôn thi CKA",
    "domainColor": "#9C27B0",
    "nodes": [
      {
        "id": "storage-classes",
        "name": "StorageClass và\ncấp phát động",
        "description": "Tự động cung cấp số lượng"
      },
      {
        "id": "volume-types",
        "name": "Volume và\nchế độ truy cập",
        "description": "Plugin RWO, ROX, RWX & Volume"
      },
      {
        "id": "persistent-volumes",
        "name": "PV và PVC",
        "description": "Chính sách thu hồi và vòng đời của PV/PVC"
      }
    ]
  },
  "troubleshooting": {
    "title": "Xử lý sự cố",
    "subtitle": "30% nội dung thi CKA",
    "parent": "main",
    "parentTitle": "Ôn thi CKA",
    "domainColor": "#F44336",
    "nodes": [
      {
        "id": "cluster-node-troubleshooting",
        "name": "Cụm và node",
        "description": "Kubelet, Kube-proxy & Nút"
      },
      {
        "id": "cluster-components",
        "name": "Thành phần\nhệ thống",
        "description": "Máy chủ API, Bộ lập lịch, etcd"
      },
      {
        "id": "monitoring",
        "name": "Giám sát\ntài nguyên",
        "description": "Máy chủ số liệu & kubectl hàng đầu"
      },
      {
        "id": "container-logs",
        "name": "Log\ncontainer",
        "description": "Nhật ký, stdout & stderr"
      },
      {
        "id": "network-troubleshooting",
        "name": "Service\nvà mạng",
        "description": "DNS, Service & Kết nối"
      }
    ]
  },
  "rbac": {
    "title": "Phân quyền truy cập RBAC",
    "subtitle": "Kiến trúc, cài đặt và cấu hình cụm > Phân quyền truy cập RBAC",
    "parent": "cluster-architecture",
    "parentTitle": "Kiến trúc, cài đặt và cấu hình cụm",
    "domainColor": "#4CAF50",
    "nodes": [
      {
        "name": "Role",
        "description": "Bộ quyền trong phạm vi namespace",
        "keyPoints": [
          "Xác định quyền trong namespace cụ thể",
          "Chứa các quy tắc với apiGroups, tài nguyên và động từ",
          "Động từ: lấy, liệt kê, xem, tạo, cập nhật, vá, xóa",
          "Không thể cấp quyền truy cập vào các tài nguyên trong phạm vi cụm"
        ],
        "commands": [
          "kubectl create role pod-reader --verb=get,list,watch --resource=pods -n <namespace>",
          "kubectl get roles -n <namespace>",
          "kubectl get roles -A",
          "kubectl describe role <role-name> -n <namespace>",
          "kubectl get role <role-name> -n <namespace> -o yaml",
          "kubectl edit role <role-name> -n <namespace>",
          "kubectl delete role <role-name> -n <namespace>",
          "kubectl create role secret-admin --verb=get,list,create,delete --resource=secrets -n <namespace>",
          "kubectl explain role.rules"
        ],
        "references": [
          {
            "title": "Sử dụng ủy quyền RBAC",
            "url": "https://kubernetes.io/docs/reference/access-authn-authz/rbac/"
          },
          {
            "title": "Ví dụ về Role",
            "url": "https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-example"
          }
        ]
      },
      {
        "name": "ClusterRole",
        "description": "Bộ quyền trên toàn cụm",
        "keyPoints": [
          "Không được đặt tên: áp dụng trên toàn bộ cụm",
          "Có thể cấp quyền truy cập vào các tài nguyên trong phạm vi cụm (nodes, PV)",
          "Có thể cấp quyền truy cập vào các điểm cuối không có tài nguyên (/healthz)",
          "Có thể được sử dụng với ClusterRoleBindings hoặc RoleBindings"
        ],
        "commands": [
          "kubectl create clusterrole node-reader --verb=get,list,watch --resource=nodes",
          "kubectl get clusterroles",
          "kubectl describe clusterrole <name>",
          "kubectl get clusterrole <name> -o yaml",
          "kubectl edit clusterrole <name>",
          "kubectl delete clusterrole <name>",
          "kubectl create clusterrole pv-reader --verb=get,list,watch --resource=persistentvolumes",
          "kubectl explain clusterrole.rules",
          "kubectl get clusterroles --no-headers | wc -l"
        ],
        "references": [
          {
            "title": "Sử dụng ủy quyền RBAC",
            "url": "https://kubernetes.io/docs/reference/access-authn-authz/rbac/"
          },
          {
            "title": "Ví dụ về ClusterRole",
            "url": "https://kubernetes.io/docs/reference/access-authn-authz/rbac/#clusterrole-example"
          }
        ]
      },
      {
        "name": "RoleBinding",
        "description": "Liên kết Roles với các chủ thể trong namespace",
        "keyPoints": [
          "Cấp quyền được xác định trong Role cho users/groups/ServiceAccounts",
          "Phạm vi cho một namespace cụ thể",
          "Có thể tham chiếu ClusterRole (quyền được giới hạn ở namespace của RoleBinding)",
          "Đối tượng: Người dùng, Nhóm, ServiceAccount"
        ],
        "commands": [
          "kubectl create rolebinding pod-reader-binding --role=pod-reader --user=jane -n default",
          "kubectl create rolebinding sa-binding --role=pod-reader --serviceaccount=default:my-sa -n <namespace>",
          "kubectl get rolebindings -n <namespace>",
          "kubectl get rolebindings -A",
          "kubectl describe rolebinding <name> -n <namespace>",
          "kubectl get rolebinding <name> -n <namespace> -o yaml",
          "kubectl delete rolebinding <name> -n <namespace>",
          "kubectl auth can-i list pods --as=jane -n default",
          "kubectl create rolebinding admin-binding --clusterrole=admin --user=jane -n <namespace>"
        ],
        "references": [
          {
            "title": "RoleBinding và ClusterRoleBinding",
            "url": "https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding"
          }
        ]
      },
      {
        "name": "ClusterRoleBinding",
        "description": "Liên kết ClusterRoles trên toàn cụm",
        "keyPoints": [
          "Cấp quyền trên toàn cụm cho các chủ đề",
          "Không thể tham chiếu Role (chỉ ClusterRole)",
          "Ảnh hưởng đến tất cả namespaces",
          "Sử dụng cẩn thận - cấp quyền truy cập rộng rãi"
        ],
        "commands": [
          "kubectl create clusterrolebinding admin-binding --clusterrole=cluster-admin --user=admin",
          "kubectl create clusterrolebinding sa-crb --clusterrole=view --serviceaccount=<namespace>:<sa-name>",
          "kubectl get clusterrolebindings",
          "kubectl describe clusterrolebinding <name>",
          "kubectl get clusterrolebinding <name> -o yaml",
          "kubectl delete clusterrolebinding <name>",
          "kubectl auth can-i list nodes --as=admin",
          "kubectl get clusterrolebindings -o jsonpath='{range .items[?(@.roleRef.name==\"cluster-admin\")]}{.metadata.name}{\"\\n\"}{end}'"
        ],
        "references": [
          {
            "title": "RoleBinding và ClusterRoleBinding",
            "url": "https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding"
          }
        ]
      },
      {
        "name": "ServiceAccount",
        "description": "Nhận dạng các tiến trình trong pods",
        "keyPoints": [
          "Mỗi namespace đều có ServiceAccount 'mặc định'",
          "Pods sử dụng ServiceAccounts để xác thực với máy chủ API",
          "Mã thông báo được gắn tự động tại /var/run/secrets/kubernetes.io/serviceaccount",
          "Có thể được gán Roles/ClusterRoles thông qua các ràng buộc",
          "Kubernetes 1.24+: mã thông báo không còn được tạo tự động dưới dạng Secrets nữa"
        ],
        "commands": [
          "kubectl create serviceaccount my-sa -n default",
          "kubectl get serviceaccounts -n <namespace>",
          "kubectl get serviceaccounts -A",
          "kubectl describe serviceaccount my-sa -n <namespace>",
          "kubectl get serviceaccount my-sa -o yaml",
          "kubectl delete serviceaccount my-sa -n <namespace>",
          "kubectl set serviceaccount deployment/my-app my-sa",
          "kubectl create token my-sa -n <namespace>",
          "kubectl auth can-i list pods --as=system:serviceaccount:<namespace>:my-sa"
        ],
        "references": [
          {
            "title": "Tài khoản Service",
            "url": "https://kubernetes.io/docs/concepts/security/service-accounts/"
          },
          {
            "title": "Định cấu hình tài khoản Service cho Pods",
            "url": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/"
          }
        ]
      },
      {
        "name": "Kiểm tra\nquyền truy cập",
        "description": "Kiểm tra và xác minh quyền truy cập",
        "keyPoints": [
          "Sử dụng 'kubectl auth can-i' để xác minh quyền",
          "Kiểm tra với tư cách người dùng cụ thể hoặc ServiceAccount",
          "Mạo danh để truy cập thử nghiệm",
          "Nhật ký kiểm tra theo dõi quyền truy cập API",
          "'kubectl auth whoami' hiển thị danh tính hiện tại (v1.27+)"
        ],
        "commands": [
          "kubectl auth can-i create pods --as=system:serviceaccount:default:my-sa",
          "kubectl auth can-i get pods --as=jane -n <namespace>",
          "kubectl auth can-i '*' '*' --all-namespaces",
          "kubectl auth can-i list deployments --as=system:serviceaccount:<namespace>:<sa-name>",
          "kubectl auth whoami",
          "kubectl auth can-i --list --as=jane -n <namespace>",
          "kubectl auth can-i delete nodes --as=admin",
          "kubectl get pods --as=jane -n <namespace>"
        ],
        "references": [
          {
            "title": "Kiểm tra quyền truy cập API",
            "url": "https://kubernetes.io/docs/reference/access-authn-authz/authorization/#checking-api-access"
          },
          {
            "title": "Tổng quan về ủy quyền",
            "url": "https://kubernetes.io/docs/reference/access-authn-authz/authorization/"
          }
        ]
      }
    ]
  },
  "kubeadm": {
    "title": "Khởi tạo và quản lý cụm bằng kubeadm",
    "subtitle": "Kiến trúc, cài đặt và cấu hình cụm > Khởi tạo và quản lý cụm bằng kubeadm",
    "parent": "cluster-architecture",
    "parentTitle": "Kiến trúc, cài đặt và cấu hình cụm",
    "domainColor": "#4CAF50",
    "nodes": [
      {
        "name": "kubeadm init",
        "description": "Khởi tạo control plane node",
        "keyPoints": [
          "Khởi động Kubernetes control plane",
          "Tạo chứng chỉ và tệp kubeconfig",
          "Triển khai kube-apiserver, kube-controller-manager, kube-scheduler dưới dạng pods tĩnh",
          "Xuất lệnh nối cho worker nodes",
          "Kiểm tra trước chuyến bay xác nhận các yêu cầu hệ thống"
        ],
        "commands": [
          "kubeadm init --pod-network-cidr=10.244.0.0/16",
          "kubeadm init --config kubeadm-config.yaml",
          "kubeadm init --control-plane-endpoint=<load-balancer>:6443 --upload-certs",
          "kubeadm init --apiserver-advertise-address=<ip> --pod-network-cidr=10.244.0.0/16",
          "kubeadm init --dry-run",
          "kubeadm init phase preflight",
          "mkdir -p $HOME/.kube && cp -i /etc/kubernetes/admin.conf $HOME/.kube/config && chown $(id -u):$(id -g) $HOME/.kube/config",
          "kubeadm init --skip-phases=addon/kube-proxy"
        ],
        "references": [
          {
            "title": "kubeadm ban đầu",
            "url": "https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/"
          },
          {
            "title": "Tạo một cụm với kubeadm",
            "url": "https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/"
          }
        ]
      },
      {
        "name": "kubeadm join",
        "description": "Tham gia nodes vào cụm",
        "keyPoints": [
          "Thêm worker nodes hoặc control plane nodes bổ sung",
          "Yêu cầu mã thông báo và hàm băm chứng chỉ CA từ 'kubeadm init'",
          "Đối với control plane: sử dụng cờ --control-plane",
          "Mã thông báo hết hạn sau 24 giờ theo mặc định"
        ],
        "commands": [
          "kubeadm join <api-server>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>",
          "kubeadm join <api-server>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash> --control-plane --certificate-key <key>",
          "kubeadm token create --print-join-command",
          "kubeadm join --config join-config.yaml",
          "kubeadm join --dry-run <api-server>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>",
          "kubeadm join phase preflight <api-server>:6443 --token <token>",
          "kubectl get nodes (verify node joined)"
        ],
        "references": [
          {
            "title": "kubeadm tham gia",
            "url": "https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-join/"
          }
        ]
      },
      {
        "name": "kubeadm upgrade",
        "description": "Nâng cấp phiên bản cụm",
        "keyPoints": [
          "Nâng cấp một phiên bản nhỏ mỗi lần",
          "Nâng cấp control plane trước, sau đó là workers",
          "Xả nodes trước khi nâng cấp kubelet",
          "Kiểm tra gói nâng cấp trước khi áp dụng"
        ],
        "commands": [
          "kubeadm upgrade plan",
          "kubeadm upgrade apply v1.35.8",
          "kubeadm upgrade apply v1.35.8 --dry-run",
          "kubeadm upgrade node",
          "kubeadm upgrade diff v1.35.8",
          "kubectl drain <node> --ignore-daemonsets --delete-emptydir-data",
          "apt-get update && apt-get install -y kubelet=1.35.8-* kubectl=1.35.8-*",
          "systemctl daemon-reload && systemctl restart kubelet",
          "kubectl uncordon <node>"
        ],
        "references": [
          {
            "title": "Nâng cấp kubeadm",
            "url": "https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-upgrade/"
          },
          {
            "title": "Nâng cấp cụm kubeadm",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/"
          }
        ]
      },
      {
        "name": "kubeadm config",
        "description": "Quản lý cấu hình",
        "keyPoints": [
          "Sử dụng ClusterConfiguration cho cài đặt init",
          "InitConfiguration cho cài đặt dành riêng cho node",
          "KubeletConfiguration cho cài đặt kubelet",
          "In cấu hình mặc định để tham khảo"
        ],
        "commands": [
          "kubeadm config print init-defaults",
          "kubeadm config print join-defaults",
          "kubeadm config images list",
          "kubeadm config images pull",
          "kubeadm config images list --kubernetes-version=v1.35.8",
          "kubeadm config validate --config kubeadm-config.yaml",
          "kubeadm config migrate --old-config old-config.yaml --new-config new-config.yaml",
          "kubectl get configmap kubeadm-config -n kube-system -o yaml"
        ],
        "references": [
          {
            "title": "Cấu hình kubeadm",
            "url": "https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-config/"
          }
        ]
      },
      {
        "name": "kubeadm token",
        "description": "Quản lý mã thông báo",
        "keyPoints": [
          "Mã thông báo Bootstrap để tham gia node",
          "TTL mặc định là 24 giờ",
          "Có thể tạo mã thông báo mới sau init",
          "Token được lưu trữ dưới dạng bí mật trong kube-system namespace"
        ],
        "commands": [
          "kubeadm token list",
          "kubeadm token create",
          "kubeadm token create --ttl 2h --print-join-command",
          "kubeadm token create --ttl 0 (never expires)",
          "kubeadm token delete <token>",
          "kubeadm token generate",
          "openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'",
          "kubectl get secrets -n kube-system | grep bootstrap-token"
        ],
        "references": [
          {
            "title": "Mã thông báo kubeadm",
            "url": "https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-token/"
          }
        ]
      },
      {
        "name": "kubeadm reset",
        "description": "Hoàn nguyên các hành động kubeadm",
        "keyPoints": [
          "Dọn dẹp các tệp và tài nguyên được tạo bởi init/join",
          "Xóa thư mục dữ liệu etcd",
          "KHÔNG đặt lại quy tắc iptables hoặc bảng IPVS",
          "Vẫn có thể cần phải dọn dẹp thủ công"
        ],
        "commands": [
          "kubeadm reset",
          "kubeadm reset --force",
          "kubeadm reset --cert-dir /etc/kubernetes/pki",
          "iptables -F && iptables -t nat -F && iptables -t mangle -F && iptables -X",
          "ipvsadm --clear",
          "rm -rf $HOME/.kube/config",
          "rm -rf /etc/cni/net.d"
        ],
        "references": [
          {
            "title": "Đặt lại kubeadm",
            "url": "https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-reset/"
          }
        ]
      }
    ]
  },
  "ha-control-plane": {
    "title": "Control plane sẵn sàng cao",
    "subtitle": "Kiến trúc, cài đặt và cấu hình cụm > Control plane sẵn sàng cao",
    "parent": "cluster-architecture",
    "parentTitle": "Kiến trúc, cài đặt và cấu hình cụm",
    "domainColor": "#4CAF50",
    "nodes": [
      {
        "name": "etcd\nđồng vị trí",
        "description": "etcd cùng vị trí với control plane",
        "keyPoints": [
          "etcd chạy trên cùng nodes với các thành phần control plane",
          "Đơn giản hơn để thiết lập và quản lý",
          "Yêu cầu ít máy chủ hơn (tối thiểu 3 nodes)",
          "Rủi ro: mất node mất cả thành viên control plane và etcd",
          "Cần ít nhất ba thành viên etcd để chịu mất một thành viên. Hai thành viên cần cả hai để có quorum."
        ],
        "commands": [
          "kubeadm init --control-plane-endpoint=<lb>:6443 --upload-certs",
          "kubeadm join <lb>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash> --control-plane --certificate-key <key>",
          "kubectl get nodes -o wide",
          "kubectl get pods -n kube-system -l component=etcd",
          "ETCDCTL_API=3 etcdctl member list --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key",
          "kubectl get endpoints -n default kubernetes"
        ],
        "references": [
          {
            "title": "Tùy chọn cấu trúc liên kết HA",
            "url": "https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/ha-topology/"
          },
          {
            "title": "Tạo cụm HA với kubeadm",
            "url": "https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/high-availability/"
          }
        ]
      },
      {
        "name": "etcd\nđộc lập",
        "description": "etcd trên nodes chuyên dụng",
        "keyPoints": [
          "etcd chạy trên các máy chủ chuyên dụng riêng biệt",
          "Kiên cường hơn: Lỗi control plane không ảnh hưởng đến etcd",
          "Yêu cầu nhiều cơ sở hạ tầng hơn (tối thiểu 3 etcd + 3 control plane)",
          "Tốt hơn cho môi trường sản xuất lớn"
        ],
        "commands": [
          "kubeadm init --config=kubeadm-config.yaml (with external etcd endpoints)",
          "ETCDCTL_API=3 etcdctl endpoint health --endpoints=https://<etcd1>:2379,https://<etcd2>:2379,https://<etcd3>:2379 --cacert=/etc/etcd/ca.crt --cert=/etc/etcd/server.crt --key=/etc/etcd/server.key",
          "ETCDCTL_API=3 etcdctl endpoint status --endpoints=https://<etcd1>:2379,https://<etcd2>:2379 --cacert=/etc/etcd/ca.crt --cert=/etc/etcd/server.crt --key=/etc/etcd/server.key -w table",
          "ETCDCTL_API=3 etcdctl member list --endpoints=https://<etcd1>:2379 --cacert=/etc/etcd/ca.crt --cert=/etc/etcd/server.crt --key=/etc/etcd/server.key",
          "systemctl status etcd",
          "journalctl -u etcd -f"
        ],
        "references": [
          {
            "title": "Tùy chọn cấu trúc liên kết HA",
            "url": "https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/ha-topology/"
          },
          {
            "title": "Thiết lập cụm etcd",
            "url": "https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/setup-ha-etcd-with-kubeadm/"
          }
        ]
      },
      {
        "name": "Cân bằng tải",
        "description": "Cân bằng tải máy chủ API",
        "keyPoints": [
          "Bắt buộc đối với HA: phân phối lưu lượng trên các máy chủ API",
          "Có thể sử dụng bộ cân bằng tải HAProxy, Nginx hoặc đám mây",
          "Kiểm tra sức khỏe trên cổng kube-apiserver 6443",
          "--control-plane-endpoint phải trỏ đến LB"
        ],
        "commands": [
          "kubeadm init --control-plane-endpoint=<load-balancer-dns>:6443",
          "curl -k https://<load-balancer-dns>:6443/healthz",
          "kubectl get endpoints kubernetes",
          "kubectl cluster-info",
          "kubectl get nodes -o wide",
          "nc -zv <load-balancer-dns> 6443"
        ],
        "references": [
          {
            "title": "Tạo cụm HA",
            "url": "https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/high-availability/"
          }
        ]
      },
      {
        "name": "Sao lưu và\nkhôi phục etcd",
        "description": "Bảo vệ dữ liệu cho etcd",
        "keyPoints": [
          "etcd lưu trữ tất cả trạng thái cụm",
          "Sử dụng etcdctl để sao lưu và khôi phục",
          "Chụp nhanh thư mục dữ liệu etcd",
          "Khôi phục tạo thư mục dữ liệu etcd mới",
          "Luôn kiểm tra quá trình khôi phục trong môi trường phi sản xuất",
          "Dùng etcdutl để phục hồi ngoại tuyến vào thư mục mới; cấu hình đúng membership, hostPath và revision bump/mark-compacted. etcdctl dùng để chụp snapshot."
        ],
        "commands": [
          "ETCDCTL_API=3 etcdctl snapshot save /tmp/backup.db --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key",
          "etcdutl snapshot restore /tmp/backup.db --data-dir=/var/lib/etcd-backup",
          "etcdutl snapshot status /tmp/backup.db -w table",
          "ETCDCTL_API=3 etcdctl endpoint health --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key",
          "ETCDCTL_API=3 etcdctl member list --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key",
          "etcdutl snapshot restore /tmp/backup.db --data-dir=/var/lib/etcd-backup --name=<node> --initial-cluster=<node>=https://<ip>:2380 --initial-advertise-peer-urls=https://<ip>:2380",
          "cat /etc/kubernetes/manifests/etcd.yaml | grep data-dir",
          "crictl ps | grep etcd"
        ],
        "references": [
          {
            "title": "Vận hành cụm etcd",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/"
          },
          {
            "title": "Sao lưu cụm etcd",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster"
          }
        ]
      }
    ]
  },
  "extension-interfaces": {
    "title": "Giao diện mở rộng",
    "subtitle": "Kiến trúc, cài đặt và cấu hình cụm > Giao diện mở rộng",
    "parent": "cluster-architecture",
    "parentTitle": "Kiến trúc, cài đặt và cấu hình cụm",
    "domainColor": "#4CAF50",
    "nodes": [
      {
        "name": "CNI",
        "description": "Giao diện mạng container",
        "keyPoints": [
          "Tiêu chuẩn cấu hình giao diện mạng trong containers",
          "Các plugin: Calico, Flannel, Dệt, Cilium",
          "Xử lý việc phân bổ và định tuyến IP Pod",
          "Các tệp cấu hình thường ở dạng /etc/cni/net.d/",
          "Phải được cài đặt sau khi khởi tạo kubeadm để pods giao tiếp"
        ],
        "commands": [
          "ls /etc/cni/net.d/",
          "cat /etc/cni/net.d/*.conflist",
          "kubectl get pods -n kube-system -l k8s-app=calico-node",
          "kubectl get pods -n kube-system | grep -E 'calico|flannel|cilium|weave'",
          "kubectl apply -f <cni-plugin-manifest>.yaml",
          "kubectl get nodes -o wide (check INTERNAL-IP and STATUS)",
          "ip route (check pod CIDR routes on node)",
          "kubectl logs -n kube-system <cni-pod>",
          "/opt/cni/bin/ (list installed CNI binaries)"
        ],
        "references": [
          {
            "title": "Plugin mạng",
            "url": "https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/"
          },
          {
            "title": "Mạng cụm",
            "url": "https://kubernetes.io/docs/concepts/cluster-administration/networking/"
          }
        ]
      },
      {
        "name": "CSI",
        "description": "Giao diện lưu trữ container",
        "keyPoints": [
          "Tiêu chuẩn để hiển thị hệ thống lưu trữ với containers",
          "Thay thế các plugin volume trong cây",
          "Hỗ trợ cung cấp động, ảnh chụp nhanh, nhân bản",
          "Trình điều khiển: AWS EBS, GCE PD, Ceph, NFS"
        ],
        "commands": [
          "kubectl get csidrivers",
          "kubectl get csinodes",
          "kubectl describe csidrivers <driver-name>",
          "kubectl get csidriver <name> -o yaml",
          "kubectl describe csinode <node-name>",
          "kubectl get storageclasses",
          "kubectl get volumeattachments",
          "kubectl describe volumeattachment <name>",
          "kubectl get pods -n kube-system | grep csi"
        ],
        "references": [
          {
            "title": "Tập CSI",
            "url": "https://kubernetes.io/docs/concepts/storage/volumes/#csi"
          },
          {
            "title": "Trình điều khiển lưu trữ",
            "url": "https://kubernetes.io/docs/concepts/storage/volumes/#types-of-volumes"
          }
        ]
      },
      {
        "name": "CRI",
        "description": "Giao diện môi trường chạy container",
        "keyPoints": [
          "Tiêu chuẩn cho môi trường chạy container để tích hợp với kubelet",
          "Thời gian chạy: containerd, CRI-O",
          "Docker đã bị xóa trong Kubernetes v1.24+ (dockershim)",
          "Được định cấu hình qua cờ kubelet --container-runtime-endpoint"
        ],
        "commands": [
          "crictl ps",
          "crictl ps -a (include stopped containers)",
          "crictl images",
          "crictl info",
          "crictl logs <container-id>",
          "crictl inspect <container-id>",
          "crictl pods",
          "crictl rmi <image-id>",
          "systemctl status containerd",
          "systemctl restart containerd",
          "cat /etc/containerd/config.toml",
          "cat /var/lib/kubelet/config.yaml | grep containerRuntimeEndpoint"
        ],
        "references": [
          {
            "title": "Giao diện môi trường chạy container",
            "url": "https://kubernetes.io/docs/concepts/architecture/cri/"
          },
          {
            "title": "Môi trường chạy container",
            "url": "https://kubernetes.io/docs/setup/production-environment/container-runtimes/"
          }
        ]
      }
    ]
  },
  "crds-operators": {
    "title": "CRD và Operator",
    "subtitle": "Kiến trúc, cài đặt và cấu hình cụm > CRD và Operator",
    "parent": "cluster-architecture",
    "parentTitle": "Kiến trúc, cài đặt và cấu hình cụm",
    "domainColor": "#4CAF50",
    "nodes": [
      {
        "name": "Định nghĩa\ntài nguyên CRD",
        "description": "Mở rộng Kubernetes API",
        "keyPoints": [
          "Xác định loại tài nguyên tùy chỉnh trong API",
          "Thông số YAML xác định nhóm, phiên bản, phạm vi, lược đồ",
          "Có thể được đặt tên hoặc theo phạm vi cụm",
          "Sau khi tạo, tài nguyên tùy chỉnh có thể được quản lý bằng kubectl",
          "Hỗ trợ xác thực lược đồ thông qua OpenAPI v3"
        ],
        "commands": [
          "kubectl get crds",
          "kubectl describe crd <crd-name>",
          "kubectl get crd <crd-name> -o yaml",
          "kubectl get <custom-resource> -n <namespace>",
          "kubectl apply -f my-crd.yaml",
          "kubectl delete crd <crd-name>",
          "kubectl explain <custom-resource>",
          "kubectl get crds | grep <group-name>",
          "kubectl api-resources | grep <custom-resource>"
        ],
        "references": [
          {
            "title": "Tài nguyên tùy chỉnh",
            "url": "https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/"
          },
          {
            "title": "Định nghĩa tài nguyên tùy chỉnh",
            "url": "https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/"
          }
        ]
      },
      {
        "name": "Mô hình\nOperator",
        "description": "Quản lý ứng dụng tự động",
        "keyPoints": [
          "Kết hợp CRDs + bộ điều khiển tùy chỉnh",
          "Mã hóa kiến thức vận hành vào phần mềm",
          "Quản lý vòng đời ứng dụng phức tạp (cài đặt, nâng cấp, sao lưu)",
          "Ví dụ: Người vận hành Prometheus, người quản lý chứng chỉ, Người vận hành etcd"
        ],
        "commands": [
          "kubectl get pods -n <operator-namespace>",
          "kubectl logs <operator-pod> -n <operator-namespace>",
          "kubectl logs <operator-pod> -n <operator-namespace> -f",
          "kubectl describe pod <operator-pod> -n <operator-namespace>",
          "kubectl get deployments -n <operator-namespace>",
          "kubectl get crds | grep <operator-domain>",
          "kubectl get events -n <operator-namespace> --sort-by='.lastTimestamp'"
        ],
        "references": [
          {
            "title": "Mẫu toán tử",
            "url": "https://kubernetes.io/docs/concepts/extend-kubernetes/operator/"
          }
        ]
      },
      {
        "name": "Tài nguyên\ntuỳ chỉnh",
        "description": "Các phiên bản của CRDs",
        "keyPoints": [
          "Được tạo sau khi CRD được đăng ký",
          "Thực hiện theo lược đồ được xác định trong CRD",
          "Được quản lý giống như mọi tài nguyên Kubernetes khác",
          "Có thể có tài nguyên phụ trạng thái và xác thực",
          "Hỗ trợ các cột máy in cho đầu ra kubectl"
        ],
        "commands": [
          "kubectl apply -f my-custom-resource.yaml",
          "kubectl get <resource-type>",
          "kubectl get <resource-type> -n <namespace> -o yaml",
          "kubectl describe <resource-type> <name>",
          "kubectl edit <resource-type> <name>",
          "kubectl delete <resource-type> <name>",
          "kubectl patch <resource-type> <name> --type merge -p '{\"spec\":{\"key\":\"value\"}}'",
          "kubectl api-resources --api-group=<group-name>"
        ],
        "references": [
          {
            "title": "Tài nguyên tùy chỉnh",
            "url": "https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/"
          },
          {
            "title": "Mở rộng Kubernetes API",
            "url": "https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/"
          }
        ]
      }
    ]
  },
  "helm-kustomize": {
    "title": "Helm và Kustomize",
    "subtitle": "Kiến trúc, cài đặt và cấu hình cụm > Helm và Kustomize",
    "parent": "cluster-architecture",
    "parentTitle": "Kiến trúc, cài đặt và cấu hình cụm",
    "domainColor": "#4CAF50",
    "nodes": [
      {
        "name": "Helm chart",
        "description": "Trình quản lý gói cho Kubernetes",
        "keyPoints": [
          "Biểu đồ là các gói tài nguyên Kubernetes được cấu hình sẵn",
          "values.yaml để tùy chỉnh",
          "Hỗ trợ phiên bản, phụ thuộc và khôi phục",
          "Cấu trúc biểu đồ: Chart.yaml, templates/, values.yaml",
          "Phát hành: một phiên bản của biểu đồ chạy trong một cụm"
        ],
        "commands": [
          "helm repo add <name> <url>",
          "helm install <release> <chart>",
          "helm install <release> <chart> --set key=value",
          "helm install <release> <chart> -f custom-values.yaml",
          "helm install <release> <chart> --namespace <namespace> --create-namespace",
          "helm upgrade <release> <chart>",
          "helm upgrade <release> <chart> --install",
          "helm list -A",
          "helm rollback <release> <revision>",
          "helm uninstall <release>",
          "helm history <release>",
          "helm get values <release>",
          "helm get manifest <release>",
          "helm show values <chart>",
          "helm template <release> <chart>"
        ],
        "references": [
          {
            "title": "Helm (Tài liệu chính thức)",
            "url": "https://helm.sh/docs/"
          },
          {
            "title": "Quản lý đối tượng Kubernetes bằng Helm",
            "url": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/helm/"
          }
        ]
      },
      {
        "name": "Kho Helm",
        "description": "Phân phối biểu đồ",
        "keyPoints": [
          "Lưu trữ biểu đồ tập trung hoặc dựa trên OCI",
          "ArtifactHub để khám phá biểu đồ",
          "helm repo add/update/remove để quản lý",
          "Hỗ trợ OCI cho lưu trữ đăng ký container"
        ],
        "commands": [
          "helm repo add bitnami https://charts.bitnami.com/bitnami",
          "helm repo update",
          "helm repo list",
          "helm repo remove <name>",
          "helm search repo <keyword>",
          "helm search repo <keyword> --versions",
          "helm search hub <keyword>",
          "helm pull <chart> --untar",
          "helm show chart <chart>",
          "helm show readme <chart>"
        ],
        "references": [
          {
            "title": "Kho lưu trữ Helm",
            "url": "https://helm.sh/docs/topics/chart_repository/"
          }
        ]
      },
      {
        "name": "Kustomize\nbase",
        "description": "Cấu hình cơ bản",
        "keyPoints": [
          "Xác định cấu hình tài nguyên chung",
          "kustomization.yaml liệt kê tài nguyên",
          "Có thể bao gồm trình tạo (ConfigMap, Secret)",
          "Được tích hợp vào kubectl với cờ -k"
        ],
        "commands": [
          "kubectl apply -k <directory>",
          "kubectl kustomize <directory>",
          "kubectl kustomize <directory> | kubectl apply -f -",
          "kubectl diff -k <directory>",
          "kubectl delete -k <directory>",
          "kubectl get -k <directory>",
          "kustomize build <directory>",
          "kustomize build <directory> | kubectl apply -f -"
        ],
        "references": [
          {
            "title": "Kustomize",
            "url": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/"
          }
        ]
      },
      {
        "name": "Kustomize\noverlay",
        "description": "Các bản vá dành riêng cho môi trường",
        "keyPoints": [
          "Tùy chỉnh lớp trên cùng của cơ sở",
          "Các bản vá: hợp nhất chiến lược, JSON, nội tuyến",
          "Sử dụng phổ biến: namespace, nhãn, bản sao, images",
          "Lớp phủ cho môi trường dev/staging/prod"
        ],
        "commands": [
          "kubectl apply -k overlays/production/",
          "kubectl kustomize overlays/production/",
          "kubectl diff -k overlays/production/",
          "kustomize build overlays/staging/",
          "kustomize build overlays/staging/ | kubectl diff -f -",
          "kubectl apply -k overlays/staging/",
          "kubectl delete -k overlays/production/",
          "kustomize build overlays/production/ | kubectl apply --dry-run=client -f -"
        ],
        "references": [
          {
            "title": "Kustomize",
            "url": "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/"
          }
        ]
      }
    ]
  },
  "cluster-lifecycle": {
    "title": "Quản lý vòng đời cụm",
    "subtitle": "Kiến trúc, cài đặt và cấu hình cụm > Quản lý vòng đời cụm",
    "parent": "cluster-architecture",
    "parentTitle": "Kiến trúc, cài đặt và cấu hình cụm",
    "domainColor": "#4CAF50",
    "nodes": [
      {
        "name": "Nâng cấp\nphiên bản",
        "description": "Nâng cấp phiên bản Kubernetes",
        "keyPoints": [
          "Nâng cấp từng phiên bản nhỏ (e.g., 1.34 -> 1.35)",
          "Thứ tự: kubeadm -> control plane -> kubelet/kubectl -> workers",
          "Xả nodes trước khi nâng cấp",
          "Xác minh bằng gói nâng cấp kubeadm",
          "Luôn đọc ghi chú phát hành trước khi nâng cấp",
          "Đổi kho APT sang nhánh 1.35, nâng kubeadm trước, rồi drain từng node trước khi nâng kubelet; control plane trước worker. Chọn bản vá đề bài yêu cầu."
        ],
        "commands": [
          "apt-get update && apt-get install -y kubeadm=1.35.8-*",
          "kubeadm upgrade plan",
          "kubeadm upgrade apply v1.35.8",
          "kubeadm upgrade apply v1.35.8 --dry-run",
          "kubectl drain <node> --ignore-daemonsets --delete-emptydir-data",
          "apt-get install -y kubelet=1.35.8-* kubectl=1.35.8-*",
          "systemctl daemon-reload && systemctl restart kubelet",
          "kubectl uncordon <node>",
          "kubeadm upgrade node # Trên worker sau khi nâng kubeadm",
          "kubectl get nodes (verify all nodes are Ready with new version)",
          "kubectl version --short"
        ],
        "references": [
          {
            "title": "Nâng cấp cụm kubeadm",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/"
          },
          {
            "title": "Chính sách lệch phiên bản",
            "url": "https://kubernetes.io/releases/version-skew-policy/"
          }
        ]
      },
      {
        "name": "Quản lý node",
        "description": "Thêm, xóa và duy trì nodes",
        "keyPoints": [
          "Xả nodes để bảo trì (đuổi pods an toàn)",
          "Cordon để ngăn chặn việc lập lịch pod mới",
          "Uncord để tiếp tục lên lịch",
          "Xóa node khỏi cụm khi ngừng hoạt động",
          "PodDisruptionBudget bảo vệ workloads trong quá trình tiêu hao"
        ],
        "commands": [
          "kubectl drain <node> --ignore-daemonsets",
          "kubectl drain <node> --ignore-daemonsets --delete-emptydir-data --force",
          "kubectl cordon <node>",
          "kubectl uncordon <node>",
          "kubectl delete node <node>",
          "kubectl get nodes -o wide",
          "kubectl describe node <node>",
          "kubectl get pods -A --field-selector spec.nodeName=<node>",
          "kubectl label node <node> role=worker",
          "kubectl annotate node <node> description='worker-node-01'"
        ],
        "references": [
          {
            "title": "Thoát một nút một cách an toàn",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/"
          },
          {
            "title": "Quản lý cụm",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/"
          }
        ]
      },
      {
        "name": "Sao lưu và\nkhôi phục etcd",
        "description": "Sao lưu trạng thái cụm",
        "keyPoints": [
          "etcd chứa tất cả dữ liệu cụm",
          "Ảnh chụp nhanh thường xuyên rất quan trọng để khắc phục thảm họa",
          "Khôi phục yêu cầu dừng máy chủ API",
          "Luôn xác minh tính toàn vẹn của bản sao lưu",
          "Dùng etcdutl để phục hồi ngoại tuyến vào thư mục mới; cấu hình đúng membership, hostPath và revision bump/mark-compacted. etcdctl dùng để chụp snapshot."
        ],
        "commands": [
          "ETCDCTL_API=3 etcdctl snapshot save /backup/snap.db --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key",
          "etcdutl snapshot restore /backup/snap.db --data-dir=/var/lib/etcd-restored",
          "etcdutl snapshot status /backup/snap.db -w table",
          "ETCDCTL_API=3 etcdctl endpoint health --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key",
          "ETCDCTL_API=3 etcdctl member list --write-out=table --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key",
          "cat /etc/kubernetes/manifests/etcd.yaml",
          "ls /var/lib/etcd/member/"
        ],
        "references": [
          {
            "title": "Vận hành cụm etcd",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/"
          }
        ]
      },
      {
        "name": "Quản lý\nchứng chỉ",
        "description": "Chứng chỉ TLS cho các thành phần cụm",
        "keyPoints": [
          "Chứng chỉ hết hạn sau 1 năm theo mặc định",
          "Chứng chỉ kubeadm được gia hạn để gia hạn",
          "Chứng chỉ được lưu trữ trong /etc/kubernetes/pki/",
          "Kiểm tra hạn sử dụng thường xuyên",
          "kubeadm tự động gia hạn chứng chỉ trong quá trình nâng cấp control plane"
        ],
        "commands": [
          "kubeadm certs check-expiration",
          "kubeadm certs renew all",
          "kubeadm certs renew apiserver",
          "openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -dates",
          "openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -text | grep -A2 Validity",
          "ls /etc/kubernetes/pki/",
          "kubeadm certs certificate-key",
          "kubectl get csr",
          "kubectl certificate approve <csr-name>"
        ],
        "references": [
          {
            "title": "Chứng chỉ và yêu cầu PKI",
            "url": "https://kubernetes.io/docs/setup/best-practices/certificates/"
          },
          {
            "title": "Quản lý chứng chỉ với kubeadm",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/"
          }
        ]
      }
    ]
  },
  "deployments": {
    "title": "Deployment",
    "subtitle": "Workload và lập lịch > Deployment",
    "parent": "workloads-scheduling",
    "parentTitle": "Workload và lập lịch",
    "domainColor": "#FF9800",
    "nodes": [
      {
        "name": "Cập nhật\ncuốn chiếu",
        "description": "Cập nhật triển khai không có thời gian ngừng hoạt động",
        "keyPoints": [
          "Chiến lược mặc định: thay thế dần cũpodsvới cái mới",
          "maxSurge: pods tối đa trên số lượng mong muốn trong quá trình cập nhật",
          "maxUnavailable: pods tối đa có thể không khả dụng trong quá trình cập nhật",
          "Tự động khôi phục khi thất bại với ProgressDeadlineSeconds"
        ],
        "commands": [
          "kubectl set image deployment/myapp myapp=myapp:v2",
          "kubectl set image deployment/myapp myapp=myapp:v2 --record",
          "kubectl rollout status deployment/myapp",
          "kubectl rollout history deployment/myapp",
          "kubectl rollout pause deployment/myapp",
          "kubectl rollout resume deployment/myapp",
          "kubectl get rs -l app=myapp (see old and new ReplicaSets)",
          "kubectl describe deployment myapp (check RollingUpdateStrategy)",
          "kubectl patch deployment myapp -p '{\"spec\":{\"strategy\":{\"rollingUpdate\":{\"maxSurge\":1,\"maxUnavailable\":0}}}}'",
          "kubectl explain deployment.spec.strategy.rollingUpdate"
        ],
        "references": [
          {
            "title": "Thực hiện cập nhật cuộn",
            "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/"
          },
          {
            "title": "Deployments - Cập nhật cuộn",
            "url": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment"
          }
        ]
      },
      {
        "name": "Quay lại\nphiên bản cũ",
        "description": "Hoàn nguyên về phiên bản trước",
        "keyPoints": [
          "Kubernetes lưu giữ lịch sử sửa đổi",
          "Quay lại bản sửa đổi cụ thể hoặc trước đó",
          "revisingHistoryLimit kiểm soát số lượng bản sửa đổi cần giữ",
          "Sử dụng 'Hoàn tác triển khai kubectl' để khôi phục"
        ],
        "commands": [
          "kubectl rollout undo deployment/myapp",
          "kubectl rollout undo deployment/myapp --to-revision=2",
          "kubectl rollout history deployment/myapp",
          "kubectl rollout history deployment/myapp --revision=3",
          "kubectl get rs -l app=myapp",
          "kubectl describe deployment myapp (check revision annotations)",
          "kubectl patch deployment myapp -p '{\"spec\":{\"revisionHistoryLimit\":10}}'",
          "kubectl rollout status deployment/myapp"
        ],
        "references": [
          {
            "title": "Quay lại Deployment",
            "url": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment"
          }
        ]
      },
      {
        "name": "Chiến lược\ntriển khai",
        "description": "RollingUpdate vs Tái tạo",
        "keyPoints": [
          "RollingUpdate: thay thế dần dần (mặc định)",
          "Tạo lại: tiêu diệt tất cả pods cũ, sau đó tạo mới (gây thời gian chết)",
          "Sử dụng Tạo lại khi ứng dụng không thể chạy nhiều phiên bản cùng lúc",
          "Xanh lam và xanh hoàng yến qua labels/services"
        ],
        "commands": [
          "kubectl create deployment myapp --image=myapp:v1 --replicas=3",
          "kubectl create deployment myapp --image=myapp:v1 --dry-run=client -o yaml > deploy.yaml",
          "kubectl scale deployment/myapp --replicas=5",
          "kubectl edit deployment/myapp",
          "kubectl patch deployment myapp -p '{\"spec\":{\"strategy\":{\"type\":\"Recreate\"}}}'",
          "kubectl get deployment myapp -o jsonpath='{.spec.strategy}'",
          "kubectl explain deployment.spec.strategy",
          "kubectl get pods -l app=myapp -w (watch pods during rollout)"
        ],
        "references": [
          {
            "title": "Chiến lược Deployment",
            "url": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy"
          }
        ]
      },
      {
        "name": "Cấu hình\nDeployment",
        "description": "Các trường cấu hình chính",
        "keyPoints": [
          "bản sao: số lượng phiên bản pod mong muốn",
          "bộ chọn: bộ chọn nhãn khớp với mẫu pod",
          "mẫu: Thông số mẫu pod (containers, tập)",
          "chiến lược: chiến lược triển khai (RollingUpdate/Recreate)",
          "minReadySeconds: thời gian chờ trước khi xem xét pod đã sẵn sàng"
        ],
        "commands": [
          "kubectl get deployment myapp -o yaml",
          "kubectl get deployment myapp -o wide",
          "kubectl describe deployment myapp",
          "kubectl apply -f deployment.yaml",
          "kubectl explain deployment.spec",
          "kubectl explain deployment.spec.template.spec.containers",
          "kubectl patch deployment myapp -p '{\"spec\":{\"replicas\":5}}'",
          "kubectl get deployment myapp -o jsonpath='{.spec.selector.matchLabels}'",
          "kubectl label deployment myapp env=prod",
          "kubectl delete deployment myapp"
        ],
        "references": [
          {
            "title": "Deployments",
            "url": "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"
          },
          {
            "title": "Tham khảo Deployment API",
            "url": "https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/deployment-v1/"
          }
        ]
      }
    ]
  },
  "configmaps-secrets": {
    "title": "ConfigMap và Secret",
    "subtitle": "Workload và lập lịch > ConfigMap và Secret",
    "parent": "workloads-scheduling",
    "parentTitle": "Workload và lập lịch",
    "domainColor": "#FF9800",
    "nodes": [
      {
        "name": "ConfigMap",
        "description": "Lưu trữ cấu hình không bí mật",
        "keyPoints": [
          "Cặp khóa-giá trị cho dữ liệu cấu hình",
          "Cấu hình tách rời khỏi container images",
          "Có thể được sử dụng dưới dạng biến môi trường hoặc gắn kết volume",
          "Kích thước tối đa: 1 MiB",
          "ConfigMaps bất biến có thể được đặt bằng bất biến: true"
        ],
        "commands": [
          "kubectl create configmap my-config --from-literal=key1=val1 --from-literal=key2=val2",
          "kubectl create configmap my-config --from-file=config.properties",
          "kubectl create configmap my-config --from-file=<key>=<file-path>",
          "kubectl create configmap my-config --from-env-file=app.env",
          "kubectl get configmaps -n <namespace>",
          "kubectl get configmap my-config -o yaml",
          "kubectl describe configmap my-config",
          "kubectl edit configmap my-config",
          "kubectl delete configmap my-config",
          "kubectl create configmap my-config --dry-run=client -o yaml > configmap.yaml"
        ],
        "references": [
          {
            "title": "ConfigMaps",
            "url": "https://kubernetes.io/docs/concepts/configuration/configmap/"
          },
          {
            "title": "Định cấu hình Pod để sử dụng ConfigMap",
            "url": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/"
          }
        ]
      },
      {
        "name": "Secret",
        "description": "Lưu trữ dữ liệu nhạy cảm",
        "keyPoints": [
          "Mã hóa Base64 (KHÔNG được mã hóa theo mặc định)",
          "Các loại: Opaque, docker-registry, tls, basic-auth, token",
          "Có thể kích hoạt mã hóa khi nghỉ ngơi trong etcd",
          "Được gắn dưới dạng tmpfs (RAM) trong pods",
          "Hỗ trợ Secrets bất biến (không thay đổi: đúng)"
        ],
        "commands": [
          "kubectl create secret generic my-secret --from-literal=password=pass123",
          "kubectl create secret generic my-secret --from-file=ssh-key=~/.ssh/id_rsa",
          "kubectl create secret tls my-tls --cert=cert.pem --key=key.pem",
          "kubectl create secret docker-registry my-reg --docker-server=<registry> --docker-username=<user> --docker-password=<pass>",
          "kubectl get secrets -n <namespace>",
          "kubectl get secret my-secret -o yaml",
          "kubectl describe secret my-secret",
          "kubectl get secret my-secret -o jsonpath='{.data.password}' | base64 -d",
          "kubectl edit secret my-secret",
          "kubectl delete secret my-secret",
          "kubectl create secret generic my-secret --dry-run=client -o yaml > secret.yaml"
        ],
        "references": [
          {
            "title": "Secrets",
            "url": "https://kubernetes.io/docs/concepts/configuration/secret/"
          },
          {
            "title": "Quản lý Secrets",
            "url": "https://kubernetes.io/docs/tasks/configmap-secret/"
          }
        ]
      },
      {
        "name": "Gắn volume",
        "description": "Gắn kết dưới dạng tệp trong containers",
        "keyPoints": [
          "Gắn ConfigMaps/Secrets dưới dạng khối trong pods",
          "Mỗi khóa sẽ trở thành một tệp trong đường dẫn gắn kết",
          "subPath để gắn các khóa cụ thể",
          "Cập nhật tự động lan truyền (không phải với đường dẫn phụ)"
        ],
        "commands": [
          "# In pod spec:\n# volumes:\n#   - name: config-vol\n#     configMap:\n#       name: my-config\n# containers:\n#   - volumeMounts:\n#     - name: config-vol\n#       mountPath: /etc/config",
          "kubectl exec <pod> -- ls /etc/config",
          "kubectl exec <pod> -- cat /etc/config/<key>",
          "kubectl get pod <pod> -o jsonpath='{.spec.volumes}'",
          "kubectl get pod <pod> -o jsonpath='{.spec.containers[*].volumeMounts}'",
          "kubectl explain pod.spec.volumes.configMap",
          "kubectl explain pod.spec.volumes.secret"
        ],
        "references": [
          {
            "title": "Sử dụng ConfigMaps làm tệp",
            "url": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/#add-configmap-data-to-a-volume"
          },
          {
            "title": "Sử dụng Secrets làm tệp",
            "url": "https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-files-from-a-pod"
          }
        ]
      },
      {
        "name": "Biến\nmôi trường",
        "description": "Tiêm dưới dạng env vars",
        "keyPoints": [
          "envFrom: chèn tất cả các khóa dưới dạng env vars",
          "env.valueFrom: chèn các phím cụ thể",
          "Tài liệu tham khảo ConfigMap hoặc Secret",
          "Các biến Env KHÔNG được cập nhật nếu ConfigMap/Secret thay đổi"
        ],
        "commands": [
          "# In pod spec:\n# envFrom:\n#   - configMapRef:\n#       name: my-config\n# env:\n#   - name: MY_VAR\n#     valueFrom:\n#       secretKeyRef:\n#         name: my-secret\n#         key: password",
          "kubectl exec <pod> -- env # Liệt kê biến môi trường",
          "kubectl exec <pod> -- printenv MY_VAR",
          "kubectl set env deployment/myapp MY_VAR=myvalue",
          "kubectl set env deployment/myapp --from=configmap/my-config",
          "kubectl set env deployment/myapp --from=secret/my-secret",
          "kubectl set env deployment/myapp --list",
          "kubectl explain pod.spec.containers.env",
          "kubectl explain pod.spec.containers.envFrom"
        ],
        "references": [
          {
            "title": "Xác định các biến môi trường",
            "url": "https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/"
          },
          {
            "title": "Định cấu hình Pods bằng ConfigMaps",
            "url": "https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/#define-container-environment-variables-using-configmap-data"
          }
        ]
      }
    ]
  },
  "autoscaling": {
    "title": "Tự động co giãn workload",
    "subtitle": "Workload và lập lịch > Tự động co giãn workload",
    "parent": "workloads-scheduling",
    "parentTitle": "Workload và lập lịch",
    "domainColor": "#FF9800",
    "nodes": [
      {
        "name": "HPA",
        "description": "Bộ co giãn tự động Pod ngang",
        "keyPoints": [
          "Tự động co giãn bản sao pod dựa trên số liệu",
          "Hỗ trợ CPU, bộ nhớ và số liệu tùy chỉnh",
          "Yêu cầu máy chủ số liệu đang chạy",
          "Bản sao min/max có thể định cấu hình và sử dụng mục tiêu",
          "Khoảng thời gian đồng bộ hóa mặc định là 15 giây"
        ],
        "commands": [
          "kubectl autoscale deployment myapp --min=2 --max=10 --cpu-percent=80",
          "kubectl get hpa",
          "kubectl get hpa -A",
          "kubectl describe hpa myapp",
          "kubectl get hpa myapp -o yaml",
          "kubectl edit hpa myapp",
          "kubectl delete hpa myapp",
          "kubectl top pods",
          "kubectl top pods -n <namespace> --sort-by=cpu",
          "kubectl explain hpa.spec"
        ],
        "references": [
          {
            "title": "Tự động co giãn Pod theo chiều ngang",
            "url": "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/"
          },
          {
            "title": "Hướng dẫn sử dụng HPA",
            "url": "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/"
          }
        ]
      },
      {
        "name": "VPA",
        "description": "Bộ co giãn tự động Pod dọc",
        "keyPoints": [
          "Điều chỉnh tài nguyên requests/limits cho containers",
          "Chế độ: Tắt (chỉ khuyến nghị), Tự động (áp dụng thay đổi)",
          "Yêu cầu bộ điều khiển tiếp nhận VPA",
          "Không thể sử dụng với HPA trên cùng số liệu CPU/memory"
        ],
        "commands": [
          "kubectl get vpa",
          "kubectl get vpa -A",
          "kubectl describe vpa <name>",
          "kubectl get vpa <name> -o yaml",
          "kubectl apply -f vpa.yaml",
          "kubectl delete vpa <name>",
          "kubectl get pods -n kube-system | grep vpa",
          "kubectl top pods (compare actual vs recommended)"
        ],
        "references": [
          {
            "title": "Tự động điều chỉnh workload",
            "url": "https://kubernetes.io/docs/concepts/workloads/autoscaling/"
          }
        ]
      },
      {
        "name": "Metrics Server",
        "description": "Thu thập số liệu sử dụng tài nguyên",
        "keyPoints": [
          "Thu thập mức sử dụng CPU/memory từ kubelets",
          "Bắt buộc đối với HPA và 'kubectl top'",
          "Chạy dưới dạng triển khai trong kube-system",
          "KHÔNG lưu trữ số liệu lâu dài",
          "Truy vấn điểm cuối /metrics/resource của kubelet"
        ],
        "commands": [
          "kubectl top nodes",
          "kubectl top nodes --sort-by=cpu",
          "kubectl top pods",
          "kubectl top pods -A --sort-by=memory",
          "kubectl top pods --containers",
          "kubectl top pods -n <namespace> --sort-by=cpu",
          "kubectl get deployment metrics-server -n kube-system",
          "kubectl get pods -n kube-system | grep metrics-server",
          "kubectl logs -n kube-system -l k8s-app=metrics-server",
          "kubectl get apiservice v1beta1.metrics.k8s.io"
        ],
        "references": [
          {
            "title": "Quy trình đo lường tài nguyên",
            "url": "https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/"
          }
        ]
      },
      {
        "name": "Resize Pod\ntại chỗ",
        "description": "Điều chỉnh CPU và bộ nhớ; ổn định trong 1.35",
        "keyPoints": [
          "Dùng subresource /resize để thay requests/limits CPU và bộ nhớ của từng container.",
          "resizePolicy quyết định có cần khởi động lại container; không phải mọi lần resize đều không gián đoạn.",
          "Giữ nguyên lớp QoS; kiểm tra PodResizePending và PodResizeInProgress nếu thay đổi chưa được áp dụng.",
          "VPA là thành phần bổ sung; cập nhật template của Deployment vẫn tạo rollout."
        ],
        "commands": [
          "kubectl explain pod.spec.containers.resizePolicy",
          "kubectl get pod <pod> -o yaml"
        ],
        "references": [
          {
            "title": "Resize tài nguyên container trong Kubernetes 1.35",
            "url": "https://v1-35.docs.kubernetes.io/docs/tasks/configure-pod-container/resize-container-resources/"
          }
        ]
      }
    ]
  },
  "self-healing": {
    "title": "Workload tự phục hồi",
    "subtitle": "Workload và lập lịch > Workload tự phục hồi",
    "parent": "workloads-scheduling",
    "parentTitle": "Workload và lập lịch",
    "domainColor": "#FF9800",
    "nodes": [
      {
        "name": "ReplicaSet",
        "description": "Đảm bảo số lượng pod mong muốn",
        "keyPoints": [
          "Duy trì bộ bản sao pods ổn định",
          "Sử dụng bộ chọn nhãn để xác định pods",
          "Tự động creates/deletes pods để khớp với số lượng mong muốn",
          "Thường được quản lý bởi Deployments (không tạo trực tiếp)"
        ],
        "commands": [
          "kubectl get replicasets",
          "kubectl get rs -A",
          "kubectl get rs -o wide",
          "kubectl describe rs <name>",
          "kubectl get rs <name> -o yaml",
          "kubectl scale rs <name> --replicas=3",
          "kubectl delete rs <name>",
          "kubectl get rs -l app=myapp",
          "kubectl explain replicaset.spec"
        ],
        "references": [
          {
            "title": "ReplicaSet",
            "url": "https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/"
          }
        ]
      },
      {
        "name": "DaemonSet",
        "description": "Chạy pod trên mọi node",
        "keyPoints": [
          "Đảm bảo bản sao của pod chạy trên tất cả (hoặc được chọn) nodes",
          "Các trường hợp sử dụng: thu thập nhật ký, tác nhân giám sát, kết nối mạng (CNI, kube-proxy)",
          "Pods được thêm vào khi nodes mới tham gia cụm",
          "Hỗ trợ các chiến lược cập nhật: RollingUpdate, OnDelete"
        ],
        "commands": [
          "kubectl get daemonsets -A",
          "kubectl get ds -n <namespace>",
          "kubectl describe daemonset <name> -n <namespace>",
          "kubectl get ds <name> -o yaml",
          "kubectl rollout status daemonset/<name>",
          "kubectl rollout history daemonset/<name>",
          "kubectl set image daemonset/<name> <container>=<image>:<tag>",
          "kubectl delete daemonset <name>",
          "kubectl explain daemonset.spec.updateStrategy",
          "kubectl get pods -l app=<ds-label> -o wide"
        ],
        "references": [
          {
            "title": "DaemonSet",
            "url": "https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/"
          }
        ]
      },
      {
        "name": "StatefulSet",
        "description": "Ứng dụng trạng thái workloads",
        "keyPoints": [
          "Nhận dạng mạng ổn định, duy nhất cho mỗi pod",
          "Triển khai và mở rộng quy mô theo thứ tự, duyên dáng",
          "Lưu trữ ổn định liên tục thông qua PVC",
          "Tên Pod: <statefulset-name>-0, -1, -2...",
          "Yêu cầu Service không đầu để nhận dạng mạng"
        ],
        "commands": [
          "kubectl get statefulsets",
          "kubectl get sts -A",
          "kubectl describe statefulset <name>",
          "kubectl get sts <name> -o yaml",
          "kubectl scale statefulset <name> --replicas=5",
          "kubectl rollout status statefulset/<name>",
          "kubectl rollout history statefulset/<name>",
          "kubectl delete statefulset <name> --cascade=orphan",
          "kubectl get pvc -l app=<sts-label> (check associated PVCs)",
          "kubectl explain statefulset.spec.podManagementPolicy"
        ],
        "references": [
          {
            "title": "StatefulSets",
            "url": "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/"
          },
          {
            "title": "Thông tin cơ bản về StatefulSet",
            "url": "https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/"
          }
        ]
      },
      {
        "name": "Job",
        "description": "Chạy đến khi hoàn thành workloads",
        "keyPoints": [
          "Chạy pods để hoàn thành thành công",
          "hoàn thành: số lần chạy thành công cần thiết",
          "song song: tối đa pods chạy song song",
          "backoffLimit: số lần thử lại tối đa trước khi xem xét thất bại",
          "activeDeadlineSeconds: hết thời gian cho công việc"
        ],
        "commands": [
          "kubectl create job my-job --image=busybox -- echo 'hello'",
          "kubectl create job my-job --image=busybox --dry-run=client -o yaml -- echo 'hello'",
          "kubectl get jobs",
          "kubectl get jobs -A",
          "kubectl describe job my-job",
          "kubectl get job my-job -o yaml",
          "kubectl logs job/my-job",
          "kubectl delete job my-job",
          "kubectl get pods --selector=job-name=my-job",
          "kubectl explain job.spec.completions",
          "kubectl explain job.spec.parallelism"
        ],
        "references": [
          {
            "title": "Jobs",
            "url": "https://kubernetes.io/docs/concepts/workloads/controllers/job/"
          }
        ]
      },
      {
        "name": "CronJob",
        "description": "Nhiệm vụ định kỳ theo lịch trình",
        "keyPoints": [
          "Chạy Jobs theo lịch trình cron",
          "Định dạng lịch trình: phút giờ ngày trong tháng tháng ngày trong tuần",
          "concurrencyPolicy: Cho phép, Cấm, Thay thế",
          "thành côngJobsHistoryLimit & thất bạiJobsHistoryLimit"
        ],
        "commands": [
          "kubectl create cronjob my-cron --image=busybox --schedule='*/5 * * * *' -- echo 'hello'",
          "kubectl create cronjob my-cron --image=busybox --schedule='*/5 * * * *' --dry-run=client -o yaml -- echo 'hello'",
          "kubectl get cronjobs",
          "kubectl get cj -A",
          "kubectl describe cronjob my-cron",
          "kubectl get cronjob my-cron -o yaml",
          "kubectl delete cronjob my-cron",
          "kubectl create job --from=cronjob/my-cron manual-job-001",
          "kubectl get jobs --selector=cronjob=my-cron",
          "kubectl explain cronjob.spec.concurrencyPolicy"
        ],
        "references": [
          {
            "title": "CronJob",
            "url": "https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/"
          },
          {
            "title": "Running Tác vụ tự động với CronJob",
            "url": "https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/"
          }
        ]
      }
    ]
  },
  "pod-admission-scheduling": {
    "title": "Tiếp nhận và lập lịch Pod",
    "subtitle": "Workload và lập lịch > Tiếp nhận và lập lịch Pod",
    "parent": "workloads-scheduling",
    "parentTitle": "Workload và lập lịch",
    "domainColor": "#FF9800",
    "nodes": [
      {
        "name": "nodeSelector",
        "description": "Lựa chọn node đơn giản",
        "keyPoints": [
          "Cách đơn giản nhất để hạn chế pods ở nodes cụ thể",
          "Khớp nhãn node (cặp khóa-giá trị)",
          "Pod sẽ không được lên lịch nếu không có node khớp",
          "Dán nhãn nodes trước, sau đó sử dụng trong thông số pod"
        ],
        "commands": [
          "kubectl label nodes <node> disktype=ssd",
          "kubectl label nodes <node> disktype- (remove label)",
          "kubectl get nodes --show-labels",
          "kubectl get nodes -l disktype=ssd",
          "# In pod spec:\n# nodeSelector:\n#   disktype: ssd",
          "kubectl run test-pod --image=nginx --overrides='{\"spec\":{\"nodeSelector\":{\"disktype\":\"ssd\"}}}' --dry-run=client -o yaml",
          "kubectl describe pod <pod> | grep -A5 'Node-Selectors'",
          "kubectl explain pod.spec.nodeSelector"
        ],
        "references": [
          {
            "title": "Gán Pods cho các nút",
            "url": "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector"
          }
        ]
      },
      {
        "name": "Node affinity",
        "description": "Quy tắc lựa chọn node nâng cao",
        "keyPoints": [
          "bắt buộcDuringSchedulingIgnoredDuringExecution (quy tắc cứng)",
          "ưa thíchDuringSchedulingIgnoredDuringExecution (quy tắc mềm)",
          "Hỗ trợ các toán tử In, NotIn, Exists, DoesNotExist",
          "Biểu cảm hơn nodeSelector",
          "Chống ái lực Pod lan truyền pods trên nodes"
        ],
        "commands": [
          "kubectl get nodes --show-labels",
          "kubectl label nodes <node> zone=us-east-1a",
          "kubectl get nodes -l zone=us-east-1a",
          "kubectl describe pod <pod> | grep -A10 'Node-Selectors\\|Tolerations\\|Affinity'",
          "kubectl explain pod.spec.affinity.nodeAffinity",
          "kubectl explain pod.spec.affinity.podAffinity",
          "kubectl explain pod.spec.affinity.podAntiAffinity",
          "kubectl get pods -o wide (check node placement)"
        ],
        "references": [
          {
            "title": "Ái lực và phản ái lực",
            "url": "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity"
          }
        ]
      },
      {
        "name": "Taint và\ntoleration",
        "description": "Đẩy lùi pods khỏi nodes",
        "keyPoints": [
          "Taint được thiết lập trên nodes để đẩy lùi pods",
          "Toleration được đặt trên pods để cho phép lập lịch trên nodes có taint",
          "Hiệu ứng: NoSchedule, PreferNoSchedule, NoExecute",
          "Control plane nodes bị nhiễm bẩn theo mặc định"
        ],
        "commands": [
          "kubectl taint nodes <node> key=value:NoSchedule",
          "kubectl taint nodes <node> key=value:NoSchedule- (remove taint)",
          "kubectl taint nodes <node> key=value:NoExecute",
          "kubectl taint nodes <node> key=value:PreferNoSchedule",
          "kubectl describe node <node> | grep -i taint",
          "kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.spec.taints}{\"\\n\"}{end}'",
          "kubectl explain pod.spec.tolerations",
          "kubectl describe pod <pod> | grep -A5 Tolerations"
        ],
        "references": [
          {
            "title": "Taint và toleration",
            "url": "https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/"
          }
        ]
      },
      {
        "name": "Giới hạn\ntài nguyên",
        "description": "Hạn chế về CPU và bộ nhớ",
        "keyPoints": [
          "requests: tài nguyên được đảm bảo tối thiểu",
          "limits: tài nguyên tối đa được phép",
          "Pods vượt quá bộ nhớ limits là OOMKilled",
          "Pods vượt quá CPU limits đang được điều chỉnh",
          "Các lớp QoS: Đảm bảo, Ổn định, BestEffort"
        ],
        "commands": [
          "kubectl describe pod <pod> (check Resources section)",
          "kubectl top pods",
          "kubectl top pods --sort-by=memory",
          "kubectl describe node <node> (check Allocated resources)",
          "kubectl get pod <pod> -o jsonpath='{.spec.containers[*].resources}'",
          "kubectl set resources deployment/myapp --requests=cpu=100m,memory=128Mi --limits=cpu=500m,memory=256Mi",
          "kubectl explain pod.spec.containers.resources",
          "kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.status.qosClass}{\"\\n\"}{end}'"
        ],
        "references": [
          {
            "title": "Quản lý tài nguyên cho container",
            "url": "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/"
          },
          {
            "title": "Chất lượng tài nguyên của Service",
            "url": "https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/"
          }
        ]
      },
      {
        "name": "Độ ưu tiên\nPod",
        "description": "Lập lịch dựa trên mức độ ưu tiên",
        "keyPoints": [
          "PriorityClass xác định mức độ ưu tiên",
          "pods có mức ưu tiên cao hơn có thể ưu tiên pods có mức ưu tiên thấp hơn",
          "hệ thống-cụm quan trọng và hệ thống-node-quan trọng được tích hợp sẵn",
          "preemptionPolicy: PreemptLowerPriority hoặc Never"
        ],
        "commands": [
          "kubectl get priorityclasses",
          "kubectl describe priorityclass <name>",
          "kubectl get priorityclass <name> -o yaml",
          "kubectl apply -f priorityclass.yaml",
          "kubectl delete priorityclass <name>",
          "kubectl explain priorityclass",
          "kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.spec.priorityClassName}{\"\\n\"}{end}'",
          "kubectl describe pod <pod> | grep Priority"
        ],
        "references": [
          {
            "title": "Ưu tiên và ưu tiên Pod",
            "url": "https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/"
          }
        ]
      }
    ]
  },
  "pod-connectivity": {
    "title": "Kết nối giữa các Pod",
    "subtitle": "Service và mạng > Kết nối giữa các Pod",
    "parent": "services-networking",
    "parentTitle": "Service và mạng",
    "domainColor": "#2196F3",
    "nodes": [
      {
        "name": "Mô hình\nmạng Pod",
        "description": "Nguyên tắc cơ bản về mạng Kubernetes",
        "keyPoints": [
          "Mỗi pod đều có địa chỉ IP riêng",
          "Pods có thể giao tiếp với bất kỳ pod nào khác mà không cần NAT",
          "Các đại lý trên node có thể giao tiếp với tất cả pods trên node đó",
          "Mạng phẳng: tất cả pods trong một không gian địa chỉ duy nhất"
        ],
        "commands": [
          "kubectl get pods -o wide (see pod IPs)",
          "kubectl get pods -A -o wide",
          "kubectl exec <pod> -- curl <other-pod-ip>:<port>",
          "kubectl exec <pod> -- ping <other-pod-ip>",
          "kubectl exec <pod> -- ip addr",
          "kubectl exec <pod> -- ip route",
          "kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.status.podIP}{\"\\n\"}{end}'",
          "kubectl cluster-info dump | grep -i cidr"
        ],
        "references": [
          {
            "title": "Mạng cụm",
            "url": "https://kubernetes.io/docs/concepts/cluster-administration/networking/"
          },
          {
            "title": "Mô hình mạng Kubernetes",
            "url": "https://kubernetes.io/docs/concepts/services-networking/#the-kubernetes-network-model"
          }
        ]
      },
      {
        "name": "Plugin CNI",
        "description": "Triển khai mạng",
        "keyPoints": [
          "Calico: Dựa trên BGP, chính sách mạng, hiệu suất cao",
          "Flannel: mạng lớp phủ đơn giản sử dụng VXLAN",
          "Cilium: khả năng quan sát và bảo mật nâng cao dựa trên eBPF",
          "Dệt: lớp phủ lưới, thiết lập dễ dàng"
        ],
        "commands": [
          "kubectl get pods -n kube-system | grep -E 'calico|flannel|cilium|weave'",
          "ls /etc/cni/net.d/",
          "cat /etc/cni/net.d/*.conflist",
          "kubectl get nodes -o wide",
          "kubectl logs -n kube-system <cni-pod>",
          "kubectl describe pod -n kube-system <cni-pod>",
          "ls /opt/cni/bin/",
          "kubectl get ds -n kube-system (check CNI DaemonSets)",
          "ip route (check pod network routes on node)"
        ],
        "references": [
          {
            "title": "Plugin mạng",
            "url": "https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/"
          },
          {
            "title": "Cài đặt tiện ích bổ sung mạng Pod",
            "url": "https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#pod-network"
          }
        ]
      },
      {
        "name": "DNS của Pod",
        "description": "Phân giải DNS cho pods",
        "keyPoints": [
          "Pods nhận các mục DNS: <pod-ip-dashed>.<namespace>.pod.cluster.local",
          "Cấu hình DNS có thể được tùy chỉnh trong thông số pod",
          "dnsPolicy: Mặc định, ClusterFirst, ClusterFirstWithHostNet, Không có",
          "/etc/resolv.conf trỏ đến dịch vụ CoreDNS"
        ],
        "commands": [
          "kubectl exec <pod> -- cat /etc/resolv.conf",
          "kubectl exec <pod> -- nslookup kubernetes.default",
          "kubectl exec <pod> -- nslookup <service>.<namespace>.svc.cluster.local",
          "kubectl run dnstest --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default",
          "kubectl get svc -n kube-system kube-dns",
          "kubectl get pod <pod> -o jsonpath='{.spec.dnsPolicy}'",
          "kubectl explain pod.spec.dnsPolicy",
          "kubectl explain pod.spec.dnsConfig"
        ],
        "references": [
          {
            "title": "DNS dành cho Services và Pods",
            "url": "https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/"
          }
        ]
      }
    ]
  },
  "service-types": {
    "title": "Các loại Service",
    "subtitle": "Service và mạng > Các loại Service",
    "parent": "services-networking",
    "parentTitle": "Service và mạng",
    "domainColor": "#2196F3",
    "nodes": [
      {
        "name": "ClusterIP",
        "description": "Chỉ truy cập cụm nội bộ",
        "keyPoints": [
          "Loại dịch vụ mặc định",
          "Chỉ có thể truy cập trong cụm",
          "IP ảo được chỉ định bởi cụm",
          "Sử dụng để liên lạc microservice nội bộ"
        ],
        "commands": [
          "kubectl expose deployment myapp --port=80 --target-port=8080",
          "kubectl get svc myapp",
          "kubectl get svc myapp -o yaml",
          "kubectl describe svc myapp",
          "kubectl get endpoints myapp",
          "kubectl exec <pod> -- curl myapp.default.svc.cluster.local",
          "kubectl exec <pod> -- curl <cluster-ip>:80",
          "kubectl edit svc myapp",
          "kubectl delete svc myapp",
          "kubectl create service clusterip myapp --tcp=80:8080 --dry-run=client -o yaml"
        ],
        "references": [
          {
            "title": "Service - ClusterIP",
            "url": "https://kubernetes.io/docs/concepts/services-networking/service/#type-clusterip"
          }
        ]
      },
      {
        "name": "NodePort",
        "description": "Truy cập bên ngoài qua cổng node",
        "keyPoints": [
          "Hiển thị dịch vụ trên mỗi IP của node tại một cổng tĩnh",
          "Phạm vi cổng: 30000-32767",
          "Có thể truy cập từ bên ngoài cụm thông qua <NodeIP>:<NodePort>",
          "Được xây dựng trên ClusterIP"
        ],
        "commands": [
          "kubectl expose deployment myapp --type=NodePort --port=80 --target-port=8080",
          "kubectl get svc myapp",
          "kubectl get svc myapp -o yaml",
          "kubectl describe svc myapp",
          "kubectl get svc myapp -o jsonpath='{.spec.ports[0].nodePort}'",
          "curl <node-ip>:<node-port>",
          "kubectl get endpoints myapp",
          "kubectl create service nodeport myapp --tcp=80:8080 --node-port=30080 --dry-run=client -o yaml",
          "kubectl get nodes -o wide (get node IPs for testing)"
        ],
        "references": [
          {
            "title": "Service - NodePort",
            "url": "https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport"
          }
        ]
      },
      {
        "name": "LoadBalancer",
        "description": "Cân bằng tải của nhà cung cấp đám mây",
        "keyPoints": [
          "Cung cấp bộ cân bằng tải bên ngoài (chỉ trên đám mây)",
          "Được xây dựng trên NodePort và ClusterIP",
          "Bộ điều khiển đám mây phân bổ IP bên ngoài",
          "Tốt nhất để truy cập bên ngoài sản xuất trên đám mây"
        ],
        "commands": [
          "kubectl expose deployment myapp --type=LoadBalancer --port=80 --target-port=8080",
          "kubectl get svc myapp (check EXTERNAL-IP)",
          "kubectl get svc myapp -o yaml",
          "kubectl describe svc myapp",
          "kubectl get svc myapp -o jsonpath='{.status.loadBalancer.ingress[0].ip}'",
          "kubectl get endpoints myapp",
          "curl <external-ip>:80",
          "kubectl get events --field-selector involvedObject.name=myapp"
        ],
        "references": [
          {
            "title": "Service - LoadBalancer",
            "url": "https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer"
          }
        ]
      },
      {
        "name": "ExternalName",
        "description": "Bí danh CNAME DNS",
        "keyPoints": [
          "Ánh xạ dịch vụ tới tên DNS bên ngoài",
          "Trả về bản ghi CNAME",
          "Không có proxy hoặc ánh xạ cổng",
          "Sử dụng để tham khảo dịch vụ bên ngoài"
        ],
        "commands": [
          "kubectl create service externalname my-svc --external-name=api.example.com",
          "kubectl get svc my-svc",
          "kubectl get svc my-svc -o yaml",
          "kubectl describe svc my-svc",
          "kubectl exec <pod> -- nslookup my-svc.default.svc.cluster.local",
          "kubectl delete svc my-svc"
        ],
        "references": [
          {
            "title": "Service - ExternalName",
            "url": "https://kubernetes.io/docs/concepts/services-networking/service/#externalname"
          }
        ]
      },
      {
        "name": "Endpoint và\nEndpointSlice",
        "description": "Theo dõi pod phụ trợ",
        "keyPoints": [
          "Endpoints: danh sách các cặp IP:cổng cho pods của dịch vụ",
          "EndpointSlices: thay thế có thể mở rộng cho Endpoints",
          "Được quản lý tự động bởi bộ điều khiển Endpoints",
          "Hướng dẫn sử dụng Endpoints cho các dịch vụ bên ngoài không có bộ chọn",
          "Endpoints deprecated từ 1.33; ưu tiên EndpointSlice khi tra cứu backend.",
          "trafficDistribution PreferSameZone/PreferSameNode là ưu tiên vị trí; khác với chính sách Local."
        ],
        "commands": [
          "kubectl get endpoints myapp",
          "kubectl get endpoints -A",
          "kubectl describe endpoints myapp",
          "kubectl get endpoints myapp -o yaml",
          "kubectl get endpointslices",
          "kubectl get endpointslices -l kubernetes.io/service-name=myapp",
          "kubectl describe endpointslice <name>",
          "kubectl get endpointslices -o yaml",
          "kubectl get endpointslices -n <namespace> -l kubernetes.io/service-name=<service> -o yaml"
        ],
        "references": [
          {
            "title": "Endpoints",
            "url": "https://kubernetes.io/docs/concepts/services-networking/service/#endpoints"
          },
          {
            "title": "EndpointSlices",
            "url": "https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/"
          }
        ]
      }
    ]
  },
  "gateway-api": {
    "title": "Gateway API",
    "subtitle": "Service và mạng > Gateway API",
    "parent": "services-networking",
    "parentTitle": "Service và mạng",
    "domainColor": "#2196F3",
    "nodes": [
      {
        "name": "Gateway",
        "description": "Cơ sở hạ tầng định tuyến giao thông",
        "keyPoints": [
          "Đại diện cho một trình cân bằng tải hoặc phiên bản proxy",
          "Xác định trình nghe (cổng, giao thức, TLS)",
          "Được quản lý bởi nhà cung cấp cơ sở hạ tầng",
          "Thay thế vai trò của bộ điều khiển Ingress"
        ],
        "commands": [
          "kubectl get gateways",
          "kubectl get gateways -A",
          "kubectl describe gateway <name>",
          "kubectl get gateway <name> -o yaml",
          "kubectl apply -f gateway.yaml",
          "kubectl delete gateway <name>",
          "kubectl get gatewayclasses",
          "kubectl explain gateway.spec"
        ],
        "references": [
          {
            "title": "Gateway API",
            "url": "https://kubernetes.io/docs/concepts/services-networking/gateway/"
          },
          {
            "title": "Tài liệu Gateway API",
            "url": "https://gateway-api.sigs.k8s.io/"
          }
        ]
      },
      {
        "name": "HTTPRoute",
        "description": "Quy tắc định tuyến lưu lượng HTTP",
        "keyPoints": [
          "Xác định quy tắc định tuyến lưu lượng HTTP",
          "Hỗ trợ kết hợp dựa trên đường dẫn, dựa trên tiêu đề, dựa trên phương thức",
          "Có thể định tuyến đến nhiều phụ trợ (phân chia lưu lượng truy cập có trọng số)",
          "Gắn vào Gateway thông qua parentRefs"
        ],
        "commands": [
          "kubectl get httproutes",
          "kubectl get httproutes -A",
          "kubectl describe httproute <name>",
          "kubectl get httproute <name> -o yaml",
          "kubectl apply -f httproute.yaml",
          "kubectl delete httproute <name>",
          "kubectl explain httproute.spec.rules"
        ],
        "references": [
          {
            "title": "Gateway API - HTTPRoute",
            "url": "https://kubernetes.io/docs/concepts/services-networking/gateway/#api-kind-httproute"
          },
          {
            "title": "Tài liệu HTTPRoute",
            "url": "https://gateway-api.sigs.k8s.io/api-types/httproute/"
          }
        ]
      },
      {
        "name": "GRPCRoute và\nTLSRoute",
        "description": "Định tuyến theo giao thức cụ thể",
        "keyPoints": [
          "GRPCRoute: định tuyến cho các dịch vụ gRPC",
          "TLSRoute: định tuyến dựa trên TLS SNI",
          "TCPRoute/UDPRoute: Định tuyến lưu lượng L4",
          "Mỗi loại tuyến xử lý các nhu cầu giao thức cụ thể"
        ],
        "commands": [
          "kubectl get grpcroutes",
          "kubectl get grpcroutes -A",
          "kubectl describe grpcroute <name>",
          "kubectl get tlsroutes",
          "kubectl get tlsroutes -A",
          "kubectl describe tlsroute <name>",
          "kubectl get tcproutes",
          "kubectl get udproutes"
        ],
        "references": [
          {
            "title": "Gateway API",
            "url": "https://kubernetes.io/docs/concepts/services-networking/gateway/"
          },
          {
            "title": "Tài liệu GRPCRoute",
            "url": "https://gateway-api.sigs.k8s.io/api-types/grpcroute/"
          }
        ]
      },
      {
        "name": "GatewayClass",
        "description": "Các loại triển khai Gateway",
        "keyPoints": [
          "Xác định bộ điều khiển nào triển khai Gateway",
          "Tương tự với IngressClass cho Ingress",
          "Tài nguyên trong phạm vi cụm",
          "Ví dụ: istio, nginx, đặc phái viên, traefik, cilium"
        ],
        "commands": [
          "kubectl get gatewayclasses",
          "kubectl describe gatewayclass <name>",
          "kubectl get gatewayclass <name> -o yaml",
          "kubectl apply -f gatewayclass.yaml",
          "kubectl delete gatewayclass <name>",
          "kubectl explain gatewayclass.spec",
          "kubectl get crds | grep gateway"
        ],
        "references": [
          {
            "title": "Gateway API - GatewayClass",
            "url": "https://kubernetes.io/docs/concepts/services-networking/gateway/#api-kind-gatewayclass"
          },
          {
            "title": "Tài liệu GatewayClass",
            "url": "https://gateway-api.sigs.k8s.io/api-types/gatewayclass/"
          }
        ]
      }
    ]
  },
  "ingress": {
    "title": "Ingress",
    "subtitle": "Service và mạng > Ingress",
    "parent": "services-networking",
    "parentTitle": "Service và mạng",
    "domainColor": "#2196F3",
    "nodes": [
      {
        "name": "Ingress\ncontroller",
        "description": "Triển khai tài nguyên Ingress",
        "keyPoints": [
          "Ingress NGINX cộng đồng kết thúc bảo trì tháng 3/2026; API Ingress vẫn tồn tại. Dùng controller còn bảo trì cho cụm mới.",
          "Cần thiết để tài nguyên Ingress hoạt động",
          "Phổ biến: Bộ điều khiển NGINX Ingress, Traefik, HAProxy",
          "Chạy dưới dạng Deployment/DaemonSet trong cụm",
          "Theo dõi tài nguyên Ingress và định cấu hình định tuyến"
        ],
        "commands": [
          "kubectl get pods -n ingress-nginx",
          "kubectl get ingressclass",
          "kubectl describe ingressclass <name>",
          "kubectl get ingressclass -o yaml",
          "kubectl logs -n ingress-nginx <controller-pod>",
          "kubectl describe pod -n ingress-nginx <controller-pod>",
          "kubectl get svc -n ingress-nginx",
          "kubectl get deployment -n ingress-nginx"
        ],
        "references": [
          {
            "title": "Bộ điều khiển Ingress",
            "url": "https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/"
          }
        ]
      },
      {
        "name": "Tài nguyên\nIngress",
        "description": "Định nghĩa quy tắc định tuyến",
        "keyPoints": [
          "Xác định định tuyến HTTP/HTTPS tới các dịch vụ phụ trợ",
          "Định tuyến dựa trên máy chủ và dựa trên đường dẫn",
          "Có thể chỉ định phụ trợ mặc định",
          "Chú thích cho cấu hình dành riêng cho bộ điều khiển"
        ],
        "commands": [
          "kubectl get ingress",
          "kubectl get ingress -A",
          "kubectl describe ingress <name>",
          "kubectl get ingress <name> -o yaml",
          "kubectl create ingress myingress --rule='host/path=svc:port'",
          "kubectl create ingress myingress --rule='myapp.example.com/=myapp-svc:80' --dry-run=client -o yaml",
          "kubectl edit ingress <name>",
          "kubectl delete ingress <name>",
          "kubectl explain ingress.spec.rules",
          "curl -H 'Host: myapp.example.com' http://<ingress-ip>"
        ],
        "references": [
          {
            "title": "Ingress",
            "url": "https://kubernetes.io/docs/concepts/services-networking/ingress/"
          }
        ]
      },
      {
        "name": "Kết thúc TLS",
        "description": "Hỗ trợ HTTPS",
        "keyPoints": [
          "Chứng chỉ TLS được lưu dưới dạng Kubernetes Secrets",
          "Ingress chấm dứt TLS và chuyển tiếp HTTP tới các chương trình phụ trợ",
          "Nhiều máy chủ có thể có chứng chỉ khác nhau",
          "người quản lý chứng chỉ có thể tự động cấp chứng chỉ"
        ],
        "commands": [
          "kubectl create secret tls my-tls --cert=cert.pem --key=key.pem",
          "kubectl get secret my-tls -o yaml",
          "kubectl describe secret my-tls",
          "# In ingress spec:\n# tls:\n#   - hosts: [myapp.example.com]\n#     secretName: my-tls",
          "kubectl create ingress myingress --rule='myapp.example.com/=myapp-svc:80,tls=my-tls' --dry-run=client -o yaml",
          "curl -k https://myapp.example.com (test TLS)",
          "openssl s_client -connect <ingress-ip>:443 -servername myapp.example.com",
          "kubectl explain ingress.spec.tls"
        ],
        "references": [
          {
            "title": "Ingress TLS",
            "url": "https://kubernetes.io/docs/concepts/services-networking/ingress/#tls"
          }
        ]
      },
      {
        "name": "Định tuyến\ntheo đường dẫn",
        "description": "Định tuyến đường dẫn URL",
        "keyPoints": [
          "pathType: Tiền tố, Chính xác, Triển khai cụ thể",
          "Tiền tố: khớp với tiền tố đường dẫn URL",
          "Chính xác: khớp với đường dẫn URL chính xác",
          "Nhiều đường dẫn có thể định tuyến đến các dịch vụ khác nhau"
        ],
        "commands": [
          "kubectl get ingress -o wide",
          "kubectl describe ingress <name>",
          "kubectl get ingress <name> -o yaml",
          "kubectl create ingress multi-path --rule='/api/*=api-svc:80' --rule='/web/*=web-svc:80' --dry-run=client -o yaml",
          "kubectl explain ingress.spec.rules.http.paths.pathType",
          "curl http://<ingress-ip>/api/",
          "curl http://<ingress-ip>/web/",
          "kubectl get ingress <name> -o jsonpath='{.spec.rules[*].http.paths}'"
        ],
        "references": [
          {
            "title": "Các loại đường dẫn Ingress",
            "url": "https://kubernetes.io/docs/concepts/services-networking/ingress/#path-types"
          }
        ]
      }
    ]
  },
  "network-policies": {
    "title": "Chính sách mạng",
    "subtitle": "Service và mạng > Chính sách mạng",
    "parent": "services-networking",
    "parentTitle": "Service và mạng",
    "domainColor": "#2196F3",
    "nodes": [
      {
        "name": "Quy tắc\nlưu lượng vào",
        "description": "Kiểm soát lưu lượng truy cập đến",
        "keyPoints": [
          "Xác định lưu lượng truy cập nào được phép VÀO pods đã chọn",
          "So khớp theo: podSelector, namespaceSelector, ipBlock",
          "Đầu vào trống = từ chối tất cả lưu lượng truy cập đến",
          "Sự vắng mặt của NetworkPolicy = tất cả lưu lượng truy cập được phép"
        ],
        "commands": [
          "kubectl get networkpolicies -n <namespace>",
          "kubectl get netpol -A",
          "kubectl describe networkpolicy <name> -n <namespace>",
          "kubectl get networkpolicy <name> -o yaml",
          "kubectl apply -f netpol.yaml",
          "kubectl delete networkpolicy <name> -n <namespace>",
          "kubectl explain networkpolicy.spec.ingress",
          "kubectl exec <pod> -- curl <target-pod-ip>:<port> (test if traffic is allowed)"
        ],
        "references": [
          {
            "title": "Chính sách mạng",
            "url": "https://kubernetes.io/docs/concepts/services-networking/network-policies/"
          }
        ]
      },
      {
        "name": "Quy tắc\nlưu lượng ra",
        "description": "Kiểm soát lưu lượng đi",
        "keyPoints": [
          "Xác định lưu lượng truy cập nào được phép NGOÀI pods đã chọn",
          "So khớp theo: podSelector, namespaceSelector, ipBlock",
          "Có thể hạn chế quyền truy cập DNS (cổng 53)",
          "Quan trọng về bảo mật: hạn chế quyền truy cập từ bên ngoài"
        ],
        "commands": [
          "kubectl apply -f egress-policy.yaml",
          "kubectl get networkpolicies -n <namespace>",
          "kubectl describe networkpolicy <name> -n <namespace>",
          "kubectl get networkpolicy <name> -o yaml",
          "kubectl explain networkpolicy.spec.egress",
          "kubectl exec <pod> -- curl <external-ip>:<port> (test egress)",
          "kubectl exec <pod> -- nslookup google.com (test DNS egress on port 53)",
          "kubectl delete networkpolicy <name> -n <namespace>"
        ],
        "references": [
          {
            "title": "Chính sách mạng",
            "url": "https://kubernetes.io/docs/concepts/services-networking/network-policies/"
          }
        ]
      },
      {
        "name": "Bộ chọn",
        "description": "Mục tiêu pods và namespaces",
        "keyPoints": [
          "podSelector: chọn pods theo nhãn trong cùng namespace",
          "namespaceSelector: chọn namespaces theo nhãn",
          "Kết hợp: logic AND (nhãn khớp pods khớp với namespaces)",
          "PodSelector trống ({}) chọn tất cả pods trong namespace"
        ],
        "commands": [
          "kubectl label namespace prod purpose=production",
          "kubectl get pods --show-labels",
          "kubectl get pods -l app=myapp",
          "kubectl get namespaces --show-labels",
          "kubectl label namespace <namespace> team=frontend",
          "kubectl get pods -l 'app in (web,api)' --show-labels",
          "kubectl explain networkpolicy.spec.ingress.from",
          "kubectl explain networkpolicy.spec.ingress.from.namespaceSelector"
        ],
        "references": [
          {
            "title": "Chính sách mạng - Bộ chọn",
            "url": "https://kubernetes.io/docs/concepts/services-networking/network-policies/#behavior-of-to-and-from-selectors"
          }
        ]
      },
      {
        "name": "Chính sách\nmặc định",
        "description": "Các mẫu từ chối tất cả và cho phép tất cả",
        "keyPoints": [
          "Mặc định từ chối tất cả ingress: mảng ingress trống với podSelector: {}",
          "Mặc định từ chối tất cả đầu ra: mảng đầu ra trống với podSelector: {}",
          "Mặc định cho phép tất cả: không áp dụng NetworkPolicy",
          "Cách thực hành tốt nhất: bắt đầu bằng từ chối tất cả, sau đó thêm quy tắc cho phép"
        ],
        "commands": [
          "# Default deny all ingress in a namespace:\n# apiVersion: networking.k8s.io/v1\n# kind: NetworkPolicy\n# metadata:\n#   name: default-deny-ingress\n# spec:\n#   podSelector: {}\n#   policyTypes: [Ingress]"
        ],
        "references": [
          {
            "title": "Chính sách mạng mặc định",
            "url": "https://kubernetes.io/docs/concepts/services-networking/network-policies/#default-policies"
          }
        ]
      }
    ]
  },
  "coredns": {
    "title": "CoreDNS",
    "subtitle": "Service và mạng > CoreDNS",
    "parent": "services-networking",
    "parentTitle": "Service và mạng",
    "domainColor": "#2196F3",
    "nodes": [
      {
        "name": "Khám phá\ndịch vụ",
        "description": "Tra cứu dịch vụ dựa trên DNS",
        "keyPoints": [
          "Services: <svc>.<namespace>.svc.cluster.local",
          "Pods: <pod-ip-dashed>.<namespace>.pod.cluster.local",
          "Dịch vụ không đầu trả lại IP pod trực tiếp",
          "Bản ghi SRV cho các cổng được đặt tên"
        ],
        "commands": [
          "kubectl exec <pod> -- nslookup myservice.default.svc.cluster.local",
          "kubectl exec <pod> -- nslookup kubernetes.default",
          "kubectl exec <pod> -- nslookup <svc>.<namespace>.svc.cluster.local",
          "kubectl run dnsutils --image=registry.k8s.io/e2e-test-images/jessie-dnsutils:1.3 -it --rm -- nslookup <service>",
          "kubectl exec <pod> -- cat /etc/resolv.conf",
          "kubectl exec <pod> -- dig SRV <svc>.<namespace>.svc.cluster.local",
          "kubectl get svc -A (verify service exists)",
          "kubectl get endpoints <svc> -n <namespace>"
        ],
        "references": [
          {
            "title": "DNS dành cho Services và Pods",
            "url": "https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/"
          }
        ]
      },
      {
        "name": "Cấu hình\nCoreDNS",
        "description": "Corefile và plugin",
        "keyPoints": [
          "Corefile được lưu trữ dưới dạng ConfigMap trong kube-system",
          "Plugin: kubernetes, chuyển tiếp, bộ đệm, lỗi, nhật ký",
          "chuyển tiếp: máy chủ DNS ngược dòng",
          "Có thể thêm các mục và tên miền sơ khai DNS tùy chỉnh"
        ],
        "commands": [
          "kubectl get configmap coredns -n kube-system -o yaml",
          "kubectl edit configmap coredns -n kube-system",
          "kubectl rollout restart deployment coredns -n kube-system",
          "kubectl get pods -n kube-system -l k8s-app=kube-dns",
          "kubectl logs -n kube-system -l k8s-app=kube-dns",
          "kubectl describe configmap coredns -n kube-system",
          "kubectl get deployment coredns -n kube-system",
          "kubectl describe deployment coredns -n kube-system"
        ],
        "references": [
          {
            "title": "Tùy chỉnh DNS Service",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/"
          },
          {
            "title": "Sử dụng CoreDNS cho Service Discovery",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/coredns/"
          }
        ]
      },
      {
        "name": "DNS tuỳ chỉnh",
        "description": "Miền tùy chỉnh và chuyển tiếp",
        "keyPoints": [
          "Tên miền sơ khai: chuyển tiếp các tên miền cụ thể tới DNS tùy chỉnh",
          "DNS ngược dòng: định cấu hình plugin chuyển tiếp",
          "Plugin lưu trữ cho các mục tĩnh tùy chỉnh",
          "Viết lại plugin để viết lại tên DNS"
        ],
        "commands": [
          "kubectl get pods -n kube-system -l k8s-app=kube-dns",
          "kubectl logs -n kube-system -l k8s-app=kube-dns",
          "kubectl get configmap coredns -n kube-system -o yaml",
          "kubectl edit configmap coredns -n kube-system",
          "kubectl rollout restart deployment coredns -n kube-system",
          "kubectl run dnstest --image=busybox:1.28 -it --rm -- nslookup <custom-domain>",
          "kubectl exec <pod> -- cat /etc/resolv.conf"
        ],
        "references": [
          {
            "title": "Tùy chỉnh DNS Service",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/"
          }
        ]
      }
    ]
  },
  "storage-classes": {
    "title": "StorageClass và cấp phát động",
    "subtitle": "Lưu trữ > StorageClass và cấp phát động",
    "parent": "storage",
    "parentTitle": "Lưu trữ",
    "domainColor": "#9C27B0",
    "nodes": [
      {
        "name": "StorageClass\ncơ bản",
        "description": "Xác định hồ sơ lưu trữ",
        "keyPoints": [
          "Mô tả một 'loại' lưu trữ (SSD, HDD, v.v.)",
          "Nhà cung cấp: plugin volume nào tạo volume",
          "Tham số: cài đặt dành riêng cho nhà cung cấp",
          "ReclaimPolicy: Xóa hoặc giữ lại",
          "allowVolumeExpansion: cho phép thay đổi kích thước PVC"
        ],
        "commands": [
          "kubectl get storageclasses",
          "kubectl get sc",
          "kubectl describe storageclass <name>",
          "kubectl get sc -o yaml",
          "kubectl get sc <name> -o yaml",
          "kubectl apply -f storageclass.yaml",
          "kubectl delete sc <name>",
          "kubectl patch storageclass <name> -p '{\"metadata\":{\"annotations\":{\"storageclass.kubernetes.io/is-default-class\":\"true\"}}}'",
          "kubectl get sc -o jsonpath='{.items[?(@.metadata.annotations.storageclass\\.kubernetes\\.io/is-default-class==\"true\")].metadata.name}'"
        ],
        "references": [
          {
            "title": "Lớp lưu trữ",
            "url": "https://kubernetes.io/docs/concepts/storage/storage-classes/"
          }
        ]
      },
      {
        "name": "Cấp phát\nđộng",
        "description": "Tự động tạo volume",
        "keyPoints": [
          "PVC tham chiếu StorageClass kích hoạt tạo PV tự động",
          "Không cần tạo trước PersistentVolumes",
          "StorageClass mặc định: được chú thích bằng storageclass.kubernetes.io/is-default-class=true",
          "PVC không có storageClassName sử dụng lớp mặc định"
        ],
        "commands": [
          "kubectl get sc -o wide",
          "kubectl get sc (check default class marker)",
          "kubectl patch storageclass <name> -p '{\"metadata\":{\"annotations\":{\"storageclass.kubernetes.io/is-default-class\":\"true\"}}}'",
          "kubectl get pvc -A (check STORAGECLASS column)",
          "kubectl describe pvc <name> -n <namespace> (check provisioning events)",
          "kubectl get pv (verify dynamically provisioned PVs)",
          "kubectl apply -f pvc.yaml (trigger dynamic provisioning)"
        ],
        "references": [
          {
            "title": "Cung cấp volume động",
            "url": "https://kubernetes.io/docs/concepts/storage/dynamic-provisioning/"
          }
        ]
      },
      {
        "name": "Provisioner",
        "description": "Plugin phụ trợ lưu trữ",
        "keyPoints": [
          "Trên cây: kubernetes.io/aws-ebs, kubernetes.io/gce-pd",
          "Trình điều khiển CSI: nhà cung cấp hiện đại, sẵn có",
          "VolumeBindingMode: Ngay lập tức hoặc WaitForFirstConsumer",
          "WaitForFirstConsumer: trì hoãn liên kết cho đến khi pod được lên lịch"
        ],
        "commands": [
          "kubectl get csidrivers",
          "kubectl describe csidrivers <name>",
          "kubectl describe storageclass <name>",
          "kubectl get csinodes",
          "kubectl describe csinode <node>",
          "kubectl get sc -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.provisioner}{\"\\t\"}{.volumeBindingMode}{\"\\n\"}{end}'",
          "kubectl get volumeattachments"
        ],
        "references": [
          {
            "title": "Nhà cung cấp StorageClass",
            "url": "https://kubernetes.io/docs/concepts/storage/storage-classes/#provisioner"
          }
        ]
      }
    ]
  },
  "volume-types": {
    "title": "Volume và chế độ truy cập",
    "subtitle": "Lưu trữ > Volume và chế độ truy cập",
    "parent": "storage",
    "parentTitle": "Lưu trữ",
    "domainColor": "#9C27B0",
    "nodes": [
      {
        "name": "Chế độ\ntruy cập",
        "description": "Làm thế nào volume có thể được truy cập",
        "keyPoints": [
          "ReadWriteOnce (RWO): đọc-ghi node đơn",
          "ReadOnlyMany (ROX): nhiều nodes chỉ đọc",
          "ReadWriteMany (RWX): đọc-ghi nhiều nodes",
          "ReadWriteOncePod (RWOP): đọc-ghi pod đơn (K8s 1.22+)"
        ],
        "commands": [
          "kubectl get pv (check ACCESS MODES column)",
          "kubectl describe pv <name>",
          "kubectl get pvc -A (check ACCESS MODES column)",
          "kubectl get pv -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.spec.accessModes}{\"\\n\"}{end}'",
          "kubectl explain pv.spec.accessModes",
          "kubectl explain pvc.spec.accessModes",
          "kubectl get pv <name> -o yaml | grep -A2 accessModes"
        ],
        "references": [
          {
            "title": "Chế độ truy cập",
            "url": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes"
          }
        ]
      },
      {
        "name": "Các loại\nvolume",
        "description": "Triển khai phụ trợ lưu trữ",
        "keyPoints": [
          "trốngDir: tạm thời, bị xóa bằng pod",
          "HostPath: ánh xạ thư mục máy chủ vào pod (chỉ dành cho thử nghiệm)",
          "nfs: Gắn kết hệ thống tệp mạng",
          "configMap/secret: gắn dữ liệu cấu hình dưới dạng tệp",
          "PersistVolumeClaim: tham chiếu PVC",
          "dự kiến: kết hợp nhiều nguồn volume"
        ],
        "commands": [
          "kubectl explain pod.spec.volumes",
          "kubectl explain pod.spec.volumes.emptyDir",
          "kubectl explain pod.spec.volumes.hostPath",
          "kubectl explain pod.spec.volumes.persistentVolumeClaim",
          "kubectl explain pod.spec.volumes.configMap",
          "kubectl explain pod.spec.volumes.secret",
          "kubectl explain pod.spec.volumes.projected",
          "kubectl get pod <pod> -o jsonpath='{.spec.volumes}'"
        ],
        "references": [
          {
            "title": "Tập",
            "url": "https://kubernetes.io/docs/concepts/storage/volumes/"
          },
          {
            "title": "Các loại tập",
            "url": "https://kubernetes.io/docs/concepts/storage/volumes/#volume-types"
          }
        ]
      },
      {
        "name": "Chế độ\nvolume",
        "description": "Hệ thống tập tin vs Khối",
        "keyPoints": [
          "Hệ thống tập tin (mặc định): ổ đĩa được gắn dưới dạng thư mục",
          "Khối: volume được hiển thị dưới dạng thiết bị khối thô",
          "Chế độ chặn yêu cầu volumeChế độ: Chặn trong PV và PVC",
          "Không phải tất cả các phụ trợ lưu trữ đều hỗ trợ chế độ chặn"
        ],
        "commands": [
          "kubectl get pv -o wide",
          "kubectl get pv -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.spec.volumeMode}{\"\\n\"}{end}'",
          "kubectl explain pv.spec.volumeMode",
          "kubectl explain pvc.spec.volumeMode",
          "kubectl describe pv <name> | grep -i volumemode",
          "kubectl get pv <name> -o yaml | grep volumeMode"
        ],
        "references": [
          {
            "title": "Chế độ volume",
            "url": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/#volume-mode"
          }
        ]
      }
    ]
  },
  "persistent-volumes": {
    "title": "PersistentVolume và PersistentVolumeClaim",
    "subtitle": "Lưu trữ > PersistentVolume và PersistentVolumeClaim",
    "parent": "storage",
    "parentTitle": "Lưu trữ",
    "domainColor": "#9C27B0",
    "nodes": [
      {
        "name": "PersistentVolume",
        "description": "Tài nguyên lưu trữ trên toàn cụm",
        "keyPoints": [
          "Tài nguyên trong phạm vi cụm (không được đặt tên)",
          "Vòng đời độc lập với pods",
          "Có thể được quản trị viên cung cấp tĩnh hoặc động bởi StorageClass",
          "Thông số: dung lượng, accessModes, storageClassName, PersistVolumeReclaimPolicy"
        ],
        "commands": [
          "kubectl get pv",
          "kubectl get pv -o wide",
          "kubectl describe pv <name>",
          "kubectl get pv <name> -o yaml",
          "kubectl apply -f pv.yaml",
          "kubectl delete pv <name>",
          "kubectl get pv --sort-by=.spec.capacity.storage",
          "kubectl get pv -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.spec.capacity.storage}{\"\\t\"}{.status.phase}{\"\\n\"}{end}'",
          "kubectl explain pv.spec"
        ],
        "references": [
          {
            "title": "Tập liên tục",
            "url": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/"
          }
        ]
      },
      {
        "name": "PersistentVolumeClaim",
        "description": "Yêu cầu lưu trữ của người dùng",
        "keyPoints": [
          "Tài nguyên được đặt tên - yêu cầu lưu trữ của người dùng",
          "Liên kết với một PV phù hợp với yêu cầu",
          "Thông số kỹ thuật: accessModes, resources.requests.storage, storageClassName",
          "Sau khi bị ràng buộc, PVC được liên kết độc quyền với PV",
          "Có thể mở rộng PVC nếu StorageClass cho phép (allowVolumeExpansion: true)"
        ],
        "commands": [
          "kubectl get pvc -n <namespace>",
          "kubectl get pvc -A",
          "kubectl describe pvc <name> -n <namespace>",
          "kubectl get pvc <name> -o yaml",
          "kubectl apply -f pvc.yaml",
          "kubectl delete pvc <name> -n <namespace>",
          "kubectl patch pvc <name> -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"10Gi\"}}}}'",
          "kubectl get pvc -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.spec.resources.requests.storage}{\"\\t\"}{.status.phase}{\"\\n\"}{end}'"
        ],
        "references": [
          {
            "title": "PersistentVolumeClaims",
            "url": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims"
          },
          {
            "title": "PVC mở rộng",
            "url": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/#expanding-persistent-volumes-claims"
          }
        ]
      },
      {
        "name": "Chính sách\nthu hồi",
        "description": "Điều gì xảy ra sau khi PVC bị xóa",
        "keyPoints": [
          "Giữ lại: PV được giữ lại, dữ liệu được bảo toàn, cần dọn dẹp thủ công",
          "Xóa: PV và bộ nhớ cơ bản bị xóa tự động",
          "Tái chế: không dùng nữa - chà cơ bản (rm -rf /thevolume/*)",
          "Mặc định cho việc cung cấp động là Xóa"
        ],
        "commands": [
          "kubectl get pv (check RECLAIM POLICY column)",
          "kubectl patch pv <name> -p '{\"spec\":{\"persistentVolumeReclaimPolicy\":\"Retain\"}}'",
          "kubectl get pv -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.spec.persistentVolumeReclaimPolicy}{\"\\n\"}{end}'",
          "kubectl describe pv <name> | grep -i reclaim",
          "kubectl get sc -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.reclaimPolicy}{\"\\n\"}{end}'",
          "kubectl explain pv.spec.persistentVolumeReclaimPolicy"
        ],
        "references": [
          {
            "title": "Chính sách đòi lại",
            "url": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaiming"
          }
        ]
      },
      {
        "name": "Liên kết\nPV/PVC",
        "description": "PV và PVC phù hợp như thế nào",
        "keyPoints": [
          "Việc liên kết dựa trên: chế độ truy cập, kích thước lưu trữ, StorageClass, bộ chọn nhãn",
          "Lưu trữ tối thiểu PVC requests; PV có thể lớn hơn",
          "Một khi đã ràng buộc: mối quan hệ một-một",
          "Pending PVC có nghĩa là không tìm thấy PV phù hợp"
        ],
        "commands": [
          "kubectl get pv,pvc",
          "kubectl describe pvc <name> (check Events for binding status)",
          "kubectl get pv -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.spec.claimRef.name}{\"\\t\"}{.status.phase}{\"\\n\"}{end}'",
          "kubectl get pvc -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{.spec.volumeName}{\"\\t\"}{.status.phase}{\"\\n\"}{end}'",
          "kubectl get pv | grep -i available",
          "kubectl get pvc | grep -i pending",
          "kubectl describe pv <name> | grep -A2 claimRef"
        ],
        "references": [
          {
            "title": "Ràng buộc PV/PVC",
            "url": "https://kubernetes.io/docs/concepts/storage/persistent-volumes/#binding"
          }
        ]
      }
    ]
  },
  "cluster-node-troubleshooting": {
    "title": "Xử lý sự cố cụm và node",
    "subtitle": "Xử lý sự cố > Xử lý sự cố cụm và node",
    "parent": "troubleshooting",
    "parentTitle": "Xử lý sự cố",
    "domainColor": "#F44336",
    "nodes": [
      {
        "name": "Trạng thái node",
        "description": "Chẩn đoán sự cố node",
        "keyPoints": [
          "Kiểm tra các điều kiện node: Ready, MemoryPressure, DiskPressure, PIDPressure",
          "NotReady thường có nghĩa là kubelet không hoạt động hoặc không thể truy cập được",
          "Kiểm tra trạng thái dịch vụ kubelet trên node",
          "Xác minh kết nối mạng giữa nodes"
        ],
        "commands": [
          "kubectl get nodes",
          "kubectl get nodes -o wide",
          "kubectl describe node <node>",
          "kubectl get node <node> -o jsonpath='{.status.conditions}' | jq .",
          "kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{\"\\t\"}{range .status.conditions[*]}{.type}={.status}{\" \"}{end}{\"\\n\"}{end}'",
          "systemctl status kubelet",
          "journalctl -u kubelet -f",
          "kubectl cordon <node>",
          "kubectl uncordon <node>",
          "kubectl drain <node> --ignore-daemonsets --delete-emptydir-data"
        ],
        "references": [
          {
            "title": "Cụm khắc phục sự cố",
            "url": "https://kubernetes.io/docs/tasks/debug/debug-cluster/"
          },
          {
            "title": "Trạng thái nút",
            "url": "https://kubernetes.io/docs/concepts/architecture/nodes/#condition"
          }
        ]
      },
      {
        "name": "Sự cố kubelet",
        "description": "Khắc phục sự cố kubelet",
        "keyPoints": [
          "Kubelet chạy trên mọi node (control plane và workers)",
          "Tệp cấu hình: /var/lib/kubelet/config.yaml",
          "Các vấn đề thường gặp: lỗi chứng chỉ, cấu hình không khớp, áp suất ổ đĩa",
          "Kiểm tra nhật ký systemd để biết lỗi chi tiết",
          "Kubelet 1.35 mặc định từ chối cgroup v1 (failCgroupV1: true); kiểm tra cgroup2fs trước khi nâng cấp."
        ],
        "commands": [
          "systemctl status kubelet",
          "systemctl restart kubelet",
          "systemctl enable kubelet",
          "journalctl -u kubelet --since '5 min ago'",
          "journalctl -u kubelet -f",
          "journalctl -u kubelet --no-pager | tail -50",
          "cat /var/lib/kubelet/config.yaml",
          "ls /etc/kubernetes/manifests/",
          "kubelet --version",
          "stat -fc %T /sys/fs/cgroup"
        ],
        "references": [
          {
            "title": "Kubelet",
            "url": "https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/"
          },
          {
            "title": "Khắc phục sự cố kubeadm",
            "url": "https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/troubleshooting-kubeadm/"
          }
        ]
      },
      {
        "name": "Sự cố\nkube-proxy",
        "description": "Sự cố mạng Service",
        "keyPoints": [
          "kube-proxy xử lý chuyển tiếp Service; trên Linux có các chế độ iptables, nftables và IPVS.",
          "IPVS bị deprecated từ 1.35 nhưng chưa bị xoá. Kiểm tra chế độ của cụm trước khi chẩn đoán.",
          "Thường chạy dưới dạng DaemonSet trong namespace kube-system.",
          "Kiểm tra log, cấu hình, EndpointSlice và kết nối từ Pod tới backend."
        ],
        "commands": [
          "kubectl get ds kube-proxy -n kube-system",
          "kubectl get pods -n kube-system -l k8s-app=kube-proxy",
          "kubectl logs -n kube-system -l k8s-app=kube-proxy",
          "kubectl describe ds kube-proxy -n kube-system",
          "kubectl get configmap kube-proxy -n kube-system -o yaml",
          "kubectl edit configmap kube-proxy -n kube-system",
          "iptables -t nat -L KUBE-SERVICES",
          "iptables -t nat -L KUBE-NODEPORTS",
          "kubectl rollout restart ds kube-proxy -n kube-system"
        ],
        "references": [
          {
            "title": "kube-proxy",
            "url": "https://kubernetes.io/docs/reference/command-line-tools-reference/kube-proxy/"
          },
          {
            "title": "IP ảo và proxy Service",
            "url": "https://kubernetes.io/docs/reference/networking/virtual-ips/"
          }
        ]
      },
      {
        "name": "Sự cố\nchứng chỉ",
        "description": "TLS và khắc phục sự cố chứng chỉ",
        "keyPoints": [
          "Chứng chỉ hết hạn gây ra lỗi kết nối máy chủ API",
          "Kiểm tra ngày hết hạn của tất cả các chứng chỉ cụm",
          "Chứng chỉ /etc/kubernetes/pki/",
          "Gia hạn với chứng chỉ kubeadm gia hạn"
        ],
        "commands": [
          "kubeadm certs check-expiration",
          "openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -text",
          "openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -dates",
          "kubeadm certs renew all",
          "kubeadm certs renew apiserver",
          "ls /etc/kubernetes/pki/",
          "openssl x509 -in /etc/kubernetes/pki/ca.crt -noout -subject -issuer",
          "kubectl get csr",
          "kubectl certificate approve <csr-name>"
        ],
        "references": [
          {
            "title": "Quản lý chứng chỉ với kubeadm",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/"
          },
          {
            "title": "Chứng chỉ PKI",
            "url": "https://kubernetes.io/docs/setup/best-practices/certificates/"
          }
        ]
      }
    ]
  },
  "cluster-components": {
    "title": "Thành phần cụm",
    "subtitle": "Xử lý sự cố > Thành phần cụm",
    "parent": "troubleshooting",
    "parentTitle": "Xử lý sự cố",
    "domainColor": "#F44336",
    "nodes": [
      {
        "name": "API server",
        "description": "Khắc phục sự cố kube-apiserver",
        "keyPoints": [
          "Thành phần trung tâm: mọi giao tiếp đều đi qua nó",
          "Chạy dưới dạng pod tĩnh trên control plane nodes",
          "Kiểm tra manifest trong /etc/kubernetes/manifests/",
          "Các sự cố thường gặp: lỗi chứng chỉ, kết nối etcd, cạn kiệt tài nguyên"
        ],
        "commands": [
          "kubectl get pods -n kube-system | grep apiserver",
          "kubectl logs kube-apiserver-<node> -n kube-system",
          "kubectl logs kube-apiserver-<node> -n kube-system --tail=100",
          "cat /etc/kubernetes/manifests/kube-apiserver.yaml",
          "crictl ps | grep apiserver",
          "crictl logs <apiserver-container-id>",
          "kubectl get --raw /healthz",
          "kubectl get --raw /livez",
          "kubectl get --raw /readyz",
          "curl -k https://localhost:6443/healthz"
        ],
        "references": [
          {
            "title": "kube-apiserver",
            "url": "https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/"
          },
          {
            "title": "Linh kiện Kubernetes",
            "url": "https://kubernetes.io/docs/concepts/overview/components/#kube-apiserver"
          }
        ]
      },
      {
        "name": "Scheduler",
        "description": "Khắc phục sự cố kube-scheduler",
        "keyPoints": [
          "Gán pods cho nodes dựa trên yêu cầu tài nguyên",
          "Chạy dưới dạng pod tĩnh trên control plane",
          "Pending pods thường chỉ ra các vấn đề về lịch trình",
          "Kiểm tra: hạn chế tài nguyên, taints, quy tắc quan hệ"
        ],
        "commands": [
          "kubectl get pods -n kube-system | grep scheduler",
          "kubectl logs kube-scheduler-<node> -n kube-system",
          "kubectl logs kube-scheduler-<node> -n kube-system --tail=100",
          "cat /etc/kubernetes/manifests/kube-scheduler.yaml",
          "kubectl describe pod <pending-pod> (check Events)",
          "kubectl get events --field-selector reason=FailedScheduling",
          "crictl ps | grep scheduler",
          "crictl logs <scheduler-container-id>"
        ],
        "references": [
          {
            "title": "kube-scheduler",
            "url": "https://kubernetes.io/docs/reference/command-line-tools-reference/kube-scheduler/"
          },
          {
            "title": "Bộ lập lịch Kubernetes",
            "url": "https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/"
          }
        ]
      },
      {
        "name": "Controller\nmanager",
        "description": "Khắc phục sự cố kube-controller-manager",
        "keyPoints": [
          "Chạy các vòng điều khiển lõi (ReplicaSet, Deployment, Node, v.v.)",
          "pod tĩnh trên control plane nodes",
          "Nguyên nhân sự cố: pods không được tạo, nodes không cập nhật, v.v.",
          "Kiểm tra việc bầu chọn người lãnh đạo trong thiết lập HA"
        ],
        "commands": [
          "kubectl get pods -n kube-system | grep controller-manager",
          "kubectl logs kube-controller-manager-<node> -n kube-system",
          "kubectl logs kube-controller-manager-<node> -n kube-system --tail=100",
          "cat /etc/kubernetes/manifests/kube-controller-manager.yaml",
          "crictl ps | grep controller-manager",
          "crictl logs <controller-manager-container-id>",
          "kubectl get lease -n kube-system (check leader election)",
          "kubectl describe lease kube-controller-manager -n kube-system"
        ],
        "references": [
          {
            "title": "kube-controller-manager",
            "url": "https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/"
          },
          {
            "title": "Linh kiện Kubernetes",
            "url": "https://kubernetes.io/docs/concepts/overview/components/#kube-controller-manager"
          }
        ]
      },
      {
        "name": "etcd",
        "description": "Khắc phục sự cố etcd",
        "keyPoints": [
          "Lưu trữ tất cả trạng thái và cấu hình cụm",
          "Các vấn đề về hiệu suất ảnh hưởng đến toàn bộ cụm",
          "Các sự cố thường gặp: độ trễ của đĩa I/O, kết nối thành viên, vượt quá hạn ngạch dung lượng",
          "etcdctl để kiểm tra và quản lý trực tiếp",
          "Dùng etcdutl để phục hồi ngoại tuyến vào thư mục mới; cấu hình đúng membership, hostPath và revision bump/mark-compacted. etcdctl dùng để chụp snapshot."
        ],
        "commands": [
          "kubectl get pods -n kube-system | grep etcd",
          "kubectl logs etcd-<node> -n kube-system",
          "kubectl logs etcd-<node> -n kube-system --tail=100",
          "cat /etc/kubernetes/manifests/etcd.yaml",
          "crictl ps | grep etcd",
          "ETCDCTL_API=3 etcdctl endpoint health --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key",
          "ETCDCTL_API=3 etcdctl member list --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key",
          "ETCDCTL_API=3 etcdctl endpoint status --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key --write-out=table",
          "ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd-backup.db --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key",
          "etcdutl snapshot restore /tmp/etcd-backup.db --data-dir=/var/lib/etcd-restored"
        ],
        "references": [
          {
            "title": "Vận hành cụm etcd",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/"
          },
          {
            "title": "Thành phần etcd",
            "url": "https://kubernetes.io/docs/concepts/overview/components/#etcd"
          }
        ]
      }
    ]
  },
  "monitoring": {
    "title": "Giám sát và sử dụng tài nguyên",
    "subtitle": "Xử lý sự cố > Giám sát và sử dụng tài nguyên",
    "parent": "troubleshooting",
    "parentTitle": "Xử lý sự cố",
    "domainColor": "#F44336",
    "nodes": [
      {
        "name": "kubectl top",
        "description": "Lệnh sử dụng tài nguyên",
        "keyPoints": [
          "Hiển thị mức sử dụng CPU và bộ nhớ cho pods và nodes",
          "Yêu cầu cài đặt máy chủ số liệu",
          "Ảnh chụp nhanh thời gian thực, không phải dữ liệu lịch sử",
          "Hữu ích để xác định workloads ngốn tài nguyên"
        ],
        "commands": [
          "kubectl top nodes",
          "kubectl top node <node>",
          "kubectl top pods -A",
          "kubectl top pods -n <namespace>",
          "kubectl top pods --containers -n <namespace>",
          "kubectl top pods --sort-by=memory",
          "kubectl top pods --sort-by=cpu",
          "kubectl get apiservice v1beta1.metrics.k8s.io (check metrics-server)",
          "kubectl get pods -n kube-system | grep metrics-server"
        ],
        "references": [
          {
            "title": "Quy trình đo lường tài nguyên",
            "url": "https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/"
          },
          {
            "title": "Công cụ giám sát tài nguyên",
            "url": "https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-usage-monitoring/"
          }
        ]
      },
      {
        "name": "ResourceQuota",
        "description": "Tài nguyên namespace limits",
        "keyPoints": [
          "Giới hạn tổng mức tiêu thụ tài nguyên trên mỗi namespace",
          "Có thể giới hạn: CPU, bộ nhớ, pods, dịch vụ, PVC, v.v.",
          "Yêu cầu và limits có thể được hạn chế riêng",
          "LimitRange đặt default/min/max trên container"
        ],
        "commands": [
          "kubectl get resourcequotas -n <namespace>",
          "kubectl get resourcequotas -A",
          "kubectl describe resourcequota <name> -n <namespace>",
          "kubectl create quota my-quota --hard=pods=10,requests.cpu=4,requests.memory=8Gi -n <namespace>",
          "kubectl get limitranges -n <namespace>",
          "kubectl describe limitrange <name> -n <namespace>",
          "kubectl apply -f resourcequota.yaml",
          "kubectl delete resourcequota <name> -n <namespace>",
          "kubectl get resourcequota <name> -o yaml -n <namespace>"
        ],
        "references": [
          {
            "title": "Hạn ngạch tài nguyên",
            "url": "https://kubernetes.io/docs/concepts/policy/resource-quotas/"
          },
          {
            "title": "Phạm vi giới hạn",
            "url": "https://kubernetes.io/docs/concepts/policy/limit-range/"
          }
        ]
      },
      {
        "name": "Sự kiện",
        "description": "Giám sát sự kiện cụm",
        "keyPoints": [
          "Sự kiện hiển thị những gì đang xảy ra trong cụm",
          "Các loại: Bình thường và Cảnh báo",
          "Sự kiện hết hạn sau 1 giờ theo mặc định",
          "Quan trọng để khắc phục sự cố pod/node"
        ],
        "commands": [
          "kubectl get events -A --sort-by='.lastTimestamp'",
          "kubectl get events -n <namespace>",
          "kubectl get events --field-selector type=Warning",
          "kubectl get events --field-selector reason=FailedScheduling",
          "kubectl get events --field-selector involvedObject.kind=Pod",
          "kubectl get events --field-selector involvedObject.name=<pod-name>",
          "kubectl describe pod <pod> (check Events at bottom)",
          "kubectl get events -n <namespace> --sort-by='.metadata.creationTimestamp' | tail -20",
          "kubectl get events -A -o json | jq '.items[] | select(.type==\"Warning\")'"
        ],
        "references": [
          {
            "title": "Xem sự kiện",
            "url": "https://kubernetes.io/docs/reference/kubectl/generated/kubectl_events/"
          },
          {
            "title": "Sự kiện API",
            "url": "https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/"
          }
        ]
      }
    ]
  },
  "container-logs": {
    "title": "Log và luồng đầu ra của container",
    "subtitle": "Xử lý sự cố > Log và luồng đầu ra của container",
    "parent": "troubleshooting",
    "parentTitle": "Xử lý sự cố",
    "domainColor": "#F44336",
    "nodes": [
      {
        "name": "kubectl logs",
        "description": "Xem nhật ký container",
        "keyPoints": [
          "Hiển thị stdout/stderr từ containers",
          "Sử dụng -c cho container cụ thể trong nhiều container pods",
          "Sử dụng -p cho phiên bản container trước đó (sau sự cố)",
          "Sử dụng -f để truyền phát nhật ký (theo dõi)",
          "Sử dụng --since để lọc theo thời gian"
        ],
        "commands": [
          "kubectl logs <pod>",
          "kubectl logs <pod> -c <container>",
          "kubectl logs <pod> --previous",
          "kubectl logs <pod> -f --tail=100",
          "kubectl logs -l app=myapp --all-containers"
        ],
        "references": [
          {
            "title": "Nhật ký kubectl",
            "url": "https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/"
          },
          {
            "title": "Kiến trúc ghi nhật ký",
            "url": "https://kubernetes.io/docs/concepts/cluster-administration/logging/"
          }
        ]
      },
      {
        "name": "Kiến trúc\nghi log",
        "description": "Mẫu ghi nhật ký Kubernetes",
        "keyPoints": [
          "Cấp độ nút: Môi trường chạy container ghi lại stdout/stderr",
          "Nhật ký được lưu trữ tại /var/log/containers/ và /var/log/pods/",
          "Cấp độ cụm: sử dụng trình tổng hợp nhật ký (EFK, Loki, Fluentd)",
          "Mẫu sidecar để xử lý nhật ký tùy chỉnh"
        ],
        "commands": [
          "ls /var/log/containers/",
          "ls /var/log/pods/",
          "crictl logs <container-id>"
        ],
        "references": [
          {
            "title": "Kiến trúc ghi nhật ký",
            "url": "https://kubernetes.io/docs/concepts/cluster-administration/logging/"
          }
        ]
      },
      {
        "name": "Gỡ lỗi\nứng dụng",
        "description": "Gỡ lỗi chạy containers",
        "keyPoints": [
          "kubectl exec: chạy các lệnh bên trong container",
          "kubectl debug: thêm ephemeral container để gỡ lỗi",
          "Kiểm tra trạng thái container: Running, Đang chờ, Đã chấm dứt",
          "Kiểm tra mã thoát và lý do khởi động lại",
          "Ephemeral container không yêu cầu khởi động lại Pod"
        ],
        "commands": [
          "kubectl exec -it <pod> -- /bin/sh",
          "kubectl debug <pod> -it --image=busybox",
          "kubectl describe pod <pod> (check container statuses)",
          "kubectl get pod <pod> -o jsonpath='{.status.containerStatuses[*].state}'"
        ],
        "references": [
          {
            "title": "Gỡ lỗi Running Pods",
            "url": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/"
          },
          {
            "title": "Container tạm thời",
            "url": "https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/"
          },
          {
            "title": "Khắc phục sự cố ứng dụng",
            "url": "https://kubernetes.io/docs/tasks/debug/debug-application/"
          }
        ]
      }
    ]
  },
  "network-troubleshooting": {
    "title": "Xử lý sự cố Service và mạng",
    "subtitle": "Xử lý sự cố > Xử lý sự cố Service và mạng",
    "parent": "troubleshooting",
    "parentTitle": "Xử lý sự cố",
    "domainColor": "#F44336",
    "nodes": [
      {
        "name": "Gỡ lỗi DNS",
        "description": "Khắc phục sự cố phân giải DNS",
        "keyPoints": [
          "Sử dụng trình gỡ lỗi pod bằng các công cụ DNS (dnsutils, busybox)",
          "Kiểm tra CoreDNS pods đang chạy",
          "Xác minh /etc/resolv.conf trong pods",
          "Kiểm tra độ phân giải tên dịch vụ"
        ],
        "commands": [
          "kubectl run dnsutils --image=registry.k8s.io/e2e-test-images/jessie-dnsutils:1.3 -it --rm -- nslookup kubernetes.default",
          "kubectl run dnsutils --image=registry.k8s.io/e2e-test-images/jessie-dnsutils:1.3 -it --rm -- nslookup <svc>.<namespace>.svc.cluster.local",
          "kubectl run dnsutils --image=registry.k8s.io/e2e-test-images/jessie-dnsutils:1.3 -it --rm -- dig <svc>.<namespace>.svc.cluster.local",
          "kubectl get pods -n kube-system -l k8s-app=kube-dns",
          "kubectl logs -n kube-system -l k8s-app=kube-dns",
          "kubectl exec <pod> -- cat /etc/resolv.conf",
          "kubectl get configmap coredns -n kube-system -o yaml",
          "kubectl get svc kube-dns -n kube-system",
          "kubectl get endpoints kube-dns -n kube-system"
        ],
        "references": [
          {
            "title": "Gỡ lỗi phân giải DNS",
            "url": "https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/"
          }
        ]
      },
      {
        "name": "Gỡ lỗi Service",
        "description": "Khắc phục sự cố kết nối dịch vụ",
        "keyPoints": [
          "Xác minh dịch vụ tồn tại và có điểm cuối",
          "Kiểm tra bộ chọn dịch vụ phù hợp với nhãn pod",
          "Kiểm tra kết nối từ trong cụm",
          "Kiểm tra quy tắc kube-proxy và iptables"
        ],
        "commands": [
          "kubectl get svc <service>",
          "kubectl get svc <service> -o wide",
          "kubectl get endpoints <service>",
          "kubectl describe svc <service>",
          "kubectl get svc <service> -o yaml",
          "kubectl exec <pod> -- curl <service>:<port>",
          "kubectl exec <pod> -- wget -O- <service>:<port>",
          "kubectl exec <pod> -- nslookup <service>",
          "kubectl get pods -l <selector-key>=<selector-value> (verify matching pods)"
        ],
        "references": [
          {
            "title": "Gỡ lỗi Services",
            "url": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/"
          }
        ]
      },
      {
        "name": "Kết nối Pod",
        "description": "Khắc phục sự cố mạng pod-to-pod",
        "keyPoints": [
          "Xác minh IP pod có thể truy cập được từ pods khác",
          "Kiểm tra plugin CNI có hoạt động tốt không",
          "Xác minh không có chính sách mạng nào chặn lưu lượng truy cập",
          "Kiểm tra với curl, wget, ping từ gỡ lỗi pods"
        ],
        "commands": [
          "kubectl get pods -o wide",
          "kubectl exec <pod1> -- ping <pod2-ip>",
          "kubectl exec <pod1> -- curl <pod2-ip>:<port>",
          "kubectl get networkpolicies -n <namespace>",
          "kubectl describe networkpolicy <name> -n <namespace>",
          "kubectl debug -it <pod> --image=nicolaka/netshoot -- bash",
          "kubectl run netshoot --image=nicolaka/netshoot -it --rm -- bash",
          "kubectl exec <pod> -- traceroute <pod2-ip>",
          "kubectl get pods -n kube-system -l k8s-app=calico-node (check CNI status)"
        ],
        "references": [
          {
            "title": "Gỡ lỗi Services",
            "url": "https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/"
          },
          {
            "title": "Mạng cụm",
            "url": "https://kubernetes.io/docs/concepts/cluster-administration/networking/"
          }
        ]
      },
      {
        "name": "Gỡ lỗi Ingress",
        "description": "Khắc phục sự cố truy cập bên ngoài",
        "keyPoints": [
          "Xác minh bộ điều khiển Ingress đang chạy",
          "Kiểm tra cấu hình tài nguyên Ingress",
          "Xác minh dịch vụ phụ trợ và điểm cuối tồn tại",
          "Kiểm tra chứng chỉ TLS nếu sử dụng HTTPS"
        ],
        "commands": [
          "kubectl get ingress",
          "kubectl get ingress -A",
          "kubectl describe ingress <name>",
          "kubectl get ingress <name> -o yaml",
          "kubectl get pods -n ingress-nginx",
          "kubectl logs -n ingress-nginx <controller-pod>",
          "kubectl get svc -n ingress-nginx",
          "kubectl describe svc -n ingress-nginx <service>",
          "curl -H 'Host: <hostname>' http://<ingress-ip>"
        ],
        "references": [
          {
            "title": "Ingress",
            "url": "https://kubernetes.io/docs/concepts/services-networking/ingress/"
          },
          {
            "title": "Bộ điều khiển Ingress",
            "url": "https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/"
          }
        ]
      }
    ]
  }
};
