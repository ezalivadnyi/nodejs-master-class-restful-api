/**
 * Request router handlers
 */

import {
    IRouterHandler,
} from "../Interfaces";
import {tokensModule} from "../modules/tokens";
import {usersModule} from "../modules/users";
import checksModule from "../modules/checksModule";

// Define the router routerHandlers
const routerHandlers: IRouterHandler = {
    // 404 handler
    notFound: (requestData, callback) => {
        callback(404, {message: 'Page not found!'});
    },
    // ping handler
    ping: (requestData, callback) => {
        // Callback an http status code and a payload object
        callback();
    },

    // users handler
    users: (requestData, responseCallback) => {
        const acceptableMethods = ['get', 'post', 'put', 'delete'];
        if(acceptableMethods.includes(requestData.method)) {
            usersModule[requestData.method](requestData, responseCallback);
        } else {
            responseCallback(405, {message: `${requestData.method} method is not allowed!`});
        }
    },

    // tokens handler
    tokens: (requestData, responseCallback) => {
        const acceptableMethods = ['get', 'post', 'put', 'delete'];
        if(acceptableMethods.includes(requestData.method)) {
            tokensModule[requestData.method](requestData, responseCallback);
        } else {
            responseCallback(405, {message: `${requestData.method} method is not allowed!`});
        }
    },

    // check handler
    checks: (requestData, responseCallback) => {
        const acceptableMethods = ['get', 'post', 'put', 'delete'];
        if(acceptableMethods.includes(requestData.method)) {
            checksModule[requestData.method](requestData, responseCallback);
        } else {
            responseCallback(405, {message: `${requestData.method} method is not allowed!`});
        }
    },
}

export default routerHandlers;
