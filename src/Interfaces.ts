interface IResponseData{
    message: string
}

export type TResponseCallback = (statusCode?: number, responseData?: IResponseData | object) => void
export type TRouterHandler = (requestData: IRequestData, responseCallback: TResponseCallback) => void

export interface IRouter {
    [key: string]: TRouterHandler
}

export interface IRouterHandler {
    [key: string]: TRouterHandler
}

export type IHttpMethodHandler = {
    [key in 'get' | 'post' | 'put' | 'delete' | string]: TRouterHandler
}

export interface IRequestData{
    host: string,
    method: string,
    headers: object,
    queryStringObject: any,
    payload: any,
}

export interface IUser{
    firstName: string | undefined,
    lastName: string | undefined,
    phone: string | undefined,
    password: string | undefined,
    tosAgreement: boolean | undefined,
}