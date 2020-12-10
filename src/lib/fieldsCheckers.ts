import { CHECKS_ID_LENGTH, CRUD_METHODS, MIN_PASSWORD_LENGTH, PHONE_LENGTH, PROTOCOLS, TOKEN_ID_LENGTH } from "../constants";
import { IUser } from "../Interfaces";

const checkers = {
    userPhone: (phoneNumber: any) => {
        return phoneNumber && typeof (phoneNumber) === 'string' && phoneNumber.trim().length === PHONE_LENGTH ? phoneNumber.trim() : '';
    },
    token: (tokenId: any) => {
        return tokenId && typeof (tokenId) === "string" && tokenId.length === TOKEN_ID_LENGTH ? tokenId : '';
    },
    firstName: (firstName: any) => {
        return firstName && typeof (firstName) === 'string' && firstName.trim().length > 0 ? firstName.trim() : "";
    },
    lastName: (lastName: any) => {
        return lastName && typeof (lastName) === 'string' && lastName.trim().length > 0 ? lastName.trim() : "";
    },
    password: (password: any) => {
        return password && typeof (password) === 'string' && password.trim().length >= MIN_PASSWORD_LENGTH ? password.trim() : "";
    },
    tosAgreement: (tosAgreement: any) => {
        return tosAgreement && typeof (tosAgreement) === 'boolean' && tosAgreement;
    },
    protocol(protocol: any) {
        return protocol && typeof (protocol) === 'string' && PROTOCOLS.includes(protocol) ? protocol : "";
    },
    url(url: any) {
        return url && typeof (url) === 'string' && url.length > 0 ? url : '';
    },
    method(method: any) {
        return method && typeof (method) === 'string' && CRUD_METHODS.includes(method.toLowerCase()) ? method : "";
    },
    successCodes(successCodes: any) {
        return successCodes && typeof (successCodes) === 'object' && successCodes instanceof Array && successCodes.length > 0 ? successCodes : '';
    },
    timeoutSeconds(timeoutSeconds: any) {
        return timeoutSeconds && typeof (timeoutSeconds) === 'number' && timeoutSeconds % 1 === 0 && timeoutSeconds >= 1 && timeoutSeconds <= 5 ? timeoutSeconds : '';
    },
    userChecks(userData: IUser) {
        return userData && userData.checks && typeof (userData.checks) === 'object' && Array.isArray(userData.checks) ? userData.checks : []
    },
    checksId(id: string) {
        return id && typeof id === 'string' && id.trim().length === CHECKS_ID_LENGTH ? id.trim() : ''
    }
}

export default checkers;