import { Observable, Subject, throwError } from "rxjs"
import { RestMethod } from "../enums/rest-methos"
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"
import { RESTException } from "./rest-exceptions"
import { ErrorCode } from "../enums/error-code"
import { CallParam, CallParamInterface } from "./call-param"
import { RestCallOptions, RestCallOptionsInterface } from "./rest-call-options"
import { error } from "console"
import { RESTClientConnection } from "./rest-client-connection"
import { RestResponseInterface } from "./dataflow/rest-response"

export interface RestClientAssetInterface{
    endpoint:string
    method: RestMethod
    secured:boolean
}

export class RestClientAsset<DATA> implements RestClientAssetInterface{

    static create<DATA>(endpoint: string, method:RestMethod, secured:boolean, connection: RESTClientConnection<RestResponseInterface<DATA>>): RestClientAsset<DATA> {
        const config : RestClientAssetInterface = {endpoint : endpoint, method : method, secured: secured}
        return new RestClientAsset<DATA>(config, connection)
    }
    
    static truncateTrailingChar(str: string, char: string): string {
        return str.replace(new RegExp(`${char}+$`), ''); // Removes all trailing occurrences of char
    }

    protected responseSubject : Subject<DATA>  = new Subject<DATA>()

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
    secured: boolean = false

    constructor(config: RestClientAssetInterface, protected parentConnection : RESTClientConnection<any>){
        this.endpoint = config.endpoint
        this.method = config.method
        this.secured = config.secured
    }

    initialize(apiUrl:string,  httpClient:HttpClient){
        this._url = apiUrl
        this._http = httpClient
    }


    makeCall(params: CallParamInterface[], id:number|undefined): Observable<DATA>;
    makeCall<T>(request: T, id:number|undefined): Observable<DATA>;

    makeCall<T>(params: any, id:number|undefined= undefined): Observable<DATA>{
        if (Array.isArray(params)) {
            switch(this.method){
                case RestMethod.GET:
                    this.parentConnection.callGet(this, params)
                break
                case RestMethod.DELETE:

                break
            }
        }else{
            params as T
            switch(this.method){
                case RestMethod.PUT:
                    if(id){
                        this.parentConnection.callPut(this, id, params)
                    }
                break
                case RestMethod.POST:
                    this.parentConnection.callPost(this, params)
                break
            }
        }
        return this.responseSubject.asObservable()
    }

    submitResult(result:DATA){
        this.responseSubject.next(result)
    }
}

export class RestPostAsset<DATA> extends RestClientAsset<DATA>{
    
    static createPost<DATA>(endpoint: string, secured: boolean, connection: RESTClientConnection<RestResponseInterface<DATA>>): RestPostAsset<DATA> {
        const config : RestClientAssetInterface = {endpoint : endpoint, method : RestMethod.POST, secured: secured }
        return new RestPostAsset<DATA>(config, connection)
    }

    override makeCall<T>(request: T): Observable<DATA>{
        this.parentConnection.callPost(this, request)
        return this.responseSubject.asObservable()
    }
}
