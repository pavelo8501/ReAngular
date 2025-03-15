import { RestConnection } from "../connection/rest-client-connection";
import { InjectionToken } from '@angular/core';
import { ResponseBase } from "./../dataflow/rest-response"
import { RestClient } from "./../../rest-client.service"
import { HeaderKey } from "./../../enums"
import { RestMethod } from "../rest-assets";


export const REST_CLIENT = new InjectionToken<RestClient>('RestClient');
export const REST_CLIENT_OPTIONS = new InjectionToken<RestClientOptions>("RestClientOptions")

export const ENUMS = {
    HeaderKey,
    RestMethod
}

export interface RestClientOptionsInterface {
    production: boolean
}

export class RestClientOptions implements RestClientOptionsInterface {
    production: boolean = false
}


export interface JwtConfigInterface {
    getTokenEndpoint: string
    refreshTokenEndpoint: string
    method: RestMethod,
    authUrl?:string
}


export class RestConnectionConfig<T extends ResponseBase<any>> {
    constructor(
        public id: number,
        public baseUrl: string,
        public responseTemplate: T,
        public withJwtAuth?: JwtConfigInterface,
    ) { }
}




