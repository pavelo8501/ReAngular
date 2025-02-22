import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import {Inject,  Injectable } from '@angular/core';
import { AuthServiceInterface } from './classes/auth-service.interface';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AUTH_SERVICE, REST_CLIENT_CONFIG} from './classes/rest-client-config.token';
import { RESTClientConfig } from './classes/rest-client-config';
import { RestClientAsset } from './classes/rest-client.asset';
import { RestCallOptions } from './classes/rest-call-options';
import { RestMethod } from './enums/rest-methos';


@Injectable({
  providedIn: 'root'
})
export class RESTClient{


  private basePath: string

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | undefined>(undefined);

  private assets: RestClientAsset<any>[] = []

  constructor(
    @Inject(REST_CLIENT_CONFIG) private config: RESTClientConfig, 
    @Inject(AUTH_SERVICE) private authService : AuthServiceInterface|undefined,  
    private http: HttpClient
  ){ 
    this.basePath = config.basePath;
  }

  registerAsset<T>(asset: RestClientAsset<T>):RestClientAsset<T>{
      const existingAssetIndex = this.assets.findIndex(x=>x.endpoint == asset.endpoint && x.method == asset.method)
      if(existingAssetIndex > 0){
        return this.assets[existingAssetIndex]
      }else{
        asset.initialize(this.basePath, this.http)
        if(this.authService != undefined){
          asset.setOnBeforeCall(this.createCallOption)
        }
        this.assets.push(asset)
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
