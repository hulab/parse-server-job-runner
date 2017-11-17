#!/usr/bin/env node
const Parse = require('parse/node');
const { JobSchedule } = require('./lib/JobSchedule');

exports.handler = function(event, context, callback) {
  if (!process.env.PARSE_APPLICATION_ID || !process.env.PARSE_MASTER_KEY || !process.env.PARSE_SERVER_URL) {
    if (callback) callback(new Error('Missing required environment variables (PARSE_APPLICATION_ID, PARSE_MASTER_KEY, PARSE_SERVER_URL)'));
    return;
  }

  Parse.initialize(process.env.PARSE_APPLICATION_ID, undefined, process.env.PARSE_MASTER_KEY);
  Parse.serverURL = process.env.PARSE_SERVER_URL;

  JobSchedule.run().then((result) => {
    return callback ? callback(null, result) : result;
  })
  .catch((error) => {
    return callback ? callback(error) : error;
  });
};


exports.handler(undefined,undefined,function (error, result){console.log(error?error:result)});
