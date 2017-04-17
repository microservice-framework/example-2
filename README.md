# example-2
CRUDs example instance of mFW with middleware on POST and SEARCH.

middleware code:
```nodejs
/**
 * POST middleware.
 */
function recordPOST(jsonData, requestDetails, callback) {
  try {
    // Validate data based on schema. You need it before process data.
    mservice.validateJson(jsonData); 
  } catch (e) {
    return callback(e, null);
  }

  // Check if record exists first.
  let searchRequest = {
    record_id: jsonData.record_id,
  };
  // Check if record with record_id extsts and return it, instead of creating new.
  mservice.search(searchRequest, requestDetails, function(err, handlerResponse) {
    if (err) {
      return callback(err);
    }
    if (handlerResponse.code == 404) {
      // No record with record_id, save data.
      mservice.post(jsonData, requestDetails, callback);
    } else {
      // return back found record.
      handlerResponse.answer = handlerResponse.answer[0];
      callback(null, handlerResponse);
    }
  });
}
```

```nodejs
/**
 * SEARCH middleware.
 */
function recordSEARCH(jsonData, requestDetails, callback) {
  mservice.search(jsonData, requestDetails, function(err, handlerResponse) {
    if (err) {
      return callback(err, handlerResponse);
    }
    // replace each user with object. This is a simple example. But ou can do request to another service here and replace data based on it.
    for (var i in handlerResponse.answer) {
      if (handlerResponse.answer[i].user) {
        var username = handlerResponse.answer[i].user;
        handlerResponse.answer[i].user = {
          user: username,
          created: Date.now()
        }
      }
    }
    return callback(err, handlerResponse);
  });
}
```

- copy .env-example into .env
- install all dependencies
  ```
  # npm install
  ```
- Make sure that MongoDB is available on localhost or update .env properly.
- start service
  ```sh
  # npm run devel-start

  > example-2@1.0.0 devel-start /GitHub/microservice-framework/example-2
  > DEBUG=* node  --max-old-space-size=48 example-2.js

  cluster:main Starting up 2 workers. +0ms
  cluster:main Worker 90921 is online +72ms
  cluster:main Worker 90922 is online +4ms
  http:log Listen on :10002 +0ms
  http:log Listen on :10002 +0ms
  ```
