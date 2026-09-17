from pathlib import Path
import re
root=Path(__file__).resolve().parents[2]
polish={
'độ phân giải DNS':'phân giải DNS','Độ phân giải DNS':'Phân giải DNS',
'Máy phát điện':'Trình tạo','máy phát điện':'trình tạo','Máy biến áp':'Bộ biến đổi','máy biến áp':'bộ biến đổi',
'công nhân':'worker','Công nhân':'Worker','mặt phẳng điều khiển':'control plane','Mặt phẳng điều khiển':'Control plane',
'máy bay điều khiển':'control plane','Máy bay điều khiển':'Control plane',
'khối lượng':'volume','Khối lượng':'Volume','hình ảnh container':'image container',
'Hướng dẫn nghiên cứu':'Tài liệu ôn tập','hướng dẫn nghiên cứu':'tài liệu ôn tập',
'Ngân sách thời gian':'Thời gian luyện tập mục tiêu','trọng lượng bài thi':'tỷ trọng bài thi','tổng trọng lượng':'tổng tỷ trọng',
'trọng lượng kỳ thi':'tỷ trọng kỳ thi','Không gian tên':'Namespace','không gian tên':'namespace',
'Niềm tin chéo namespace':'Cấp quyền tham chiếu chéo namespace',
'CNCF Graded dự án':'dự án đã tốt nghiệp CNCF',
'Toán tử cụm':'Người vận hành cụm','cân bằng tảirv':'loadbalancersrv',
'control plane1':'controlplane1','control plane2':'controlplane2','nút01':'node01','nút02':'node02',
'Khác biệt trước khi nộp đơn':'So sánh trước khi áp dụng',
'Ghim vào thông báo chính xác':'Ghim theo digest chính xác',
'Vải NGINX Gateway Vải':'NGINX Gateway Fabric',
'các nodes':'các node','các namespaces':'các namespace','các Pods':'các Pod','các pods':'các Pod',
'các containers':'các container','các Services':'các Service','các workloads':'các workload',
'Control Plane nodes':'Node control plane','Worker nodes':'Node worker',
'Study Guides':'Tài liệu ôn tập',
}
files=[*root.glob('guides/*.md'),root/'Kubernetes installation/guide.md',*root.glob('Kubernetes installation/scripts/*.sh'),root/'js/data.js']
for p in files:
    s=p.read_text(encoding='utf-8')
    for a,b in polish.items():s=s.replace(a,b)
    if p.suffix=='.md' and p.name!='kubernetes-1.35-update.md':
        # Date-stamped scope note, without changing historic feature introductions.
        note='> **Bản tiếng Việt · CKA Kubernetes 1.35 · cập nhật 17/09/2026.** '
        note+='Đọc [các thay đổi cho phiên bản thi](kubernetes-1.35-update.md).\n\n' if p.parent.name=='guides' else 'Đọc [các thay đổi cho phiên bản thi](../guides/kubernetes-1.35-update.md).\n\n'
        s=re.sub(r'(^# .+\n)',lambda m:m[0]+'\n'+note,s,count=1,flags=re.M)
    if p.name in ['kubernetes-complete-guide.md','data.js']:
        s=s.replace('ETCDCTL_API=3 etcdctl snapshot restore','etcdutl snapshot restore').replace('etcdctl snapshot restore','etcdutl snapshot restore')
        s=s.replace('ETCDCTL_API=3 etcdctl snapshot status','etcdutl snapshot status').replace('etcdctl snapshot status','etcdutl snapshot status')
        s=s.replace('1.34.0','1.35.8').replace('1.33 -> 1.34','1.34 -> 1.35')
        s=s.replace('Kubernetes v1.34','Kubernetes v1.35')
        s=s.replace('1.31.0','1.35.8').replace('1.30.0-00','1.35.8-1.1')
        s=s.replace('v1.30.0','v1.34.0')
        s=s.replace('stable:/v1.31/','stable:/v1.35/').replace('dành cho Kubernetes 1.31','dành cho Kubernetes 1.35')
        s=s.replace('pod-security.kubernetes.io/enforce-version=v1.30','pod-security.kubernetes.io/enforce-version=v1.35')
        s=s.replace('Kubernetes 1.32 (hiện tại ổn định tính đến năm 2026)','Kubernetes 1.35 (môi trường thi CKA; kiểm tra 17/09/2026)')
        s=s.replace('v3.27.0/manifests/calico.yaml','v3.31.4/manifests/calico.yaml')
    if p.name=='kubernetes-complete-guide.md':
        # Use one complete, current upgrade workflow in the installation chapter.
        update=(root/'guides/kubernetes-1.35-update.md').read_text(encoding='utf-8')
        upgrade=update.split('## Nâng cấp kubeadm từ 1.34 lên 1.35\n',1)[1].split('\n## ',1)[0]
        s=re.sub(r'(## 2\.12[^\n]*\n).*?(?=\n<a name="chapter-3")',lambda m:m[1]+'\n'+upgrade+'\n\n---\n',s,flags=re.S)
        # Snapshot inspection is offline: TLS flags only belong to online etcdctl calls.
        s=re.sub(r'(etcdutl snapshot status [^\n]+) \\\n(?:\s+--(?:cacert|cert|key)=[^\n]+(?:\n|$))+',r'\1\n',s)
        # New resize semantics apply in the existing Pod chapter too.
        marker='## 23.2 '
        idx=s.find(marker)
        if idx>=0:
            end=s.find('\n',idx)
            s=s[:end+1]+'\n> **Cập nhật 1.35:** CPU/bộ nhớ của từng container có thể thay đổi qua `/resize`. Danh sách hoặc tên container và lệnh khởi chạy vẫn không được sửa tuỳ ý trên Pod đang tồn tại. Xem [bài resize Pod](kubernetes-1.35-update.md#thay-đổi-cpu-và-bộ-nhớ-của-pod-tại-chỗ).\n'+s[end+1:]
    if p.name=='coredns-cka-guide.md':
        s=re.sub(r'^> \*\*Mức độ liên quan[^\n]+', '> **Phạm vi ôn thi:** CoreDNS thuộc lĩnh vực Service và mạng (20%); việc chẩn đoán cũng liên quan lĩnh vực xử lý sự cố (30%). Không có tỷ trọng riêng chính thức cho CoreDNS.[^cka-curriculum]',s,flags=re.M)
    if 'ingress' in p.name and p.suffix=='.md':
        s=s.replace('Kubernetes 1.31/1.32','Kubernetes 1.35').replace('Kubernetes 1.32 / CKA v1.31+','Kubernetes 1.35 / đề cương CKA')
        notice='> **Controller cũ:** Ingress NGINX đã kết thúc bảo trì từ tháng 3/2026. Các ví dụ annotation NGINX bên dưới chỉ để thực hành với controller có sẵn trong lab hoặc đề bài. API Ingress vẫn tồn tại. Với cụm mới, chọn controller còn được bảo trì hoặc Gateway API. [Thông báo chính thức](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/).\n\n'
        s=re.sub(r'(^# .+\n)',lambda m:m[0]+'\n'+notice,s,count=1,flags=re.M)
    if 'gateway-api' in p.name and p.suffix=='.md':
        s=s.replace('Kubernetes 1.32+','Kubernetes 1.35').replace('Chương trình giảng dạy CKA v1.31+','đề cương CKA / Kubernetes 1.35')
        s=s.replace('Bản vá mới nhất','Bản vá của nhánh 1.4')
        if p.name=='gateway-api-cka-guide.md':
            s=re.sub(r'> ⚠️ \*\*Ghi chú bài kiểm tra:.*?(?=\n---)', '> **Ôn thi CKA 1.35:** Gateway API và Ingress đều có trong đề cương. Kiểm tra CRD, GatewayClass và controller mà đề bài cung cấp; không tự cài hoặc thay thế thành phần nếu không được yêu cầu. Các ví dụ API dùng bộ CRD 1.4.1; phiên bản CRD không phải phiên bản Kubernetes.\n',s,flags=re.S)
        else:
            # Keep the pinned API examples; stop recommending an incompatible old controller.
            s=s.replace('--version v1.2.1', '--version v1.8.4')
            target='# Envoy Gateway (triển khai tham chiếu CNCF)'
            s=s.replace(target,'# Envoy Gateway 1.8.x hỗ trợ Kubernetes 1.35 và Gateway API 1.5.1.\n# Cập nhật CRD lên cùng phiên bản trước khi cài controller này.\nkubectl apply --server-side -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.5.1/standard-install.yaml')
            s=s.replace('Sau khi cài đặt bộ điều khiển, đối tượng `GatewayClass` thường được tạo tự động. Xác minh:', 'Việc tạo `GatewayClass` phụ thuộc cách cài controller. Xác minh và tạo GatewayClass với `controllerName` đúng nếu chưa có. Không dùng GatewayClass của Cilium cho Envoy Gateway:')
    if p.name in ['guide.md','env.sh']:
        s=s.replace('v3.29.0','v3.31.4')
    if p.name=='guide.md':
        s=s.replace('# Hướng dẫn thiết lập cụm Kubernetes HA','# Lab Kubernetes 1.35 với nhiều control plane')
        s=s.replace('## Kiến trúc','> **Giới hạn lab:** hai thành viên stacked etcd cần cả hai để có quorum; mất một node là mất quorum. Một HAProxy cũng là điểm lỗi đơn. Muốn HA chịu lỗi, cần ít nhất ba control plane/etcd và đầu vào API có dự phòng.\n\n## Kiến trúc',1)
        s=s.replace('kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/tigera-operator.yaml','kubectl apply --server-side -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/operator-crds.yaml\nkubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/tigera-operator.yaml\nkubectl wait --for=condition=Established crd/installations.operator.tigera.io --timeout=120s')
        s=s.replace('### 3. Cài đặt', '> **Kiểm tra cgroup v2:** chạy `stat -fc %T /sys/fs/cgroup` trên mọi node; kết quả phải là `cgroup2fs`. Kubelet 1.35 mặc định từ chối cgroup v1. Đặt `SystemdCgroup = true` không tự bật cgroup v2.\n\n### 3. Cài đặt',1)
    p.write_text(s,encoding='utf-8',newline='\n')

for p in [root/'index.html',root/'pages/guide.html']:
    s=p.read_text(encoding='utf-8');prefix='pages/' if p.name=='index.html' else ''
    s=s.replace('<div class="guides-dropdown-menu">','<div class="guides-dropdown-menu">\n          <a href="'+prefix+'guide.html?id=kubernetes-1.35"><span class="guide-icon">&#128214;</span><span class="guide-info"><span class="guide-name">Cập nhật CKA Kubernetes 1.35</span><span class="guide-desc">Phiên bản thi, thay đổi và bài thực hành</span></span></a>',1)
    p.write_text(s,encoding='utf-8',newline='\n')
