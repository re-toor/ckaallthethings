import concurrent.futures, hashlib, html, json, re, subprocess, sys, time
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import urlencode

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'tmp/localize'
CACHE = WORK / 'cache.json'
cache = json.loads(CACHE.read_text(encoding='utf-8')) if CACHE.exists() else {}
segments = []

# Preserve executable syntax, references and Kubernetes API vocabulary.
terms = 'Kubernetes kubectl kubeadm kubelet kube-proxy kube-apiserver kube-scheduler kube-controller-manager containerd crictl etcd etcdctl etcdutl CoreDNS Calico Flannel Cilium NGINX Envoy Traefik Linux Ubuntu Debian systemd iptables nftables IPVS Kustomize Helm Docker Pod Pods Deployment Deployments StatefulSet StatefulSets DaemonSet DaemonSets ReplicaSet ReplicaSets ReplicationController Job Jobs CronJob CronJobs Service Services Endpoint Endpoints EndpointSlice EndpointSlices ConfigMap ConfigMaps Secret Secrets PersistentVolume PersistentVolumes PersistentVolumeClaim PersistentVolumeClaims StorageClass StorageClasses VolumeSnapshot VolumeAttributesClass Ingress IngressClass Gateway GatewayClass HTTPRoute GRPCRoute TCPRoute TLSRoute UDPRoute ReferenceGrant NetworkPolicy NetworkPolicies ServiceAccount ServiceAccounts Role Roles ClusterRole ClusterRoles RoleBinding RoleBindings ClusterRoleBinding ClusterRoleBindings ResourceQuota LimitRange PodDisruptionBudget HPA VPA RBAC CNI CSI CRI CRD CRDs API DNS TCP UDP TLS HTTP HTTPS CIDR NAT SNAT DNAT MTU BGP VXLAN IPIP HAProxy NodePort ClusterIP LoadBalancer ExternalName ReadWriteOnce ReadWriteMany ReadOnlyMany ReadWriteOncePod YAML JSON Corefile kubeconfig namespace namespaces node nodes workload workloads container containers control-plane'.split()
terms += 'pod pods image images digest shell shells worker workers taint taints toleration tolerations sidecar sidecars initContainer initContainers configMapGenerator secretGenerator imagePullPolicy CrashLoopBackOff ImagePullBackOff Pending Running Ready NotReady OOMKilled requests limits stdout stderr stdin kubelet.service'.split()
terms += ['control plane', 'Control Plane', 'Service Discovery', 'service discovery']
term_re = r'\b(?:' + '|'.join(sorted(map(re.escape, terms),key=len,reverse=True)) + r')\b'
protect = re.compile(r'`+[^`\n]+`+|\]\([^\n]*?\)|\[\^[^\]]+\]|https?://[^\s<>)]+|<[^>]+>|&(?:#\d+|\w+);|\$\{[^}]+\}|\$[A-Za-z_]\w*|(?<!\w)--[a-z][\w-]*|(?:\.?\.?/)?[A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)+|\b\w+(?:\.\w+){1,}\b|'+term_re)

def mask(s):
    values=[]
    def sub(m):
        values.append(m.group())
        return f'ZXQ{len(values)-1:04d}QXZ'
    return protect.sub(sub,s),values

def add(s):
    if not re.search('[a-zA-Z]{2}',s) or not s.strip(): return lambda:s
    if s.strip() in terms: return lambda:s
    masked, values=mask(s)
    if not re.search('[a-zA-Z]{2}',re.sub(r'ZXQ\d+QXZ','',masked)): return lambda:s
    key=hashlib.sha256(masked.encode()).hexdigest()
    segments.append((key,masked))
    def result():
        t=cache[key]
        for i,v in enumerate(values):
            t=re.sub(r'ZXQ\s*'+f'{i:04d}'+r'\s*QXZ',lambda m:v,t,flags=re.I)
        if re.search(r'ZXQ\s*\d',t,re.I): raise ValueError('Unresolved protected token: '+t)
        return t
    return result

def markdown(src):
    parts=[]; fence=False; paragraph=[]; headings=[]; used={}
    def flush():
        if paragraph:
            p=' '.join(x.strip() for x in paragraph)
            parts.append(add(p));parts.append(lambda:'\n');paragraph.clear()
    for line in src.splitlines():
        if re.match(r'^\s*(```|~~~)',line):
            flush();fence=not fence;parts.append(lambda l=line:l+'\n');continue
        if fence:
            m=re.match(r'^(\s*#\s+)(.*)$',line)
            if not m: m=re.match(r'^(.*?\s{2,}#\s+)(.*)$',line)
            # Comments that represent raw command output remain exact.
            if m and re.search(r'[a-z]{3}',m[2]) and not re.search(r'\b(?:Running|Ready|NAME|AGE|ClusterIP|NodePort)\b',m[2]):
                fn=add(m[2]);parts.append(lambda p=m[1],f=fn:p+f()+'\n')
            else: parts.append(lambda l=line:l+'\n')
            continue
        if re.match(r'^\s*\[[^\]]+\]:\s*https?://',line) or line.startswith('<a '):
            flush();parts.append(lambda l=line:l+'\n');continue
        m=re.match(r'^(#{1,6})\s+(.+)$',line)
        if m:
            flush()
            plain=html.unescape(re.sub(r'<[^>]+>|[*`]', '', m[2]))
            github=re.sub(r'[^\w\- ]','',plain.lower()).replace(' ','-')
            n=used.get(github,0);used[github]=n+1
            github=github+(f'-{n}' if n else '')
            anchors=[github]
            if len(m[1])<=3:
                slug=re.sub(r'-+','-',re.sub(r'\s+','-',re.sub(r'[^a-z0-9\s-]','',plain[:50].lower()))).strip()
                anchors.append(f'heading-{len(headings)}-{slug}');headings.append(plain)
            parts.append(lambda a=anchors:''.join(f'<a id="{x}"></a>\n' for x in a)+'\n')
            fn=add(m[2]);parts.append(lambda p=m[1],f=fn:p+' '+f()+'\n');continue
        if not line.strip() or re.match(r'^\s*[-|: ]+$',line):
            flush();parts.append(lambda l=line:l+'\n');continue
        if line.lstrip().startswith('|'):
            flush();cells=line.split('|');fns=[add(c.strip()) for c in cells[1:-1]]
            parts.append(lambda fs=fns:'| '+' | '.join(f() for f in fs)+' |\n');continue
        m=re.match(r'^(\s*(?:>\s*|[-*+]\s+|\d+\.\s+))(.+)$',line)
        if m:
            flush();fn=add(m[2]);parts.append(lambda p=m[1],f=fn:p+f()+'\n');continue
        paragraph.append(line)
    flush()
    return lambda:''.join(f() for f in parts)

