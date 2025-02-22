import { Observable, Subject, throwError } from "rxjs"
import { RestMethod } from "../enums/rest-methos"
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"
import { RESTException } from "./rest-exceptions"
import { ErrorCode } from "../enums/error-code"
import { CallParamInterface } from "./call-param"
import { RestCallOptions, RestCallOptionsInterface } from "./rest-call-options"
import { error } from "console"

export interface RestClientAssetInterface{
    endpoint:string
    method: RestMethod
}

export class RestClientAsset<RESULT_TYPE> implements RestClientAssetInterface{

    static create<T>(endpoint: string, method:RestMethod): RestClientAsset<T> {
        const config : RestClientAssetInterface = {endpoint : endpoint, method : method}
        return new RestClientAsset(config)
    }

    static truncateTrailingChar(str: string, char: string): string {
        return str.replace(new RegExp(`${char}+$`), ''); // Removes all trailing occurrences of char
    }

    private responseSubject : Subject<RESULT_TYPE>  = new Subject<RESULT_TYPE>()

    private _http:HttpClient|undefined = undefined
    get http():HttpClient{
        if(this._http != undefined){
            return this._http
        }else{
            throw new RESTException("HttpClient not initialized", ErrorCode.FATAL_INIT_FAILURE)
        }
    }

    private _url:string = ""
    get url():string{
        return  `${this._url}/${this.endpoint}`
    }

    private onBeforeCall? : (method:RestMethod, endpoint:string)=>RestCallOptionsInterface =  undefined
    
    endpoint:string= ""
    method: RestMethod = RestMethod.GET

    private constructor(config: RestClientAssetInterface){
        this.endpoint = config.endpoint
        this.method = config.method
    }

    initialize(apiUrl:string,  httpClient:HttpClient){
        this._url = apiUrl
        this._http = httpClient
    }

    setOnBeforeCall(fn:  (method:RestMethod, endpoint:string)=>RestCallOptionsInterface){
        this.onBeforeCall = fn
    }

    private callGet(params:CallParamInterface[]){
        let callOptions : RestCallOptionsInterface | undefined = undefined

        if(this.onBeforeCall != undefined){
            this.onBeforeCall.bind(this)
            callOptions =  this.onBeforeCall(this.method, this.endpoint)
        }

        let paramStr = "?" 
        params.forEach(x=> paramStr+= `${x.key}=${x.value}&`)
        paramStr =  RestClientAsset.truncateTrailingChar(paramStr, '&')
        const requestUrl = this.url+paramStr
        console.log(`Making Get call with url : ${requestUrl}`)
        
        this.http.get<RESULT_TYPE>(requestUrl, RestCallOptions.toOptions(callOptions)).subscribe(
            (response)=>{
                this.responseSubject.next(response)
            },
            (error:HttpErrorResponse)=>{
                throw new RESTException(error.message, ErrorCode.HTTP_CALL_ERROR)
            },
            () => {
                console.log("call ended")
             }
        )
    }

    makeCall(...params:CallParamInterface[]): Observable<RESULT_TYPE>{

        switch(this.method){
            case RestMethod.GET:
                this.callGet(params)
            break
            case RestMethod.PUT:

            break

            case RestMethod.PATCH:

            break

            case RestMethod.POST:

            break

            case RestMethod.DELETE:

            break
        }
        return this.responseSubject.asObservable()
    }


}