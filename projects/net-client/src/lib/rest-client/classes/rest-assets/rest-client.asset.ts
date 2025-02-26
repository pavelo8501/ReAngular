import { pipe, skip, Subject, take } from "rxjs"
import { HttpClient, HttpErrorResponse} from "@angular/common/http"
import { ContentNegotiationsInterface } from "../plugins/content/content-negotiations.plugin"
import { RestConnection } from "../rest-client-connection"
import { ResponseBase } from "../dataflow/rest-response"
import { RestCallOptions } from "../dataflow/rest-call-options"
import { RESTException, ErrorCode } from "../exceptions"
import { AssetType, RestMethod } from "./rest-asset.enums"
import { CallParamInterface } from "../dataflow"
import { AuthIncident } from "../security"



export interface RestAssetInterface{
    endpoint:string
    secured:boolean
    method: RestMethod
}

export abstract class CommonRestAsset<DATA> implements RestAssetInterface{

    static truncateTrailingChar(str: string, char: string): string {
        return str.replace(new RegExp(`${char}+$`), ''); // Removes all trailing occurrences of char
    }

    protected responseSubject : Subject<DATA>  = new Subject<DATA>()

    protected http:HttpClient

    protected baseUrl:string
    get apiUrl():string{
        return  `${this.baseUrl}/${this.endpoint}`
    }

    contentNegotiations : ContentNegotiationsInterface<ResponseBase<DATA>>

    endpoint:string
    secured: boolean
    method: RestMethod
    assetType: AssetType = AssetType.NON_SERVICE

    callOptions = new RestCallOptions()

   // private errorHandlerfn?: (error: HttpErrorResponse, requestFn: (token:string) => void) => void  

    protected constructor(
        config: RestAssetInterface,
        protected parentConnection : RestConnection<ResponseBase<DATA>>
    ){
        this.endpoint = config.endpoint
        this.method = config.method
        this.secured = config.secured
        this.baseUrl = parentConnection.baseUrl
        this.http = parentConnection.http
        this.contentNegotiations = parentConnection.contentNegotiations
    }

    private preCallRoutine(){
        if(this.secured){}
    }

    private processResponse(response: ResponseBase<DATA>){
        try{
            const deserializeResult = this.contentNegotiations.deserialize<DATA>(response)
            console.log(`processResponse response data  ${deserializeResult} `)
            this.responseSubject.next(deserializeResult)
        }catch(err:any){
            console.error(err.message)
            this.responseSubject.error(err)
        }
    }

    private fallbackEnabled = false
    enableFallbackFn(enabled:boolean){
        this.fallbackEnabled = enabled
    }
    private handleError(err:HttpErrorResponse, requestFn: () => void){

        if(err.status == 401){
                console.log(`Processing Unauthorized`)
            if(this.fallbackEnabled){
                const token = this.parentConnection.getJWTToken(this)
                if(token){
                     requestFn()
                }
            }else{
                console.warn(`Unmanaged ${err.status} | ${err.message} when  ${this.method} to ${this.endpoint}`)
            }
        }
    }

    protected callPost<REQUEST>(requestData : REQUEST){
    
        this.preCallRoutine()
        this.http.post<ResponseBase<DATA>>(
            this.apiUrl, 
            JSON.stringify(requestData), 
            RestCallOptions.toOptions(this.callOptions.getHeaders())
        ).subscribe({
            next:(response)=>{
                 this.processResponse(response)
            },
            error: (err : HttpErrorResponse) => {
                console.error(`callPost ${err.message}`)
                this.handleError(err, () => {
                    this.callOptions.setAuthHeader(this.parentConnection.getJWTToken(this)!, RestMethod.POST);
                    this.callPost(requestData);
                });
            },
            complete:() => {}
        })
    }

    protected callGet<RESPONSE>(params:CallParamInterface[]){

        let paramStr = ""
        if(params.length>0){
             paramStr = "?"
             params.forEach(x=> paramStr+= `${x.key}=${x.value}&`)
             paramStr =  CommonRestAsset.truncateTrailingChar(paramStr, '&')
         }
         const requestUrl = this.apiUrl+paramStr
         this.preCallRoutine()
         this.http.get<ResponseBase<DATA>>(
            requestUrl,  
            RestCallOptions.toOptions(this.callOptions.getHeaders())
            ).subscribe({
                next:(response)=>{
                    this.processResponse(response)
                },
                error: (err : HttpErrorResponse) => {
                    console.error(`callGet ${err.message}`)
                    this.handleError(err, () => {
                        this.callOptions.setAuthHeader(this.parentConnection.getJWTToken(this)!, RestMethod.GET);
                        this.callGet(params)
                    });
                },
                complete:() => {}
            })
    }

    protected callPut<REQUEST>(id:number, requestData : REQUEST){
    
        const paramStr = `?id=${id}`
        const requestUrl = this.apiUrl+paramStr

        this.preCallRoutine()
       
        this.http.put<ResponseBase<DATA>>(
            requestUrl, 
            JSON.stringify(requestData),
            RestCallOptions.toOptions(this.callOptions.getHeaders())).subscribe({
                next:(response)=>{
                    console.log("raw response")
                    console.log(response)
                    this.processResponse(response)
                },
                error:(err:HttpErrorResponse)=>{
                console.error(`callPut ${err.message}`)
                this.handleError(err, () => {
                        this.callOptions.setAuthHeader(this.parentConnection.getJWTToken(this)!, RestMethod.PUT);
                         this.callPut(id, requestData)
                });
                },
                complete:()=>{}
            })
    }
}


