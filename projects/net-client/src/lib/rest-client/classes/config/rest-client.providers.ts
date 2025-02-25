import { EnvironmentProviders, inject, makeEnvironmentProviders } from "@angular/core";
import {ResponseBase}  from "./../dataflow/rest-response"
import {RestClient} from "./../../rest-client.service"
import { HttpClient } from '@angular/common/http';
import { REST_CLIENT, RestConnectionConfig, RestServiceOptions, RestServiceOptionsInterface } from "./rest-client-config";


export function provideRestClient(
    options?:RestServiceOptions,
  ... connections: RestConnectionConfig<ResponseBase<any>>[]
): EnvironmentProviders {
    console.log(`provideRestClient`)
  return makeEnvironmentProviders([{ 

    provide: REST_CLIENT, useFactory: () => {
        const http = inject(HttpClient);
        const restClientService = new RestClient(http, options);
        connections.forEach(conn => {
            console.log(`provideRestClient addConnection`);
            restClientService.createConnection(conn)
        })
        
        return restClientService;
    }
    
    }]);
}