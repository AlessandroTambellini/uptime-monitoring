/*
 * Primary file for API
 *
 */

const server = require('./lib/server');
const workers = require('./lib/workers');
const db = require("./db/index");
const cli = require('./lib/cli');

let app = {}

app.init = function (callback) {

    server.init();

    workers.init();

    db.init();

    // Start the CLI, but make sure it starts last
    setTimeout(function () {
        cli.init();
        callback();
    }, 50);
}

// starts after command: node index.js
if (require.main === module) {
    app.init(function () { });
}

// Export the app
module.exports = app;
