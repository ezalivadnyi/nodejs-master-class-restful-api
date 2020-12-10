import * as http from "http";

interface IResponseData {
    message: string
}

export type TResponseCallback = (statusCode?: number, responseData?: IResponseData | object) => void
export type TRouterHandler = (requestData: IRequestData, responseCallback: TResponseCallback) => void

export interface IRouter {
    [key: string]: TRouterHandler
}

export interface IRouterHandler {
    [key: string]: TRouterHandler,
    notFound: TRouterHandler,
    ping: TRouterHandler,
    users: TRouterHandler,
    tokens: TRouterHandler,
    checks: TRouterHandler,
}

export type THttpMethodHandler = {
    [key in 'get' | 'post' | 'put' | 'delete' | string]: TRouterHandler
}

export interface IRequestData {
    host: string,
    method: string,
    headers: http.IncomingHttpHeaders,
    queryStringObject: any,
    payload: any,
}

export interface IUser {
    firstName: string | undefined,
    lastName: string | undefined,
    phone: string | undefined,
    password: string | undefined,
    tosAgreement: boolean | undefined,
    checks?: string[],
}

export interface IToken {
    'id': string,
    'phone': string,
    'expires': number,
}

export interface ICheck {
    'id': string,
    'userPhone': string,
    'protocol': 'http' | 'https' | string,
    'url': string,
    'method': 'get' | 'post' | 'put' | 'delete' | string,
    'successCodes': number[],
    'timeoutSeconds': number,
}