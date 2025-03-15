import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ErrorCode } from "../exceptions/error-code";
import { HeaderKey } from "../../enums/header-key.enum";
import { RestClient } from "../../rest-client.service";
import { ResponseBase, RestHeader } from "../dataflow";
import { RestCommonAsset, RestAssetInterface } from "../rest-assets/rest-common.asset";
import { RestGetAsset, RestPostAsset, RestPutAsset, RestTypedAssetInterface } from "../rest-assets/rest-typed.assets"
import { RESTException } from "../exceptions";
import { ContentNegotiationsInterface, JsNegotiationsPlugin } from "../plugins/content/content-negotiations.plugin";
import { RestServiceAsset } from "../rest-assets/rest-service.assets";
import { AssetType, RestMethod } from "../rest-assets/rest-asset.enums";
import { BehaviorSubject, distinctUntilChanged, filter, Observable } from "rxjs";
import { AuthIncidentTracker, AuthIncident, } from "../security";
import {EventEmitterService, RequestEvent} from "./../events"
import { RestExceptionCode, TokenSubjectException } from "../security/token-subject.exception";
import { TokenPayloadInterface } from "../security/token-payload.interface";
import { RestConnectionConfig } from "../config";
import { RestCommand } from "../dataflow";
import { AssetParams } from "../rest-assets";


// RESTClientConnection.prototype.registerAsset = function<T>(
//     assetFactory: <T>(conn: RESTClientConnection<RestResponseInterface<any>>) => CommonRestAsset<T>
//   ): RestAssetInterface<T> {
//         const asset = assetFactory(this)
//         const existingAssetIndex = this.assets.findIndex(
//             (x: RestAssetInterface<T>) => x.endpoint === asset.endpoint && x.method === asset.method
//           );
//     if (existingAssetIndex >= 0) {
//         return this.assets[existingAssetIndex] as CommonRestAsset<T>;
//     }else{
//         asset.initialize(this);
//         this.assets.push(asset);
//         return asset;
//     }
//   }


export class RestConnection<RESPONSE extends ResponseBase<any>> {

    onCheckExpiration?: (token: string) => TokenPayloadInterface
    onCommand?: (command: RestCommand, param: any, src?: RestAssetInterface) => void

    private onTokenRequest?: () => string | undefined

    readonly connectionId: number
    readonly baseUrl: string
    private response: RESPONSE

    serviceAssets: RestServiceAsset<any>[] = []
    assets: RestCommonAsset<any>[] = []

    public readonly http: HttpClient

    private client: RestClient

    private _emitter: EventEmitterService | undefined
    get eventEmitter(): EventEmitterService {
        if (this._emitter != undefined) {
            return this._emitter
        } else {
            throw new RESTException(`AuthEventEmitterService not set for RESTClientConnection with id : ${this.connectionId}`, ErrorCode.FATAL_INIT_FAILURE)
        }
    }

    private defaultHeaders: RestHeader[] = []
    private tokenSubject = new BehaviorSubject<string | undefined>(undefined)

    private onNewIncident(incident : { method: string, endpoint: string, incident: AuthIncident; timestamp: number } ){
        console.log(incident.incident)
    }

    contentNegotiations: ContentNegotiationsInterface<RESPONSE>
    private incidentTracker = new AuthIncidentTracker(3,1,this.onNewIncident)

    constructor(
        config: RestConnectionConfig<RESPONSE>,
        http: HttpClient,
        client: RestClient
    ) {
        this.client = client
        this.http = http
        this.connectionId = config.id
        this.baseUrl = config.baseUrl
        this.response = config.responseTemplate
        this.createdDefaultHeaders()
        this.contentNegotiations = new JsNegotiationsPlugin<RESPONSE>(this.response)
        this.listenToTokenSubject()
    }

    initialize(eventEmitter: EventEmitterService, token: string | undefined) {
        this._emitter = eventEmitter
        if (token) {
            this.tokenSubject.next(token)
        }
    }

    subscribeRequestErrors():Observable<RequestEvent>{
        return this.eventEmitter.requestEvents$
    }

    private compare(str1: string, str2: string): boolean {
        if (str1.toLocaleLowerCase() == str2.toLocaleLowerCase()) {
            return true
        }
        return false
    }

    private createdDefaultHeaders() {
        this.defaultHeaders.push(new RestHeader(RestMethod.GET, HeaderKey.CONTENT_TYPE, "application/json"))
        this.defaultHeaders.push(new RestHeader(RestMethod.POST, HeaderKey.CONTENT_TYPE, "application/json"))
        this.defaultHeaders.push(new RestHeader(RestMethod.PUT, HeaderKey.CONTENT_TYPE, "application/json"))
        const token = this.client.getToken(this)
        this.defaultHeaders.push(new RestHeader(RestMethod.GET, HeaderKey.AUTHORIZATION, token))
        this.defaultHeaders.push(new RestHeader(RestMethod.POST, HeaderKey.AUTHORIZATION, token))
        this.defaultHeaders.push(new RestHeader(RestMethod.PUT, HeaderKey.AUTHORIZATION, token))
    }

    private addOrOverrideHeader(header: RestHeader) {
        let existingHeader = this.defaultHeaders.find(x => this.compare(x.key, header.key) && this.compare(x.methodType.toString(), header.methodType.toString()))
        if (existingHeader != undefined) {
            existingHeader.value = header.value
        } else {
            this.defaultHeaders.push(header)
        }
    }

    private listenToTokenSubject() {
        this.tokenSubject.pipe(
            distinctUntilChanged()
        ).subscribe({
            next: (token: string | undefined) => {
                if (token != undefined) {
                    this.client.setToken(this, token)
                    this.assets.filter(f => f.secured == true).forEach(x => x.callOptions.setAuthHeader(token))
                } else {
                    console.warn(`Received ${token}`)
                }
            },
            error: (err: any) => {
                console.warn(`Received ${err}`)
            }
        })
    }

