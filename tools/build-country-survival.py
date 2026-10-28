"""Extract 2023 both-sex l(x) tables from the official WPP complete CSV gzip.
Usage: python tools/build-country-survival.py /path/to/official.csv.gz
Browser values are rounded to whole survivors per 100,000 births (<=0.0005 pp error).
"""
import csv,gzip,json,sys
from pathlib import Path
rows={}
with gzip.open(sys.argv[1],'rt',encoding='utf-8-sig',newline='') as f:
 for r in csv.DictReader(f):
  if r['Time']!='2023' or r['SexID']!='3' or not r['ISO3_code']:continue
  iso=r['ISO3_code'];age=int(r['AgeGrpStart']);rows.setdefault(iso,{})[age]=round(float(r['lx']))
tables={}
for iso,ages in sorted(rows.items()):
 if len(ages)!=101:raise ValueError((iso,len(ages)))
 values=[ages[i] for i in range(101)]
 assert values[0]==100000 and all(0<=v<=values[max(0,i-1)] for i,v in enumerate(values))
 tables[iso]=values
meta={'year':2023,'radix':100000,'sex':'Both sexes','source':'United Nations DESA, World Population Prospects 2024','sourceUrl':'https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_Life_Table_Complete_Medium_Both_1950-2023.csv.gz','retrieved':'2026-10-28','license':'CC BY 3.0 IGO','rounding':'l(x) rounded to whole survivors out of 100000; maximum error 0.0005 percentage points','countryCount':len(tables)}
Path('data/country-survival-2023-source.json').write_text(json.dumps(meta,indent=2)+'\n')
items=list(tables.items())
for part in range(4):
 chunk=dict(items[part::4]);data=json.dumps(chunk,separators=(',',':'))
 Path(f'dist/country-survival-{part}.js').write_text('(function(root){const tables='+data+';if(typeof module!=="undefined")module.exports=tables;root.CountrySurvivalTables=Object.assign(root.CountrySurvivalTables||{},tables);})(typeof globalThis!=="undefined"?globalThis:this);\n')
print('Extracted',len(tables),'country tables, four small browser bundles.')
