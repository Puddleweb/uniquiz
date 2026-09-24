"""Export only public quiz content. No lecture files, local paths or progress."""
import argparse,json,os
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('source');args=p.parse_args()
bank=json.loads(Path(args.source).read_text(encoding='utf-8-sig'))
public={'version':1,'updated':bank['updated'],'modules':[]}
for m in bank['modules']:
    clean={'id':m['id'],'name':m['name'],'questions':[]}
    for q in m['questions']:
        item={k:q[k] for k in ['id','week','prompt','options','answer','explanation']}
        item['source']={'title':Path(q['source']['file'].replace('\\','/')).stem,'page':q['source']['page']}
        clean['questions'].append(item)
    public['modules'].append(clean)
target=Path(__file__).resolve().parents[1]/'docs/questions.json'
temp=target.with_suffix('.tmp');temp.write_text(json.dumps(public,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');os.replace(temp,target)
print(f'Exported {sum(len(m["questions"]) for m in public["modules"])} public questions.')
