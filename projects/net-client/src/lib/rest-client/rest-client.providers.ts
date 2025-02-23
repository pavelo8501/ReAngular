import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { RESTClientConfig } from "./classes/config/rest-client-config";
import { REST_CLIENT_CONFIG, AUTH_SERVICE } from './classes/config/rest-client-config.token';
import { AuthServiceInterface } from "./classes/auth-service.interface";
import { ErrorCode } from "./enums/error-code";
import { HeaderKey } from "./enums/header-key";
import { RestMethod } from "./enums/rest-methos";


export const ENUMS = {
  ErrorCode,
  HeaderKey,
  RestMethod
}

export function provideRESTClient(config : RESTClientConfig, withAuthService: AuthServiceInterface|undefined = undefined): EnvironmentProviders {
    return makeEnvironmentProviders(
      [{ provide: REST_CLIENT_CONFIG, useValue: config }, 
        {provide:AUTH_SERVICE, useValue:withAuthService},
        {provide: ENUMS, useValue: ENUMS}
      ]);
  }