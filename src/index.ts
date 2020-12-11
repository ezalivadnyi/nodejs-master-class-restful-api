import fs from 'fs';
import http from 'http';
import https from 'https';
import { exit } from 'process';
import { StringDecoder } from 'string_decoder';
import url from 'url';
import env from './env';
import { IRequestData } from "./Interfaces";
import helpers from './lib/helpers';
import router from './router';

if (!env.ENVIRONMENT_NAME) {
    console.error('ERROR! PLEASE PROVIDE ENVIRONMENT_NAME IN .env FILE!');
    exit();
} else {
    console.log(`Environment mode = ${env.ENVIRONMENT_NAME}.`);
}

if (!env.HASHING_SECRET) {
    console.error('ERROR! PLEASE PROVIDE STRONG HASHING_SECRET IN .env FILE!');
    exit();
}

if (!env.HOST) {
    console.error('ERROR! PLEASE PROVIDE HOST IN .env FILE!');
    exit();
}

if (!env.PORT_HTTPS && !env.PORT_HTTP) {
    console.error('ERROR! PLEASE PROVIDE PORT_HTTP AND/OR PORT_HTTPS IN .env FILE!');
    exit();
}

if (env.HOST && env.PORT_HTTP) {
    // The HTTP server should respond only to HTTP requests
    const serverHttp = http.createServer((req, res) => {
        unifiedServer(req, res);
    });
    // Start the server, and have it listen on port PORT_HTTP
    serverHttp.listen(+env.PORT_HTTP, env.HOST, () => {
        console.info(`HTTP Server is listening on http://${env.HOST}:${env.PORT_HTTP}.`);
    });
}

if (env.HOST && env.PORT_HTTPS) {
    // The HTTPS server should respond only to HTTP requests
    const serverHttpsOptions = {
        'key': fs.readFileSync(__dirname + '/../https/key.pem'),
        'cert': fs.readFileSync(__dirname + '/../https/cert.pem'),
    };
    const serverHttps = https.createServer(serverHttpsOptions, (req, res) => {
        unifiedServer(req, res);
    });
    // Start the server, and have it listen on port env.PORT_HTTPS
    serverHttps.listen(+env.PORT_HTTPS, env.HOST, () => {
        console.info(`HTTPS Server is listening on https://${env.HOST}:${env.PORT_HTTPS}.`);
    });
}

// All the server logic for both the http and https server
const unifiedServer = (req: http.IncomingMessage, res: http.ServerResponse) => {

    if (req.url) {
        // Get the url and parse it
        const parsedUrl = url.parse(req.url, true);

        if (parsedUrl && parsedUrl.pathname) {
            // Get the path
            const trimmedPathname = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

            // Get the query string as an object
            const queryStringObject = parsedUrl.query;

            // Get the HTTP request method
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
                if (env.ENVIRONMENT_NAME === 'staging') {
                    console.log(`=================================`);
                    console.log(`Received ${req.method} request to ${req.headers.host}${req.url}`)
                    console.log(`Headers: `, requestData.headers);

                    if (Object.keys(queryStringObject).length) {
                        console.log("queryStringObject:", queryStringObject)
                    }
                    if (buffer) {
                        console.log('buffer payload:', helpers.jsonToObject(buffer))
                    }
                    console.log();
                };

                chosenHandler(requestData, (statusCode: number | undefined, responsePayload: object | undefined) => {
                    // Use the payload callback back by the handler, or default to an empty object
                    // Convert the payload to a string_decoder
                    const payloadString = JSON.stringify(typeof (responsePayload) === 'object' ? responsePayload : {});
                    res.setHeader('Content-Type', 'application/json');
                    // Use the status code called back by the handler, or default to 200
                    res.writeHead(typeof (statusCode) === 'number' ? statusCode : 200);
                    res.end(payloadString);
                });
            });
        };
    };
};
