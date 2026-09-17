from pathlib import Path
terms={
'Step 1: Cấu hình /etc/hosts on all nodes':'Bước 1: Cấu hình /etc/hosts trên mọi node',
'Step 3: Install kubeadm, kubelet, kubectl on K8s nodes':'Bước 4: Cài kubeadm, kubelet, kubectl trên các node Kubernetes',
'Enable kubelet (it will crashloop until kubeadm init/join)':'Bật kubelet (có thể khởi động lại liên tục trước khi kubeadm init/join)',
' installed on ':' đã được cài trên ',
'Run kubeadm init and capture output':'Chạy kubeadm init và lưu đầu ra',
'Set up kubectl for the SSH user on CP1':'Cấu hình kubectl cho tài khoản SSH trên CP1',
'Set up kubectl on CP2':'Cấu hình kubectl trên CP2',
'kubeadm generates a full PKI during "kubeadm init":':'kubeadm tạo bộ PKI khi chạy "kubeadm init":',
'Checks expiry dates (kubeadm certs expire after 1 year)':'Kiểm tra ngày hết hạn (mặc định chứng chỉ lá hết hạn sau một năm)',
'Checking for certs expiring within 30 days...':'Kiểm tra chứng chỉ sẽ hết hạn trong 30 ngày...',
' expires in ${DAYS_LEFT} days!':' sẽ hết hạn sau ${DAYS_LEFT} ngày!',
'matches on both control planes':'khớp trên cả hai control plane',
'The API server cert should include the LB IP and both CP IPs.':'Chứng chỉ API server cần chứa IP của LB và cả hai control plane.',
'SAN missing ${expected_ip} — may need to regenerate apiserver cert':'SAN thiếu ${expected_ip} — có thể cần tạo lại chứng chỉ apiserver',
'Renew all certificates:':'Gia hạn tất cả chứng chỉ:',
'Run all steps':'Chạy mọi bước', 'Resume from step 4':'Tiếp tục từ bước 4', 'Run only step 7':'Chỉ chạy bước 7',
'Kịch bản phối âm chính':'Script điều phối triển khai',
'Deployment Đã hoàn thành!':'Đã triển khai xong!',
'proxy phía trước-ca.crt':'front-proxy-ca.crt',
'Service ký tài khoản':'Khóa ký token ServiceAccount',
'toán tử Tigera Calico':'Tigera operator của Calico',
'Đợi người vận hành sẵn sàng':'Đợi operator sẵn sàng',
'Thăm dò ý kiến cho đến khi hệ thống calico pods đang chạy':'Kiểm tra định kỳ đến khi các Pod calico-system chạy',
'Stats Dashboard':'Bảng thống kê',
}
for p in Path('Kubernetes installation/scripts').glob('*.sh'):
 s=p.read_text(encoding='utf8')
 for a,b in terms.items():s=s.replace(a,b)
 # set -e coi ((counter++)) là thất bại ở lần đầu (giá trị biểu thức bằng 0).
 for counter in ['PASS','FAIL','WARN']:s=s.replace(f'(({counter}++))',f'(({counter}+=1))')
 p.write_text(s,encoding='utf8',newline='\n')
