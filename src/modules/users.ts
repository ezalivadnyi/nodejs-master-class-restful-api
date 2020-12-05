import { THttpMethodHandler, IUser } from "../Interfaces";
import config from "../config";
import _data from "../lib/data";
import helpers from "../lib/helpers";
import checkers from "../lib/checkers";
import { PHONE_LENGTH } from "../constants";

export const usersModule: THttpMethodHandler = {
    get: (requestData, responseCallback) => {
        const phone = checkers.phone(requestData.queryStringObject.phone);
        // Get the token from the headers
        const token = checkers.token(requestData.headers.token);
        if (!token) {
            responseCallback(400, { message: `Missing required token in header` })
        } else if (!phone) {
            responseCallback(400, { message: 'Missing required field. Please specify the phone number in GET parameter.' })
        } else {
            // Verify that the given token is valid for the phone number
            helpers.verifyToken(token, phone, (tokenIsValid) => {
                if (!tokenIsValid) {
                    responseCallback(403, { message: `Token is invalid` })
                } else {
                    // Lookup the user
                    _data.read('users', phone, (err, userData: IUser) => {
                        if (err) {
                            responseCallback(404, { message: 'User with this phone not found' })
                        } else {
                            // Remove the hashed password from the user object before returning it to the requester
                            delete userData.password;
                            delete userData.tosAgreement;
                            responseCallback(200, userData)
                        }
                    });
                }
            })
        }
    },
    post: (requestData, responseCallback) => {
        if (config.envName === 'staging') { console.log('\n/users POST payload:', requestData.payload); }
        // Check the all required fields are filled out
        const firstName = checkers.firstName(requestData.payload.firstName);
        const lastName = checkers.lastName(requestData.payload.lastName);
        const phone = checkers.phone(requestData.payload.phone);
        const password = checkers.password(requestData.payload.password);
        const tosAgreement = checkers.tosAgreement(requestData.payload.tosAgreement);

        if (!firstName && !lastName && !phone && !password && !tosAgreement) {
            responseCallback(400, { message: 'Missing required fields.' });
        } else if (!firstName) {
            responseCallback(400, { message: 'First name required' });
        } else if (!lastName) {
            responseCallback(400, { message: 'Last name required' });
        } else if (!phone) {
            responseCallback(400, { message: `Phone required (${PHONE_LENGTH} digits without + sign)` });
        } else if (!password) {
            responseCallback(400, { message: 'Password required' });
        } else if (!tosAgreement) {
            responseCallback(400, { message: 'tosAgreement required' });
        } else {
            // Make sure that the user doesn't exist yet
            _data.read('users', phone, (err, data) => {
                if (!err) {
                    // TODO: notify the owner with reset password link instead of saying that already exist
                    responseCallback(400, { message: 'User with this phone number already exist' });
                } else {
                    // Hash the password
                    const hashedPassword = helpers.hashPassword(password);
                    if (!hashedPassword) {
                        responseCallback(500, { message: `Couldn't hash the user password!` });
                    } else {
                        // Create a user object
                        const newUserObject: IUser = {
                            'firstName': firstName,
                            'lastName': lastName,
                            'phone': phone,
                            'password': hashedPassword,
                            'tosAgreement': true,
                        }
                        _data.create('users', phone, newUserObject, (createError) => {
                            // if error - it's assume that user doesn't exist and we can create it
                            if (createError) {
                                responseCallback(500, { message: `Couldn't create a new user` });
                            } else {
                                responseCallback(200, { message: 'User successfully created' });
                            }
                        });
                    }
                }
            });
        }
    },
    put: (requestData, responseCallback) => {
        if (config.envName === 'staging') { console.log(`\n/users PUT payload: `, requestData.payload); }

        const token = typeof (requestData.headers.token) === "string" ? requestData.headers.token : '';
        let phone = checkers.phone(requestData.payload.phone);

        if (!token) {
            responseCallback(400, { message: `Missing required token in header` })
        } else if (!phone) {
            responseCallback(400, { message: 'Phone field missed or incorrect.' });
        } else {
            // Check for the optional field
            let firstName = requestData.payload.firstName;
            firstName = typeof (firstName) === 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
            let lastName = requestData.payload.lastName;
            lastName = typeof (lastName) === 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
            let password = requestData.payload.password;
            password = typeof (password) === 'string' && password.trim().length > 7 ? password.trim() : false;

            if (!firstName && !lastName && !password) {
                responseCallback(400, { message: 'Missing fields to update' })
            } else {
                helpers.verifyToken(token, phone, tokenIsValid => {
                    if (!tokenIsValid) {
                        responseCallback(403, { message: `Token is invalid` })
                    } else {
                        // Lookup the user
                        _data.read('users', phone, (readError, userData: IUser) => {
                            if (readError) {
                                responseCallback(404, { message: `The specified user doesn't exist` });
                            } else {
                                // Update the fields
                                if (firstName) userData.firstName = firstName;
                                if (lastName) userData.lastName = lastName;
                                if (password) userData.password = helpers.hashPassword(password);

                                // Store the new updates
                                _data.update('users', phone, userData, (updateError) => {
                                    if (updateError) {
                                        console.error(updateError);
                                        responseCallback(500, { message: `Error couldn't update the user` })
                                    } else {
                                        responseCallback(200, { message: `Update successful` })
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
        // TODO: only let an authenticated user to delete their own profile. Don't let delete anyone else's
        // TODO: Cleanup any other data files associated with this user


        // Get the token from the headers
        const token = typeof (requestData.headers.token) === "string" ? requestData.headers.token : '';

        // Check phone is valid
        const phone = checkers.phone(requestData.queryStringObject.phone);
        if (!token) {
            responseCallback(400, { message: `Missing required token in header` })
        } else if (!phone) {
            responseCallback(400, { message: 'Missing required field. Please specify the phone number in GET parameter.' })
        } else {
            helpers.verifyToken(token, phone, tokenIsValid => {
                if (!tokenIsValid) {
                    responseCallback(403, { message: `Token is invalid` })
                } else {
                    // Lookup the user
                    _data.read('users', phone, (readError, userData) => {
                        if (readError) {
                            responseCallback(404, { message: 'User with this phone not found' })
                        } else {
                            // Remove the hashed password from the user object before returning it to the requester
                            _data.delete('users', phone, (err) => {
                                if (err) {
                                    console.error(err);
                                    responseCallback(500, { message: `Couldn't delete the specified user` })
                                } else {
                                    responseCallback(200, { message: 'User successfully deleted!' })
                                }
                            })
                        }
                    });
                }
            })
        }
    },
};