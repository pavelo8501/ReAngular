import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ErrorCode } from "./exceptions/error-code";
import { HeaderKey } from "../enums/header-key";
import { RestMethod } from "../enums/rest-methos";
import { RestClient } from "../rest-client.service";
import { ResponseBase } from "./dataflow/rest-response";
import { CommonRestAsset} from "./rest-assets/rest-client.asset";
import {RestGetAsset, RestPostAsset, RestPutAsset, RestTypedAssetInterface} from "./rest-assets/test-typed.assets"
import { RESTException } from "./exceptions/rest-exceptions";
import { RESTHeader } from "./rest-header";
import { ContentNegotiationsInterface, JsNegotiationsPlugin} from "./plugins/content/content-negotiations.plugin";
import { RestCallOptions} from "./rest-call-options";
import { RestServiceAsset } from "./rest-assets/rest-service.assets";



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

    private _defaultHeaders : RESTHeader[]= []
    defaultHeaders(methodType: RestMethod):RESTHeader[]{
        return this._defaultHeaders.filter(x=>x.methodType == methodType)
    }

    private compare(str1:string, str2:string):boolean{
        if(str1.toLocaleLowerCase() == str2.toLocaleLowerCase()){
            return true
        }
        return false
    }

    private createdDefaultHeaders(){
        this._defaultHeaders.push(new RESTHeader(RestMethod.GET, HeaderKey.CONTENT_TYPE, "application/json"))
        this._defaultHeaders.push(new RESTHeader(RestMethod.POST, HeaderKey.CONTENT_TYPE, "application/json"))
        this._defaultHeaders.push(new RESTHeader(RestMethod.PUT, HeaderKey.CONTENT_TYPE, "application/json"))
    }

    private addOrOverrideHeader(header : RESTHeader){
        let existingHeader = this._defaultHeaders.find(x=> this.compare(x.key, header.key) && this.compare(x.methodType.toString(), header.methodType.toString()))
        if(existingHeader != undefined){
            existingHeader.value = header.value
        }else{
            this._defaultHeaders.push(header)
        }
    }

    contentNegotiations : ContentNegotiationsInterface<RESPONSE>

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

    onBeforeCallMethod(asset: CommonRestAsset<any>):RestCallOptions{
        return this.client.createCallOption(asset)
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

    private registerAsset<DATA>(asset : CommonRestAsset<DATA>){
        this.assets.push(asset)
    }

    private registerServiceAsset<DATA>(asset : CommonRestAsset<DATA>){
        const serviceAsset =  new RestServiceAsset<DATA>(asset, this)
        this.serviceAssets.push(serviceAsset)
    }

    createPostAsset<DATA>(src: RestTypedAssetInterface,  service:boolean = false):RestPostAsset<DATA>{
        const asset =  new RestPostAsset<DATA>(src.endpoint, src.secured, this)
        if(!service){
             this.registerAsset(asset)
        }else{
            this.registerServiceAsset(asset)
        }
        return asset
    }

    createPutAsset<DATA>(src: RestTypedAssetInterface, service:boolean = false):RestPutAsset<DATA>{
        const asset =  new RestPutAsset<DATA>(src.endpoint, src.secured, this)
        if(!service){
             this.registerAsset(asset)
        }else{
            this.registerServiceAsset(asset)
        }
        return asset
    }

    createGetAsset<DATA>(src: RestTypedAssetInterface,  service:boolean = false):RestGetAsset<DATA>{
        const asset = new RestGetAsset<DATA>(src.endpoint, src.secured, this)
        if(!service){
             this.registerAsset(asset)
        }else{
            this.registerServiceAsset(asset)
        }
        return asset
    }
}