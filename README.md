# CKA Study guide Vietnamese

Bộ tài liệu ôn thi **Certified Kubernetes Administrator (CKA)** gồm sơ đồ tư duy tương tác, tài liệu lý thuyết, bài thực hành, hướng dẫn dựng cụm và PDF để đọc ngoại tuyến.

**Phiên bản mục tiêu: Kubernetes 1.35**, theo [môi trường thi CKA do Linux Foundation công bố](https://docs.linuxfoundation.org/tc-docs/certification/faq-cka-ckad-cks), kiểm tra ngày **17/09/2026**. Repo bám phiên bản thi; không phải tuyên bố về bản Kubernetes mới nhất. Trước ngày thi, kiểm tra lại thông tin của đơn vị tổ chức.

Đọc [các thay đổi cần biết cho CKA 1.35](guides/kubernetes-1.35-update.md) trước khi thực hành.

## Nội dung ôn tập

| Lĩnh vực | Tỷ trọng | Chủ đề chính |
|---|---:|---|
| Kiến trúc, cài đặt và cấu hình cụm | 25% | RBAC, kubeadm, HA, CNI/CSI/CRI, CRD, Operator, Helm, Kustomize, vòng đời cụm |
| Workload và lập lịch | 15% | Deployment, ConfigMap, Secret, autoscaling, tự phục hồi, lập lịch Pod |
| Service và mạng | 20% | Kết nối Pod, Service, Gateway API, Ingress, NetworkPolicy, CoreDNS |
| Lưu trữ | 10% | StorageClass, volume, chế độ truy cập, PV/PVC |
| Xử lý sự cố | 30% | Cụm, node, thành phần hệ thống, tài nguyên, log và mạng |

Nguồn: [đề cương CKA chính thức](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/). Đây là tài liệu cộng đồng và bài tự luyện, không phải tài liệu hay đề thi chính thức của CNCF/Linux Foundation.

## Tài liệu học và thực hành

- [Cập nhật CKA Kubernetes 1.35](guides/kubernetes-1.35-update.md): phiên bản thi, thay đổi kỹ thuật và quy trình nâng cấp.
- [Kubernetes đầy đủ](guides/kubernetes-complete-guide.md): 30 chương lý thuyết, lệnh và tình huống quản trị.
- [Lệnh mạng Linux](guides/linux-network-commands.md): 56 mục tra cứu lệnh, tùy chọn và ví dụ.
- [Gateway API đầy đủ](guides/gateway-api-complete-guide.md) và [thực hành Gateway API](guides/gateway-api-cka-guide.md).
- [Ingress đầy đủ](guides/ingress-complete-guide.md) và [thực hành Ingress](guides/ingress-cka-guide.md).
- [CoreDNS đầy đủ](guides/coredns-complete-guide.md) và [thực hành CoreDNS](guides/coredns-cka-guide.md).
- [Dựng cụm Kubernetes](Kubernetes%20installation/guide.md): lab HAProxy, hai control plane và hai worker.
- PDF tiếng Việt: [Kubernetes CKA](guides/kubernetes-complete-guide_KDP.pdf), có phụ lục cập nhật 1.35, và [lệnh mạng Linux](guides/linux-network-commands_KDP.pdf).

## Quy ước tiếng Việt

Phần giải thích, tiêu đề, giao diện và chú thích được Việt hoá. Giữ nguyên tên tài nguyên (Pod, Deployment, Service…), thuật ngữ cần tra cứu, tên trường YAML, định danh, đường dẫn, câu lệnh và đầu ra thực tế của công cụ. Xem [bảng thuật ngữ](docs/thuat-ngu.md).

Các liên kết mục cũ được giữ qua anchor ổn định. Trình đọc hỗ trợ mục lục, tìm kiếm tiếng Việt, đánh dấu kết quả và bộ nhớ đệm theo phiên bản nội dung. Giao diện tối có màu riêng cho từng lĩnh vực và hỗ trợ máy tính, máy tính bảng.

## Chạy trên máy

Website dùng HTML, CSS, JavaScript thuần, không cần build. D3.js v7 vẽ mindmap; marked.js chuyển Markdown thành HTML. D3.js và phông chữ web được tải từ CDN. GitHub Pages phục vụ trang công khai.

```bash
git clone https://github.com/compufreq/cka-mindmap.git
cd cka-mindmap
python3 -m http.server 8080
```

Trên Windows có thể dùng `python -m http.server 8080`. Mở [localhost:8080](http://localhost:8080). Dùng HTTP để trình duyệt tải được các tệp Markdown.

Trang dự án gốc: [compufreq.github.io/cka-mindmap](https://compufreq.github.io/cka-mindmap/). Bản làm việc này chỉ xuất hiện trên trang công khai sau khi chủ repo triển khai.

## Điều hướng

1. Chọn một trong năm nhánh lĩnh vực để mở chủ đề.
2. Chọn chủ đề để xem các mục chi tiết.
3. Chọn mục cuối để đọc kiến thức, lệnh và nguồn tham khảo.
4. Dùng menu **Tài liệu ôn tập** hoặc liên kết trong bảng chi tiết để mở hướng dẫn.
5. Dùng đường dẫn điều hướng hoặc nút **Quay lại** để trở về sơ đồ.

## Lab cài đặt

Lab trong `Kubernetes installation/` gồm một HAProxy (`10.10.10.10`), hai control plane (`10.10.10.11`, `10.10.10.12`) và hai worker (`10.10.10.14`, `10.10.10.15`). Có 12 tệp script, gồm cấu hình chung, bộ điều phối và 10 bước: host, tường lửa, HAProxy, gói Kubernetes, khởi tạo/join, Calico, kiểm tra và chứng chỉ.

**Giới hạn HA:** hai thành viên stacked etcd không chịu được mất một thành viên; HAProxy đơn cũng là điểm lỗi đơn. Dùng cấu hình này để luyện thao tác. Muốn chịu mất một control plane, cần ít nhất ba thành viên etcd và đầu vào API có dự phòng.

Đọc các bước chuẩn bị Ubuntu, containerd, cgroup v2 và swap trong hướng dẫn trước khi chạy script. Bộ script cài mới không dùng để nâng cấp một cụm đang có dữ liệu.

## Cấu trúc repo

```text
index.html                   Trang sơ đồ tư duy
pages/guide.html             Trình đọc tài liệu
js/data.js                   Chủ đề, kiến thức, lệnh và liên kết
js/mindmap.js                Vẽ sơ đồ và bảng chi tiết
js/guide.js                  Tải tài liệu, mục lục, điều hướng
js/guide-search.js           Tìm kiếm trong tài liệu
js/markdown.js               Kết xuất Markdown và nguồn tham khảo
css/                        Giao diện chung và trang tài liệu
guides/                     Markdown và hai bản PDF
Kubernetes installation/    Hướng dẫn và script dựng lab
docs/                       Thuật ngữ và ghi chú cập nhật
tools/                      Kiểm tra nội dung và xuất PDF
lib/marked.min.js            Thư viện Markdown bên thứ ba
.github/workflows/          Cấu hình GitHub Pages
```

## Kiểm tra và xuất lại PDF

```bash
node tools/check-docs.cjs
```

Để xuất PDF ngoại tuyến, cần Node.js, Python và ReportLab. Bộ xuất dùng phông Arial/Consolas trên Windows hoặc DejaVu trên Linux để hiển thị đủ dấu tiếng Việt. Đặt `PDF_FONT_DIR` nếu phông nằm ở thư mục khác.

```bash
python -m pip install reportlab
node tools/prepare-pdfs.cjs
python tools/render-pdfs.py
```

Script xuất lại hai PDF trong `guides/` từ Markdown hiện tại. Sau mỗi lần sửa nội dung, kiểm tra bố cục các trang có bảng, sơ đồ và khối lệnh dài.

## Tác giả và giấy phép

Tác giả gốc: **Alaa Alhorani** ([@compufreq](https://github.com/compufreq)), tháng 2/2026. Bản tiếng Việt và cập nhật CKA 1.35: ngày 17/09/2026.

Giữ nguyên [LICENSE](LICENSE): **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International**. Giấy phép cho phép chia sẻ nguyên tác kèm ghi công, không cho phép sử dụng thương mại hoặc phân phối bản sửa đổi theo giấy phép này.
