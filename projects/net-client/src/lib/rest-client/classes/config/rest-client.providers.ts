import { EnvironmentProviders, inject, makeEnvironmentProviders } from "@angular/core";
import {ResponseBase}  from "./../dataflow/rest-response"
import {RestClient} from "./../../rest-client.service"
import { HttpClient } from '@angular/common/http';
import { REST_CLIENT, RestConnectionConfig, RestClientOptionsInterface} from "./rest-client-config";
import {CookieService} from 'ngx-cookie-service';
import { AssetParams } from "../rest-assets";

export function provideRestClient(
    options: RestClientOptionsInterface,
  ... connections: RestConnectionConfig<ResponseBase<any>>[]
): EnvironmentProviders {
   
  return makeEnvironmentProviders([{ 
    provide: REST_CLIENT, useFactory: () => {
        const http = inject(HttpClient)
        const cookie = inject(CookieService)
        const restClientService = new RestClient(http, cookie);
        restClientService.production = options?.production??false
        connections.forEach(conn => {
          AssetParams
            restClientService.createConnection(conn, options.assetParams)
        })
        restClientService.configComplete()
        return restClientService;
    }}]);
}