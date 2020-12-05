import { THttpMethodHandler } from "../Interfaces";
import checkers from "../lib/checkers";
import _data from "../lib/data";

const checksModule: THttpMethodHandler = {
    post: (requestData, responseCallback) => {
        const protocol = checkers.protocol(requestData.payload.protocol);
        const url = checkers.url(requestData.payload.url);
        const method = checkers.method(requestData.payload.method);
        const successCodes = checkers.successCodes(requestData.payload.successCodes);
        const timeoutSeconds = checkers.timeoutSeconds(requestData.payload.timeoutSeconds);

        if (!protocol || !url || !method || !successCodes || !timeoutSeconds) {
            responseCallback(400, { message: `Missing required inputs or inputs are invalid` })
        } else {
            const token = checkers.token(requestData.headers.token);
            _data.read('tokens', token, (readError, readedData) => {
                if (readError) {
                    //const 
                } else {
                    responseCallback(403, { message: `Not authorized` })
                }
            })
        }
    }
}

export default checksModule;