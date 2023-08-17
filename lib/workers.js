/*
 * Worker-related tasks
 *
 */

const https = require('https');
const db = require("../db/index");
const helpers = require("./helpers");

let workers = {}

// Lookup all checks, get their data, send to validator
workers.gatherAllChecks = function () {
    db.queries.getAllChecks(function (err, checks) {
        if (!err && checks && checks.length > 0) {
            checks.forEach(check => {
                workers.performCheck(check);
            });
        }
    });
}

workers.performCheck = function (check) {

    let checkOutcome = {
        "error": false,
        "responseCode": false,
        "isFirstCheck": false,
    }

    // Set the state because may not be set (if the workers have never seen this check before)
    if (!check.state) {
        check.state = "down";
        checkOutcome.isFirstCheck = true;
    }

    let outcomeSent = false;

    const checkURL = new URL("/", check.protocol + '://' + check.url);
    const hostName = checkURL.hostname;
    const pathname = checkURL.pathname;

    const requestObj = {
        'protocol': check.protocol + ':',
        'hostname': hostName,
        'method': check.method,
        'path': pathname,
    }

    // just requests of https protocol
    let req = https.request(requestObj, function (res) {
        checkOutcome.responseCode = res.statusCode;
        if (!outcomeSent) {
            workers.processCheckOutcome(check, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on('error', function (e) {
        checkOutcome.error = { 'error': true, 'value': e }
        if (!outcomeSent) {
            workers.processCheckOutcome(check, checkOutcome);
            outcomeSent = true;
        }
    });

    req.on('timeout', function () {
        checkOutcome.error = { 'error': true, 'value': 'timeout' }
        if (!outcomeSent) {
            workers.processCheckOutcome(check, checkOutcome);
            outcomeSent = true;
        }
    });

    req.end();
}

workers.processCheckOutcome = function (check, checkOutcome) {

    const newState = checkOutcome.responseCode && check.successcodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    let alertWarranted;
    if (checkOutcome.isFirstCheck && newState === "down")
        alertWarranted = true;
    else if (!checkOutcome.isFirstCheck && check.state !== newState)
        alertWarranted = true;
    else
        alertWarranted = false;

    let updatedCheck = check;
    updatedCheck.state = newState;

    db.queries.putCheckState(updatedCheck, function (err) {
        if (!err) {
            if (alertWarranted)
                workers.alertUserToStatusChange(updatedCheck);
        }
    });
}

workers.alertUserToStatusChange = function (updatedCheck) {
    let msg = 'Alert: Your check for ' +
        updatedCheck.method +
        ' ' + updatedCheck.protocol +
        '://' + updatedCheck.url +
        ' is currently ' + updatedCheck.state;

    helpers.sendTwilioSms(updatedCheck.userphone, msg, function (err) {
        if (!err)
            console.log("Success: User was alerted to a status change in their check, via sms");
        else
            console.log("Error: Could not send sms alert to user who had a state change in their check");
    });
}

workers.loop = function () {
    setInterval(function () {
        workers.gatherAllChecks();
    }, 1000 * 30);
}

workers.init = function () {

    console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');

    // Execute all the checks immediately
    workers.gatherAllChecks();
    workers.loop();
}


module.exports = workers;
