import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import {Inject,  Injectable } from '@angular/core';
import { RESTClientConfig } from './classes/config/rest-client-config';
import { CommonRestAsset } from './classes/rest-assets/rest-client.asset';
import { RestCallOptions } from './classes/rest-call-options';
import { RestMethod } from './enums/rest-methos';
import { RESTClientConnection } from './classes/rest-client-connection';
import { RESTException } from './classes/rest-exceptions';
import { ErrorCode } from './enums/error-code';
import { RESTHeader } from './classes/rest-header';
import { HeaderKey } from './enums/header-key';
import { AUTH_SERVICE, REST_CLIENT_CONFIG } from 'net-client';
import { AuthService } from './classes/plugins/auth/authentication.plugin';


@Injectable({
  providedIn: 'root'
})
export class RestClient{


  private connections : RESTClientConnection<any>[] = []
  get http():HttpClient{
    return this._http
  }
 

  constructor(
    @Inject(REST_CLIENT_CONFIG) private config: RESTClientConfig, 
    @Inject(AUTH_SERVICE) private authService : AuthService,  
    private _http: HttpClient
  ){
    console.log("RestClient constructor") 
    authService.setRestClient(this)
    this.connections = config.getConnections()
    this.connections.forEach(x=>x.initialize(this))
    console.log("Info frpm Service")
    this.restClientInfo()
  }

  private getAuthHeaders(method:RestMethod): RESTHeader|undefined {
    if(this.authService == undefined){
      return undefined
    }else{
      const token =  this.authService.getToken()
      if(token != undefined){
        return new RESTHeader(method, HeaderKey.AUTHORIZATION, token)
      }else{
        return undefined
      }
    }
  }

  getConnection(id:number):RESTClientConnection<any>{
    const found = this.connections.find(x=>x.connectionId == id)
     if(found != undefined){
       return found
     }else{
       throw new RESTException(`Connection with id : ${id} not found`, ErrorCode.NOT_FOUND)
     }
  }

  connectionList():RESTClientConnection<any>[]{
    return this.connections
  }


 createCallOption(asset:CommonRestAsset<any>): RestCallOptions{
    console.log("createCallOptions call by callback")
    let restOptions = new RestCallOptions()
    if(asset.secured){
     const authHeader = this.getAuthHeaders(asset.method)
     if(authHeader){
       restOptions.setAppliedHeadders([authHeader])
     }else{
       console.warn("autth header null")
      }
    }
    return restOptions
 }

 injectAuthService(service : AuthService){
      this.authService = service
      this.connections.forEach(x=>x.initialize(this))
 }

  restClientInfo(){
    console.log(`Number of connections applied ${this.connections.length}`)
    let yesNo : string  = "no"
    if(this.authService){
      yesNo = "yes"
    }
    console.log(`Is auth module injected?  ${yesNo}`)
      yesNo = "no"
      if(this._http){
        yesNo = "yes"
      }
      console.log(`Is httpClient injected?  ${yesNo}`)
  }

}
