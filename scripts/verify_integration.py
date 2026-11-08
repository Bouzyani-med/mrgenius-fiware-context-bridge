from pathlib import Path
import sys,json
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from context_bridge import *
child,b=start_broker()
try:
 data=json.loads((ROOT/'data/public_units.json').read_text(encoding='utf-8'));count=b.seed(data['records']);entities=b.libraries();assert len(entities)==len(data['records']);top=rank(entities,'Library')[0];review,back=b.review(top['id'],'Reviewed','Public-source trace checked in local prototype.')
 out=ROOT/'docs/INTEGRATION_EVIDENCE.json';out.write_text(json.dumps(dict(broker='Antares v0.2.0 WASM / local Node shim',seeded_entities=count,libraries=len(entities),review_entity=review,readback=back,http_calls=b.calls,source=data['source']),ensure_ascii=False,indent=2),encoding='utf-8');print('PASS',count,len(entities),len(b.calls))
finally:child.terminate();child.wait(timeout=10)
