"""Render only cited pages. Review new previews before publishing; never uploads files.

Usage: python scripts/build_slide_previews.py PRIVATE_BANK --scratch PRIVATE_DIRECTORY
Dependencies: Pillow, pypdfium2, pypdf; Windows PowerPoint for PPTX sources.
Content hashes reuse unchanged images and invalidate replaced source documents.
"""
import argparse,hashlib,json,os,subprocess,zipfile,logging
from pathlib import Path
from xml.etree import ElementTree as ET
from PIL import Image
import pypdfium2 as pdfium
from pypdf import PdfReader

def build(source,scratch):
    logging.getLogger('pypdf').setLevel(logging.ERROR)
    bank=json.loads(source.read_text(encoding='utf-8-sig'))
    docs=Path(__file__).resolve().parents[1]/'docs';out=docs/'slides';out.mkdir(exist_ok=True)
    scratch.mkdir(parents=True,exist_ok=True)
    index_path=docs/'slide-index.json';old=json.loads(index_path.read_text(encoding='utf-8')) if index_path.exists() else {}
    groups={}
    for module in bank['modules']:
        for q in module['questions']: groups.setdefault(q['source']['file'],set()).add(q['source']['page'])
    jobs=[];result=dict(old)
    for rel,pages in groups.items():
        path=Path(bank['sourceRoot'])/rel;digest=hashlib.sha256(path.read_bytes()).hexdigest()[:16]
        pending=[]
        for page in sorted(pages):
            sid=f'{digest}-{page}'
            if sid in old and (docs/old[sid]['image']).is_file(): result[sid]={**old[sid],'title':path.stem}
            else: pending.append(page)
        if pending:
            folder=scratch/digest;folder.mkdir(exist_ok=True)
            jobs.append(dict(source=str(path),document=digest,pages=pending,output=str(folder)))
    ppt_jobs=[j for j in jobs if Path(j['source']).suffix.lower()=='.pptx']
    if ppt_jobs:
        job_file=scratch/'powerpoint-jobs.json';job_file.write_text(json.dumps(ppt_jobs),encoding='utf-8')
        script=scratch/'render-slides.ps1'
        script.write_text('''param([string]$JobFile)
$ErrorActionPreference='Stop'
$jobs=Get-Content -Raw -LiteralPath $JobFile | ConvertFrom-Json
$alreadyRunning=@(Get-Process POWERPNT -ErrorAction SilentlyContinue).Count -gt 0
$ppt=New-Object -ComObject PowerPoint.Application
try { foreach($job in $jobs) {
 $deck=$ppt.Presentations.Open($job.source,-1,0,0)
 try {foreach($page in $job.pages){$deck.Slides.Item([int]$page).Export((Join-Path $job.output "$page.png"),'PNG',1600)}} finally {$deck.Close()}
}} finally {if(-not $alreadyRunning){$ppt.Quit()}}
''',encoding='utf-8')
        subprocess.run(['powershell.exe','-NoProfile','-File',str(script),str(job_file)],check=True)
    for job in jobs:
        path=Path(job['source']);suffix=path.suffix.lower()
        if suffix=='.pdf':
            reader=PdfReader(path);pdf=pdfium.PdfDocument(str(path));texts={p:reader.pages[p-1].extract_text() or '' for p in job['pages']}
        elif suffix=='.pptx':
            pdf=None
            with zipfile.ZipFile(path) as z:
                texts={p:'\n'.join(e.text for e in ET.fromstring(z.read(f'ppt/slides/slide{p}.xml')).iter() if e.tag.endswith('}t') and e.text) for p in job['pages']}
        else: raise ValueError(f'Unsupported preview type: {suffix}. Render and verify real pages first.')
        for page in job['pages']:
            sid=f"{job['document']}-{page}"
            if pdf:
                pg=pdf[page-1];im=pg.render(scale=1600/pg.get_width()).to_pil().convert('RGB');pg.close()
            else: im=Image.open(Path(job['output'])/f'{page}.png').convert('RGB')
            im.save(out/f'{sid}.webp','WEBP',quality=88,method=6)
            result[sid]=dict(image=f'slides/{sid}.webp',title=path.stem,page=page,label='Slide' if suffix=='.pptx' else 'Page',text=texts[page])
        if pdf:pdf.close()
    tmp=index_path.with_suffix('.tmp');tmp.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');os.replace(tmp,index_path)
    print(f'{len(result)} cited previews ready; {sum(len(j["pages"]) for j in jobs)} newly rendered. Review new images before publication.')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('--scratch',required=True,type=Path);args=p.parse_args();build(args.source,args.scratch)