    private processTokenSubjecrException = (err: TokenSubjectException, asset: RestCommonAsset<any>) => {

        switch ((err as TokenSubjectException).errorCode) {
            case RestExceptionCode.PRE_FAILED_CALL:
                this.registerIncident(asset, AuthIncident.PRE_FAILED_CALL)
                this.incidentTracker.onMaxPrefaileRetries = ((incidents) => {
                    console.log(incidents)
                    asset.enableFallbackFn(false)
                    this.onCommand?.(
                        RestCommand.CLOSE_CLIENT,
                        err,
                        RestCommonAsset.toInterface(asset)
                    ) ?? console.warn(`this.onCommand undefined`)
                })
                break;
            case RestExceptionCode.TOKEN_INVALIDATED:
                this.registerIncident(asset, AuthIncident.SERVER_INVALIDATED)
                this.incidentTracker.onMaxRetries = ((incidents) => {
                    console.log(incidents)
                    asset.enableFallbackFn(false)
                    this.onCommand?.(
                        RestCommand.CLOSE_CLIENT,
                        err,
                        RestCommonAsset.toInterface(asset)
                    ) ?? console.warn(`this.onCommand undefined`)

                })
                break
        }
    }

    private getSavedToken(): string | undefined {
        if (this.onTokenRequest != undefined) {
            return this.onTokenRequest()
        } else {
            return this.client.getToken(this)
        }
    }

    private registerIncident(author: RestCommonAsset<any>, incident: AuthIncident) {
       // this.eventEmitter.emit(AuthEvent.PRE_FAILED_CALL)
        this.incidentTracker.registerIncident(author.method, author.endpoint, incident)
    }

    private registerAsset<DATA>(asset: RestCommonAsset<DATA>): RestCommonAsset<DATA> {
        asset.callOptions.setDefaultHeadders(this.defaultHeaders.filter(x => x.methodType == asset.method))
        if (asset.secured) {
            asset.callOptions.setAppliedHeadders([new RestHeader(asset.method, HeaderKey.AUTHORIZATION, "")])
        }
        this.assets.push(asset)
        return asset
    }

    private registerServiceAsset<DATA>(asset: RestServiceAsset<DATA>): RestServiceAsset<DATA> {
        asset.callOptions.setDefaultHeadders(this.defaultHeaders.filter(x => x.methodType == asset.method))

        this.serviceAssets.push(asset)
        return asset
    }

    overrideOnTokenRequest(tokenRequestFn: () => string | undefined) {
        this.onTokenRequest = tokenRequestFn
    }

    getJWTToken(asset: RestCommonAsset<any>): string | undefined {

        const jwtToken = this.tokenSubject.getValue()
        if (jwtToken) {
            return jwtToken
        } else {
            let savedToken: string
            try {
                return this.getSavedToken()
            } catch (exception: any) {
                this.processTokenSubjecrException(exception, asset)
            }
            return undefined
        }
    }

    installPlugin(plugin: ContentNegotiationsInterface<RESPONSE>) {
        switch (plugin.type) {
            case "jsNegotiations":
                this.contentNegotiations = plugin
                break
        }
    }

    subscribeToTokenUpdates(subscriberName: string): Observable<string | undefined> {
       // this.eventEmitter.emit(AuthEvent.NEW_TOKEN_SUBSCRIBER, subscriberName)
        return this.tokenSubject.asObservable()
    }

    tokenAuthenticator(): RestServiceAsset<string> | undefined {
        const authenticator = this.serviceAssets.find(x => x.type == AssetType.ATHENTICATE)
        if (!authenticator) {
            console.warn(`Unable to find authenticator`)
            return undefined
        }
        return this.serviceAssets.find(x => x.type == AssetType.ATHENTICATE)
    }

    tokenRefresher(): RestServiceAsset<string> | undefined {
        return this.serviceAssets.find(x => x.type == AssetType.REFRESH)
    }

    closeConnections(asset: RestCommonAsset<any> | boolean): void {

        if (!this.onCommand) {
            console.warn("No command handler assigned. Skipping close action.");
            return;
        }

        if (typeof (asset) === "boolean") {
            this.onCommand(RestCommand.CLOSE_HTTP, true)
        } else {
            this.onCommand(RestCommand.CLOSE_HTTP, true, {
                endpoint: asset.endpoint,
                method: asset.method,
                secured: asset.secured
            });
        }
    }

    createServiceAsset<DATA>(endpoint: string, method: RestMethod, type: AssetType, authUrl: string): RestServiceAsset<DATA> {
        return this.registerServiceAsset(
            new RestServiceAsset<DATA>( authUrl, endpoint, method, this, type, this.tokenSubject)
        )
    }

    createPostAsset<DATA>(src: RestTypedAssetInterface, params: AssetParams = new AssetParams()) {
        const asset = new RestPostAsset<DATA>(src.endpoint, src.secured, this, params)
        this.registerAsset(asset)
        return asset

    }

    createPutAsset<DATA>(src: RestTypedAssetInterface,  params: AssetParams = new AssetParams()): RestPutAsset<DATA> {
        const asset = new RestPutAsset<DATA>(src.endpoint, src.secured, this, params)
        this.registerAsset(asset)
        return asset
    }

    createGetAsset<DATA>(src: RestTypedAssetInterface, params: AssetParams = new AssetParams()): RestGetAsset<DATA> {
        const asset = new RestGetAsset<DATA>(src.endpoint, src.secured, this, params)
        this.registerAsset(asset)
        return asset
    }
}