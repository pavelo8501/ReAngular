import { Observable, pipe, skip, Subject, Subscription, take } from "rxjs"
import { HttpClient, HttpErrorResponse} from "@angular/common/http"
import { ContentNegotiationsInterface } from "../plugins/content/content-negotiations.plugin"
import { RestConnection } from "../rest-client-connection"
import { ResponseBase } from "../dataflow/rest-response"
import { RestCallOptions } from "../dataflow/rest-call-options"
import { RESTException, ErrorCode } from "../exceptions"
import { AssetType, RestMethod } from "./rest-asset.enums"
import { CallParamInterface, RestCommand } from "../dataflow"
import { AuthIncident, TokenSubjectException } from "../security"



export interface RestAssetInterface{
    endpoint:string
    secured:boolean
    method: RestMethod
}

export abstract class CommonRestAsset<DATA> implements RestAssetInterface{

    static toInterface(asset: CommonRestAsset<any>):RestAssetInterface{
        return   asset
    }

    static truncateTrailingChar(str: string, char: string): string {
        return str.replace(new RegExp(`${char}+$`), ''); // Removes all trailing occurrences of char
    }

    protected http : HttpClient
    protected httpHandler : Subscription | undefined

    protected responseSubject : Subject<DATA>  = new Subject<DATA>()
   
    private satisfyesAssetInterface(src: RestAssetInterface):boolean{
        return src && src.endpoint === this.endpoint && src.secured === this.secured && src.method === this.method;
    }

    private _connection : RestConnection<ResponseBase<DATA>>
    protected set connection(value : RestConnection<ResponseBase<DATA>>){
        this._connection = value
        this.connection.onCommand = (command:RestCommand, param:TokenSubjectException, src?: RestAssetInterface)=>{

            if(!src || !this.satisfyesAssetInterface(src)){
                return
            }
            switch(command){
                case  RestCommand.CLOSE_CLIENT:
                    
                    this.responseSubject.error(param)
                    throw param
                    break
                case RestCommand.CLOSE_HTTP:
                    this.httpHandler?.unsubscribe()
                    break
                case RestCommand.TERMINATE:
                    this.responseSubject.complete()
                    this.httpHandler?.unsubscribe()
                    break
                default:
                    console.error(`Unable to process command ${command}`)
            }
        }
    }

    protected get connection (): RestConnection<ResponseBase<DATA>>{
        return this._connection
    }

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
        parentConnection : RestConnection<ResponseBase<DATA>>
    ){
        this._connection = parentConnection
        this.connection = parentConnection

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
                const token = this.connection.getJWTToken(this)
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
        this.httpHandler = this.http.post<ResponseBase<DATA>>(
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
                    this.callOptions.setAuthHeader(this.connection.getJWTToken(this)!, RestMethod.POST);
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
                        this.callOptions.setAuthHeader(this.connection.getJWTToken(this)!, RestMethod.GET);
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
                        this.callOptions.setAuthHeader(this.connection.getJWTToken(this)!, RestMethod.PUT);
                         this.callPut(id, requestData)
                });
                },
                complete:()=>{}
            })
    }
}


