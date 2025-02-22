import { InjectionToken } from '@angular/core';
import { RESTClientConfig } from './rest-client-config';
import { AuthServiceInterface } from './auth-service.interface';

export const REST_CLIENT_CONFIG = new InjectionToken<RESTClientConfig>('RESTClientConfig');
export const AUTH_SERVICE = new InjectionToken<AuthServiceInterface>('AuthService');