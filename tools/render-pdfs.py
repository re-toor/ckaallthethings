"""Xuất PDF tiếng Việt bằng ReportLab. Chạy node tools/prepare-pdfs.cjs trước."""
import html
import json
import os
import re
from html.parser import HTMLParser
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, LongTable,
    TableStyle, HRFlowable,
)

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = Path(os.environ.get('PDF_FONT_DIR', 'C:/Windows/Fonts' if os.name == 'nt' else '/usr/share/fonts/truetype/dejavu'))
windows = (FONT_DIR / 'arial.ttf').exists()
font_files = {'Body':'arial.ttf', 'BodyBold':'arialbd.ttf', 'BodyItalic':'ariali.ttf', 'Mono':'consola.ttf'} if windows else {
    'Body':'DejaVuSans.ttf', 'BodyBold':'DejaVuSans-Bold.ttf', 'BodyItalic':'DejaVuSans-Oblique.ttf', 'Mono':'DejaVuSansMono.ttf'}
for name, filename in font_files.items():
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / filename)))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold', italic='BodyItalic', boldItalic='BodyBold')
PAGE_W, PAGE_H = A4
WIDTH = PAGE_W - 84
styles = getSampleStyleSheet()
body = ParagraphStyle('Vietnamese', fontName='Body', fontSize=9, leading=14, spaceAfter=7,
                      textColor=colors.HexColor('#203247'), splitLongWords=True)
headings = {n:ParagraphStyle('Heading'+str(n), parent=body, fontName='BodyBold',
    fontSize={1:20,2:14,3:11,4:10,5:9,6:9}[n], leading={1:26,2:20,3:16}.get(n,14),
    spaceBefore=18 if n<3 else 12, spaceAfter=9, keepWithNext=True,
    textColor=colors.HexColor('#174d83')) for n in range(1,7)}
cell = ParagraphStyle('Cell',parent=body,fontSize=8,leading=11,spaceAfter=0)
note = ParagraphStyle('Note',parent=body,leftIndent=10,rightIndent=8,
    borderColor=colors.HexColor('#326ce5'),borderWidth=0.5,borderPadding=7,
    backColor=colors.HexColor('#f1f6fc'),spaceBefore=5,spaceAfter=11)
code_style = ParagraphStyle('Code',fontName='Mono',fontSize=7.2,leading=10,
    spaceBefore=5,spaceAfter=9,leftIndent=7,rightIndent=5,
    backColor=colors.HexColor('#f2f5f8'),borderPadding=6)

class Element:
    def __init__(self, tag='', attrs=()):self.tag=tag;self.attrs=dict(attrs);self.children=[]
    def text(self):return ''.join(c if isinstance(c,str) else c.text() for c in self.children)

