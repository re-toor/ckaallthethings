from pathlib import Path
import re
root=Path(__file__).resolve().parents[2]
p=root/'guides/kubernetes-complete-guide.md';s=p.read_text(encoding='utf-8')
for frag in set(re.findall(r'\]\(#(chapter-(?:2[6-9]|30)-[-a-z0-9]+)\)',s)):
    key=re.match(r'chapter-\d+',frag)[0]
    s=re.sub(r'(<a id="'+key+r'--[^"]+"></a>)',lambda m:m[0]+f'\n<a id="{frag}"></a>',s,count=1)
# Clearly label legacy installation manifests instead of recommending retired ingress-nginx.
s=s.replace('kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.5/', '# Ví dụ lịch sử, không triển khai controller đã ngừng bảo trì lên cụm mới.\n# kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.5/')
p.write_text(s,encoding='utf-8',newline='\n')
for p in root.glob('guides/*.md'):
    s=p.read_text(encoding='utf-8')
    s=re.sub(r'^(\[\^[^\]]+\]:[^\n]+)\n(https?://\S+)',r'\1 \2',s,flags=re.M)
    s=s.replace('| sai |','| `false` |').replace('| ĐÚNG |','| `true` |').replace('| Đúng |','| `true` |')
    s=s.replace('CKA (giáo trình v1.31)','CKA (đề cương hiện hành)').replace('CNCF — Chương trình giảng dạy CKA v1.31.','CNCF — Đề cương CKA; xem bản hiện hành.')
    s=s.replace('https://github.com/cncf/curriculum/blob/master/CKA_Curriculum_v1.31.pdf','https://github.com/cncf/curriculum')
    if p.name=='coredns-complete-guide.md':
        s=re.sub(r'^> \*\*Phạm vi phủ sóng[^\n]*', '> **Mục tiêu:** Kubernetes 1.35; kiểm tra image CoreDNS thực tế của cụm trước khi sửa hoặc nâng cấp. Plugin có thể yêu cầu phiên bản CoreDNS riêng.',s,flags=re.M)
        start=s.index('| Phiên bản Kubernetes | CoreDNS');end=s.index('\n<a id="112-',start)
        s=s[:start]+'''Với Kubernetes 1.35, không suy đoán phiên bản CoreDNS từ tên cụm hoặc bảng tương thích cũ. Xem image kubeadm lựa chọn và image đang chạy:

```bash
kubeadm config images list --kubernetes-version=v1.35.0
kubectl get deployment coredns -n kube-system \\
  -o jsonpath='{.spec.template.spec.containers[0].image}'
```

Kubeadm 1.35.0 ghim CoreDNS **v1.13.1** trong [mã nguồn chính thức](https://github.com/kubernetes/kubernetes/blob/v1.35.0/cmd/kubeadm/app/constants/constants.go). Bản vá, nhà cung cấp hoặc cấu hình tuỳ chỉnh có thể thay đổi image này. Dùng phiên bản mà bài thực hành yêu cầu; kiểm tra Corefile/plugin và DNS sau nâng cấp. Không mặc định mọi CoreDNS mới đều tương thích với mọi cụm cũ.

'''+s[end:]
    if p.name=='coredns-cka-guide.md':
        s=s.replace('registry.k8s.io/coredns/coredns:v1.11.3','registry.k8s.io/coredns/coredns:v1.13.1')
        s=s.replace('## Nhiệm vụ 10 - Nâng cấp hình ảnh CoreDNS','## Bài 10 - Cập nhật image CoreDNS theo yêu cầu')
        s=s.replace('**Dạng câu hỏi thi:** *"Nâng cấp CoreDNS','**Bài tự luyện:** *"Cập nhật CoreDNS')
        s=s.replace('# Đầu ra: registry.k8s.io/coredns/coredns:v1.11.1','# Ví dụ cụm cũ có thể dùng v1.11.1; ghi lại phiên bản thực tế để rollback.')
    p.write_text(s,encoding='utf-8',newline='\n')

# Localize fixed operator-facing labels in the installation scripts.
replacements={
'Kubernetes HA Cluster Deployment':'Triển khai lab Kubernetes nhiều control plane',
'Deploys the full Kubernetes HA cluster from your Mac.':'Điều phối các bước dựng lab Kubernetes từ máy có Bash và SSH.',
'Skipping step':'Bỏ qua bước','Architecture:':'Kiến trúc:','SSH User:':'Tài khoản SSH:',
': connected':': đã kết nối','Configure /etc/hosts':'Cấu hình /etc/hosts',
'Configure UFW Firewall':'Cấu hình tường lửa UFW','Setup HAProxy Load Balancer':'Cấu hình HAProxy',
'Install Kubernetes Packages':'Cài gói Kubernetes','Initialize Cluster (CP1)':'Khởi tạo cụm (CP1)',
'Join Control Plane 2':'Join control plane 2','Join Worker Nodes':'Join các worker',
'Install Calico CNI':'Cài Calico CNI','Verify Cluster Health':'Kiểm tra cụm','Verify Certificates':'Kiểm tra chứng chỉ',
'Waiting for Tigera operator...':'Đang chờ Tigera operator...',
'  From ${host}:':'  Từ ${host}:','  Done on':'  Hoàn tất trên',
'UFW rules on':'Quy tắc UFW trên',
'# --- Load Balancer ---':'# --- Bộ cân bằng tải ---',
'# --- Control Plane Nodes ---':'# --- Các node control plane ---',
'# --- Worker Nodes ---':'# --- Các node worker ---',
'# --- Grouped Arrays ---':'# --- Danh sách node theo nhóm ---',
'# --- Kubernetes Settings ---':'# --- Cấu hình Kubernetes ---',
'# --- Join Info (populated by 04-init-cluster.sh) ---':'# --- Thông tin join (do 05-init-cluster.sh tạo) ---',
'# --- Helper Functions ---':'# --- Hàm hỗ trợ ---',
}
for p in root.glob('Kubernetes installation/scripts/*.sh'):
    s=p.read_text(encoding='utf-8')
    for a,b in replacements.items():s=s.replace(a,b)
    p.write_text(s,encoding='utf-8',newline='\n')
