import json
from pathlib import Path
import pytest
from context_bridge import *

@pytest.fixture(scope='module')
def runtime():
 child,broker=start_broker();source=json.loads((ROOT/'data/public_units.json').read_text(encoding='utf-8'));broker.seed(source['records'])
 yield broker,source
 child.terminate();child.wait(timeout=10)

def test_real_broker_preserves_sources_and_relationships(runtime):
 broker,data=runtime;items=broker.libraries();assert len(items)==len(data['records'])==138
 for r in data['records']:
  e=next(x for x in items if x['id'].endswith(':'+r['id']));assert value(e,VOCAB+'sourceUrl')==r['source'];org=broker.get(e[VOCAB+'managedBy']['object']);assert value(org,VOCAB+'registryIdentifier')==r['organisation_id']

def test_geo_coordinates_keep_lon_lat_order(runtime):
 broker,data=runtime;r=next(x for x in data['records'] if x['longitude'] is not None);e=broker.get(entity(r)['id']);assert e['location']['value']['coordinates']==[r['longitude'],r['latitude']]

def test_unknown_query_has_no_fabricated_match(runtime):
 broker,_=runtime;assert rank(broker.libraries(),'zzzxqvnomatch')==[]

def test_exact_name_ranks_matching_record(runtime):
 broker,data=runtime;r=data['records'][0];items=rank(broker.libraries(),r['name']);assert items[0]['id']==entity(r)['id'];assert all(0<=x['similarity']<=1 for x in items)

def test_review_creates_ngsild_event_and_roundtrip(runtime):
 broker,data=runtime;target=entity(data['records'][0])['id'];before=broker.get(target);event,after=broker.review(target,'Needs follow-up','Registry phone needs a current owner check.');stored=broker.get(event['id']);assert stored[VOCAB+'target']['object']==target;assert value(after,VOCAB+'reviewState')=='Needs follow-up';assert value(after,VOCAB+'sourceUrl')==value(before,VOCAB+'sourceUrl')

@pytest.mark.parametrize('decision,note',[('Approved','valid rationale'),('Reviewed','no'),('Reviewed','x'*501)])
def test_invalid_review_never_writes(runtime,decision,note):
 broker,data=runtime;n=len(broker.calls)
 with pytest.raises(ValueError):broker.review(entity(data['records'][0])['id'],decision,note)
 assert len(broker.calls)==n

def test_missing_target_blocks_review_before_event_creation(runtime):
 broker,_=runtime;n=len(broker.calls)
 with pytest.raises(RuntimeError):broker.review('urn:ngsi-ld:MrGeniusLibrary:does-not-exist','Reviewed','Source checked locally.')
 assert len(broker.calls)==n

def test_no_unavailable_phone_or_hours_invented(runtime):
 broker,data=runtime
 for r in data['records']:
  e=entity(r)
  if not r['phone']:assert SCHEMA+'telephone' not in e
  assert SCHEMA+'openingHours' not in e
