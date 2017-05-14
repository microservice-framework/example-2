/**
 * Profile Stats MicroService.
 */
'use strict';

const Cluster = require('@microservice-framework/microservice-cluster');
const Microservice = require('@microservice-framework/microservice');


require('dotenv').config();

var mservice = new Microservice({
  mongoUrl: process.env.MONGO_URL + process.env.MONGO_PREFIX + process.env.MONGO_OPTIONS,
  mongoTable: process.env.MONGO_TABLE,
  secureKey: process.env.SECURE_KEY,
  schema: process.env.SCHEMA
});

var mControlCluster = new Cluster({
  pid: process.env.PIDFILE,
  port: process.env.PORT,
  hostname: process.env.HOSTNAME,
  count: process.env.WORKERS,
  callbacks: {
    validate: mservice.validate,
    POST: recordPOST,
    GET: mservice.get,
    PUT: mservice.put,
    DELETE: mservice.delete,
    SEARCH: recordSEARCH
  }
});

/**
 * POST middleware.
 */
function recordPOST(jsonData, requestDetails, callback) {
  try {
    mservice.validateJson(jsonData);
  } catch (e) {
    return callback(e, null);
  }

  // Check if record exists first.
  let searchRequest = {
    record_id: jsonData.record_id,
  };
  mservice.search(searchRequest, requestDetails, function(err, handlerResponse) {
    if (err) {
      return callback(err);
    }
    if (handlerResponse.code == 404) {
      return mservice.post(jsonData, requestDetails, callback);
    }

    handlerResponse.answer = handlerResponse.answer[0];
    callback(null, handlerResponse);
  });
}

/**
 * SEARCH middleware.
 */
function recordSEARCH(jsonData, requestDetails, callback) {
  mservice.search(jsonData, requestDetails, function(err, handlerResponse) {
    if (err) {
      return callback(err, handlerResponse);
    }
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
