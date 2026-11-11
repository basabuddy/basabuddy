"""Optimize one generated or reused cartoon without modifying its source."""
from pathlib import Path
from PIL import Image,ImageOps
import sys,json,hashlib
root=Path(__file__).resolve().parent.parent
entry_id,source,destination,method,prompt=sys.argv[1:]
source=Path(source);target=root/'public'/destination.lstrip('/')
with Image.open(source) as im:
 im=im.convert('RGB');im.thumbnail((640,640),Image.Resampling.LANCZOS)
 target.parent.mkdir(parents=True,exist_ok=True);im.save(target,'WEBP',quality=88,method=6)
 width,height=im.size
record={'id':entry_id,'image':destination,'source':str(source),'method':method,'prompt':prompt,'width':width,'height':height,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size,'review':'Pending visual review'}
(root/'reference/dictionary-generation'/f'{entry_id}.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(entry_id+' saved')
