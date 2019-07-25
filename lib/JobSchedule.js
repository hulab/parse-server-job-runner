/*
How to determine if a job should be run at a current date?
1. job.dayOfWeek contains "1" at the current day index (0-6)
2. job.startAfter is less than the current date
3. job.timeOfDay is less than the current time of day (the job's start time every day)
4. job.lastRun + job.repeatMinutes >= now (if repeat minutes is set, rounded to the minute)
 */
const request = require('request-promise-native');
const {filters} = require('./utils');

async function run() {
  console.log('Searching jobs to run...');
  const date = new Date();
  try {
    const jobs = await getJobsToRun(date);
    return Promise.all(jobs.map(job => runJob(job, date)));
  }
  catch (error) {
    console.error(error);
  }
}

async function getJobsToRun(date) {
  const options = {};
  options.headers = {
    'X-Parse-Application-Id': process.env.PARSE_APPLICATION_ID,
    'X-Parse-Master-Key': process.env.PARSE_MASTER_KEY,
    'Content-Type': 'application/json'
  }
  options.url = process.env.PARSE_SERVER_URL + '/classes/_JobSchedule';
  options.method = 'GET';
  try {
    let {results: jobs} = JSON.parse(await request(options));
    console.info("Found " + jobs.length + " job(s) scheduled");
    jobs = jobs.filter(filters.all(date));
    console.info("Running " + jobs.length + "job(s)...");
    return jobs;

  } catch (error) {
    console.log(error);
    return error;
  }
}

async function runJob(job, date) {
  console.info("Running " + job.jobName);
  const options = {};
  options.headers = {
    'X-Parse-Application-Id': process.env.PARSE_APPLICATION_ID,
    'X-Parse-Master-Key': process.env.PARSE_MASTER_KEY,
    'Content-Type': 'application/json'
  }
  options.url = process.env.PARSE_SERVER_URL + '/jobs/' + job.jobName;
  options.body = job.params;
  options.method = 'POST';
  try {
    await request(options);
    console.info("Successfully ran " + job.jobName + "!");
    const lastRunDate = new Date(date);
    lastRunDate.setMilliseconds(0);
    lastRunDate.setSeconds(0);
    return await saveJob(job, lastRunDate);
  }
  catch (res) {
    console.error("error running " + job.jobName, res.error);
    throw res;
  }
}

async function saveJob(job, date) {
  const options = {};
  options.headers = {
    'X-Parse-Application-Id': process.env.PARSE_APPLICATION_ID,
    'X-Parse-Master-Key': process.env.PARSE_MASTER_KEY,
    'Content-Type': 'application/json'
  }
  options.url = process.env.PARSE_SERVER_URL + '/classes/_JobSchedule/' + job.objectId;
  console.log(job);
  options.body = JSON.stringify({lastRun: Math.round(date.getTime() / 1000)});
  options.method = 'PUT';
  return await request(options);
}

module.exports = { run };
