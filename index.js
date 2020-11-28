/**
* Primary File for the API server
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');

const config = require('./config');

const objectToStrings = (obj) => {
    if(obj.constructor === Object && Object.keys(obj).length) {
        let result = '';
        for(const [key, value] of Object.entries(obj)) {
            result +=`\t${key}: ${value}\n`
        }
        return result;
    } else {
        return obj;
    }
}

console.log(`Environment mode = ${config.envName}.`);

// The HTTP server should respond only to HTTP requests
const serverHttp = http.createServer((req, res) => {
    unifiedServer(req, res);
})
// Start the server, and have it listen on port config.portHttp
serverHttp.listen(config.portHttp, () => {
    console.info(`HTTP Server is listening on port ${config.portHttp}.`);
})


// The HTTPS server should respond only to HTTP requests
const serverHttpsOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem'),
};
const serverHttps = https.createServer(serverHttpsOptions, (req, res) => {
    unifiedServer(req, res);
})
// Start the server, and have it listen on port config.portHttps
serverHttps.listen(config.portHttps, () => {
    console.info(`HTTPS Server is listening on port ${config.portHttps}.`);
})


// All the server logic for both the http and https server
const unifiedServer = function (req, res) {

    // Get the url and parse it
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP request method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new stringDecoder('utf-8');
    let buffer = '';
    req.on('data', chunk => {
        buffer += decoder.write(chunk);
    });
    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the notFound handler.
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : routerHandlers.notFound;

        // Construct the responseData object to send to the handler
        let responseData = {
            host: headers.host,
            path: trimmedPath,
            method: method,
            headers: headers,
        }

        if(queryStringObject.constructor === Object && Object.keys(queryStringObject).length)
            responseData.query = queryStringObject;
        if(buffer)
            responseData.body = buffer;

        chosenHandler(responseData, (statusCode, payload) => {
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload callback back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string_decoder
            let payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('payloadString', payloadString);
        })

    })
}

// Define the router routerHandlers
const routerHandlers = {
    // 404 handler
    notFound: (data, callback) => {
        callback(404, {message: 'Page not found!'});
    },
    // ping handler
    ping: (data, callback) => {
        // Callback an http status code and a payload object
        callback();
    },
    // hello handler
    hello: (data, callback) => {
        // Callback an http status code and a payload object
        callback(200, {message: 'Hello World!'});
    }
};

// Define a request router
const router = {
  'ping': routerHandlers.ping,
  'hello': routerHandlers.hello,
};