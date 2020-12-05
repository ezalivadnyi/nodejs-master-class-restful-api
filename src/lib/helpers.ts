import crypto from 'crypto';

const hashingSecret = 'try to guess me:)';

const helpers = {
    // Create a SHA256 hash
    hash: (str: string) => {
        if(str && str.length > 0) {
            return crypto.createHmac('sha256', hashingSecret).update(str).digest('hex');
        }
        return undefined;
    },

    jsonToObject: (json: string) => {
        // Parse a json string to an object in all cases, without throwing
        try {
            return JSON.parse(json);
        } catch (e) {
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
    }
}

export default helpers;