class Parser(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.root=Element('root');self.stack=[self.root]
    def handle_starttag(self,tag,attrs):
        e=Element(tag,attrs);self.stack[-1].children.append(e)
        if tag not in ['br','hr','img','input','meta','link']:self.stack.append(e)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:self.stack=self.stack[:i];break
    def handle_data(self,data):self.stack[-1].children.append(data)

def text_safe(s):
    # Remove pictographs used as decorative bullets; all Vietnamese is retained.
    s=re.sub('[\U0001F000-\U0001FFFF\uFE0F\u2705\u274C\u26A0]', '',s)
    return html.escape(s.replace('\u2011','-').replace('\u2013','-').replace('\u2014','-'))

def inline(e):
    if isinstance(e,str):return text_safe(e)
    content=''.join(inline(c) for c in e.children)
    if e.tag in ['strong','b']:return '<b>'+content+'</b>'
    if e.tag in ['em','i']:return '<i>'+content+'</i>'
    if e.tag=='code':return '<font name="Mono" size="7.5">'+content+'</font>'
    if e.tag=='br':return '<br/>'
    if e.tag=='sup':return '<super>'+content+'</super>'
    if e.tag=='a':
        url=e.attrs.get('href','')
        if url.startswith(('http://','https://')):
            return '<a href="'+html.escape(url,quote=True)+'" color="#17629d">'+content+'</a>'
        return content
    return content

def wrap_code(text,size):
    result=[]
    max_width=WIDTH-24
    for line in text.expandtabs(4).splitlines():
        if not line:result.append('');continue
        while pdfmetrics.stringWidth(line,'Mono',size)>max_width:
            n=len(line)
            while pdfmetrics.stringWidth(line[:n],'Mono',size)>max_width:n-=1
            split=line.rfind(' ',0,n)
            if split<n//2:split=n
            result.append(line[:split]);line='  '+line[split:].lstrip()
        result.append(line)
    return '\n'.join(result)

def descendants(e, tag):
    for child in e.children:
        if isinstance(child,Element):
            if child.tag==tag:yield child
            else:yield from descendants(child,tag)

def blocks(e,depth=0):
    flow=[]
    for child in e.children:
        if isinstance(child,str):
            if child.strip():flow.append(Paragraph(text_safe(child),body))
            continue
        tag=child.tag
        if tag in ['h1','h2','h3','h4','h5','h6']:
            flow.append(Paragraph(inline(child),headings[int(tag[1])]))
        elif tag=='p':
            if child.text().strip():
                meaningful=[c for c in child.children if not isinstance(c,str) or c.strip()]
                only_bold=meaningful and all(isinstance(c,Element) and c.tag=='strong' for c in meaningful)
                sty=ParagraphStyle('Label',parent=body,keepWithNext=True) if only_bold else body
                flow.append(Paragraph(inline(child),sty))
        elif tag=='pre':
            code=child.text().rstrip('\n');size=7.2
            # Keep conceptual diagrams aligned where possible.
            if re.search('[┌┐└┘│═║]',code):
                longest=max((pdfmetrics.stringWidth(l,'Mono',size) for l in code.splitlines()),default=0)
                if longest>WIDTH-24:size=max(4.8,size*(WIDTH-24)/longest)
            sty=ParagraphStyle('CodeBlock',parent=code_style,fontSize=size,leading=size*1.4)
            flow.append(Preformatted(wrap_code(code,size),sty))
        elif tag in ['ul','ol']:
            for number,item in enumerate(c for c in child.children if isinstance(c,Element) and c.tag=='li'):
                prefix=str(number+int(child.attrs.get('start','1')))+'. ' if tag=='ol' else '- '
                content=''.join(inline(c) for c in item.children if not isinstance(c,Element) or c.tag not in ['ul','ol','pre'])
                sty=ParagraphStyle('ListItem',parent=body,leftIndent=10+depth*10,firstLineIndent=-6)
                if content.strip():flow.append(Paragraph(prefix+content,sty))
                for nested in item.children:
                    if isinstance(nested,Element) and nested.tag in ['ul','ol','pre']:
                        holder=Element('root');holder.children=[nested];flow.extend(blocks(holder,depth+1))
        elif tag=='table':
            rows=[]
            for tr in descendants(child,'tr'):
                cells=[c for c in tr.children if isinstance(c,Element) and c.tag in ['th','td']]
                rows.append([Paragraph(inline(c),cell) for c in cells])
            if rows:
                count=max(map(len,rows));rows=[r+['']*(count-len(r)) for r in rows]
                table=LongTable(rows,colWidths=[WIDTH/count]*count,repeatRows=1,hAlign='LEFT',splitByRow=True)
                table.setStyle(TableStyle([
                    ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e7eff8')),
                    ('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#ccd9e7')),
                    ('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),
                    ('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),
                    ('BOTTOMPADDING',(0,0),(-1,-1),5),
                ]));flow.extend([table,Spacer(1,9)])
        elif tag=='blockquote':
            for c in child.children:
                if isinstance(c,Element) and c.tag=='p':flow.append(Paragraph(inline(c),note))
                elif isinstance(c,Element):
                    holder=Element('root');holder.children=[c];flow.extend(blocks(holder,depth))
        elif tag=='hr':flow.append(HRFlowable(width='100%',thickness=0.5,color=colors.HexColor('#ccd9e7'),spaceBefore=8,spaceAfter=8))
        else:flow.extend(blocks(child,depth))
    return flow

def footer(canvas,doc):
    canvas.setFont('Body',7)
    canvas.setFillColor(colors.HexColor('#60758a'))
    canvas.drawString(42,24,'CKA - Kubernetes 1.35 - Bản tiếng Việt')
    canvas.drawRightString(PAGE_W-42,24,str(doc.page))

for item in json.loads((ROOT/'tmp/pdfs/content.json').read_text(encoding='utf-8')):
    parser=Parser();parser.feed(item['html'])
    output=ROOT/'guides'/(item['name']+'_KDP.pdf')
    doc=SimpleDocTemplate(str(output),pagesize=A4,leftMargin=42,rightMargin=42,topMargin=42,bottomMargin=44,
        title='Tài liệu CKA tiếng Việt - '+item['name'],author='Alaa Alhorani; bản tiếng Việt cập nhật 17/09/2026')
    story=[Paragraph('BẢN TIẾNG VIỆT · CKA 1.35 · 17/09/2026',body)]+blocks(parser.root)
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    print(output.relative_to(ROOT),flush=True)
