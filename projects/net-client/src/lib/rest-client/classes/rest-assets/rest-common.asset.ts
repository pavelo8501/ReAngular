import { Observable, Subject, Subscription} from "rxjs"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { ContentNegotiationsInterface } from "../plugins/content/content-negotiations.plugin"
import { RestConnection } from "../connection/rest-client-connection"
import { ResponseBase } from "../dataflow/rest-response"
import { RestCallOptions } from "../dataflow/rest-call-options"
import { AssetType, RestMethod } from "./rest-asset.enums"
import { CallParamInterface, RestCommand } from "../dataflow"
import { TokenSubjectException } from "../security"
import { EventEmitterService, RequestError } from "../events"
import { RequestEvent } from "../events/models/request-event.class"


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
        connection: RestConnection<ResponseBase<DATA>>
    ) {
        this._connection = connection
        this.connection = connection

        this.endpoint = config.endpoint
        this.method = config.method
        this.secured = config.secured
        this.baseUrl = connection.baseUrl
        this.http = connection.http
        this.eventEmitter = connection.eventEmitter
        this.contentNegotiations = connection.contentNegotiations
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
                console.log(`preCallRoutine has token`)
            } else {
                console.log(`preCallRoutine has no token, requesting`)
                const token = this.connection.getJWTToken(this)

                this.callOptions.setAuthHeader(token)
            }
        }
    }

    private processResponse(response: ResponseBase<DATA>|undefined) {
        try {
            if(response){
                console.log(`processResponse received response`,response)
                const deserializeResult = this.contentNegotiations.deserialize<DATA>(response)
                console.log(`processResponse response data  ${deserializeResult} `)
                this.responseSubject.next(deserializeResult)
            }else{
                this.eventEmitter.emitRequestEvent(`Undefined response at ${this.toString()}`,RequestError.DATA_RESPONSE_UNDEFINED)
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

        if (err.status == 401) {
            this.eventEmitter.emitRequestEvent(
                `Unauthorized request on ${this.toString()}`, 
                RequestError.SERVER_UNAUTHORIZED
            )
            console.log(`Processing Unauthorized`)
            if (this.fallbackEnabled) {
                const token = this.connection.getJWTToken(this)
                if (token) {
                    requestFn()
                }
            } else {
                console.warn(`Unmanaged ${err.status} | ${err.message} when  ${this.method} to ${this.endpoint}`)
            }
        }else{
            this.eventEmitter.emitRequestEvent(
                `Request error code ${err.status} with message ${err.message} on ${this.toString()}`,
                RequestError.OTHER
            )
        }
    }


    protected callPost(requestData: DATA): void;
    protected callPost<REQUEST>(requestData: REQUEST): void;

    
    protected callPost<REQUEST>(requestData: REQUEST) {

        this.preCallRoutine()
        this.httpHandler = this.http.post<ResponseBase<DATA>>(
            this.apiUrl,
            JSON.stringify(requestData),
            this.callOptions.toOptions()
        ).subscribe({
            next: (response) => {
                this.processResponse(response)
            },
            error: (err: HttpErrorResponse) => {
                console.error(`callPost ${err.message}`)
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
                console.error(`callGet ${err.message}`)
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

        this.http.put<ResponseBase<DATA>>(
            this.apiUrl,
            requestBodyStr,
            this.callOptions.toOptions()).subscribe({
                next: (response) => {
                    console.log("raw response")
                    console.log(response)
                    this.processResponse(response)
                },
                error: (err: HttpErrorResponse) => {
                    console.error(`callPut ${err.message}`)
                    this.handleError(err, () => {
                        this.callOptions.setAuthHeader(this.connection.getJWTToken(this));
                        this.callPut(requestData)
                    });
                },
                complete: () => { }
            })
    }

    subscribeForRequestEvents():Observable<RequestEvent>{
       return this.eventEmitter.requestEvents$
    }
}


