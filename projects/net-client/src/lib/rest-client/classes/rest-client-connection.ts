import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ErrorCode } from "./exceptions/error-code";
import { HeaderKey } from "../enums/header-key.enum";
import { RestClient } from "../rest-client.service";
import { ResponseBase } from "./dataflow/rest-response";
import { CommonRestAsset, RestAssetInterface} from "./rest-assets/rest-client.asset";
import { RestGetAsset, RestPostAsset, RestPutAsset, RestTypedAssetInterface} from "./rest-assets/rest-typed.assets"
import { RESTException } from "./exceptions";
import { RESTHeader } from "./dataflow/rest-header";
import { ContentNegotiationsInterface, JsNegotiationsPlugin} from "./plugins/content/content-negotiations.plugin";
import { RestServiceAsset } from "./rest-assets/rest-service.assets";
import { AssetType, RestMethod } from "./rest-assets/rest-asset.enums";
import { BehaviorSubject, Observable } from "rxjs";
import { AuthEventEmitterService, AuthIncidentTracker, AuthEvent, AuthIncident,  } from "./security";
import { RestExceptionCode, TokenSubjectException } from "./security/token-subject.exception";
import { TokenPayloadInterface } from "./security/token-payload.interface";
import { RestConnectionConfig } from "./config";
import { RestCommand } from "./dataflow";


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


export class RestConnection<RESPONSE extends ResponseBase<any>>{
   
    
    onCheckExpiration? : (token:string)=>TokenPayloadInterface
    onTokenRequest? :()=>string|undefined

    onCommand? : (command:RestCommand, param:any, src?:RestAssetInterface)=> void
   

    readonly connectionId:number
    readonly baseUrl:string
    private response : RESPONSE

    serviceAssets:RestServiceAsset<any>[] = []
    assets: CommonRestAsset<any>[] = []

    public readonly http: HttpClient
 
    private client: RestClient
  

    private _emitter: AuthEventEmitterService|undefined
    get eventEmitter(): AuthEventEmitterService{
        if(this._emitter != undefined){
            return this._emitter
        }else{
            throw new RESTException(`AuthEventEmitterService not set for RESTClientConnection with id : ${this.connectionId}`, ErrorCode.FATAL_INIT_FAILURE)
        }
    }
    private defaultHeaders : RESTHeader[]= []

    

    private incidentTracker  = new  AuthIncidentTracker()

    constructor(
        config : RestConnectionConfig<RESPONSE>,
        http : HttpClient,
        client: RestClient
    ){
        this.client = client
        this.http = http
        this.connectionId = config.id
        this.baseUrl = config.baseUrl
        this.response = config.responseTemplate
        this.createdDefaultHeaders()
        this.contentNegotiations = new JsNegotiationsPlugin<RESPONSE>(this.response)
    }


   
    private compare(str1:string, str2:string):boolean{
        if(str1.toLocaleLowerCase() == str2.toLocaleLowerCase()){
            return true
        }
        return false
    }

    private createdDefaultHeaders(){
        this.defaultHeaders.push(new RESTHeader(RestMethod.GET, HeaderKey.CONTENT_TYPE, "application/json"))
        this.defaultHeaders.push(new RESTHeader(RestMethod.POST, HeaderKey.CONTENT_TYPE, "application/json"))
        this.defaultHeaders.push(new RESTHeader(RestMethod.PUT, HeaderKey.CONTENT_TYPE, "application/json"))
    }

    private addOrOverrideHeader(header : RESTHeader){
        let existingHeader = this.defaultHeaders.find(x=> this.compare(x.key, header.key) && this.compare(x.methodType.toString(), header.methodType.toString()))
        if(existingHeader != undefined){
            existingHeader.value = header.value
        }else{
            this.defaultHeaders.push(header)
        }
    }

    contentNegotiations : ContentNegotiationsInterface<RESPONSE>

    private tokenSubject = new  BehaviorSubject<string|undefined>(undefined)

    private processTokenSubjecrException = (err:TokenSubjectException, asset : CommonRestAsset<any>)=>{
       
        switch((err as TokenSubjectException).errorCode){
            case RestExceptionCode.PRE_FAILED_CALL:
                this.registerIncident(asset, AuthIncident.PRE_FAILED_CALL)
                this.incidentTracker.onMaxPrefaileRetries = ((incidents)=>{
                    console.log(incidents)
                    asset.enableFallbackFn(false)
                    this.onCommand?.(
                        RestCommand.CLOSE_CLIENT, 
                        err, 
                        CommonRestAsset.toInterface(asset)
                    )??console.warn(`this.onCommand undefined`)
                })  
            break;
            case RestExceptionCode.TOKEN_INVALIDATED:
                this.registerIncident(asset,AuthIncident.SERVER_INVALIDATED)
                this.incidentTracker.onMaxRetries = ((incidents)=>{
                    console.log(incidents)
                    asset.enableFallbackFn(false)
                    this.onCommand?.(
                    RestCommand.CLOSE_CLIENT, 
                    err, 
                    CommonRestAsset.toInterface(asset)
                )??console.warn(`this.onCommand undefined`)
                        
        })
            break
        }
    }

   
    overrideOnTokenRequest(tokenRequestFn : () => string|undefined ) {
        this.onTokenRequest = tokenRequestFn
    }

