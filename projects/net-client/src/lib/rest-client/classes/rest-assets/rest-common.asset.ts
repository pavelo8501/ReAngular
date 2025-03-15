import { lastValueFrom, Observable, Subject, Subscription} from "rxjs"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { ContentNegotiationsInterface } from "../plugins/content/content-negotiations.plugin"
import { RestConnection } from "../connection/rest-client-connection"
import { ResponseBase } from "../dataflow/rest-response"
import { RestCallOptions } from "../dataflow/rest-call-options"
import { AssetType, RestMethod } from "./rest-asset.enums"
import { CallParamInterface, RestCommand } from "../dataflow"
import { TokenSubjectException } from "../security"
import { EventEmitterService, IncidentCode, RequestError } from "../events"
import { RequestEvent } from "../events/models/request-event.class"
import { AssetParams } from "./rest-assets.model"
import { RestPostAsset, RestPutAsset } from "./rest-typed.assets"
import {  } from "./../../extensions/client.extensions"




export interface RestAssetInterface {
    endpoint: string
    secured: boolean
    method: RestMethod
}

export abstract class RestCommonAsset<DATA> implements RestAssetInterface {

    static toInterface(asset: RestCommonAsset<any>): RestAssetInterface {
        return asset
    }

    static truncateTrailingChar(str: string, char: string): string {
        return str.replace(new RegExp(`${char}+$`), ''); // Removes all trailing occurrences of char
    }



    notify( message : {url: string, params: string, secured:boolean}, callback?: (caller: RestCommonAsset<DATA>) => void){
        console.warn(`Executong notify as RestCommonAsset`)
        const assetName = `Asset ${this.method} to endpint ${this.endpoint}`
        if(this.params.notifyRequestParams){
            console.log(`${assetName} makeing  ${message.secured? "secured":"unsecured"} api call to ${message.url} with data params ${message.params}`)
            console.log(`request heraders`, this.callOptions.getHeaders().map(m=> `[ ${m.key} : ${m.value}], `))
        }
  
        console.log(`Asset ${this.method} notify  a warning`)

        if(callback){
          callback(this);
        }
    } 


    protected http: HttpClient
    protected httpHandler: Subscription | undefined

    protected responseSubject: Subject<DATA> = new Subject<DATA>()

