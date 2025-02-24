import { Subject } from "rxjs"
import { RestMethod } from "../../enums/rest-method.enums"
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParamsOptions } from "@angular/common/http"
import { ContentNegotiationsInterface } from "../plugins/content/content-negotiations.plugin"
import { RestConnection } from "../rest-client-connection"
import { ResponseBase } from "../dataflow/rest-response"
import {RestTypedAssetInterface} from "./rest-typed.assets"
import { RestCallOptions } from "../dataflow/rest-call-options"
import { CallParamInterface } from "../call-param"
import { RESTException, ErrorCode } from "../exceptions"
import { RESTHeader } from "../dataflow/rest-header"



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

    endpoint:string= ""
    method: RestMethod = RestMethod.GET
    secured: boolean = false
    service: boolean = false

    callOptions = new RestCallOptions()

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

        console.log(`Running pre call routine for ${this.method} asset, to endoint: ${this.endpoint} secured : ${this.secured}`)

        if(this.secured){
            if(this.callOptions.hasJwtToken == false){
                if(this.parentConnection.token){
                     this.callOptions.replaceJwtToken(this.parentConnection.token)
                }else{
                      console.warn(`${this.method}Assed marked as secured but was unable to obtain jwt token from connection.
                    Most likely reques will fail`)
                }
            }
        }
    }

    protected callPost<REQUEST>(requestData : REQUEST){
    
        let paramStr = ""
        this.preCallRoutine()
        console.log(`callPost url : ${this.apiUrl} requestData ${requestData} `)
        this.http.post<ResponseBase<DATA>>(
            this.apiUrl, 
            JSON.stringify(requestData), 
            RestCallOptions.toOptions(this.callOptions.getHeaders())
        ).subscribe({
            next:(response)=>{
                 console.log(`callPost raw response  ${response} `)
                 this.processResponse(response)
            },
            error: (err : HttpErrorResponse) => {
                this.handleError(err, (token:string|undefined)=> { 
                    if(token){
                        this.callOptions.setAuthHeader(token, RestMethod.POST)
                        this.callPost(requestData) 
                    }
                })
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
         console.log(`Making Get call with url : ${requestUrl}`)

         this.http.get<ResponseBase<DATA>>(requestUrl,  RestCallOptions.toOptions(this.callOptions.getHeaders())).subscribe({
             next:(response)=>{
                 console.log("raw response")
                 console.log(response)
                 this.processResponse(response)
             },
             error: (err : HttpErrorResponse) => {
                this.handleError(err, (token:string|undefined)=> { 
                    if(token){
                        this.callOptions.setAuthHeader(token, RestMethod.GET)
                        this.callGet(params) 
                    }
                })
                throw new RESTException(err.message, ErrorCode.HTTP_CALL_ERROR)
             },
             complete:() => {}
         })
     }

    protected callPut<REQUEST>(id:number, requestData : REQUEST){
    
        const paramStr = `?id=${id}`
        const requestUrl = this.apiUrl+paramStr
        this.preCallRoutine()
        console.log(`Request url: ${requestUrl}`)
      
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
                this.handleError(err, (token:string|undefined)=> { 
                    if(token){
                        this.callOptions.setAuthHeader(token, RestMethod.PUT)
                        this.callPut(id, requestData) 
                    }
                })
                throw new RESTException(err.message, ErrorCode.HTTP_CALL_ERROR)
            },
            complete:()=>{}
        })
    }

    protected processResponse(response: ResponseBase<DATA>){
        try{
            console.log(`processResponse response  ${response} `)
            const deserializeResult = this.contentNegotiations.deserialize<DATA>(response)
            console.log(`processResponse response data  ${deserializeResult} `)
            this.responseSubject.next(deserializeResult)
        }catch(err:any){
            console.error(err.message)
            this.responseSubject.error(err)
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


