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
        if (!err && res) {
            callback(false, res.rows[0]);
        }
        else {
            callback(err, res);
        }
    })
}

db.queries.getToken = function (id, callback) {
    client.query("SELECT * FROM tokens WHERE id = $1", [id], (err, res) => {
        if (!err && res) {
            callback(false, res.rows[0]);
        }
        else {
            callback(err, res);
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
            callback(err);
        }
    })
}

db.queries.deleteToken = function (id, callback) {
    client.query("DELETE FROM tokens WHERE id = $1", [id], (err) => {
        if (!err) {
            callback(false);
        }
        else {
            callback(err);
        }
    })
}



module.exports = db;