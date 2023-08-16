/*
 * Primary file for API
 *
 */

const server = require('./lib/server');
const workers = require('./lib/workers');
const db = require("./db/index");

let app = {}

app.init = function (callback) {

    server.init();

    db.init();

    /* Start the background workers after the server is up and the connection to
        the database is created */
    setTimeout(function () {
        workers.init();
        callback();
    }, 50);
}

// starts after command: node index.js
if (require.main === module) {
    app.init(function () { });
}

module.exports = app;