    getJWTToken(asset: CommonRestAsset<any>):string|undefined{
        const jwtToken = this.tokenSubject.getValue()
        if(jwtToken){
             return jwtToken
        }else{
            let savedToken : string
            try{
                if(this.onTokenRequest ){
                    return this.onTokenRequest()
                }else{
                    return  this.client.getToken(this)
                }
                }catch(exception : any){
                    this.processTokenSubjecrException(exception, asset)
                }
          return undefined
        }
    }
    
    installPlugin(plugin : ContentNegotiationsInterface<RESPONSE>){
        switch(plugin.type){
            case "jsNegotiations":
                this.contentNegotiations = plugin
            break
        }
    }

    initialize(eventEmitter: AuthEventEmitterService, token : string|undefined) {
       this._emitter = eventEmitter
       if(token){
            this.eventEmitter.emit(AuthEvent.TOKEN_SET)
       }
    }

    subscribeToTokenUpdates(subscriberName:string):Observable<string|undefined>{
        this.eventEmitter.emit(AuthEvent.NEW_TOKEN_SUBSCRIBER, subscriberName)
        return this.tokenSubject.asObservable()
    }
    private registerIncident(author:CommonRestAsset<any>, incident: AuthIncident){
        this.eventEmitter.emit(AuthEvent.PRE_FAILED_CALL)
        this.incidentTracker.registerIncident(author.method, author.endpoint, incident)
    }

    tokenAuthenticator():RestServiceAsset<string>|undefined{
       return this.serviceAssets.find(x=>x.type == AssetType.ATHENTICATE)
    }

    tokenRefresher():RestServiceAsset<string>|undefined{
         return this.serviceAssets.find(x=>x.type == AssetType.REFRESH)
    }

    closeConnections(asset: CommonRestAsset<any>): void {
        if (!this.onCommand) {
            console.warn("No command handler assigned. Skipping close action.");
            return;
        }
        this.onCommand(RestCommand.CLOSE_HTTP , true, {
            endpoint: asset.endpoint,
            method: asset.method,
            secured: asset.secured
        });
    }

    private registerAsset<DATA>(asset : CommonRestAsset<DATA>):CommonRestAsset<DATA>{
        asset.callOptions.setDefaultHeadders(this.defaultHeaders.filter(x=>x.methodType == asset.method))
        if(asset.secured){
             asset.callOptions.setAppliedHeadders([new RESTHeader(asset.method, HeaderKey.AUTHORIZATION, "")])
        }
        this.assets.push(asset)
        return asset
    }

    private registerServiceAsset<DATA>(asset : RestServiceAsset<DATA>): RestServiceAsset<DATA> {
        asset.callOptions.setDefaultHeadders(this.defaultHeaders.filter(x=>x.methodType == asset.method))
        this.serviceAssets.push(asset)
        return asset
    }

    createServiceAsset<DATA>(
            endpoint: string, 
            method: RestMethod, 
            type: AssetType, 
        ):RestServiceAsset<DATA>{

         return this.registerServiceAsset(
            new RestServiceAsset<DATA>(
                endpoint, 
                method,
                this, 
                type, 
                this.tokenSubject
                )
            )
    }

    createPostAsset<DATA>(src: RestTypedAssetInterface):RestPostAsset<DATA>{
         const asset =  new RestPostAsset<DATA>(src.endpoint, src.secured, this)
         this.registerAsset(asset)
         return asset
     
    }

    createPutAsset<DATA>(src: RestTypedAssetInterface, type : AssetType = AssetType.NON_SERVICE):RestPutAsset<DATA>{
        const asset =new RestPutAsset<DATA>(src.endpoint, src.secured, this)
        this.registerAsset(asset)
        return asset
    }

    createGetAsset<DATA>(src: RestTypedAssetInterface,  type : AssetType = AssetType.NON_SERVICE):RestGetAsset<DATA>{
        const asset = new RestGetAsset<DATA>(src.endpoint, src.secured, this)
        this.registerAsset(asset)
        return asset
    }
}