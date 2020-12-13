import crypto from 'crypto';
import https from 'https';
import querystring from 'querystring';
import env from '../env';
import { IToken } from "../Interfaces";
import checkers from './fieldsCheckers';
import _data from "./fsDataCRUD";

const helpers = {
    // Create a SHA256 hash
    hashPassword: (str: string) => {
        if (str && str.length > 0 && env.HASHING_SECRET) {
            return crypto.createHmac('sha256', env.HASHING_SECRET).update(str).digest('hex');
        }
        return undefined;
    },

    jsonToObject: (json: string) => {
        // Parse a json string to an object in all cases, without throwing
        try {
            return JSON.parse(json);
        } catch (e) {
            console.error(e);
            return json;
        }
    },

    objectToStrings: (obj: object) => {
        if (obj.constructor === Object && Object.keys(obj).length) {
            let result = '';
            for (const [key, value] of Object.entries(obj)) {
                result += `\t${key}: ${value}\n`
            }
            return result;
        } else {
            return obj;
        }
    },

    createRandomString(length: number) {
        length = typeof (length) === 'number' && length > 0 ? length : 0;
        if (length) {
            // Define all possible characters that could go into a string
            const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 1; i <= length; i++) {
                result += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            }
            return result;
        }
        return '';
    },

    // Verify if a given token id is currently valid for a given user
    verifyToken: (tokenId: string, phone: string, callback: (tokenIsValid: boolean) => void) => {
        if (!tokenId) {
            callback(false);
        } else {
            // Lookup the token
            _data.read('tokens', tokenId, (readError, tokenData: IToken) => {
                if (readError) {
                    callback(false);
                } else {
                    // Check that the token is for the given user and has not expired
                    if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                }
            })
        }
    },

    sendTwilioSMS: (phoneNumber: string, message: string, callback: (err: any) => void) => {
        phoneNumber = checkers.user.phone(phoneNumber);
        message = typeof message === 'string' && message.trim().length > 0 && message.trim().length <= 1600 ? message.trim() : '';
        if (!phoneNumber) {
            callback('Given phoneNumber were missing or invalid. Phone must be 10 sign length without + sign.');
        } else if (!message) {
            callback('Given message were missing or invalid. Message length must be less then 1600 characters.');
        } else {
            const payload = querystring.stringify({
                'From': env.TWILIO.FROM_PHONE,
                'To': '+' + phoneNumber,
                'Body': message
            });

            const requestOptions: https.RequestOptions = {
                'protocol': 'https:',
                'hostname': 'api.twilio.com',
                'method': 'POST',
                'path': `/2010-04-01/Accounts/${env.TWILIO.ACCOUNT_SID}/Messages.json`,
                'auth': `${env.TWILIO.ACCOUNT_SID}:${env.TWILIO.AUTH_TOKEN}`,
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(payload),
                }
            };
            const req = https.request(requestOptions, (res) => {
                const status = res.statusCode;
                if (status === 200 || status === 201) {
                    callback(false);
                } else {
                    callback(`Status code returned was ${status}`);
                }
            });
            if (env.ENVIRONMENT_NAME === 'staging') {
                //console.log(`sendTwilioSMS payload`, payload);
                //console.log(`sendTwilioSMS requestOptions`, requestOptions);
                //console.log(`sendTwilioSMS req`, req);
            }
            req.on('error', (requestError) => {
                console.error(`sendTwilioSMS request errored:`, requestError);
                callback(requestError);
            });
            req.write(payload);
            req.end()
        }
    }
}

export default helpers;