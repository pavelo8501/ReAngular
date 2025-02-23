import { RESTClientConnection } from "../rest-client-connection";

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