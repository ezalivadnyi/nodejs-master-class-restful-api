import crypto from 'crypto';
import _data from "./data";
import {IToken} from "../Interfaces";
import config from "../config";

const helpers = {
    // Create a SHA256 hash
    hashPassword: (str: string) => {
        if(str && str.length > 0) {
            return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
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
        if(obj.constructor === Object && Object.keys(obj).length) {
            let result = '';
            for(const [key, value] of Object.entries(obj)) {
                result +=`\t${key}: ${value}\n`
            }
            return result;
        } else {
            return obj;
        }
    },

    createRandomString(length: number) {
        length = typeof(length) === 'number' && length > 0 ? length : 0;
        if(length) {
            // Define all possible characters that could go into a string
            const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for(let i = 1; i <= length; i++) {
                result += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            }
            return result;
        }
        return '';
    },

    // Verify if a given token id is currently valid for a given user
    verifyToken: (tokenId: string, phone: string, callback: (tokenIsValid: boolean) => void) => {
        if(tokenId) {
            // Lookup the token
            _data.read('tokens', tokenId, (readError, readedTokenData: IToken) => {
                if(readError) {
                    callback(false);
                } else {
                    // Check that the token is for the given user and has not expired
                    if(readedTokenData.phone === phone && readedTokenData.expires > Date.now()) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                }
            })
        } else {
            callback(false);
        }
    },

}

export default helpers;