"""Export only public quiz content. No lecture files, local paths or progress."""
import argparse,json,os,hashlib
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('source');args=p.parse_args()
bank=json.loads(Path(args.source).read_text(encoding='utf-8-sig'))
public={'version':1,'updated':bank['updated'],'modules':[]}
docs=Path(__file__).resolve().parents[1]/'docs'
slides=json.loads((docs/'slide-index.json').read_text(encoding='utf-8'))
digests={}
for m in bank['modules']:
    clean={'id':m['id'],'name':m['name'],'questions':[]}
    for q in m['questions']:
        item={k:q[k] for k in ['id','week','prompt','options','answer','explanation']}
        item['source']={'title':Path(q['source']['file'].replace('\\','/')).stem,'page':q['source']['page']}
        rel=q['source']['file']
        if rel not in digests: digests[rel]=hashlib.sha256((Path(bank['sourceRoot'])/rel).read_bytes()).hexdigest()[:16]
        slide_id=f"{digests[rel]}-{q['source']['page']}"
        preview=slides.get(slide_id)
        if not preview or preview['title']!=item['source']['title'] or preview['page']!=item['source']['page'] or not (docs/preview['image']).is_file():
            raise ValueError(f"Build and review missing slide preview before publishing: {q['id']}")
        item['source'].update(slideId=slide_id,label=preview['label'])
        clean['questions'].append(item)
    public['modules'].append(clean)
target=Path(__file__).resolve().parents[1]/'docs/questions.json'
temp=target.with_suffix('.tmp');temp.write_text(json.dumps(public,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');os.replace(temp,target)
print(f'Exported {sum(len(m["questions"]) for m in public["modules"])} public questions.')