outputs={}
files=[ROOT/'README.md',*[p for p in sorted((ROOT/'guides').glob('*.md')) if p.name!='kubernetes-1.35-update.md'],ROOT/'Kubernetes installation/guide.md']
for p in files:
    backup=WORK/(p.stem+'-original.md' if p.name!='guide.md' else 'install-original.md')
    if not backup.exists(): backup.write_text(p.read_text(encoding='utf-8'),encoding='utf-8')
    outputs[p]=markdown(backup.read_text(encoding='utf-8'))

data=json.loads((WORK/'data-original.json').read_text(encoding='utf-8'))
def walk(obj,key=''):
    if isinstance(obj,dict): return {k:walk(v,k) for k,v in obj.items()}
    if isinstance(obj,list): return [walk(v,key) for v in obj]
    if isinstance(obj,str) and key in ['title','subtitle','parentTitle','name','description','keyPoints','guide']:
        # Keep explicit line breaks in mind map labels.
        fs=[add(x) for x in obj.split('\n')]
        return lambda:'\n'.join(f() for f in fs)
    return obj
data=walk(data)
def resolve(obj):
    if callable(obj): return obj()
    if isinstance(obj,dict):return {k:resolve(v) for k,v in obj.items()}
    if isinstance(obj,list):return [resolve(v) for v in obj]
    return obj

def translate_batch(batch):
    query='\n'.join(f'[ZSEG{i:04d}]\n{s}' for i,(_,s) in enumerate(batch))
    url='https://translate.googleapis.com/translate_a/single?'+urlencode({'client':'gtx','sl':'en','tl':'vi','dt':'t','q':query})
    for attempt in range(5):
        try:
            with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=40) as r: response=json.load(r)
            translated=''.join(x[0] for x in response[0] if x[0])
            chunks=re.split(r'\[\s*ZSEG\s*\d{4}\s*\]',translated,flags=re.I)[1:]
            if len(chunks)!=len(batch):raise ValueError('segment count')
            result={}
            for (key,original),out in zip(batch,chunks):
                expected=re.findall(r'ZXQ\d{4}QXZ',original)
                actual=re.findall(r'ZXQ\s*\d{4}\s*QXZ',out,re.I)
                if sorted(expected)!=sorted(re.sub(r'\s','',x).upper() for x in actual):raise ValueError('protected tokens changed')
                result[key]=out.strip()
            return result
        except Exception as exc:
            if attempt==4 or isinstance(exc,ValueError):
                if len(batch)>1:
                    result={}
                    for item in batch:result.update(translate_batch([item]))
                    return result
                key,original=batch[0]
                print('Fallback protected spans:',original[:100],flush=True)
                pieces=re.split(r'(ZXQ\d{4}QXZ)',original)
                for j,piece in enumerate(pieces):
                    if not piece.strip() or re.fullmatch(r'ZXQ\d{4}QXZ',piece) or not re.search('[A-Za-z]{2}',piece):continue
                    u='https://translate.googleapis.com/translate_a/single?'+urlencode({'client':'gtx','sl':'en','tl':'vi','dt':'t','q':piece})
                    with urlopen(u,timeout=40) as r:raw=json.load(r)
                    pieces[j]=''.join(x[0] for x in raw[0] if x[0])
                return {key:''.join(pieces)}
            time.sleep(1+attempt*2)

pending=list(dict(segments).items());pending=[s for s in pending if s[0] not in cache]
batches=[];batch=[];size=0
for item in pending:
    if size+len(item[1])>2800 and batch:batches.append(batch);batch=[];size=0
    batch.append(item);size+=len(item[1])+18
if batch:batches.append(batch)
print(f'{len(segments)} segments, {len(pending)} uncached, {len(batches)} batches',flush=True)
if '--dry-run' in sys.argv:sys.exit()
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    futures=[pool.submit(translate_batch,b) for b in batches]
    for n,future in enumerate(concurrent.futures.as_completed(futures)):
        cache.update(future.result())
        CACHE.write_text(json.dumps(cache,ensure_ascii=False),encoding='utf-8')
        if n%10==0:print(f'{n+1}/{len(batches)} batches done',flush=True)
for p,fn in outputs.items():
    p.write_text(fn(),encoding='utf-8',newline='\n');print('Wrote',p.relative_to(ROOT),flush=True)
resolved=resolve(data)
(ROOT/'js/data.js').write_text('// Dữ liệu ôn tập CKA bằng tiếng Việt. Giữ nguyên định danh và lệnh thực hành.\n'+''.join('const '+k+' = '+json.dumps(v,ensure_ascii=False,indent=2)+';\n\n' for k,v in resolved.items()),encoding='utf-8',newline='\n')
