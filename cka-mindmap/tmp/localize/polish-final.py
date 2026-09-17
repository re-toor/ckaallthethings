from pathlib import Path
import re

# Chỉ sửa câu chữ và chú thích; giữ nguyên dòng lệnh thực thi.
phrases = {
 'cuộn tròn':'curl', 'Hộp bận rộn':'BusyBox', 'kiểm tra độ cong':'kiểm tra bằng curl',
 'Vết nhơ và sự dung túng':'Taint và toleration', 'bị nhiễm độc':'có taint',
 'số đại biểu':'quorum', 'Số đại biểu cần thiết':'Quorum cần thiết',
 'Thất bại được dung thứ':'Số thành viên có thể mất',
 'phù du':'tạm thời', 'trước khi bay':'preflight',
 'Vòng lặp hòa giải':'Vòng lặp đối chiếu trạng thái',
 'sự hòa giải trong hành động':'quá trình đối chiếu trạng thái',
 'bộ điều khiển hòa giải với nó liên tục':'controller liên tục đối chiếu và điều chỉnh trạng thái thực tế',
 'Đăng nhập các gói sao hỏa':'Ghi log gói có địa chỉ nguồn bất thường (martian packets)',
 'Đăng nhập đầu ra vào LOGFILE':'Ghi đầu ra vào LOGFILE',
 'Đăng nhập vào tập tin':'Ghi log vào tệp', 'Đăng nhập tất cả':'Ghi log ở mức high',
 'Đăng nhập mọi thứ':'Ghi log ở mức full',
 'Đăng nhập lỗi xác thực':'Ghi log lỗi xác thực',
 'Đăng nhập từ pod mới nhất của quá trình triển khai':'Xem log của Pod mới nhất trong Deployment',
 'Đăng nhập ít dài dòng hơn trong sản xuất':'Giảm mức chi tiết của log trong môi trường production',
 'Hết thời gian kết nối':'Thời gian chờ tối đa để kết nối',
 'Đọc thời gian chờ':'Thời gian chờ tối đa khi đọc dữ liệu',
 'Hết thời gian chờ DNS':'Thời gian chờ tối đa cho DNS',
 'Hết thời gian truy vấn':'Thời gian chờ tối đa cho truy vấn',
 'số liệu thống kê chuyển nhượng':'thống kê truyền dữ liệu',
 'Liên kết với địa chỉ địa phương':'Gắn với địa chỉ IP cục bộ',
 'Đặt tên cho các giá trị thời gian chờ':'Đặt các giá trị thời gian chờ',
 'Đặt tất cả các giá trị thời gian chờ':'Đặt giới hạn thời gian chờ cho các thao tác',
 'Kiên trì vs tạm thời':'Cấu hình lâu dài và cấu hình tạm thời',
 'Bìa sách':'RoleBinding và ClusterRoleBinding',
 'containers tạm thời không yêu cầu khởi động lại image':'Ephemeral container không yêu cầu khởi động lại Pod',
 'Gỡ lỗi kubectl: tạo gỡ lỗi tạm thời container':'kubectl debug: thêm ephemeral container để gỡ lỗi',
 'All control-plane pods should be Running except CoreDNS (waits for CNI)':'Các Pod control plane cần ở trạng thái Running; CoreDNS chờ CNI',
 'Once CalicoPods are Running, the node becomes Ready':'Khi các Pod Calico hoạt động, node chuyển sang Ready',
 'STEP 1: Check pods are Running and Ready':'BƯỚC 1: Kiểm tra Pod ở trạng thái Running và Ready',
 'Thời gian chạy container':'Môi trường chạy container',
 'thời gian chạy container':'môi trường chạy container',
}
headings = {
 '1.3':'Chi tiết các thành phần control plane', '1.4':'Chi tiết các thành phần worker node',
 '1.6':'Namespace', '1.7':'Nhãn, bộ chọn và annotation', '1.9':'Quan hệ giữa các tài nguyên cốt lõi',
 '1.11':'Tìm hiểu sâu về kubeconfig', '1.12':'Trạng thái vòng đời Pod',
 '1.13':'Requests và limits của tài nguyên', '1.15':'Tổng quan mô hình bảo mật',
 '1.16':'Tóm tắt: 10 điều cần hiểu về Kubernetes',
 '2.1':'Tổng quan và điều kiện tiên quyết', '2.8':'Quản lý chứng chỉ bằng kubeadm',
 '2.11':'Danh sách kiểm tra sau cài đặt', '3.2':'Các mô hình HA',
 '3.4':'Quorum và khả năng chịu lỗi của etcd', '3.5':'Sao lưu và khôi phục etcd',
 '3.8':'Quản lý chứng chỉ trong cụm HA', '5.2':'Pod có một hoặc nhiều container',
 '5.4':'Cấu trúc chi tiết của Pod', '5.5':'Init container', '5.6':'Sidecar container',
 '5.7':'Các mẫu thiết kế Pod có nhiều container', '5.8':'Static Pod', '5.9':'Điều khiển lập lịch Pod',
 '5.10':'Bảo mật Pod và ServiceAccount', '5.11':'Quy trình gỡ lỗi Pod', '5.12':'Chiến lược cập nhật Deployment',
 '6.6':'ConfigMap bất biến', '6.12':'Mã hoá Secret khi lưu trữ', '6.14':'Thực hành bảo mật Secret',
 '7.8':'Quy trình xử lý sự cố PV/PVC', '7.9':'Các loại volume và ví dụ', '7.10':'Lưu trữ cho StatefulSet',
 '8.1':'Tự động tăng giảm số Pod bằng HPA', '8.2':'Tạo HPA bằng lệnh', '8.6':'Cấu hình HPA nâng cao',
 '8.7':'Tự động điều chỉnh tài nguyên Pod bằng VPA', '9.1':'Probe của container',
 '9.2':'Các cơ chế probe', '9.4':'Gỡ lỗi probe', '9.7':'Xử lý sự cố PodDisruptionBudget',
 '10.2':'Operator: controller cho tài nguyên tùy chỉnh', '10.5':'Xử lý sự cố CRD và Operator',
 '11.2':'Các tài nguyên cốt lõi của Gateway API', '11.7':'Chia lưu lượng bằng HTTPRoute (canary deployment)',
 '12.2':'Các loại Service', '12.6':'ExternalName Service: bí danh DNS CNAME', '12.7':'Headless Service: khám phá Pod trực tiếp',
 '12.9':'Xử lý sự cố Service', '12.10':'Tra cứu DNS của Service',
 '13.3':'Ingress cơ bản cho một Service', '13.4':'Định tuyến theo đường dẫn', '13.5':'Định tuyến theo hostname',
 '13.6':'Chấm dứt TLS', '14.4':'Chính sách lưu lượng đi ra (egress)',
 '14.5':'Mẫu NetworkPolicy trong thực tế', '14.6':'Kiểm tra NetworkPolicy',
 '15.4':'ClusterRole có sẵn', '15.6':'Kiểm tra và kiểm toán RBAC',
 '16.1':'Xác thực, phân quyền và admission', '16.2':'Xác thực: người dùng và chứng chỉ',
 '16.3':'Pod Security Standards (PSS)', '16.5':'Ghi log kiểm toán (audit log)',
 '16.6':'Chứng chỉ TLS trong Kubernetes', '16.7':'Quét và tăng cường bảo mật',
 '17.9':'Chạy lệnh một lần để gỡ lỗi', '17.10':'Thực thi lệnh trong Pod có nhiều container',
 '18.2':'Ghi và phân tích log có cấu trúc', '18.3':'Tổng hợp log từ nhiều Pod',
 '18.4':'Lưu giữ log và xem log của container trước đó', '18.5':'Kiến trúc thu thập log',
 '20.2':'So sánh trạng thái tài nguyên bằng diff', '20.5':'Sự kiện: công cụ chẩn đoán',
 '21.2':'Chuyển tiếp cổng để truy cập cơ sở dữ liệu', '22.3':'Kiến trúc Metrics Server',
 '22.4':'ResourceQuota và LimitRange', '22.5':'Lập kế hoạch năng lực cụm và node',
 '23.1':'Các trường bất biến của Pod đang chạy', '23.2':'Vì sao không thể xóa container khỏi Pod đang chạy',
 '23.3':'Xóa container khỏi Pod độc lập', '23.4':'Xóa container khỏi Pod do Deployment quản lý',
 '23.7':'Dừng tiến trình container để buộc khởi động lại', '23.8':'Loại bỏ init container',
 '23.11':'Vá Deployment đang hoạt động', '24.4':'Tạo container thử nghiệm có curl',
 '24.5':'Sử dụng netshoot: image chứa bộ công cụ mạng', '24.6':'Chạy Pod thử nghiệm trong namespace cụ thể',
 '24.7':'Kết nối vào Pod thử nghiệm đang chạy', '25.4':'Ma trận xử lý sự cố mạng',
 '25.5':'Lệnh kiểm tra mạng nâng cao', '26.2':'Quy ước đặt tên DNS trong Kubernetes',
 '26.5':'Kiểm tra phân giải DNS bằng nslookup', '26.6':'Kiểm tra phân giải DNS bằng dig',
 '26.11':'Metrics và endpoint kiểm tra sức khoẻ CoreDNS', '27.2':'Xử lý sự cố hệ thống trên node',
 '27.5':'Danh sách kiểm tra sự cố cấp cụm', '28.6':'Truy cập Service ở namespace khác',
 '28.7':'Vòng đời và dọn dẹp namespace', '29.3':'Cấu trúc thư mục: base và overlay',
 '29.5':'Ví dụ cấu hình base', '29.6':'Overlay: tùy chỉnh cho từng môi trường',
 '29.7':'Bản vá Kustomize: strategic merge và JSON 6902', '29.8':'Transformer: thay đổi tài nguyên trên toàn cấu hình',
 '29.9':'Generator: tạo ConfigMap và Secret từ tệp', '29.10':'Thay đổi image',
 '29.13':'Sử dụng base từ xa với Kustomize', '30.2':'Các lĩnh vực và tỷ trọng kỳ thi CKA',
 '30.3':'Sao lưu và khôi phục etcd', '30.7':'Quản lý node: cordon, drain và taint',
 '30.8':'Lập lịch Pod: affinity, nodeSelector và toleration', '30.11':'Static Pod trong CKA',
 '30.14':'Bài tự luyện CKA: các dạng nhiệm vụ thường gặp', '30.15':'Chuẩn bị ngày thi và lỗi thường gặp',
}
files = [*Path('guides').glob('*.md'),Path('Kubernetes installation/guide.md')]
for p in files:
 s=p.read_text(encoding='utf8'); lines=[]; fenced=False
 for line in s.splitlines():
  if line.startswith('```'): fenced=not fenced
  if not fenced or line.lstrip().startswith('#') or ' #' in line:
   for a,b in phrases.items():line=line.replace(a,b)
  if p.name=='kubernetes-complete-guide.md' and not fenced and line.startswith('## '):
   m=re.search(r'(?<!\d)(\d+\.\d+)(?!\d)',line)
   if m and m[1] in headings:line=f'## {m[1]} {headings[m[1]]}'
  lines.append(line.rstrip())
 s='\n'.join(lines).rstrip()+'\n'
 if p.name=='linux-network-commands.md':
  s=s.replace('*Kết thúc phần tham khảo lệnh mạng Linux hoàn chỉnh*\n\n---\n\n*Kết thúc phần tham khảo lệnh mạng Linux hoàn chỉnh*','*Kết thúc phần tham khảo lệnh mạng Linux hoàn chỉnh*')
 if p.name=='kubernetes-complete-guide.md':
  s=s.replace('nodeName - Chuyển nhượng trực tiếp','nodeName - Gán trực tiếp vào node')
  s=s.replace('**Taint** đẩy lùi Pods khỏi nodes. **Toleration** cho phép Pods được lên lịch trên nodes có taint.','**Taint** hạn chế Pod chạy trên node. **Toleration** tương ứng cho phép scheduler xem xét node đó; Pod vẫn phải đáp ứng các điều kiện lập lịch khác.')
  s=s.replace('Kubernetes 1.23+ đã giới thiệu **Container tạm thời** như một tính năng ổn định.','[Ephemeral container](https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/) ổn định từ Kubernetes **1.25**.')
  s=s.replace('Ổn định, K8s 1.23+','Ổn định từ Kubernetes 1.25')
  s=s.replace('| Tính ổn định | GA kể từ v1.1 | GA (v1) kể từ Kubernetes 1.28 |','| Tính ổn định | Ingress v1 ổn định từ Kubernetes 1.19 | GatewayClass, Gateway và HTTPRoute v1 ổn định từ Gateway API 1.0; phiên bản độc lập với Kubernetes |\n\nNguồn: [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) và [Gateway API 1.0](https://kubernetes.io/blog/2023/10/31/gateway-api-ga/).')
  s=s.replace('Người vận hành cơ sở dữ liệu','Operator cơ sở dữ liệu').replace('người vận hành nên','Operator nên').replace('Người vận hành không đối chiếu','Operator không đối chiếu').replace('bộ nhớ của người vận hành','bộ nhớ của Operator').replace('Tham khảo nhanh về người vận hành','Tham khảo nhanh về Operator')
  s=s.replace('# Kiểm tra namespace: kubectl nhận triển khai -n dàn dựng','# Kiểm tra namespace: kubectl get deployment -n staging').replace('# Kiểm tra chính tả: kubectl nhận triển khai --all-namespaces | grep của tôi','# Kiểm tra tên: kubectl get deployment --all-namespaces | grep my')
  s=s.replace('Sau khi thiết lập cụm HA, hãy xác minh rằng nó thực sự chịu được lỗi node:','Chỉ thực hiện trong lab có ít nhất ba thành viên etcd và đã sao lưu. Dừng kubelet không dừng các container đang chạy, nên không đủ để mô phỏng mất node. Tắt một máy ảo control plane bằng công cụ quản lý VM, rồi kiểm tra từ node còn lại:')
  s=s.replace('# Bước 2: Mô phỏng thất bại bằng cách dừng kubelet của người dẫn đầu\n# Trên dây dẫn node:\nsudo systemctl stop kubelet','# Bước 2: Tắt VM chứa etcd leader bằng công cụ quản lý máy ảo.\n# Chỉ tắt một VM trong lab ba control plane; giữ hai thành viên còn lại hoạt động.')
  s=s.replace('# Bước 5: Khôi phục node bị lỗi\n# Trên dây dẫn đầu node:\nsudo systemctl start kubelet','# Bước 5: Bật lại VM bằng công cụ quản lý máy ảo và chờ node trở lại Ready.')
 p.write_text(s,encoding='utf8',newline='\n')
p=Path('js/data.js');s=p.read_text(encoding='utf8')
for a,b in phrases.items():s=s.replace(a,b)
p.write_text(s,encoding='utf8',newline='\n')
print('Đã chuẩn hóa thuật ngữ và tiêu đề.')
