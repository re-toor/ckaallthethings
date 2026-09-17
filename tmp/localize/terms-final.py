from pathlib import Path
for p in list(Path('guides').glob('*.md'))+[Path('js/data.js'),Path('Kubernetes installation/guide.md')]:
    s=p.read_text(encoding='utf-8')
    for a,b in {'PodSự gián đoạnNgân sách':'PodDisruptionBudget','PodDisruptionNgân sách':'PodDisruptionBudget','Nguyên thủy tự phục hồi: Thăm dò':'Cơ chế tự phục hồi: probe','nguyên thủy tự phục hồi':'cơ chế tự phục hồi','và Beyond':'và các lựa chọn khác','Ảnh băm băm':'Giá trị băm','ảnh băm băm':'giá trị băm','Toán tử':'Operator','toán tử Tigera':'Tigera operator','CoreDNS 1.13.x / Kubernetes 1.31+':'CoreDNS trên Kubernetes 1.35','CoreDNS 1.13.2 / Kubernetes 1.31+':'CoreDNS trên Kubernetes 1.35'}.items():s=s.replace(a,b)
    p.write_text(s,encoding='utf-8')