    private _connection: RestConnection<ResponseBase<DATA>>
    protected set connection(value: RestConnection<ResponseBase<DATA>>) {
        this._connection = value
        this.connection.onCommand = (command: RestCommand, param?: TokenSubjectException, src?: RestAssetInterface) => {

            if (!src || !this.satisfyesAssetInterface(src)) {
                return
            }
            switch (command) {
                case RestCommand.CLOSE_CLIENT:
                    if (param != undefined) {
                        this.responseSubject.error(param)
                        throw param
                    } else {
                        this.responseSubject.complete()
                    }
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

    protected get connection(): RestConnection<ResponseBase<DATA>> {
        return this._connection
    }

    protected baseUrl: string
    get apiUrl(): string {
        return `${this.baseUrl}/${this.endpoint}`
    }

    private contentNegotiations: ContentNegotiationsInterface<ResponseBase<DATA>>

    endpoint: string
    secured: boolean
    method: RestMethod
    assetType: AssetType = AssetType.NON_SERVICE

    callOptions = new RestCallOptions(this)
    private eventEmitter: EventEmitterService

    // private errorHandlerfn?: (error: HttpErrorResponse, requestFn: (token:string) => void) => void  

    protected constructor(
        config: RestAssetInterface,
        protected params: AssetParams,
        connection: RestConnection<ResponseBase<DATA>>,
        altBaseUrl?: string
    ) {

        console.log(`Params `)
        console.log(params)

        this._connection = connection
        this.connection = connection

        this.endpoint = config.endpoint
        this.method = config.method
        this.secured = config.secured
        this.http = connection.http
        this.eventEmitter = connection.eventEmitter
        this.contentNegotiations = connection.contentNegotiations
        if(altBaseUrl!= undefined){
            this.baseUrl = altBaseUrl
        }else{
            this.baseUrl = connection.baseUrl
        }
    }

    private toString(){
        if(this.secured){
             return `${this.method}|${this.endpoint}(secured)`
        }else{
             return `${this.method}|${this.endpoint}`
        }
    }

    private satisfyesAssetInterface(src: RestAssetInterface): boolean {
        return src && src.endpoint === this.endpoint && src.secured === this.secured && src.method === this.method;
    }

    private preCallRoutine() {
        if (this.secured) {
            if (this.callOptions.hasJwtToken) {

            } else {
                const token = this.connection.getJWTToken(this)
                this.callOptions.setAuthHeader(token)
            }
        }
    }

    private processResponse(response: ResponseBase<DATA>|undefined) {
        try {
            if(response){
                const deserializeResult = this.contentNegotiations.deserialize<DATA>(response)
                this.responseSubject.next(deserializeResult)
            }else{
                console.warn(`Undefined response`)
                this.eventEmitter.emitError(`Undefined response`, IncidentCode.RESPONSE_UNDEFINED)
            }
        } catch (err: any) {
            console.error(err.message)
            this.responseSubject.error(err)
        }
    }

    private fallbackEnabled = false
    enableFallbackFn(enabled: boolean) {
        this.fallbackEnabled = enabled
    }

    private handleError(err: HttpErrorResponse, requestFn: () => void) {

        console.warn(err.message)

        switch(err.status){
            case 401:
                this.eventEmitter.emitRequestError(err)
                if (this.fallbackEnabled) {
                    const token = this.connection.getJWTToken(this)
                    if (token) {
                        requestFn()
                    }
                } else {
                    console.warn(`Unmanaged ${err.status} | ${err.message} when  ${this.method} to ${this.endpoint}`)
                }
            break;
            default:
                this.eventEmitter.emitRequestError(err)
        }
    }


    protected callPost(requestData: DATA): void;
    protected callPost<REQUEST>(requestData: REQUEST): void;
    protected callPost<REQUEST>(requestData: REQUEST) {

        this.preCallRoutine()
        const requestDataJson = JSON.stringify(requestData)
        const callOptions =  this.callOptions.toOptions()
        if(this.params.notifyDataSent){
            console.log(`Making Post request with request data ${requestDataJson}`)
        }
       
        this.notify({url: this.apiUrl, secured : this.secured, params: requestDataJson})
        this.httpHandler = this.http.post<ResponseBase<DATA>>(
            this.apiUrl,
            requestDataJson,
            callOptions
        ).subscribe({
            next: (response) => {
                this.processResponse(response)
            },
            error: (err: HttpErrorResponse) => {
                this.handleError(err, () => {
                    this.callOptions.setAuthHeader(this.connection.getJWTToken(this));
                    this.callPost(requestData);
                });
            },
            complete: () => { }
        })
    }

    protected callGet(params: CallParamInterface[]) {

        let paramStr = ""
        if (params.length > 0) {
            paramStr = "?"
            params.forEach(x => paramStr += `${x.key}=${x.value}&`)
            paramStr = RestCommonAsset.truncateTrailingChar(paramStr, '&')
        }
        
       
        this.notify({url: this.apiUrl, secured : this.secured, params: paramStr})
        const requestUrl = this.apiUrl + paramStr
        this.preCallRoutine()
        this.http.get<ResponseBase<DATA>>(
            requestUrl,
            this.callOptions.toOptions()
        ).subscribe({
            next: (response) => {
                this.processResponse(response)
            },
            error: (err: HttpErrorResponse) => {
                this.handleError(err, () => {
                    this.callOptions.setAuthHeader(this.connection.getJWTToken(this));
                    this.callGet(params)
                });
            },
            complete: () => { }
        })
    }


    protected callPut(requestData: DATA) {

        const requestBodyStr = JSON.stringify(requestData)
        console.log(`Put request Url ${this.apiUrl} with body : ${requestBodyStr}`)
        this.preCallRoutine()
    

        this.notify({url: this.apiUrl, secured : this.secured, params: requestBodyStr})

        this.http.put<ResponseBase<DATA>>(
            this.apiUrl,
            requestBodyStr,
            this.callOptions.toOptions()).subscribe({
                next: (response) => {
                    this.processResponse(response)
                },
                error: (err: HttpErrorResponse) => {
                    this.handleError(err, () => {
                        this.callOptions.setAuthHeader(this.connection.getJWTToken(this));
                        this.callPut(requestData)
                    });
                },
                complete: () => { }
            })
    }

    protected async asyncCallPut(requestData: DATA): Promise<DATA | undefined> {
        try {
            const requestBodyStr = JSON.stringify(requestData);
            console.log(`Put request Url ${this.apiUrl} with body : ${requestBodyStr}`);
    
            this.preCallRoutine();
            this.notify({ url: this.apiUrl, secured: this.secured, params: requestBodyStr });
    
            const response = await lastValueFrom(
                this.http.put<ResponseBase<DATA>>(
                    this.apiUrl,
                    requestBodyStr,
                    this.callOptions.toOptions()
                )
            );
            return this.contentNegotiations.deserialize<DATA>(response);
        } catch (err) {
            if (err instanceof HttpErrorResponse) {
                this.handleError(err, () => {
                    this.callOptions.setAuthHeader(this.connection.getJWTToken(this));
                    return this.asyncCallPut(requestData);
                });
            } else {
                console.error('Unexpected error:', err);
            }
            return undefined;
        }
    }


    requestErrors():Observable<RequestEvent>{
       return this.eventEmitter.requestEvents$
    }
}


