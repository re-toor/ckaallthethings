const fs=require('fs'),vm=require('vm');const c={};vm.runInNewContext(fs.readFileSync('js/data.js','utf8')+';this.d={GUIDE_LINKS,DOMAIN_COLORS,MIND_MAP_DATA}',c);
const {GUIDE_LINKS,DOMAIN_COLORS,MIND_MAP_DATA:d}=c.d;
const pages={
'main':['Ôn thi CKA',['Kiến trúc cụm,\ncài đặt và\ncấu hình','Workload và\nlập lịch','Service\nvà mạng','Lưu trữ','Xử lý sự cố']],
'cluster-architecture':['Kiến trúc, cài đặt và cấu hình cụm',['RBAC','kubeadm','Control plane\nsẵn sàng cao','Giao diện\nmở rộng','CRD và\nOperator','Helm và\nKustomize','Vòng đời\ncụm']],
'workloads-scheduling':['Workload và lập lịch',['Deployment','ConfigMap\nvà Secret','Tự động\nco giãn','Tự phục hồi','Tiếp nhận và\nlập lịch Pod']],
'services-networking':['Service và mạng',['Kết nối\ngiữa các Pod','Các loại\nService','Gateway API','Ingress','NetworkPolicy','CoreDNS']],
'storage':['Lưu trữ',['StorageClass và\ncấp phát động','Volume và\nchế độ truy cập','PV và PVC']],
'troubleshooting':['Xử lý sự cố',['Cụm và node','Thành phần\nhệ thống','Giám sát\ntài nguyên','Log\ncontainer','Service\nvà mạng']],
'rbac':['Phân quyền truy cập RBAC',['Role','ClusterRole','RoleBinding','ClusterRoleBinding','ServiceAccount','Kiểm tra\nquyền truy cập']],
'kubeadm':['Khởi tạo và quản lý cụm bằng kubeadm',['kubeadm init','kubeadm join','kubeadm upgrade','kubeadm config','kubeadm token','kubeadm reset']],
'ha-control-plane':['Control plane sẵn sàng cao',['etcd\nđồng vị trí','etcd\nđộc lập','Cân bằng tải','Sao lưu và\nkhôi phục etcd']],
'extension-interfaces':['Giao diện mở rộng',['CNI','CSI','CRI']],
'crds-operators':['CRD và Operator',['Định nghĩa\ntài nguyên CRD','Mô hình\nOperator','Tài nguyên\ntuỳ chỉnh']],
'helm-kustomize':['Helm và Kustomize',['Helm chart','Kho Helm','Kustomize\nbase','Kustomize\noverlay']],
'cluster-lifecycle':['Quản lý vòng đời cụm',['Nâng cấp\nphiên bản','Quản lý node','Sao lưu và\nkhôi phục etcd','Quản lý\nchứng chỉ']],
'deployments':['Deployment',['Cập nhật\ncuốn chiếu','Quay lại\nphiên bản cũ','Chiến lược\ntriển khai','Cấu hình\nDeployment']],
'configmaps-secrets':['ConfigMap và Secret',['ConfigMap','Secret','Gắn volume','Biến\nmôi trường']],
'autoscaling':['Tự động co giãn workload',['HPA','VPA','Metrics Server']],
'self-healing':['Workload tự phục hồi',['ReplicaSet','DaemonSet','StatefulSet','Job','CronJob']],
'pod-admission-scheduling':['Tiếp nhận và lập lịch Pod',['nodeSelector','Node affinity','Taint và\ntoleration','Giới hạn\ntài nguyên','Độ ưu tiên\nPod']],
'pod-connectivity':['Kết nối giữa các Pod',['Mô hình\nmạng Pod','Plugin CNI','DNS của Pod']],
'service-types':['Các loại Service',['ClusterIP','NodePort','LoadBalancer','ExternalName','Endpoint và\nEndpointSlice']],
'gateway-api':['Gateway API',['Gateway','HTTPRoute','GRPCRoute và\nTLSRoute','GatewayClass']],
'ingress':['Ingress',['Ingress\ncontroller','Tài nguyên\nIngress','Kết thúc TLS','Định tuyến\ntheo đường dẫn']],
'network-policies':['Chính sách mạng',['Quy tắc\nlưu lượng vào','Quy tắc\nlưu lượng ra','Bộ chọn','Chính sách\nmặc định']],
'coredns':['CoreDNS',['Khám phá\ndịch vụ','Cấu hình\nCoreDNS','DNS tuỳ chỉnh']],
'storage-classes':['StorageClass và cấp phát động',['StorageClass\ncơ bản','Cấp phát\nđộng','Provisioner']],
'volume-types':['Volume và chế độ truy cập',['Chế độ\ntruy cập','Các loại\nvolume','Chế độ\nvolume']],
'persistent-volumes':['PersistentVolume và PersistentVolumeClaim',['PersistentVolume','PersistentVolumeClaim','Chính sách\nthu hồi','Liên kết\nPV/PVC']],
'cluster-node-troubleshooting':['Xử lý sự cố cụm và node',['Trạng thái node','Sự cố kubelet','Sự cố\nkube-proxy','Sự cố\nchứng chỉ']],
'cluster-components':['Thành phần cụm',['API server','Scheduler','Controller\nmanager','etcd']],
'monitoring':['Giám sát và sử dụng tài nguyên',['kubectl top','ResourceQuota','Sự kiện']],
'container-logs':['Log và luồng đầu ra của container',['kubectl logs','Kiến trúc\nghi log','Gỡ lỗi\nứng dụng']],
'network-troubleshooting':['Xử lý sự cố Service và mạng',['Gỡ lỗi DNS','Gỡ lỗi Service','Kết nối Pod','Gỡ lỗi Ingress']]
};
for(const [key,[title,names]] of Object.entries(pages)){
  if(d[key].nodes.length!==names.length)throw Error(key);
  d[key].title=title;d[key].nodes.forEach((n,i)=>n.name=names[i]);
}
for(const [key,page] of Object.entries(d)){
  page.parentTitle=page.parent?d[page.parent].title:null;
  page.subtitle=key==='main'?'Certified Kubernetes Administrator | Kubernetes 1.35 | Tiếng Việt':
    page.parent==='main'?d.main.nodes.find(n=>n.id===key).weight+' nội dung thi CKA':page.parentTitle+' > '+page.title;
}
const update={title:'Cập nhật CKA Kubernetes 1.35',url:'pages/guide.html?id=kubernetes-1.35',guide:'Phiên bản thi và kiến thức cập nhật'};
for(const key of ['kubeadm','cluster-lifecycle','autoscaling','service-types','ingress','gateway-api','ha-control-plane','volume-types'])GUIDE_LINKS[key].unshift({...update});
d.autoscaling.nodes.push({
  name:'Resize Pod\ntại chỗ',description:'Điều chỉnh CPU và bộ nhớ; ổn định trong 1.35',
  keyPoints:['Dùng subresource /resize để thay requests/limits CPU và bộ nhớ của từng container.',
    'resizePolicy quyết định có cần khởi động lại container; không phải mọi lần resize đều không gián đoạn.',
    'Giữ nguyên lớp QoS; kiểm tra PodResizePending và PodResizeInProgress nếu thay đổi chưa được áp dụng.',
    'VPA là thành phần bổ sung; cập nhật template của Deployment vẫn tạo rollout.'],
  commands:['kubectl explain pod.spec.containers.resizePolicy','kubectl get pod <pod> -o yaml'],
  references:[{title:'Resize tài nguyên container trong Kubernetes 1.35',url:'https://v1-35.docs.kubernetes.io/docs/tasks/configure-pod-container/resize-container-resources/'}]
});
d['cluster-node-troubleshooting'].nodes[1].keyPoints.push('Kubelet 1.35 mặc định từ chối cgroup v1 (failCgroupV1: true); kiểm tra cgroup2fs trước khi nâng cấp.');
d['cluster-node-troubleshooting'].nodes[1].commands.push('stat -fc %T /sys/fs/cgroup');
d['cluster-node-troubleshooting'].nodes[2].keyPoints=[
'kube-proxy xử lý chuyển tiếp Service; trên Linux có các chế độ iptables, nftables và IPVS.',
'IPVS bị deprecated từ 1.35 nhưng chưa bị xoá. Kiểm tra chế độ của cụm trước khi chẩn đoán.',
'Thường chạy dưới dạng DaemonSet trong namespace kube-system.',
'Kiểm tra log, cấu hình, EndpointSlice và kết nối từ Pod tới backend.'
];
d['service-types'].nodes[4].keyPoints.push('Endpoints deprecated từ 1.33; ưu tiên EndpointSlice khi tra cứu backend.',
'trafficDistribution PreferSameZone/PreferSameNode là ưu tiên vị trí; khác với chính sách Local.');
d['service-types'].nodes[4].commands.push('kubectl get endpointslices -n <namespace> -l kubernetes.io/service-name=<service> -o yaml');
d.ingress.nodes[0].keyPoints.unshift('Ingress NGINX cộng đồng kết thúc bảo trì tháng 3/2026; API Ingress vẫn tồn tại. Dùng controller còn bảo trì cho cụm mới.');
d['ha-control-plane'].nodes[0].keyPoints.push('Cần ít nhất ba thành viên etcd để chịu mất một thành viên. Hai thành viên cần cả hai để có quorum.');
d['cluster-lifecycle'].nodes[0].keyPoints.push('Đổi kho APT sang nhánh 1.35, nâng kubeadm trước, rồi drain từng node trước khi nâng kubelet; control plane trước worker. Chọn bản vá đề bài yêu cầu.');
for(const page of Object.values(d))for(const n of page.nodes){
  if(n.commands)n.commands=n.commands.map(cmd=>cmd.replace(/\s+\((on worker nodes after kubeadm upgrade|list all environment variables)\)$/,
    (_,s)=>' # '+(s.startsWith('on')?'Trên worker sau khi nâng kubeadm':'Liệt kê biến môi trường')));
  if(n.commands?.some(x=>x.includes('etcdutl snapshot restore')))n.keyPoints.push('Dùng etcdutl để phục hồi ngoại tuyến vào thư mục mới; cấu hình đúng membership, hostPath và revision bump/mark-compacted. etcdctl dùng để chụp snapshot.');
}
fs.writeFileSync('js/data.js','// Dữ liệu CKA tiếng Việt, mục tiêu Kubernetes 1.35.\n'+Object.entries(c.d).map(([k,v])=>'const '+k+' = '+JSON.stringify(v,null,2)+';\n').join('\n'));
