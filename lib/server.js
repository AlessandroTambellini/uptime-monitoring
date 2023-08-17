/*
 * Server-related tasks
 *
 */

const http = require('http');
const StringDecoder = require('string_decoder').StringDecoder;
const handlers = require('./handlers');
const helpers = require('./helpers');
require('dotenv').config({ path: "./KEYS.env" });

// Instantiate the server module object
let server = {}

// Instantiate the HTTP server
server.httpServer = http.createServer(function (req, res) {

    const myURL = new URL(req.url, process.env.BASE_URL);

    const pathname = myURL.pathname;
    const trimmedPath = pathname.replace(/^\/+|\/+$/g, '');

    const searchParams = myURL.searchParams;

    const method = req.method;
    const headers = req.headers;

    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        let chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

        // Construct the data object to send to the handler
        const data = {
            'trimmedPath': trimmedPath,
            'searchParams': searchParams,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        }

        // Route the request to the handler specified in the router
        try {
            chosenHandler(data, function (statusCode, payload, contentType) {
                server.processHandlerResponse(res, method, trimmedPath, statusCode, payload, contentType);
            });
        } catch (e) {
            console.log(e);
            server.processHandlerResponse(res, method, trimmedPath, 500, { 'Error': 'An unknown error has occured' }, 'json');
        }
    });
});


// Process the response from the handler
server.processHandlerResponse = function (res, method, trimmedPath, statusCode, payload, contentType) {
    // Determine the type of response (fallback to JSON)
    contentType = typeof (contentType) == 'string' ? contentType : 'json';
    statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

    let payloadString = "";
    if (contentType == 'json') {
        res.setHeader('Content-Type', 'application/json');
        payload = typeof (payload) == 'object' ? payload : {}
        payloadString = JSON.stringify(payload);
    }

    if (contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof (payload) == 'string' ? payload : '';
    }

    if (contentType == 'plain') {
        res.setHeader('Content-Type', 'text/plain');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
    }

    if (contentType == 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
    }

    if (contentType == 'css') {
        res.setHeader('Content-Type', 'text/css');
        payloadString = typeof (payload) !== 'undefined' ? payload : '';
    }

    res.writeHead(statusCode);
    res.end(payloadString);

    if (statusCode === 200) {
        console.log('\x1b[32m%s\x1b[0m', method + ' /' + trimmedPath + ' ' + statusCode);
    } else {
        console.log('\x1b[31m%s\x1b[0m', method + ' /' + trimmedPath + ' ' + statusCode);
    }
}

// Define the request router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/delete': handlers.accountDelete,
    "session/create": handlers.sessionCreate,
    "session/deleted": handlers.sessionDeleted,
    'checks/list': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/delete': handlers.checksDelete,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'public': handlers.public, // Why does this workksss=?????!!!?!?! WTF?!?!?
}

server.init = function () {

    // start HTTP server
    server.httpServer.listen(process.env.HTTP_PORT, function () {
        console.log('\x1b[36m%s\x1b[0m', 'The HTTP server is running on port ' + process.env.HTTP_PORT);
    });
}


module.exports = server;
