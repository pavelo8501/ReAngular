import { HttpErrorResponse } from "@angular/common/http";
import { RestClient } from './../../rest-client.service'
import { BehaviorSubject, catchError, Observable,  throwError } from "rxjs";
import { AuthService } from "../plugins";


export class RestErrorHandler{

    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<string | undefined>(undefined);

    constructor(private restclient :RestClient, private authService :AuthService ){
        this.initDependancies()
    }

    initDependancies(){
        this.restclient.connectionList().forEach(x=> {
            if(!x.errorHandlerfn){
                x.errorHandlerfn = this.handleError
                console.log(`Applied error handler to connection id : ${x.connectionId}`)
            }
        })
    }

    private handle401Error(error: HttpErrorResponse, requestFn: (token:string) => void): Observable<any> | undefined {
    
        let result : Observable<any> | undefined
    
        if (!this.isRefreshing && this.authService) {
          this.isRefreshing = true;
          this.refreshTokenSubject.next(undefined);
          const user = this.authService.getUser(undefined)
          this.authService.refreshToken().subscribe(
            (newToken?: string) => {
              if(newToken == undefined){
                console.warn("Unable to refresh token service returbned undefined")
                result =  undefined
              }else{
                this.isRefreshing = false;
                this.refreshTokenSubject.next(newToken); 
                requestFn(newToken);  
              }
            }),
            catchError((err) => {
              this.isRefreshing = false;
              if(this.authService != undefined){
                this.authService.logout(undefined)
                this.authService.throwAway(); 
              }
              return throwError(() => err);
            })
        } else {
          this.refreshTokenSubject.next(undefined)
        }
        return result
    }

    restErrorHandleInfo(){
        let yesNo : string  = "no"
        if(this.authService){
          yesNo = "yes"
        }
        console.log(`Is authService injected?  ${yesNo}`)

        yesNo = "no"
        if(this.restclient){
            yesNo = "yes"
        }
        console.log(`Is restclient injected?  ${yesNo}`)
    }

    handleError(error: HttpErrorResponse, requestFn: (token:string) => void): Observable<any>|undefined {
        if (error.status === 401) {
          return this.handle401Error(error, requestFn);
        }
        return throwError(() => error);
    }
}