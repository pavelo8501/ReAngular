import { Observable, Subject, throwError } from "rxjs"
import { RestMethod } from "../../enums/rest-methos"
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParamsOptions } from "@angular/common/http"
import { RESTException } from "../rest-exceptions"
import { ErrorCode } from "../../enums/error-code"
import { CallParamInterface } from "../call-param"
import { RestCallOptions } from "../rest-call-options"
import { RESTClientConnection } from "../rest-client-connection"
import { RestResponseInterface } from "../dataflow/rest-response"
import { ContentNegotiationsInterface } from "../plugins/content/content-negotiations.plugin"




export interface RestTypedAssetInterface{
    endpoint:string
    secured:boolean
}

export interface RestAssetInterface<DATA>  extends RestTypedAssetInterface{
    endpoint:string
    secured:boolean
    method: RestMethod
}

export abstract class CommonRestAsset<DATA> implements RestAssetInterface<DATA>{

    static create<DATA>(
        src : RestAssetInterface<DATA>,
        connection: RESTClientConnection<RestResponseInterface<DATA>>
    ): RestAssetInterface<DATA> {
        let a : RestAssetInterface<DATA> = Object.create(CommonRestAsset<DATA>)  (src, connection)
        return a
    }

    static truncateTrailingChar(str: string, char: string): string {
        return str.replace(new RegExp(`${char}+$`), ''); // Removes all trailing occurrences of char
    }

    protected responseSubject : Subject<DATA>  = new Subject<DATA>()

    protected http:HttpClient

    protected baseUrl:string
    get url():string{
        return  `${this.baseUrl}/${this.endpoint}`
    }

    contentNegotiations : ContentNegotiationsInterface<RestResponseInterface<DATA>>

   
    endpoint:string= ""
    method: RestMethod = RestMethod.GET
    secured: boolean = false

    protected constructor(
        config: RestAssetInterface<DATA>, 
        protected parentConnection : RESTClientConnection<RestResponseInterface<DATA>>
    ){
        this.endpoint = config.endpoint
        this.method = config.method
        this.secured = config.secured
        this.baseUrl = parentConnection.baseUrl
        this.http = parentConnection.client.http
        this.contentNegotiations = parentConnection.contentNegotiations
    }

    protected processResponse(response: RestResponseInterface<DATA>){
        if(this.contentNegotiations != undefined){
            const deserializeResult = this.contentNegotiations.deserialize<DATA>(response)
           
            this.responseSubject.next(deserializeResult)
        }
    }

    protected handleError(err:HttpErrorResponse, requestFn: (token:string) => void){
        console.warn(`Received error on request ${err.message}`)
        if(this.parentConnection.errorHandlerfn != undefined){
            console.log(`Found error handler on parentConnection, invoking`)
            this.parentConnection.errorHandlerfn(err, requestFn)
        }
    }

}

export class RestPostAsset<DATA> extends CommonRestAsset<DATA>{

    constructor(endpoint :string, secured: boolean , connection : RESTClientConnection<RestResponseInterface<DATA>>){
        super({endpoint : endpoint, method : RestMethod.POST, secured: secured }, connection)
    }

    private callPost<REQUEST>(requestData : REQUEST){

        let paramStr = ""
        let restOptions = this.parentConnection.onBeforeCallMethod(this)
        let callOptions  : object | undefined

        if(restOptions){
            restOptions.seDefaultHeadders(this.parentConnection.defaultHeaders(this.method))
            callOptions = RestCallOptions.toOptions(restOptions.getHeaders())
        }
        const requestUrl = this.url

        this.http.post<RestResponseInterface<DATA>>(requestUrl, JSON.stringify(requestData)).subscribe({
            next:(response)=>{
                this.processResponse(response)
            },
            error: (err : HttpErrorResponse) => {
                this.handleError(err, (token:string|undefined)=> { 
                    if(token){
                        restOptions?.setAuthHeader(token, RestMethod.POST)
                        this.callPost(requestData) 
                    }
                })
            },
            complete:() => {}
        })
    }


