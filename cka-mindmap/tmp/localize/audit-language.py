from pathlib import Path
import re,json
for p in list(Path('guides').glob('*.md'))+[Path('Kubernetes installation/guide.md')]:
    fence=False;found=[]
    for n,line in enumerate(p.read_text(encoding='utf-8').splitlines(),1):
        if line.strip().startswith('```'):fence=not fence;continue
        if fence or not line.strip() or line.startswith('<a '):continue
        if len(re.findall(r'\b(the|is|are|should|must|your|you|with|from|using|this|that)\b',line,re.I))>=3 and not re.search('[à-ỹÀ-Ỹ]',line):found.append((n,line[:170]))
    print(p.name,found[:12],len(found))
