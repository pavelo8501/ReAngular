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

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | undefined>(undefined);

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
    console.log("RESTClient connections")
    console.log(this.connections)
  }


  private getAuthHeaders(method:RestMethod): RESTHeader|undefined {
    if(this.authService == undefined){
      return undefined
    }else{
      const token =  this.authService.getToken("some_login")
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

  // registerAsset<DATA>(asset: CommonRestAsset<DATA>, forConnectionId:number):CommonRestAsset<DATA>{
  //     const consConnection = this.getConnection(forConnectionId)
  //     return consConnection.registerAsset<DATA>(asset)
  // }


  private handleError(error: HttpErrorResponse, requestFn: () => Observable<any>): Observable<any>|undefined {
    if (error.status === 401) {
      return this.handle401Error(requestFn);
    }
    return throwError(() => error);
  }

  private handle401Error(requestFn: () => Observable<any>): Observable<any> | undefined {

    let result : Observable<any> | undefined

    if (!this.isRefreshing && this.authService) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(undefined); // ✅ Prevent queued requests from using old tokens

      this.authService.refreshToken("some_temp_login").subscribe(
        (newToken?: string) => {
          if(newToken == undefined){
            console.warn("Unable to refresh token service returbned undefined")
            result =  undefined
          }else{
            this.isRefreshing = false;
            this.refreshTokenSubject.next(newToken);  // ✅ Notify all queued requests
            result = requestFn();  // ✅ Retry the failed request with new token
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          if(this.authService != undefined){
            this.authService.logout()
            this.authService.throwOut(); // ✅ Logout if refresh fails
          }
          return throwError(() => err);
        })
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => result = requestFn()) // ✅ Retry the original request once refresh is complete
      )
    }
    return result
  }
}
