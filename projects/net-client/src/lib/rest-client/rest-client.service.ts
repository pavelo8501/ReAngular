import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import {Inject,  Injectable } from '@angular/core';
import { AuthServiceInterface } from './classes/auth-service.interface';
import { BehaviorSubject, catchError, filter, Observable, Subject, switchMap, take, throwError } from 'rxjs';
import { AUTH_SERVICE, REST_CLIENT_CONFIG} from './classes/config/rest-client-config.token';
import { RESTClientConfig } from './classes/config/rest-client-config';
import { CommonRestAsset } from './classes/rest-assets/rest-client.asset';
import { RestCallOptions } from './classes/rest-call-options';
import { RestMethod } from './enums/rest-methos';
import { RESTClientConnection } from './classes/rest-client-connection';
import { RESTException } from './classes/rest-exceptions';
import { ErrorCode } from './enums/error-code';
import { RESTHeader } from './classes/rest-header';
import { HeaderKey } from './enums/header-key';


@Injectable({
  providedIn: 'root'
})
export class RESTClient{



  private connections : RESTClientConnection<any>[] = []
  get http():HttpClient{
    return this._http
  }
  get authService():AuthServiceInterface|undefined{
    return this._authService
  }

  constructor(
    @Inject(REST_CLIENT_CONFIG) private config: RESTClientConfig, 
    @Inject(AUTH_SERVICE) private _authService : AuthServiceInterface|undefined,  
    private _http: HttpClient
  ){ 
    this.connections = config.getConnections()
    this.connections.forEach(x=>x.initialize(this))
  }

  private getAuthHeaders(method:RestMethod): RESTHeader|undefined {
    if(this.authService == undefined){
      return undefined
    }else{
      const token =  this.authService.getToken(undefined)
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

 injectAuthService(service : AuthServiceInterface){
      this._authService = service
      this.connections.forEach(x=>x.initialize(this))
 }

  restClientInfo(){
    console.log(`Number of connections applied ${this.connections.length}`)
    let yesNo : string  = "no"
    if(this._authService){
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
