"""Read-only image inventory and manifest validation; never sharpens or resamples assets."""
from pathlib import Path
from PIL import Image
import csv, hashlib, json
ROOT=Path(__file__).resolve().parent.parent
extensions={'.png','.webp','.jpg','.jpeg','.gif','.ico','.svg','.avif'}
exclude={'node_modules','.git','dist','test-results','playwright-report','.vscode','.codex','.agents'}
rows=[]
for p in sorted(ROOT.rglob('*')):
 rel=p.relative_to(ROOT)
 if any(part in exclude for part in rel.parts) or p.suffix.lower() not in extensions: continue
 row={'path':str(rel),'category':'shipped' if rel.parts[0]=='public' else 'reference' if rel.parts[0]=='reference' else 'test/documentation','bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
 try:
  if p.suffix.lower()=='.svg': row.update(width='vector',height='vector',format='SVG',decoded=True)
  else:
   with Image.open(p) as im:
    im.load();row.update(width=im.width,height=im.height,format=im.format,decoded=True,mode=im.mode,alpha='A' in im.getbands() or 'transparency' in im.info)
    if im.format=='WEBP':
     data=p.read_bytes();offset=12;chunks=[]
     while offset+8<=len(data):
      chunk=data[offset:offset+4];size=int.from_bytes(data[offset+4:offset+8],'little');chunks.append(chunk);offset+=8+size+(size%2)
     row['compression']='lossless VP8L' if b'VP8L' in chunks else 'lossy VP8' if b'VP8 ' in chunks else 'unknown'
    else:row['compression']='lossy JPEG' if im.format=='JPEG' else 'lossless container'
 except Exception as e: row.update(decoded=False,error=str(e))
 rows.append(row)
manifest=json.loads((ROOT/'src/data/assets.json').read_text());errors=[];known=set()
for key,asset in manifest.items():
 for a in [asset,*asset.get('variants',[])]:
  path='public'+a['src'];known.add(path);r=next((r for r in rows if r['path']==path),None)
  if not r or not r['decoded']:errors.append(f'{key}: missing/invalid {path}')
  elif (r['width'],r['height'],r['bytes'])!=(a['width'],a['height'],a['bytes']):errors.append(f'{key}: stale metadata {path}')
  elif r['sha256'][:16]!=a.get('revision'):errors.append(f'{key}: stale content revision {path}')
for r in rows:
 if r['category']=='shipped' and r['path'] not in known:errors.append('Unmanifested '+r['path'])
report={'totalFiles':len(rows),'categories':{c:sum(r['category']==c for r in rows) for c in ['shipped','reference','test/documentation']},'logicalAssets':len(manifest),'errors':errors,'images':rows}
(ROOT/'docs/image-inventory.json').write_text(json.dumps(report,indent=2)+'\n')
with (ROOT/'docs/image-inventory.csv').open('w') as f:
 writer=csv.DictWriter(f,fieldnames=['path','category','width','height','format','bytes','decoded','mode','alpha','compression','sha256','error']);writer.writeheader();writer.writerows(rows)
print(json.dumps({k:v for k,v in report.items() if k!='images'},indent=2))
if errors or any(not r['decoded'] for r in rows):raise SystemExit(1)
