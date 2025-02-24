import { EnvironmentProviders, forwardRef, makeEnvironmentProviders } from "@angular/core";
import { AUTH_SERVICE, REST_CLIENT_CONFIG, RESTClientConfig } from "./classes/config/rest-client-config";
import { ErrorCode } from "./enums/error-code";
import { HeaderKey } from "./enums/header-key";
import { RestMethod } from "./enums/rest-methos";
import { AuthService } from "./classes/plugins/auth/authentication.plugin";


export const ENUMS = {
  ErrorCode,
  HeaderKey,
  RestMethod
}

export function provideRESTClient(config : RESTClientConfig, authService: AuthService): EnvironmentProviders {
    return makeEnvironmentProviders(
      [{ provide: REST_CLIENT_CONFIG, useValue: config, deps: [forwardRef(() => AuthService)] }, 
        {provide:AUTH_SERVICE, useValue:authService},
        {provide: ENUMS, useValue: ENUMS}
      ]);
      
  }