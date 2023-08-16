const { Client } = require("pg");
require('dotenv').config({ path: "../KEYS.env" });

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_USER_PASSWORD,
    database: process.env.DB_DATABASE,
})

let db = {};

db.init = function () {
    client.connect();
    client.on("error", (err) => {
        console.log("\x1b[36m%s\x1b[0m", "error connecting the database: " + err.stack);
    })
}

db.queries = {};

db.queries.getUsers = function (data, callback) {
    client.query(`SELECT * FROM users`, (err, res) => {
        if (!err && res) {
            callback(false, res);
        }
        else {
            callback(err.message);
        }
        client.end;
    })
}

db.queries.getUser = function (phone, callback) {
    client.query(`SELECT * FROM users WHERE phone = $1`, [phone], (err, res) => {
        // if (!err && res) is not enough becase even if there's no user matching the request,
        // a response is always given if there's no error
        if (!err && res.rows[0]) {
            callback(false, res.rows[0]); // the user exists
        }
        else if (!err && !res.rows[0]) {
            callback(false, false); // the user doesn't exist
        }
        else {
            callback(err.message, false); // something went wrong
        }
    })
}

db.queries.postUser = function (userObj, callback) {
    const { name, phone } = userObj;
    client.query("INSERT INTO users (name, phone, checks) VALUES ($1, $2, $3)", [name, phone, []], (err) => {
        if (!err)
            callback(false);
        else
            callback(err.message);
    })
}

db.queries.putUser = function (userObj, callback) {
    const { checks, phone } = userObj;
    client.query("UPDATE users SET checks = $1 WHERE phone = $2", [checks, phone], (err) => {
        if (!err) {
            callback(false);
        }
        else {
            callback(err.message);
        }
    })
}

db.queries.deleteUser = function (phone, callback) {
    client.query("DELETE FROM users WHERE phone = $1", [phone], (err, data) => {
        if (!err) {
            callback(false);
        }
        else {
            callback(err.message);
        }
    })
}

db.queries.getToken = function (id, callback) {
    client.query("SELECT * FROM tokens WHERE id = $1", [id], (err, res) => {
        if (!err && res) {
            callback(false, res.rows[0]);
        }
        else {
            callback(err.message, res);
        }
    })
}

db.queries.postToken = function (tokenObj, callback) {
    const { phone, id, expires } = tokenObj;
    const values = [phone, id, expires];
    client.query("INSERT INTO tokens (phone, id, expires) VALUES ($1, $2, $3)", values, (err) => {
        if (!err) {
            callback(false);
        }
        else {
            callback(err.message);
        }
    })
}

db.queries.deleteToken = function (id, callback) {
    client.query("DELETE FROM tokens WHERE id = $1", [id], (err) => {
        if (!err) {
            callback(false);
        }
        else {
            callback(err.message);
        }
    })
}

db.queries.postCheck = function (checkObj, callback) {
    const { id, userphone, protocol, url, method, successCodes } = checkObj;
    const values = [id, userphone, protocol, url, method, successCodes];

    // is it the same if I call with userPhone instead of userphone?
    client.query("INSERT INTO checks (id, userphone, protocol, url, method, successcodes) VALUES ($1, $2, $3, $4, $5, $6)", values, (err) => {
        if (!err) {
            callback(false);
        }
        else {
            callback(err.message);
        }
    })
}

db.queries.getCheck = function (id, callback) {
    client.query("SELECT * FROM checks WHERE id = $1", [id], (err, data) => {
        if (!err && data.rows[0])
            callback(false, data.rows[0]);
        else
            callback(err.message, false);
    })
}

db.queries.putCheckState = function (checkObj, callback) {
    const { id, state } = checkObj;
    client.query("UPDATE checks SET state = $1 WHERE id = $2", [state, id], (err) => {
        if (!err)
            callback(false);
        else
            callback(err.message);
    })
}

db.queries.deleteCheck = function (id, callback) {
    client.query("DELETE FROM checks WHERE id = $1", [id], (err) => {
        if (!err) {
            callback(false)
        }
        else {
            callback(err.message);
        }
    })
}

db.queries.getAllChecks = function (callback) {
    client.query("SELECT * FROM checks", [], (err, data) => {
        if (!err && data) {
            callback(false, data.rows);
        }
        else {
            callback(err.message);
        }
    })
}

module.exports = db;