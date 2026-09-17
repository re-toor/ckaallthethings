from pathlib import Path
import re, json, concurrent.futures
source=Path(__file__).with_name('translate.py').read_text(encoding='utf-8')
exec(source.split('outputs={}')[0])
translate_code=source[source.index('def translate_batch'):source.index('pending=list(dict(segments)')]
exec(translate_code)
edits=[]
for p in [ROOT/'README.md',*sorted((ROOT/'guides').glob('*.md')),ROOT/'Kubernetes installation/guide.md']:
    if p.name=='kubernetes-1.35-update.md':continue
    s=p.read_text(encoding='utf-8')
    backup=WORK/(p.stem+'-original.md' if p.name!='guide.md' else 'install-original.md')
    original=backup.read_text(encoding='utf-8')
    # Fix a missing closing fence in the upstream CoreDNS quick-reference card.
    if p.name=='coredns-cka-guide.md':
        marker='*CKA CoreDNS Practice Guide'
        before,after=s.split(marker,1)
        before=before.rstrip().removesuffix('---').rstrip()+'\n```\n\n---\n\n'
        s=before
        tail=markdown(marker+after)
    else:tail=lambda:''
    # Keep each reference definition on its own line; preserve its identifier.
    s=re.sub(r'^\[\^[^\]]+\]:.*\n?', '',s,flags=re.M)
    refs=[]
    for line in original.splitlines():
        m=re.match(r'^(\[\^[^\]]+\]:\s*)(.+)$',line)
        if m:refs.append((m[1],add(m[2])))
    # Translate explanatory labels in diagrams, never machine output or commands.
    lines=s.splitlines(keepends=True);fence=False
    for i,line in enumerate(lines):
        if line.lstrip().startswith('```'):fence=not fence;continue
        if not fence:continue
        if re.search('[│║]',line) and re.search('[A-Za-z]{3}',line):
            pieces=re.split(r'([│║])',line.rstrip('\n'))
            for j,piece in enumerate(pieces):
                if not re.search('[a-z]{3}',piece) or any(x in piece for x in ['kubectl ', 'sudo ', 'http://', 'https://', '--', 'nameserver ', 'search ', 'options ', 'apiVersion:', 'kind:']):continue
                if re.search('[à-ỹÀ-Ỹ]',piece):continue
                lead=len(piece)-len(piece.lstrip());trail=len(piece)-len(piece.rstrip())
                fn=add(piece.strip());pieces[j]=lambda f=fn,l=lead,t=trail:' '*l+f()+' '*t
            lines[i]=lambda ps=pieces:''.join(x() if callable(x) else x for x in ps)+'\n'
    def render(ls=lines,rs=refs,t=tail):
        text=''.join(x() if callable(x) else x for x in ls)+t()
        text=re.sub(r'^\[\^[^\]]+\]:.*\n?', '',text,flags=re.M)
        return text+'\n'+''.join(prefix+fn()+'\n' for prefix,fn in rs)
    edits.append((p,render))

# Localize standalone script comments and simple diagnostic messages.
# Do not alter markers that scripts use to edit /etc/hosts.
for p in (ROOT/'Kubernetes installation/scripts').glob('*.sh'):
    lines=p.read_text(encoding='utf-8').splitlines(keepends=True)
    for i,line in enumerate(lines):
        m=re.match(r'^(\s*#\s+)(.*?)(\n?)$',line)
        if m and '---' not in m[2] and not re.search(r'\$|\.sh|/etc|/var|/tmp|kubectl|sudo |EOF|kubeadm|^[-=]+$',m[2]):
            fn=add(m[2]);lines[i]=lambda f=fn,prefix=m[1],e=m[3]:prefix+f()+e;continue
        m=re.match(r'^(\s*(?:log|warn|err) ")(.*)("\n?)$',line)
        if m and not re.search(r'\\|\$\(|`',m[2]):
            fn=add(m[2]);lines[i]=lambda f=fn,a=m[1],b=m[3]:a+f().replace('"','\\"')+b
    edits.append((p,lambda ls=lines:''.join(x() if callable(x) else x for x in ls)))

pending=[s for s in dict(segments).items() if s[0] not in cache]
batches=[];batch=[];size=0
for item in pending:
    if size+len(item[1])>2500 and batch:batches.append(batch);batch=[];size=0
    batch.append(item);size+=len(item[1])+18
if batch:batches.append(batch)
print(f'Refine: {len(pending)} segments / {len(batches)} batches',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    for n,r in enumerate(pool.map(translate_batch,batches)):
        cache.update(r);CACHE.write_text(json.dumps(cache,ensure_ascii=False),encoding='utf-8')
        print(n+1,'/',len(batches),flush=True)
for p,fn in edits:p.write_text(fn(),encoding='utf-8',newline='\n')
