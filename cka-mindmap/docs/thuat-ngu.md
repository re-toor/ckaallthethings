# Thuật ngữ trong bộ tài liệu CKA

| Thuật ngữ | Cách hiểu trong tài liệu |
|---|---|
| cluster | Cụm Kubernetes |
| control plane | Các thành phần điều khiển trạng thái cụm |
| worker node | Node chạy workload |
| Pod | Đơn vị triển khai nhỏ nhất, gồm một hoặc nhiều container |
| workload | Ứng dụng hoặc tác vụ chạy trong cụm |
| container image | Image chứa hệ thống tệp và cấu hình để tạo container |
| namespace | Phạm vi tên của tài nguyên |
| controller | Bộ điều khiển đối chiếu trạng thái thực tế với trạng thái mong muốn |
| scheduler | Bộ lập lịch, chọn node phù hợp cho Pod |
| Service | Tài nguyên cung cấp điểm truy cập mạng đến backend |
| service discovery | Khám phá dịch vụ, thường qua DNS trong cụm |
| endpoint | Địa chỉ và cổng của backend |
| EndpointSlice | Tài nguyên mô tả nhóm endpoint của Service |
| ingress / egress | Lưu lượng vào / lưu lượng ra |
| Ingress | Tài nguyên định tuyến HTTP/HTTPS; cần Ingress controller |
| Gateway API | Tập API/CRD định tuyến lưu lượng; cần controller tương thích |
| volume | Vùng lưu trữ gắn vào Pod/container |
| claim / PVC | Yêu cầu cấp phát lưu trữ PersistentVolumeClaim |
| request / limit | Tài nguyên yêu cầu / giới hạn tài nguyên |
| probe | Phép kiểm tra startup, readiness hoặc liveness |
| taint / toleration | Hạn chế Pod lên node / khai báo chấp nhận hạn chế đó |
| affinity / anti-affinity | Quy tắc bố trí gần / tách xa |
| drain / cordon / uncordon | Di tản Pod / chặn / mở lại việc lập lịch lên node |
| snapshot / restore | Bản chụp trạng thái / khôi phục |
| quorum | Số thành viên biểu quyết tối thiểu để cụm etcd hoạt động |
| stable (GA) / beta / alpha | Ổn định / thử nghiệm beta / thử nghiệm alpha |
| deprecated | Không còn được khuyến nghị; chưa đồng nghĩa đã bị xoá |
| rollout / rollback | Triển khai phiên bản mới / quay lại phiên bản trước |
| shell | Môi trường diễn giải lệnh như Bash hoặc sh |

Tên loại tài nguyên, trường cấu hình, nhãn, namespace, hostname, đường dẫn, cờ lệnh và thông báo lỗi giữ đúng chính tả gốc. Các định danh như `web`, `default`, `controlplane1` không được dịch khi thực hành.
