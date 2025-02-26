import { EnvironmentProviders, inject, makeEnvironmentProviders } from "@angular/core";
import {ResponseBase}  from "./../dataflow/rest-response"
import {RestClient} from "./../../rest-client.service"
import { HttpClient } from '@angular/common/http';
import { REST_CLIENT, RestConnectionConfig, RestClientOptionsInterface} from "./rest-client-config";
import {CookieService} from 'ngx-cookie-service';
import  {AuthEventEmitterService} from "./../security"

export function provideRestClient(
    options?:RestClientOptionsInterface,
  ... connections: RestConnectionConfig<ResponseBase<any>>[]
): EnvironmentProviders {
   
  return makeEnvironmentProviders([{ 
    provide: REST_CLIENT, useFactory: () => {
        const http = inject(HttpClient)
        const cookie = inject(CookieService)
        const emmiter = inject(AuthEventEmitterService)
        const restClientService = new RestClient(http, cookie, emmiter);
        restClientService.production = options?.production??false
        connections.forEach(conn => {
            restClientService.createConnection(conn)
        })
        restClientService.configComplete()
        return restClientService;
    }}]);
}