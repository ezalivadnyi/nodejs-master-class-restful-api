import {CRUD_METHODS, MIN_PASSWORD_LENGTH, PHONE_LENGTH, PROTOCOLS, TOKEN_LENGTH} from "../constants";

const checkers = {
    // Check phone is valid
    phone: (phoneNumber: any) => {
        return phoneNumber && typeof(phoneNumber) === 'string' && phoneNumber.trim().length === PHONE_LENGTH ? phoneNumber.trim() : '';
    },
    token: (tokenId: any) => {
        return tokenId && typeof(tokenId) === "string" && tokenId.length === TOKEN_LENGTH ? tokenId : '';
    },
    firstName: (firstName: any) => {
        return firstName && typeof(firstName) === 'string' && firstName.trim().length > 0 ? firstName.trim() : "";
    },
    lastName: (lastName: any) => {
        return lastName && typeof(lastName) === 'string' && lastName.trim().length > 0 ? lastName.trim() : "";
    },
    password: (password: any) => {
        return password && typeof(password) === 'string' && password.trim().length >= MIN_PASSWORD_LENGTH ? password.trim() : "";
    },
    tosAgreement: (tosAgreement: any) => {
        return tosAgreement && typeof (tosAgreement) === 'boolean' && tosAgreement;
    },

    protocol(protocol: any) {
        return protocol && typeof(protocol) === 'string' && PROTOCOLS.includes(protocol) ? protocol : "";
    },
    url(url: any) {
        return url && typeof(url) === 'string' && url.length > 0 ? url : '';
    },
    method(method: any) {
        return method && typeof(method) === 'string' && CRUD_METHODS.includes(method) ? method : "";

    },
    successCodes(successCodes: any) {
        return successCodes && typeof(successCodes) === 'object' && successCodes instanceof Array && successCodes.length > 0 ? successCodes : '';
    },
    timeoutSeconds(timeoutSeconds: any) {
        return timeoutSeconds && typeof(timeoutSeconds) === 'number' && timeoutSeconds % 1 === 0 && timeoutSeconds >= 1 && timeoutSeconds <= 5 ? timeoutSeconds : '';
    }
}

export default checkers;