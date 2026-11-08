"""Loopback-only Python UI server backed by the real Antares NGSI-LD runtime."""
from context_bridge import *
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from urllib.parse import urlparse,parse_qs
import atexit,hashlib,secrets,sys

class Application:
 def __init__(self):
  self.child,self.broker=start_broker();self.data=json.loads((ROOT/'data/public_units.json').read_text(encoding='utf-8'));self.total=self.broker.seed(self.data['records']);self.lock=threading.RLock()
  self.db=ROOT/'local/reviews.sqlite'
  with sqlite3.connect(self.db) as c:c.execute('CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY,target TEXT,decision TEXT,note TEXT)')
 def search(self,q):
  rows=self.broker.libraries();items=rank(rows,q)
  return dict(records=items,total=len(rows),entities=self.total,missing_contact=sum(not value(e,SCHEMA+'telephone') for e in rows),reviewed=sum(value(e,VOCAB+'reviewState')!='Unreviewed' for e in rows),source=self.data['source'],credit=self.data['credit'],limits=self.data['limits'],calls=self.broker.calls[-12:],broker='Antares v0.2.0 / WebAssembly')
 def review(self,body):
  with self.lock:
   event,readback=self.broker.review(body['id'],body['decision'],body['note'])
   with sqlite3.connect(self.db) as c:c.execute('INSERT INTO reviews VALUES (?,?,?,?)',(event['id'],body['id'],body['decision'],body['note']))
   return dict(event=event,readback=readback,scope='Local review annotation only. No live registry or external listing changed.')
 def close(self):
  if self.child.poll() is None:self.child.terminate();self.child.wait(timeout=10)

APP=None
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*a):pass
 def reply(self,status,body,kind='application/json'):
  data=json.dumps(body,ensure_ascii=False).encode('utf-8') if kind=='application/json' else body
  self.send_response(status);self.send_header('Content-Type',kind);self.send_header('Content-Length',str(len(data)));self.send_header('X-Content-Type-Options','nosniff');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data)
 def do_GET(self):
  parsed=urlparse(self.path)
  try:
   if parsed.path=='/':return self.reply(200,(ROOT/'web/index.html').read_bytes(),'text/html; charset=utf-8')
   if parsed.path=='/api/search':return self.reply(200,APP.search(parse_qs(parsed.query).get('q',[''])[0][:200]))
   if parsed.path=='/api/entity':return self.reply(200,APP.broker.get(parse_qs(parsed.query)['id'][0]))
   if parsed.path=='/api/export':return self.reply(200,dict(entities=APP.broker.libraries(),provenance=APP.data,broker_calls=APP.broker.calls))
   return self.reply(404,dict(error='Unknown endpoint'))
  except Exception as e:return self.reply(400,dict(error=str(e)))
 def do_POST(self):
  origin=self.headers.get('Origin');host=self.headers.get('Host')
  if origin not in (None,'http://'+str(host)):return self.reply(403,dict(error='Foreign origin blocked'))
  size=int(self.headers.get('Content-Length','0'))
  if not 0<size<=4096:return self.reply(413,dict(error='Payload limit'))
  try:
   body=json.loads(self.rfile.read(size))
   if self.path!='/api/review':return self.reply(404,dict(error='Unknown action'))
   return self.reply(200,APP.review(body))
  except Exception as e:return self.reply(400,dict(error=str(e)))

if __name__=='__main__':
 APP=Application();atexit.register(APP.close);port=int(os.environ.get('CONTEXT_BRIDGE_PORT','8766'));server=ThreadingHTTPServer(('127.0.0.1',port),Handler)
 print('Context Bridge ready at http://127.0.0.1:'+str(port),flush=True)
 try:server.serve_forever()
 finally:server.server_close();APP.close()
