# Mr.Genius / FIWARE Context Bridge

By Mohammed Bouzyani, Mr.Genius Morocco. Independent FIWARE prototype for Since AI 2026.

A Python producer/consumer around the **actual Antares v0.2.0 NGSI-LD broker**, using its official WebAssembly release and upstream Node shim. No paid account, Docker or API key is needed.

## Run

Requires Python 3.12+ and Node.js 22+ (24 used in CI).

```
python -m pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:8766 . The Windows `start.cmd` can also use the supplied portfolio's shared Python environment.

## Live demonstration

1. Start the app. Antares receives 138 public registry records and 24 organisation entities.
2. Search `Kannelmäki`. Inspect the source link and organisation Relationship.
3. Enter a rationale and choose Reviewed or Needs follow-up.
4. Record the review. The app POSTs a ReviewDecision entity, PATCHes the target's local projection and GETs the result back. Inspect transport evidence and export JSON.
5. Search `zzzxqvnomatch`. Unsupported matches remain empty.

## Validation

```
python -m pytest -q
python scripts/verify_integration.py
```

Ten tests run against a fresh real Antares process, checking source preservation, organisation links, coordinate order, retrieval, missing fields, invalid-review write blocking and POST/PATCH/GET readback. The standalone integration run records its HTTP evidence in `docs/INTEGRATION_EVIDENCE.json`.

## FIWARE integration

NGSI-LD normalized Properties, GeoProperty, Relationships and type-filtered queries. Custom LibraryServicePoint and ReviewDecision types use project IRIs. They are not claimed as certified Smart Data Models.

Antares is third-party software, credited under EUPL 1.2 in `broker/LICENSE`. Its WASM/JS release files are unmodified. The Node shim differs only by a loopback bind and explanatory comment. Corresponding upstream source: https://github.com/joinedcontext/Antares-NGSI-LD-Context-Broker/tree/v0.2.0 . See `broker/UPSTREAM.md`.

## Public data and limitations

City of Helsinki Service Map: https://www.hel.fi/palvelukarttaws/rest/v4/unit/?search=kirjasto . CC BY 4.0. Attribution: City of Helsinki Service Map, https://servicemap.hel.fi . No endorsement.

Snapshot collected 7 November 2026. Records can be incomplete or outdated and include library-related services, not only standalone libraries. Missing phones and opening hours are never invented. No sponsor or confidential data are used.

Reviews are local annotations, not business-owner or municipality approval. No public registry changes. Antares runs in memory and resets on restart. The SQLite journal stays local but does not automatically replay into Antares. Both servers bind loopback. This prototype has no production authentication or authorisation; do not expose it to the internet without hardening.

## Entry status

Independent FIWARE award route, separate from company rankings. A live working demonstration is required. Repository publication or email is not proof of accepted entry. Official status comes from the Since AI platform.
