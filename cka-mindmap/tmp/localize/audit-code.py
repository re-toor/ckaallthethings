from pathlib import Path
import re,difflib
for p in sorted(Path('guides').glob('*.md')):
    orig=Path('tmp/localize')/(p.stem+'-original.md')
    if not orig.exists():continue
    def code(s):
        blocks=re.findall(r'^```(?:bash|sh|shell|yaml|json|toml|corefile|ini|properties)\s*\n(.*?)^```',s,re.M|re.S)
        return [re.sub(r'\s+#.*','',l).rstrip() for b in blocks for l in b.splitlines() if l.strip() and not l.lstrip().startswith('#')]
    a,b=code(orig.read_text(encoding='utf-8')),code(p.read_text(encoding='utf-8'))
    changes=[x for x in difflib.unified_diff(a,b,n=0) if (x.startswith('+') or x.startswith('-')) and not x.startswith(('+++','---'))]
    print(p.name,len(changes),'changed executable lines')
    print('\n'.join(changes[:16]))
# Normalize source files to LF so Bash works after checkout on Windows too.
for p in [Path('README.md'),*Path('guides').glob('*.md'),*Path('js').glob('*.js'),*Path('docs').glob('*.md'),*Path('Kubernetes installation').rglob('*.sh'),Path('Kubernetes installation/guide.md')]:
    p.write_text(p.read_text(encoding='utf-8'),encoding='utf-8',newline='\n')