- open new terminal and start tests
  ```sh
  # npm run test
  
  > example-2@1.0.0 test /GitHub/microservice-framework/example-2
  > mocha  --timeout 15000



    RECORD CRUD API
  { message: 'Task accepted',
    id: '58f42a5d08c9bf6a13b8c086',
    token: '0d3852e8f6d7709c0ab4ff66d0c1292b0d1eb2191cb8882c' }
      ✓ POST record 1 should return 200 (109ms)
  { message: 'Task accepted',
    id: '58f42a5d0971fc6a14a457f5',
    token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235' }
      ✓ POST record 2 should return 200 (78ms)
  { _id: '58f42a5d0971fc6a14a457f5',
    user: 'example-user-2',
    body: 'Example record body 2',
    record_id: 2,
    created: 1492396637406,
    changed: 1492396637406,
    token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235' }
      ✓ POST record 2 should return 200 and previosly saved record
  [ { _id: '58f42a5d08c9bf6a13b8c086',
      user: { user: 'example-user', created: 1492396637443 },
      body: 'Example record body',
      record_id: 1,
      created: 1492396637311,
      changed: 1492396637311,
      token: '0d3852e8f6d7709c0ab4ff66d0c1292b0d1eb2191cb8882c' },
    { _id: '58f42a5d0971fc6a14a457f5',
      user: { user: 'example-user-2', created: 1492396637443 },
      body: 'Example record body 2',
      record_id: 2,
      created: 1492396637406,
      changed: 1492396637406,
      token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235' } ]
      ✓ SEARCH should return 200 (213ms)
  { _id: '58f42a5d08c9bf6a13b8c086',
    user: 'example-user',
    body: 'Example record body',
    record_id: 1,
    created: 1492396637311,
    changed: 1492396637311,
    token: '0d3852e8f6d7709c0ab4ff66d0c1292b0d1eb2191cb8882c' }
      ✓ GET should record 1 return 200
  { _id: '58f42a5d0971fc6a14a457f5',
    user: 'example-user-2',
    body: 'Example record body 2',
    record_id: 2,
    created: 1492396637406,
    changed: 1492396637406,
    token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235' }
      ✓ GET should record 2 return 200
  { _id: '58f42a5d08c9bf6a13b8c086',
    user: 'example-user',
    body: 'Example record body',
    record_id: 1,
    created: 1492396637311,
    changed: 1492396637311,
    token: '0d3852e8f6d7709c0ab4ff66d0c1292b0d1eb2191cb8882c' }
      ✓ DELETE record1 should return 200
  { _id: '58f42a5d0971fc6a14a457f5',
    user: 'example-user-2',
    body: 'Example record body 2',
    record_id: 2,
    created: 1492396637406,
    changed: 1492396637406,
    token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235' }
      ✓ DELETE record2 should return 200
  { message: 'Not found' }
      ✓ GET after delete should return nothing
  { message: 'Not found' }
      ✓ GET after delete should return nothing (41ms)
  
  
    10 passing (554ms)

  ```
  
  Example service works in debug mode, so you will see debug output in first terminal:
  ```js
  http:log Request: POST: / +3s
  http:debug Data: {"user":"example-user","body":"Example record body","record_id":1} +4ms
  microservice:debug Validate:requestDetails { url: '',
  microservice:debug   headers:
  microservice:debug    { accept: 'application/json',
  microservice:debug      'user-agent': 'MicroserviceClient.1.0.0',
  microservice:debug      signature: 'sha256=490db96b2a9d9a15480f203a2f83c3776c2c6da4764fe4363cc8596cc2fb8a75',
  microservice:debug      host: 'localhost:10002',
  microservice:debug      'content-type': 'application/json',
  microservice:debug      'content-length': '66',
  microservice:debug      connection: 'close' },
  microservice:debug   _buffer: '{"user":"example-user","body":"Example record body","record_id":1}',
  microservice:debug   method: 'POST' }  +1ms
  microservice:debug Validate:SignatureSystem +3ms
  http:debug Parsed data: { user: 'example-user',
  http:debug   body: 'Example record body',
  http:debug   record_id: 1 } +0ms
  microservice:debug MongoClient:toArray object not found. +49ms
  http:debug Handler responce:
  http:debug  { code: 200,
  http:debug   answer:
  http:debug    { message: 'Task accepted',
  http:debug      id: 58f42a5d08c9bf6a13b8c086,
  http:debug      token: '0d3852e8f6d7709c0ab4ff66d0c1292b0d1eb2191cb8882c' } } +9ms
  http:log Request: POST: / +3s
  http:debug Data: {"user":"example-user-2","body":"Example record body 2","record_id":2} +3ms
  microservice:debug Validate:requestDetails { url: '',
  microservice:debug   headers:
  microservice:debug    { accept: 'application/json',
  microservice:debug      'user-agent': 'MicroserviceClient.1.0.0',
  microservice:debug      signature: 'sha256=eef69fe44c531795648e9fd030217432937746d468e1b004bc83ca1ef850922a',
  microservice:debug      host: 'localhost:10002',
  microservice:debug      'content-type': 'application/json',
  microservice:debug      'content-length': '70',
  microservice:debug      connection: 'close' },
  microservice:debug   _buffer: '{"user":"example-user-2","body":"Example record body 2","record_id":2}',
  microservice:debug   method: 'POST' }  +2ms
  microservice:debug Validate:SignatureSystem +3ms
  http:debug Parsed data: { user: 'example-user-2',
  http:debug   body: 'Example record body 2',
  http:debug   record_id: 2 } +0ms
  microservice:debug MongoClient:toArray object not found. +46ms
  http:debug Handler responce:
  http:debug  { code: 200,
  http:debug   answer:
  http:debug    { message: 'Task accepted',
  http:debug      id: 58f42a5d0971fc6a14a457f5,
  http:debug      token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235' } } +9ms
  http:log Request: POST: / +104ms
  http:debug Data: {"user":"example-user","body":"Example record body","record_id":2} +0ms
  microservice:debug Validate:requestDetails { url: '',
  microservice:debug   headers:
  microservice:debug    { accept: 'application/json',
  microservice:debug      'user-agent': 'MicroserviceClient.1.0.0',
  microservice:debug      signature: 'sha256=7d66b0cfd834e980af354d3910c49354bb66816e324074e51802554894d8c0d6',
  microservice:debug      host: 'localhost:10002',
  microservice:debug      'content-type': 'application/json',
  microservice:debug      'content-length': '66',
  microservice:debug      connection: 'close' },
  microservice:debug   _buffer: '{"user":"example-user","body":"Example record body","record_id":2}',
  microservice:debug   method: 'POST' }  +0ms
  microservice:debug Validate:SignatureSystem +1ms
  http:debug Parsed data: { user: 'example-user',
  http:debug   body: 'Example record body',
  http:debug   record_id: 2 } +0ms
  http:debug Handler responce:
  http:debug  { code: 200,
  http:debug   answer:
  http:debug    { _id: 58f42a5d0971fc6a14a457f5,
  http:debug      user: 'example-user-2',
  http:debug      body: 'Example record body 2',
  http:debug      record_id: 2,
  http:debug      created: 1492396637406,
  http:debug      changed: 1492396637406,
  http:debug      token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235' },
  http:debug   headers: { 'x-total-count': 1 } } +5ms
  http:log Request: SEARCH: / +22ms
  http:debug Data: {"body":{"$regex":"body","$options":"i"}} +1ms
  microservice:debug Validate:requestDetails { url: '',
  microservice:debug   headers:
  microservice:debug    { accept: 'application/json',
  microservice:debug      'user-agent': 'MicroserviceClient.1.0.0',
  microservice:debug      signature: 'sha256=9e6100ef5b77c8a113ed2d7d3708c623ecd3a528875159c63e531fb2236317b5',
  microservice:debug      host: 'localhost:10002',
  microservice:debug      'content-type': 'application/json',
  microservice:debug      'content-length': '41',
  microservice:debug      connection: 'close' },
  microservice:debug   _buffer: '{"body":{"$regex":"body","$options":"i"}}',
  microservice:debug   method: 'SEARCH' }  +0ms
  microservice:debug Validate:SignatureSystem +0ms
  http:debug Parsed data: { body: { '$regex': 'body', '$options': 'i' } } +0ms
  http:debug Handler responce:
  http:debug  { code: 200,
  http:debug   answer:
  http:debug    [ { _id: 58f42a5d08c9bf6a13b8c086,
  http:debug        user: [Object],
  http:debug        body: 'Example record body',
  http:debug        record_id: 1,
  http:debug        created: 1492396637311,
  http:debug        changed: 1492396637311,
  http:debug        token: '0d3852e8f6d7709c0ab4ff66d0c1292b0d1eb2191cb8882c' },
  http:debug      { _id: 58f42a5d0971fc6a14a457f5,
  http:debug        user: [Object],
  http:debug        body: 'Example record body 2',
  http:debug        record_id: 2,
  http:debug        created: 1492396637406,
  http:debug        changed: 1492396637406,
  http:debug        token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235' } ],
  http:debug   headers: { 'x-total-count': 2 } } +6ms
  http:log Request: GET: /58f42a5d08c9bf6a13b8c086 +225ms
  http:debug Data: null +0ms
  microservice:debug Validate:requestDetails { url: '58f42a5d08c9bf6a13b8c086',
  microservice:debug   headers:
  microservice:debug    { accept: 'application/json',
  microservice:debug      'user-agent': 'MicroserviceClient.1.0.0',
  microservice:debug      token: '0d3852e8f6d7709c0ab4ff66d0c1292b0d1eb2191cb8882c',
  microservice:debug      host: 'localhost:10002',
  microservice:debug      'content-type': 'application/json',
  microservice:debug      'content-length': '4',
  microservice:debug      connection: 'close' },
  microservice:debug   _buffer: 'null',
  microservice:debug   method: 'GET' }  +0ms
  microservice:debug Validate:TokenSystem +1ms
  http:debug Parsed data: null +8ms
  http:debug Handler responce:
  http:debug  { code: 200,
  http:debug   answer:
  http:debug    { _id: 58f42a5d08c9bf6a13b8c086,
  http:debug      user: 'example-user',
  http:debug      body: 'Example record body',
  http:debug      record_id: 1,
  http:debug      created: 1492396637311,
  http:debug      changed: 1492396637311,
  http:debug      token: '0d3852e8f6d7709c0ab4ff66d0c1292b0d1eb2191cb8882c' } } +4ms
  http:log Request: GET: /58f42a5d0971fc6a14a457f5 +231ms
  http:debug Data: null +0ms
  microservice:debug Validate:requestDetails { url: '58f42a5d0971fc6a14a457f5',
  microservice:debug   headers:
  microservice:debug    { accept: 'application/json',
  microservice:debug      'user-agent': 'MicroserviceClient.1.0.0',
  microservice:debug      token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235',
  microservice:debug      host: 'localhost:10002',
  microservice:debug      'content-type': 'application/json',
  microservice:debug      'content-length': '4',
  microservice:debug      connection: 'close' },
  microservice:debug   _buffer: 'null',
  microservice:debug   method: 'GET' }  +0ms
  microservice:debug Validate:TokenSystem +1ms
  http:debug Parsed data: null +4ms
  http:debug Handler responce:
  http:debug  { code: 200,
  http:debug   answer:
  http:debug    { _id: 58f42a5d0971fc6a14a457f5,
  http:debug      user: 'example-user-2',
  http:debug      body: 'Example record body 2',
  http:debug      record_id: 2,
  http:debug      created: 1492396637406,
  http:debug      changed: 1492396637406,
  http:debug      token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235' } } +6ms
  http:log Request: DELETE: /58f42a5d08c9bf6a13b8c086 +22ms
  http:debug Data: null +0ms
  microservice:debug Validate:requestDetails { url: '58f42a5d08c9bf6a13b8c086',
  microservice:debug   headers:
  microservice:debug    { accept: 'application/json',
  microservice:debug      'user-agent': 'MicroserviceClient.1.0.0',
  microservice:debug      token: '0d3852e8f6d7709c0ab4ff66d0c1292b0d1eb2191cb8882c',
  microservice:debug      host: 'localhost:10002',
  microservice:debug      'content-type': 'application/json',
  microservice:debug      'content-length': '4',
  microservice:debug      connection: 'close' },
  microservice:debug   _buffer: 'null',
  microservice:debug   method: 'DELETE' }  +0ms
  microservice:debug Validate:TokenSystem +1ms
  http:debug Parsed data: null +3ms
  http:debug Handler responce:
  http:debug  { code: 200,
  http:debug   answer:
  http:debug    { _id: 58f42a5d08c9bf6a13b8c086,
  http:debug      user: 'example-user',
  http:debug      body: 'Example record body',
  http:debug      record_id: 1,
  http:debug      created: 1492396637311,
  http:debug      changed: 1492396637311,
  http:debug      token: '0d3852e8f6d7709c0ab4ff66d0c1292b0d1eb2191cb8882c' } } +7ms
  http:log Request: DELETE: /58f42a5d0971fc6a14a457f5 +18ms
  http:debug Data: null +2ms
  microservice:debug Validate:requestDetails { url: '58f42a5d0971fc6a14a457f5',
  microservice:debug   headers:
  microservice:debug    { accept: 'application/json',
  microservice:debug      'user-agent': 'MicroserviceClient.1.0.0',
  microservice:debug      token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235',
  microservice:debug      host: 'localhost:10002',
  microservice:debug      'content-type': 'application/json',
  microservice:debug      'content-length': '4',
  microservice:debug      connection: 'close' },
  microservice:debug   _buffer: 'null',
  microservice:debug   method: 'DELETE' }  +1ms
  microservice:debug Validate:TokenSystem +1ms
  http:debug Parsed data: null +3ms
  http:debug Handler responce:
  http:debug  { code: 200,
  http:debug   answer:
  http:debug    { _id: 58f42a5d0971fc6a14a457f5,
  http:debug      user: 'example-user-2',
  http:debug      body: 'Example record body 2',
  http:debug      record_id: 2,
  http:debug      created: 1492396637406,
  http:debug      changed: 1492396637406,
  http:debug      token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235' } } +7ms
  http:log Request: GET: /58f42a5d08c9bf6a13b8c086 +22ms
  http:debug Data: null +0ms
  microservice:debug Validate:requestDetails { url: '58f42a5d08c9bf6a13b8c086',
  microservice:debug   headers:
  microservice:debug    { accept: 'application/json',
  microservice:debug      'user-agent': 'MicroserviceClient.1.0.0',
  microservice:debug      token: '0d3852e8f6d7709c0ab4ff66d0c1292b0d1eb2191cb8882c',
  microservice:debug      host: 'localhost:10002',
  microservice:debug      'content-type': 'application/json',
  microservice:debug      'content-length': '4',
  microservice:debug      connection: 'close' },
  microservice:debug   _buffer: 'null',
  microservice:debug   method: 'GET' }  +0ms
  microservice:debug Validate:TokenSystem +0ms
  microservice:debug MongoClient:findOneAndUpdate object not found. +4ms
  http:debug Validation error: Not found +0ms
  http:log Request: GET: /58f42a5d0971fc6a14a457f5 +14ms
  http:debug Data: null +0ms
  microservice:debug Validate:requestDetails { url: '58f42a5d0971fc6a14a457f5',
  microservice:debug   headers:
  microservice:debug    { accept: 'application/json',
  microservice:debug      'user-agent': 'MicroserviceClient.1.0.0',
  microservice:debug      token: '4bdb06ee410492e9d6a16da12d7189f6d0a31e9b3f569235',
  microservice:debug      host: 'localhost:10002',
  microservice:debug      'content-type': 'application/json',
  microservice:debug      'content-length': '4',
  microservice:debug      connection: 'close' },
  microservice:debug   _buffer: 'null',
  microservice:debug   method: 'GET' }  +0ms
  microservice:debug Validate:TokenSystem +26ms
  microservice:debug MongoClient:findOneAndUpdate object not found. +11ms
  http:debug Validation error: Not found +0ms
  ```
