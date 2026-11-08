"""NGSI-LD producer/consumer over the actual local Antares broker."""
from pathlib import Path
import json,urllib.request,urllib.error,urllib.parse,subprocess,shutil,os,time,socket,sqlite3,uuid,re,threading
import numpy as np
ROOT=Path(__file__).resolve().parent
VOCAB='https://mrgenius.example/vocab/'
SCHEMA='https://schema.org/'
TYPE=VOCAB+'LibraryServicePoint'
HEADERS={'Content-Type':'application/json','Accept':'application/json'}

def prop(value):return {'type':'Property','value':value}
def value(e,key,default=''):return e.get(key,{}).get('value',default)
def entity(record):
 e={'id':'urn:ngsi-ld:MrGeniusLibrary:'+record['id'],'type':TYPE,SCHEMA+'name':prop(record['name']),VOCAB+'managedBy':{'type':'Relationship','object':'urn:ngsi-ld:RegistryOrganisation:'+record['organisation_id']},VOCAB+'sourceUrl':prop(record['source']),VOCAB+'reviewState':prop('Unreviewed')}
 for src,dest in [('address',SCHEMA+'streetAddress'),('city',SCHEMA+'addressLocality'),('phone',SCHEMA+'telephone'),('website',SCHEMA+'url'),('modified',VOCAB+'registryModified')]:
  if record.get(src):e[dest]=prop(record[src])
 if record.get('longitude') is not None and record.get('latitude') is not None:e['location']={'type':'GeoProperty','value':{'type':'Point','coordinates':[record['longitude'],record['latitude']]}}
 return e

def rank(entities,query):
 texts=[value(e,SCHEMA+'name')+' '+value(e,SCHEMA+'streetAddress')+' '+value(e,SCHEMA+'addressLocality') for e in entities]
 tokens=lambda s:re.findall(r'[^\W_]+',s.lower(),re.UNICODE)
 docs=list(map(tokens,texts));vocab={w:i for i,w in enumerate(sorted({w for d in docs for w in d}))}
 matrix=np.zeros((len(docs),len(vocab)))
 for i,doc in enumerate(docs):
  for w in doc:matrix[i,vocab[w]]+=1
 idf=np.log((1+len(docs))/(1+(matrix>0).sum(0)))+1;matrix=np.log1p(matrix)*idf;matrix/=np.maximum(np.linalg.norm(matrix,axis=1,keepdims=True),1e-12)
 q=np.zeros(len(vocab))
 for w in tokens(query):
  if w in vocab:q[vocab[w]]+=1
 q=np.log1p(q)*idf;q/=max(np.linalg.norm(q),1e-12)
 scores=matrix@q;items=[]
 for e,score in zip(entities,scores):
  present=sum(bool(value(e,k)) for k in (SCHEMA+'streetAddress',SCHEMA+'telephone',SCHEMA+'url'))
  if query.strip() and score<=0:continue
  items.append(dict(id=e['id'],name=value(e,SCHEMA+'name'),address=value(e,SCHEMA+'streetAddress'),city=value(e,SCHEMA+'addressLocality'),phone=value(e,SCHEMA+'telephone'),website=value(e,SCHEMA+'url'),source=value(e,VOCAB+'sourceUrl'),similarity=round(float(score),4),complete_fields=present,review_state=value(e,VOCAB+'reviewState'),organisation=e[VOCAB+'managedBy']['object'],entity=e))
 return sorted(items,key=lambda i:(i['similarity'],-i['complete_fields'],i['name']),reverse=True)

class Broker:
 def __init__(self,url):self.url=url.rstrip('/');self.calls=[];self.lock=threading.RLock()
 def request(self,method,path,payload=None,expected=(200,201,204)):
  data=None if payload is None else json.dumps(payload,ensure_ascii=False).encode('utf-8');request=urllib.request.Request(self.url+path,data=data,headers=HEADERS,method=method)
  try:
   with urllib.request.urlopen(request,timeout=15) as response:
    body=response.read();status=response.status
  except urllib.error.HTTPError as exc:raise RuntimeError(f'Antares {method} {path}: {exc.code} {exc.read().decode()[:500]}') from exc
  if status not in expected:raise RuntimeError(f'Unexpected broker status {status}')
  with self.lock:self.calls.append(dict(method=method,path=path,status=status))
  return json.loads(body) if body else None
 def seed(self,records):
  orgs=sorted({r['organisation_id'] for r in records})
  for id in orgs:self.request('POST','/ngsi-ld/v1/entities',{'id':'urn:ngsi-ld:RegistryOrganisation:'+id,'type':SCHEMA+'Organization',VOCAB+'registryIdentifier':prop(id)})
  for r in records:self.request('POST','/ngsi-ld/v1/entities',entity(r))
  return len(orgs)+len(records)
 def libraries(self):return self.request('GET','/ngsi-ld/v1/entities?'+urllib.parse.urlencode({'type':TYPE,'limit':1000}))
 def get(self,id):return self.request('GET','/ngsi-ld/v1/entities/'+urllib.parse.quote(id,safe=''))
 def review(self,id,decision,note):
  if not id.startswith('urn:ngsi-ld:MrGeniusLibrary:') or decision not in ('Reviewed','Needs follow-up') or not 5<=len(note.strip())<=500:raise ValueError('Choose a valid local review and a 5-500 character rationale.')
  self.get(id) # fail before writing when target does not exist
  review={'id':'urn:ngsi-ld:MrGeniusReview:'+str(uuid.uuid4()),'type':VOCAB+'ReviewDecision',VOCAB+'target':{'type':'Relationship','object':id},VOCAB+'decision':prop(decision),VOCAB+'rationale':prop(note.strip()),VOCAB+'scope':prop('Local prototype annotation; no external owner authorization')}
  self.request('POST','/ngsi-ld/v1/entities',review)
  try:self.request('PATCH','/ngsi-ld/v1/entities/'+urllib.parse.quote(id,safe='')+'/attrs',{VOCAB+'reviewState':prop(decision)})
  except Exception as exc:raise RuntimeError('Review event exists, but projection failed. Retry/read back before relying on review state.') from exc
  readback=self.get(id)
  if value(readback,VOCAB+'reviewState')!=decision:raise RuntimeError('Broker readback does not match review')
  return review,readback

def free_port():
 with socket.socket() as sock:sock.bind(('127.0.0.1',0));return sock.getsockname()[1]
def start_broker(port=None):
 node=os.environ.get('NODE_EXE') or shutil.which('node')
 if not node:raise RuntimeError('Install Node.js 22 or newer, or set NODE_EXE.')
 local=ROOT/'local';local.mkdir(exist_ok=True);log=(local/'broker.log').open('w',encoding='utf-8');port=port or free_port()
 child=subprocess.Popen([node,str(ROOT/'broker/node-shim.mjs'),str(port)],cwd=ROOT,stdout=log,stderr=log,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0));broker=Broker(f'http://127.0.0.1:{port}')
 deadline=time.monotonic()+15
 while time.monotonic()<deadline:
  if child.poll() is not None:raise RuntimeError('Broker stopped; inspect local/broker.log')
  try:broker.request('GET','/ngsi-ld/v1/entities?'+urllib.parse.urlencode({'type':TYPE,'limit':1}));return child,broker
  except Exception:time.sleep(.1)
 child.terminate();raise RuntimeError('Broker startup timed out')

