import http from 'http';
import https from 'https';
import url from 'url';
import {StringDecoder} from 'string_decoder';
import fs from 'fs';

import config from './config';
import router from './router';
import helpers from './lib/helpers';
import {IRequestData} from "./Interfaces";

console.log(`Environment mode = ${config.envName}.`);

// The HTTP server should respond only to HTTP requests
const serverHttp = http.createServer((req, res) => {
    unifiedServer(req, res);
})
// Start the server, and have it listen on port config.portHttp
serverHttp.listen(config.portHttp, () => {
    console.info(`HTTP Server is listening on http://localhost:${config.portHttp}.`);
})

// The HTTPS server should respond only to HTTP requests
const serverHttpsOptions = {
    'key': fs.readFileSync(__dirname + '/../https/key.pem'),
    'cert': fs.readFileSync(__dirname + '/../https/cert.pem'),
};
const serverHttps = https.createServer(serverHttpsOptions, (req, res) => {
    unifiedServer(req, res);
})
// Start the server, and have it listen on port config.portHttps
serverHttps.listen(config.portHttps, () => {
    console.info(`HTTPS Server is listening on https://localhost:${config.portHttps}.`);
})

// All the server logic for both the http and https server
const unifiedServer = (req: http.IncomingMessage, res: http.ServerResponse) => {

    if(req.url) {
        // Get the url and parse it
        const parsedUrl = url.parse(req.url, true);

        if(parsedUrl && parsedUrl.pathname) {
            // Get the path
            const trimmedPathname = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

            // Get the query string as an object
            const queryStringObject = parsedUrl.query;

            // Get the HTTP request method
            console.log(req.method, 'req.url:', req.url)
            const method = req.method ? req.method.toLowerCase() : 'get';

            // Get the headers as an object
            const headers = req.headers;

            // Get the payload, if any
            const decoder = new StringDecoder('utf-8');
            let buffer = '';
            req.on('data', (chunk: any) => buffer += decoder.write(chunk));
            req.on('end', () => {
                buffer += decoder.end();

                // Choose the handler this request should go to. If one is not found, use the notFound handler.
                const chosenHandler = trimmedPathname && router[trimmedPathname] ? router[trimmedPathname] : router['404'];

                // Construct the requestData object to send to the handler
                const requestData: IRequestData = {
                    host: headers.host ? headers.host : "",
                    method,
                    headers,
                    queryStringObject,
                    payload: buffer ? helpers.jsonToObject(buffer) : ''
                }

                chosenHandler(requestData, (statusCode: number | undefined, responsePayload: object | undefined) => {

                    // Use the payload callback back by the handler, or default to an empty object
                    // Convert the payload to a string_decoder
                    const payloadString = JSON.stringify(typeof(responsePayload) === 'object' ? responsePayload : {});

                    res.setHeader('Content-Type', 'application/json');
                    // Use the status code called back by the handler, or default to 200
                    res.writeHead(typeof(statusCode) === 'number' ? statusCode : 200);
                    res.end(payloadString);
                })

            })
        }

    }

}
