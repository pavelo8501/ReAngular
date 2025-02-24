import { RestConnection } from "../rest-client-connection";
import { InjectionToken } from '@angular/core';
import {ResponseBase} from "./../dataflow/rest-response"
import {RestClient} from "./../../rest-client.service"


export class RestClientConfig {
  private connections: RestConnection<ResponseBase<any>>[] = [];
  
  constructor() {}

  addConnection(connection: RestConnection<ResponseBase<any>>, withOptions? : object ) {
    this.connections.push(connection);
  }

  getConnections(): RestConnection<ResponseBase<any>>[] {
    return this.connections;
  }
}

export type ConnectionFactory = <T extends ResponseBase<any>>(
  id: number,
  baseUrl: string,
  responseTemplate: T
) => RestConnection<T>;

export const REST_CLIENT = new InjectionToken<RestClient>('RestClient');




