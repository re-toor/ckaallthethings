from pathlib import Path
import re
root=Path(__file__).resolve().parents[2]
p=root/'guides/kubernetes-complete-guide.md';s=p.read_text(encoding='utf-8')
update=(root/'guides/kubernetes-1.35-update.md').read_text(encoding='utf-8')
upgrade=update.split('## Nâng cấp kubeadm từ 1.34 lên 1.35\n',1)[1].split('\n## ',1)[0]
start=s.index('<a id="heading-55-');start=s.index('\n## ',start);body=s.index('\n',start+1)
end=s.index('\n<a name="chapter-3"',body)
s=s[:start]+'\n## 2.12 Nâng cấp kubeadm từ 1.34 lên 1.35\n\n'+upgrade+'\n\n---\n'+s[end:]
# Keep the second upgrade chapter useful without carrying a conflicting workflow.
start=s.index('<a id="heading-368-');start=s.index('\n## ',start);body=s.index('\n',start+1)
end=s.index('\n<a id=',body)
s=s[:start]+'''\n## 30.4 Nâng cấp cụm bằng kubeadm

Thực hành theo [quy trình đầy đủ tại mục 2.12](#212-kubeadm-upgrade-workflow): đổi kho APT, chọn bản vá 1.35.x, nâng kubeadm, nâng control plane đầu tiên bằng `kubeadm upgrade apply`, rồi chạy `kubeadm upgrade node` trên từng control plane còn lại và worker. Drain từng node trước khi nâng kubelet và uncordon sau khi xác minh Ready.

```bash
# Máy có kubeconfig quản trị: kiểm tra trước và sau mỗi node
kubectl get nodes -o wide
kubectl get pods -A
kubectl get --raw='/readyz?verbose'
```

Không bỏ qua minor, không nâng kubelet vượt phiên bản API server, không xử lý đồng thời nhiều thành viên etcd. Chọn đúng bản vá đề bài yêu cầu; không dùng tên gói kiểu `1.30.0-00` của kho cũ.

'''+s[end:]
# Strip online-only flags from offline etcdutl commands and add revision handling.
lines=s.splitlines();out=[];i=0
while i<len(lines):
    if re.match(r'\s*(?:sudo )?etcdutl snapshot (status|restore) ',lines[i]):
        block=[lines[i]]
        while block[-1].rstrip().endswith('\\') and i+1<len(lines):i+=1;block.append(lines[i])
        block=[l.rstrip().removesuffix('\\').rstrip() for l in block if not re.match(r'\s*--(?:endpoints|cacert|cert|key)=',l)]
        if 'snapshot restore' in block[0]:block+=['  --bump-revision=1000000000','  --mark-compacted']
        out.extend(l+' \\' if j<len(block)-1 else l for j,l in enumerate(block))
    else:out.append(lines[i])
    i+=1
s='\n'.join(out)+'\n'
# Add aliases for original table-of-contents fragments which differed from headings.
for frag in set(re.findall(r'\]\(#((?:chapter-\d+|appendix-[a-d])-[-a-z0-9]+)\)',s)):
    key=re.match(r'(chapter-\d+|appendix-[a-d])',frag)[1]
    s=s.replace(f'<a name="{key}"></a>',f'<a name="{key}"></a>\n<a id="{frag}"></a>',1)
start=s.index('<a id="heading-267-');pos=s.index('\n',s.index('\n## ',start)+1)
s=s[:pos+1]+'\n> **Kubernetes 1.35:** tài nguyên CPU/bộ nhớ của từng container có thể thay đổi qua `/resize`; danh sách container và lệnh khởi chạy vẫn có ràng buộc bất biến. Xem [bài resize Pod](kubernetes-1.35-update.md#thay-đổi-cpu-và-bộ-nhớ-của-pod-tại-chỗ).\n'+s[pos+1:]
s=s.replace('`ETCDCTL_API=3` — Sử dụng etcd API phiên bản 3 (bắt buộc đối với etcd hiện đại)','`ETCDCTL_API=3` — Biến dùng trong ví dụ etcdctl cũ; các phiên bản etcdctl hiện đại mặc định dùng API v3')
p.write_text(s,encoding='utf-8',newline='\n')
for filename,pairs in {
 'coredns-complete-guide.md':[('7-troubleshooting--systematic-diagnosis-k8s-dns-debug','7-troubleshooting--systematic-diagnosis')],
 'coredns-cka-guide.md':[('task-12--configure-externalname-service-k8s-externalname','task-12--configure-externalname-service'),('task-13--verify-headless-service-dns-k8s-statefulset-dns','task-13--verify-headless-service-dns')]
}.items():
    p=root/'guides'/filename;s=p.read_text(encoding='utf-8')
    for a,b in pairs:s=s.replace(f'<a id="{a}"></a>',f'<a id="{b}"></a>\n<a id="{a}"></a>')
    p.write_text(s,encoding='utf-8',newline='\n')
polish={
 'volume công việc':'workload','Volume công việc':'Workload','thùng chứa':'container','Thùng chứa':'Container',
 'vùng chứa':'container','Vùng chứa':'Container','âm lượng':'volume','Âm lượng':'Volume',
 'Vết bẩn':'Taint','vết bẩn':'taint','Dung sai':'Toleration','dung sai':'toleration',
 'Nhập học':'Tiếp nhận','nhập học':'tiếp nhận','Vé vào':'Tiếp nhận','hệ thống kube':'kube-system',
 'tự chữa bệnh':'tự phục hồi','Tự chữa bệnh':'Tự phục hồi','lăn cập nhật':'cập nhật cuốn chiếu',
 'máy phát':'trình tạo','bảng kê khai':'manifest','tệp kê khai':'manifest',
 'kubectl lấy bí mật -A -o json | kubectl thay thế -f -':'kubectl get secrets -A -o json | kubectl replace -f -',
 'Lập kế hoạch':'Lập lịch','lập kế hoạch':'lập lịch',
 'Tỷ lệ tự động':'Tự động co giãn','chia tỷ lệ':'co giãn','Chia tỷ lệ':'Co giãn',
}
for p in [*root.glob('guides/*.md'),*root.glob('Kubernetes installation/**/*.sh'),root/'Kubernetes installation/guide.md',root/'js/data.js']:
    s=p.read_text(encoding='utf-8')
    for a,b in polish.items():s=s.replace(a,b)
    p.write_text(s,encoding='utf-8',newline='\n')
