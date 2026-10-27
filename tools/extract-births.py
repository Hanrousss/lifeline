"""Extract a reproducible birth-weight snapshot from downloaded official UN files."""
import csv,gzip,zipfile,io,json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
def select(reader):return [r for r in reader if r['Time']=='2023' and r['LocTypeID']=='4']
with gzip.open(root/'data/wpp2024-medium.csv.gz','rt',encoding='utf-8-sig') as f:rows=select(csv.DictReader(f))
with zipfile.ZipFile(root/'data/wpp2024-update.zip') as z:
 updates=select(csv.DictReader(io.TextIOWrapper(z.open('WPP2024_Demographic_Indicators_Medium_Update.csv'),encoding='utf-8-sig')))
for kind,rs in [('country',rows),('update',updates)]:
 # Keep only fields needed by the game, without rounding the source's thousand-unit count.
 reduced=[{k:r[k] for k in ['LocID','ISO3_code','ISO2_code','ParentID','Location','Births']} for r in rs]
 (root/f'data/wpp-{kind}-rows-2023.json').write_text(json.dumps(reduced,ensure_ascii=False,indent=2)+'\n')
