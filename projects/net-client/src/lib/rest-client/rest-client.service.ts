import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import {Inject,  Injectable } from '@angular/core';
import { AuthServiceInterface } from './classes/auth-service.interface';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AUTH_SERVICE, REST_CLIENT_CONFIG} from './classes/rest-client-config.token';
import { RESTClientConfig } from './classes/rest-client-config';
import { RestClientAsset } from './classes/rest-client.asset';
import { RestCallOptions } from './classes/rest-call-options';
import { RestMethod } from './enums/rest-methos';
import { RESTClientConnection } from './classes/rest-client-connection';
import { RESTException } from './classes/rest-exceptions';
import { ErrorCode } from './enums/error-code';


@Injectable({
  providedIn: 'root'
})
export class RESTClient{

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | undefined>(undefined);

  private connections : RESTClientConnection<any>[] = []


  constructor(
    @Inject(REST_CLIENT_CONFIG) private config: RESTClientConfig, 
    @Inject(AUTH_SERVICE) private authService : AuthServiceInterface|undefined,  
    private http: HttpClient
  ){ 
    this.connections = config.getConnections()
  }

  private getConnection(id:number):RESTClientConnection<any>{
     const found = this.connections.find(x=>x.connectionId == id)
      if(found != undefined){
        return found
      }else{
        throw new RESTException(`Connection with id : ${id} not found`, ErrorCode.NOT_FOUND)
      }
  }

  registerAsset<T>(asset: RestClientAsset<T>, forConnectionId:number):RestClientAsset<T>{
      const consConnection = this.getConnection(forConnectionId)
      const existingAssetIndex = consConnection.assets.findIndex(x=>x.endpoint == asset.endpoint && x.method == asset.method)
      if(existingAssetIndex > 0){
        return consConnection.assets[existingAssetIndex]
      }else{
        asset.initialize(consConnection.baseUrl, this.http)
        if(this.authService != undefined){
          asset.setOnBeforeCall(this.createCallOption)
        }
        
        consConnection.assets.push(asset)
        return asset
      }
  }

  private createCallOption(method: RestMethod, endpoint: string): RestCallOptions{
     let options = new RestCallOptions()
     options.headers = this. getAuthHeaders()
     options.withCredentials = true 
     return options
  }

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if(this.authService != undefined){
      const token = this.authService.getToken("some_login")
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

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
