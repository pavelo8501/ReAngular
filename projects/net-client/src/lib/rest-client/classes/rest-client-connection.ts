import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ErrorCode } from "./exceptions/error-code";
import { HeaderKey } from "../enums/header-key";
import { RestMethod } from "../enums/rest-method.enums";
import { RestClient } from "../rest-client.service";
import { ResponseBase } from "./dataflow/rest-response";
import { CommonRestAsset} from "./rest-assets/rest-client.asset";
import { RestGetAsset, RestPostAsset, RestPutAsset, RestTypedAssetInterface} from "./rest-assets/rest-typed.assets"
import { RESTException } from "./exceptions/rest-exceptions";
import { RESTHeader } from "./dataflow/rest-header";
import { ContentNegotiationsInterface, JsNegotiationsPlugin} from "./plugins/content/content-negotiations.plugin";
import { RestCallOptions} from "./dataflow/rest-call-options";
import { RestServiceAsset } from "./rest-assets/rest-service.assets";
import { AssetType } from "./rest-assets/rest-asset.enums";
import { BehaviorSubject, Observable } from "rxjs";


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
   
    serviceAssets:RestServiceAsset<any>[] = []
    assets: CommonRestAsset<any>[] = []

    private _http: HttpClient| undefined
    get http():HttpClient{
        if(this._http){
             return this._http
        }else{
            throw new RESTException("HTTP Client not injected ", ErrorCode.FATAL_INIT_FAILURE)
        }
    }
 
    private _client: RestClient|undefined
    get client():RestClient{
        if(this._client != undefined){
            return this._client
        }else{
            throw new RESTException(`Parent RESTClient not set for RESTClientConnection with id : ${this.connectionId}`, ErrorCode.FATAL_INIT_FAILURE)
        }
    }

    private defaultHeaders : RESTHeader[]= []

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

    private $tokenSubject = new  BehaviorSubject<string|undefined>(undefined)
    get tokenSubject():Observable<string|undefined>{
        return this.$tokenSubject.asObservable()
    }
    get token():string{
        const value = this.$tokenSubject.getValue()
        if(value){
            return value
        }else{
            throw new RESTException("Accessing token undefined", ErrorCode.FATAL_INIT_FAILURE)
        }
    }
    set token(value:string){
        const subjectValue = this.$tokenSubject.getValue()
        if( subjectValue != value){
            this.$tokenSubject.next(value)
        }else{
            console.warn("Trying to update exixtent token with same value")
        }
    }
    


    constructor(
        public connectionId : number, 
        public baseUrl:string, 
        public response: RESPONSE,
        private headers: RESTHeader[] = []
    ){
        this.createdDefaultHeaders()
        if(headers.length > 0){
            headers.forEach(x=> this.addOrOverrideHeader(x))
        }
        this.contentNegotiations =   new JsNegotiationsPlugin<RESPONSE>(response)
    }


    installPlugin(plugin : ContentNegotiationsInterface<RESPONSE>){

        switch(plugin.type){
            case "jsNegotiations":
                this.contentNegotiations = plugin
            break
        }
    }

    errorHandlerfn?: (error: HttpErrorResponse, requestFn: (token:string) => void) => void  

    initialize(client: RestClient, http: HttpClient) {
       this._client = client
       this._http = http
    }

    tokenAuthenticator():RestServiceAsset<string>|undefined{
       return this.serviceAssets.find(x=>x.type == AssetType.ATHENTICATE)
    }

    tokenRefresher():RestServiceAsset<string>|undefined{
         return this.serviceAssets.find(x=>x.type == AssetType.REFRESH)
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
                this.$tokenSubject
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