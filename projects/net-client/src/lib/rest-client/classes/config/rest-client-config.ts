import { RestConnection } from "../rest-client-connection";
import { InjectionToken } from '@angular/core';
import {ResponseBase} from "./../dataflow/rest-response"
import {RestClient} from "./../../rest-client.service"
import {RestMethod,  HeaderKey} from "./../../enums"


export const REST_CLIENT = new InjectionToken<RestClient>('RestClient');
export const REST_CLIENT_OPTIONS = new  InjectionToken<RestServiceOptions>("RestClientOptions")

export const ENUMS = {
  HeaderKey,
  RestMethod
}

export interface RestServiceOptionsInterface{
    production : boolean
}

export class RestServiceOptions implements  RestServiceOptionsInterface{
    production : boolean = false
}


export interface JwtConfigInterface{
    getTokenEndpoint: string
    refreshTokenEndpoint:string
    method: RestMethod
}


export class RestConnectionConfig<T extends ResponseBase<any>>{
    constructor(
        public id: number, 
        public baseUrl: string, 
        public responseTemplate: T,  
        public withJwtAuth?: JwtConfigInterface){}
}




