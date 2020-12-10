import { CHECKS_ID_LENGTH, MAX_CHECKS_PER_USER } from "../constants";
import { ICheck, IToken, IUser, THttpMethodHandler } from "../Interfaces";
import _data from "../lib/data";
import checkers from "../lib/fieldsCheckers";
import helpers from "../lib/helpers";

const checksModule: THttpMethodHandler = {
    post: (requestData, responseCallback) => {
        const protocol = checkers.protocol(requestData.payload.protocol);
        const url = checkers.url(requestData.payload.url);
        const method = checkers.method(requestData.payload.method);
        const successCodes = checkers.successCodes(requestData.payload.successCodes);
        const timeoutSeconds = checkers.timeoutSeconds(requestData.payload.timeoutSeconds);

        const token = checkers.token(requestData.headers.token);
        if (!token) {
            responseCallback(400, { message: `Token missing` })
        } else {
            if (!protocol || !url || !method || !successCodes || !timeoutSeconds) {
                responseCallback(400, { message: `Missing required inputs or inputs are invalid` })
            } else {
                _data.read('tokens', token, (readTokenError, tokenData: IToken) => {
                    if (readTokenError) {
                        responseCallback(403, { message: `Token didn't exist` })
                    } else {
                        _data.read('users', tokenData.phone, (err, userData: IUser) => {
                            if (err) {
                                responseCallback(404, { message: `User didn't exist` })
                            } else {
                                const userChecks = checkers.userChecks(userData);
                                const checkId = helpers.createRandomString(CHECKS_ID_LENGTH);
                                if (userChecks.length < MAX_CHECKS_PER_USER) {
                                    const checkObject: ICheck = {
                                        'id': checkId,
                                        'userPhone': tokenData.phone,
                                        'protocol': protocol,
                                        'url': url,
                                        'method': method,
                                        'successCodes': successCodes,
                                        'timeoutSeconds': timeoutSeconds,
                                    };
                                    _data.create('checks', checkId, checkObject, (err) => {
                                        if (err) {
                                            responseCallback(500, { message: `Couldn't create the new check` })
                                        } else {
                                            userData.checks = userChecks;
                                            userData.checks.push(checkId);
                                            _data.update('users', tokenData.phone, userData, (updateUserError => {
                                                if (updateUserError) {
                                                    responseCallback(500, { message: `Couldn't update the user with the new check` });
                                                } else {
                                                    responseCallback(200, checkObject);
                                                }
                                            }))
                                        }
                                    })
                                } else {
                                    responseCallback(400, { message: `The user already has the maximum number of checks (${MAX_CHECKS_PER_USER})` })
                                }
                            }
                        })
                    }
                })
            }

        }
    },
    get: (requestData, responseCallback) => {
        const checkId = checkers.checksId(requestData.queryStringObject.id);
        // Get the token from the headers
        const token = checkers.token(requestData.headers.token);
        if (!token) {
            responseCallback(400, { message: `Missing required token in header` })
        } else if (!checkId) {
            responseCallback(400, { message: 'Missing required field. Please specify the checks id number in GET parameter.' })
        } else {
            _data.read('checks', checkId, (readChecksErr, readedCheckData: ICheck) => {
                if (readChecksErr) {
                    responseCallback(404, { message: `Couldn't find checks with provided id` });
                } else {

                    // Verify that the given token is valid for the phone number
                    helpers.verifyToken(token, readedCheckData.userPhone, (tokenIsValid) => {
                        if (!tokenIsValid) {
                            responseCallback(403, { message: `Token is invalid` })
                        } else {
                            responseCallback(200, readedCheckData)
                        }
                    })
                }
            });
        }
    },
    put: (requestData, responseCallback) => {
        const checkId = checkers.checksId(requestData.payload.id);
        const protocol = checkers.protocol(requestData.payload.protocol);
        const url = checkers.url(requestData.payload.url);
        const method = checkers.method(requestData.payload.method);
        const successCodes = checkers.successCodes(requestData.payload.successCodes);
        const timeoutSeconds = checkers.timeoutSeconds(requestData.payload.timeoutSeconds);

        if (!checkId) {
            responseCallback(400, { message: 'Missing required field. Please specify the checks id number in GET parameter.' })
        } else {
            if (!protocol && !url && !method && !successCodes && !timeoutSeconds) {
                responseCallback(400, { message: 'Missing fields to update' });
            } else {
                _data.read('checks', checkId, (readChecksError, readedChecksData) => {
                    if (readChecksError) {
                        responseCallback(404, { message: `Couldn't find checks with provided id` });
                    } else {
                        const token = checkers.token(requestData.headers.token);
                        helpers.verifyToken(token, readedChecksData.userPhone, (tokenIsValid) => {
                            if (!tokenIsValid) {
                                responseCallback(403, { message: `Token is invalid` })
                            } else {
                                if (protocol) readedChecksData.protocol = protocol
                                if (url) readedChecksData.url = url
                                if (method) readedChecksData.method = method
                                if (successCodes) readedChecksData.successCodes = successCodes
                                if (timeoutSeconds) readedChecksData.timeoutSeconds = timeoutSeconds

                                _data.update('checks', checkId, readedChecksData, (updErr) => {
                                    if (updErr) {
                                        responseCallback(500, { message: `Couldn't update the check` });
                                    } else {
                                        responseCallback(200, { message: `Check ${checkId} updated!` });
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    },
    delete: (requestData, responseCallback) => {
        const tokenId = checkers.token(requestData.headers.token);
        const checkId = checkers.checksId(requestData.queryStringObject.id);
        if (!tokenId) {
            responseCallback(400, { message: 'Missing required header. Please provide the token ID.' })
        } else if (!checkId) {
            responseCallback(400, { message: 'Missing required field. Please specify the check ID in GET parameter.' })
        } else {
            _data.read('checks', checkId, (readChecksErr, checksData: ICheck) => {
                if (readChecksErr) {
                    responseCallback(404, { message: `Couldn't find checks with provided id` });
                } else {

                    // Verify that the given token is valid for the phone number
                    helpers.verifyToken(tokenId, checksData.userPhone, (tokenIsValid) => {
                        if (!tokenIsValid) {
                            responseCallback(403, { message: `Token is invalid` })
                        } else {
                            _data.delete('checks', checkId, deleteError => {
                                if (deleteError) {
                                    responseCallback(500, { message: `Couldn't delete the check data` });
                                } else {
                                    _data.read('users', checksData.userPhone, (err, userData: IUser) => {
                                        if (err) {
                                            responseCallback(500, { message: `Couldn't find the user who created the check, so could not remove the check from the list of checks on the user object` });
                                        } else {
                                            const userChecks = checkers.userChecks(userData);
                                            const checkPosition = userChecks.indexOf(checkId);
                                            if (checkPosition === -1) {
                                                responseCallback(500, { message: `Couldn't find the check on the user's object, so couldn't remove it` });
                                            } else {
                                                userChecks.splice(checkPosition, 1);
                                                userData.checks = userChecks;
                                                _data.update('users', checksData.userPhone, userData, updateError => {
                                                    if (updateError) {
                                                        responseCallback(500, { message: `Couldn't update the user's check` });
                                                    } else {
                                                        responseCallback(200, { message: `User's check successfuly deleted` });
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    })

                }
            })

        }
    },
}

export default checksModule;