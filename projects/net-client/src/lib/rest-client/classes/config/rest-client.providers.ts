import { EnvironmentProviders, inject, makeEnvironmentProviders } from "@angular/core";
import { REST_CLIENT, RestClientConfig } from "./rest-client-config";
import { ErrorCode } from "../exceptions/error-code";
import { HeaderKey } from "../../enums/header-key";
import { RestMethod } from "../../enums/rest-methos";
import { RestConnection } from "./../rest-client-connection";
import {ResponseBase}  from "./../dataflow/rest-response"
import {RestClient} from "./../../rest-client.service"
import { HttpClient } from '@angular/common/http';

export const ENUMS = {
  ErrorCode,
  HeaderKey,
  RestMethod
}


export class RestConnectionConfig<T extends ResponseBase<any>>{
    constructor(
        public id: number, 
        public baseUrl: string, 
        public responseTemplate: T,  
        public withJwtAuth?: {getTokenEndpoint:string, refreshTokenEndpoint:string}
        ){}
}
 
export function provideRestClient(
  ... connections: RestConnectionConfig<ResponseBase<any>>[]
): EnvironmentProviders {
    console.log(`provideRestClient`)
  return makeEnvironmentProviders([{ 

    provide: REST_CLIENT, useFactory: () => {
       // const restClientService  = inject(RestClient);
         const http = inject(HttpClient);
         const restClientService = new RestClient(http);
        connections.forEach(conn => {
          console.log(`provideRestClient addConnection`);
          restClientService.createConnection(conn)
        })
        return restClientService;
    } 
    
    }]);
}