- now you can interrupt devel mode by ctrl+C and start as a standalone service:
  ```sh
  # npm run start
  > example-2@1.0.0 start /GitHub/microservice-framework/example-2
  > DEBUG=http:log,cluster:* node  --max-old-space-size=48 example-2.js >> `cat .env|grep LOGFILE|awk -F= {'print$2'}` 2>&1 &
  ```
- to stop service, just run:
  ```sh  
  # npm run stop

  > example-2@1.0.0 stop /GitHub/microservice-framework/example-2
  > cat `cat .env|grep PIDFILE|awk -F= {'print$2'}` |xargs kill -2  2>&1 &

  ```

- Check service logs in file `record.log`
  ```log
  Sun, 16 Apr 2017 23:34:48 GMT cluster:main Starting up 2 workers.
  Sun, 16 Apr 2017 23:34:48 GMT cluster:main Worker 90982 is online
  Sun, 16 Apr 2017 23:34:48 GMT cluster:main Worker 90983 is online
  Sun, 16 Apr 2017 23:34:49 GMT http:log Listen on :10002
  Sun, 16 Apr 2017 23:34:49 GMT http:log Listen on :10002
  Sun, 16 Apr 2017 23:34:51 GMT cluster:main Caught interrupt signal
  ```

We encorage you to use jscs, so package.json contain jscs comman that you can run next way:
```
# npm run jscs
```

In file `schema/record.json` you can define fields for your record. Each POST request will be validated to match data to this record specification.