    makeCall<REQUEST>(request: REQUEST): Observable<DATA>{
        this.callPost(request)
        return this.responseSubject.asObservable()
    }
}

export class RestGetAsset<DATA> extends CommonRestAsset<DATA>{
    
    constructor(endpoint : string,  secured : boolean, connection : RESTClientConnection<RestResponseInterface<DATA>>){

        super({endpoint : endpoint, method : RestMethod.GET, secured: secured }, connection)
    }

   private callGet<RESPONSE>(params:CallParamInterface[]){

        let paramStr = ""
        console.log("onBeforeCall callback")
        console.log(this.parentConnection.onBeforeCallMethod)
        let  restOptions = this.parentConnection.onBeforeCallMethod(this)
        console.log("Received options")
        console.log(restOptions)
        let callOptions  : object | undefined

        if(restOptions){
            restOptions.seDefaultHeadders(this.parentConnection.defaultHeaders(this.method))
            callOptions = RestCallOptions.toOptions(restOptions.getHeaders())
        }
        if(params.length>0){
             paramStr = "?"
             params.forEach(x=> paramStr+= `${x.key}=${x.value}&`)
             paramStr =  CommonRestAsset.truncateTrailingChar(paramStr, '&')
         }
         const requestUrl = this.url+paramStr
         console.log(`Making Get call with url : ${requestUrl}`)

 
         this.http.get<RestResponseInterface<DATA>>(requestUrl, callOptions).subscribe({
             next:(response)=>{
                 console.log("raw response")
                 console.log(response)
                 this.processResponse(response)
             },
             error: (err : HttpErrorResponse) => {
                this.handleError(err, (token:string|undefined)=> { 
                    if(token){
                        restOptions?.setAuthHeader(token, RestMethod.GET)
                        this.callGet(params) 
                    }
                })
                throw new RESTException(err.message, ErrorCode.HTTP_CALL_ERROR)
             },
             complete:() => {}
         })
     }

    makeCall<REQUEST>(params: CallParamInterface[]): Observable<DATA>{
        this.callGet(params)
        return this.responseSubject.asObservable()
    }
}


export class RestPutAsset<DATA> extends CommonRestAsset<DATA>{
    
    constructor(endpoint : string,  secured : boolean, connection : RESTClientConnection<RestResponseInterface<DATA>>){
        super({endpoint:endpoint, method: RestMethod.PUT, secured:true}, connection)
    }

    private callPut<REQUEST>(id:number, requestData : REQUEST){
        let  restOptions = this.parentConnection.onBeforeCallMethod(this)
        let callOptions  : object | undefined

        if(restOptions){
            restOptions.seDefaultHeadders(this.parentConnection.defaultHeaders(this.method))
            callOptions = RestCallOptions.toOptions(restOptions.getHeaders())
        }

        const paramStr = `?id=${id}`
        const requestUrl = this.url+paramStr
        console.log(`Request url: ${requestUrl}`)
      
        this.http.put<RestResponseInterface<DATA>>(requestUrl, JSON.stringify(requestData), callOptions).subscribe({
            next:(response)=>{
                console.log("raw response")
                console.log(response)
                this.processResponse(response)
            },
            error:(err:HttpErrorResponse)=>{
                this.handleError(err, (token:string|undefined)=> { 
                    if(token){
                        restOptions?.setAuthHeader(token, RestMethod.PUT)
                        this.callPut(id, requestData) 
                    }
                })
                throw new RESTException(err.message, ErrorCode.HTTP_CALL_ERROR)
            },
            complete:()=>{}
        })
    }
    
    makeCall<REQUEST>(id:number, data: DATA): Observable<DATA>{
        this.callPut(id, data)
        return this.responseSubject.asObservable()
    }
}
