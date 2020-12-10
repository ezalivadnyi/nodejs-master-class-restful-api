import { TRouterHandler } from "../Interfaces";
import checksModule from "../modules/checks";
import { tokensModule } from "../modules/tokens";
import { usersModule } from "../modules/users";

// Define the router routerHandlers
export const notFound: TRouterHandler = (requestData, responseCallback) => {
    responseCallback(404, { message: 'Page not found!' });
};
export const ping: TRouterHandler = (requestData, responseCallback) => {
    // Callback an http status code and a payload object
    responseCallback();
};
export const users: TRouterHandler = (requestData, responseCallback) => {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    if (acceptableMethods.includes(requestData.method)) {
        usersModule[requestData.method](requestData, responseCallback);
    } else {
        responseCallback(405, { message: `${requestData.method} method is not allowed!` });
    }
};
export const tokens: TRouterHandler = (requestData, responseCallback) => {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    if (acceptableMethods.includes(requestData.method)) {
        tokensModule[requestData.method](requestData, responseCallback);
    } else {
        responseCallback(405, { message: `${requestData.method} method is not allowed!` });
    }
};
export const checks: TRouterHandler = (requestData, responseCallback) => {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    if (acceptableMethods.includes(requestData.method)) {
        checksModule[requestData.method](requestData, responseCallback);
    } else {
        responseCallback(405, { message: `${requestData.method} method is not allowed!` });
    }
};