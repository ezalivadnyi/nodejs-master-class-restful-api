//@ts-check
import env from "../env";
import { IToken, IUser, THttpMethodHandler } from "../Interfaces";
import checkers from "../lib/fieldsCheckers";
import _data from "../lib/fsDataCRUD";
import helpers from "../lib/helpers";

export const tokensModule: THttpMethodHandler = {
    get: (requestData, responseCallback) => {
        // Check that the id is valid
        let id: string = requestData.queryStringObject.id;
        id = typeof (id) === 'string' && id.trim().length === 20 ? id.trim() : "";
        if (!id) {
            responseCallback(400, { message: 'Missing required field. Please specify the correct token id.' })
        } else {
            // Lookup the token
            _data.read('tokens', id, (readError, tokenData: IToken) => {
                if (readError) {
                    responseCallback(404, { message: 'Token id not found' })
                } else {
                    responseCallback(200, tokenData)
                }
            });
        }
    },

    post: (requestData, responseCallback) => {
        if (env.ENVIRONMENT_NAME === 'staging') { console.log('\n/users POST payload:', requestData.payload); }

        const phone = checkers.user.phone(requestData.payload.phone);
        let password = requestData.payload.password;
        password = typeof (password) === 'string' && password.trim().length > 7 ? password.trim() : "";
        if (!phone || !password) {
            responseCallback(400, { message: `Missing required fields` });
        } else {
            // Lookup the user who matches that phone number
            _data.read('users', phone, (readError, readedData: IUser) => {
                if (readError) {
                    console.error(readError);
                    responseCallback(404, { message: `Couldn't find the user with a provided phone number` });
                } else {
                    if (helpers.hashPassword(password) !== readedData.password) {
                        responseCallback(400, { message: "Password didn't match the specified user's stored password" });
                    } else {
                        const tokenId = helpers.createRandomString(20);
                        const expires = Date.now() + 1000 * 60 * 60;
                        const tokenObject: IToken = {
                            'phone': phone,
                            'id': tokenId,
                            'expires': expires,
                        }
                        _data.create('tokens', tokenId, tokenObject, (createError) => {
                            if (createError) {
                                responseCallback(500, { message: `Couldn't create the new token` });
                            } else {
                                responseCallback(200, tokenObject);
                            }
                        })
                    }
                }
            })
        }
    },

    put: (requestData, responseCallback) => {
        let id: string = requestData.payload.id;
        id = typeof (id) === 'string' && id.trim().length === 20 ? id.trim() : "";

        let extend: boolean = requestData.payload.extend;
        extend = typeof (extend) === 'boolean' && extend;

        if (!id || !extend) {
            responseCallback(400, { message: `Missing required field(s) or field(s) are invalid` })
        } else {
            _data.read("tokens", id, (err, tokenData: IToken) => {
                if (err) {
                    responseCallback(400, { message: `Specified token doesn't exist` })
                } else {
                    // Check to make sure that token isn't already expired
                    if (tokenData.expires > Date.now()) {
                        // Set the expiration an hour from now
                        tokenData.expires = Date.now() * 1000 * 60 * 60;
                        // Store the new updates
                        _data.update('tokens', id, tokenData, updateError => {
                            if (updateError) {
                                responseCallback(500, { message: `Couldn't update the token's expiration` })
                            } else {
                                responseCallback(200, { message: `Token's expiration successfully extended` })
                            }
                        })
                    } else {
                        responseCallback(400, { message: `The token has already expired and cannot be extended` })
                    }
                }
            })
        }
    },

    delete: (requestData, responseCallback) => {
        // Check id is valid
        const id = checkers.user.token(requestData.queryStringObject.id);
        if (!id) {
            responseCallback(400, { message: 'Missing required field. Please specify the id in GET parameter.' })
        } else {
            // Lookup the user
            _data.read('tokens', id, (readTokenError, tokenData: IToken) => {
                if (readTokenError) {
                    responseCallback(404, { message: `Can't find token with id ${id}` })
                } else {
                    // Remove the hashed password from the user object before returning it to the requester
                    _data.delete('tokens', id, (deleteTokenError) => {
                        if (deleteTokenError) {
                            console.error(deleteTokenError);
                            responseCallback(500, { message: `Couldn't delete the specified token` })
                        } else {
                            responseCallback(200, { message: 'Token successfully deleted!' })
                        }
                    })
                }
            });
        }
    },
}
