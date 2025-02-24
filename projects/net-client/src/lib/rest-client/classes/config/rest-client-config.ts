import { RESTClientConnection } from "../rest-client-connection";
import { InjectionToken } from '@angular/core';
import { AuthServiceInterface } from '../../../../../../auth-services/src/lib/classes/auth-service.interface';


export const REST_CLIENT_CONFIG = new InjectionToken<RESTClientConfig>('RESTClientConfig');
export const AUTH_SERVICE = new InjectionToken<AuthServiceInterface>('AuthService');

export interface RESTClientConfigInterface {
    timeout: number|undefined // Optional configuration
  }

  export class RESTClientConfig implements RESTClientConfigInterface {

    constructor(private connections : RESTClientConnection<any>[], public timeout: number|undefined = undefined){
        this.connections = connections
        this.timeout = timeout
    }

    getConnections():RESTClientConnection<any>[]{
      return this.connections
    }

  } 