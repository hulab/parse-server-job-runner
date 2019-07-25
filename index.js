#!/usr/bin/env node
const JobSchedule = require('./lib/JobSchedule');

exports.handler = function(event, context, callback) {
  if (!process.env.PARSE_APPLICATION_ID || !process.env.PARSE_MASTER_KEY || !process.env.PARSE_SERVER_URL) {
    if (callback) callback(new Error('Missing required environment variables (PARSE_APPLICATION_ID, PARSE_MASTER_KEY, PARSE_SERVER_URL)'));
    return;
  }

  JobSchedule.run()
    .then((result) => {
      return callback ? callback(null, result) : result;
    })
    .catch((error) => {
      return callback ? callback(error) : error;
    });
};
