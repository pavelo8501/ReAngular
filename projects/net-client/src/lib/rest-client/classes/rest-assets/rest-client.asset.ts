import { pipe, skip, Subject, take } from "rxjs"
import { RestMethod } from "../../enums/rest-method.enum"
import { HttpClient, HttpErrorResponse} from "@angular/common/http"
import { ContentNegotiationsInterface } from "../plugins/content/content-negotiations.plugin"
import { RestConnection } from "../rest-client-connection"
import { ResponseBase } from "../dataflow/rest-response"
import { RestCallOptions } from "../dataflow/rest-call-options"
import { CallParamInterface } from "../call-param"
import { RESTException, ErrorCode } from "../exceptions"
import { AssetType } from "./rest-asset.enums"



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

    private handleError(err:HttpErrorResponse, requestFn: (token:string) => void){


        switch(err.status){
            case 401 :
                console.log(`Processing Unauthorized`)
              this.parentConnection.tokenInvalidation().pipe(
                    skip(1),
                    take(1)
               ).subscribe({ next : (token)=>{
                if(token){
                    //Repeat last call
                    requestFn(token)
                }else{
                    console.warn("handleError Another unsuccesfull atempt to reaquire token")
                    return
                }},
                error: (err:any)=>{
                    console.warn(`handleError Atempt to reaquire token resulted in error ${err}`)
                    return
                }, 
                complete:() => {
                     console.warn(`handleError observable closed`)
                    return
                }})
            return

            default:
                console.warn(`Unmanaged ${err.status} | ${err.message} when  ${this.method} to ${this.endpoint}`)
                throw new RESTException(err.message, ErrorCode.UNMANAGED_GENERIC_EXCEPTION)
            break
        }
    }

    protected callPost<REQUEST>(requestData : REQUEST){
    
        this.preCallRoutine()
        console.log(`callPost url : ${this.apiUrl} requestData ${requestData} `)
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
                if(this.assetType == AssetType.NON_SERVICE){
                    this.handleError(err, (token:string|undefined)=> { 
                        if(token){
                            this.callOptions.setAuthHeader(token, RestMethod.POST)
                            this.callPost(requestData) 
                        }
                    })
                }
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
                    if(this.assetType == AssetType.NON_SERVICE){

                        this.handleError(err, (token:string|undefined)=> { 
                            if(token){
                                this.callOptions.setAuthHeader(token, RestMethod.GET)
                                this.callGet(params) 
                            }
                        })
                    }
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
                    if(this.assetType == AssetType.NON_SERVICE){
                        this.handleError(err, (token:string|undefined)=> { 
                            if(token){
                                this.callOptions.setAuthHeader(token, RestMethod.PUT)
                                this.callPut(id, requestData) 
                            }
                        })
                     }
                },
                
                complete:()=>{}
            })
    }
}


