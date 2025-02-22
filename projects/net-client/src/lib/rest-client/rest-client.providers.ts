import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { RESTClientConfig } from "./classes/rest-client-config";
import { REST_CLIENT_CONFIG, AUTH_SERVICE } from './classes/rest-client-config.token';
import { AuthServiceInterface } from "./classes/auth-service.interface";

export function provideRESTClient(config : RESTClientConfig, withAuthService: AuthServiceInterface|undefined = undefined): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: REST_CLIENT_CONFIG, useValue: config }, {provide:AUTH_SERVICE, useValue:withAuthService}]);
  }