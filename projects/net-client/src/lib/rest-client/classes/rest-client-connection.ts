import { HttpErrorResponse } from "@angular/common/http";
import { ErrorCode } from "../enums/error-code";
import { HeaderKey } from "../enums/header-key";
import { RestMethod } from "../enums/rest-methos";
import { RestClient } from "../rest-client.service";
import { RestResponseInterface } from "./dataflow/rest-response";
import { CommonRestAsset, RestAssetInterface, RestGetAsset, RestPostAsset, RestPutAsset, RestTypedAssetInterface} from "./rest-assets/rest-client.asset";
import { RESTException } from "./rest-exceptions";
import { RESTHeader } from "./rest-header";
import { ContentNegotiationsInterface, JsNegotiationsPlugin } from "./plugins/content/content-negotiations.plugin";
import { CallParamInterface } from "./call-param";
import { RestCallOptions, RestCallOptionsInterface } from "./rest-call-options";
import { Observable } from "rxjs";
import { ErrorHandler } from "@angular/core";


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


export class RESTClientConnection<RESPONSE extends RestResponseInterface<any>>{
   
    assets: CommonRestAsset<any>[] = []

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

    initialize(client: RestClient) {
       this._client = client
    }

    private registerAsset<DATA>(asset : CommonRestAsset<DATA>){
        this.assets.push(asset)
    }

    createPostAsset<DATA>(src: RestTypedAssetInterface):RestPostAsset<DATA> {
        const asset =  new RestPostAsset(src.endpoint, src.secured, this)
        this.registerAsset(asset)
        return asset
    }

    createPutAsset<DATA>(src: RestTypedAssetInterface){
        const asset =  new RestPutAsset(src.endpoint, src.secured, this)
        this.registerAsset(asset)
        return asset
    }

    createGetAsset<DATA>(src: RestTypedAssetInterface){
        const asset = new RestGetAsset(src.endpoint, src.secured, this)
        this.registerAsset(asset)
        return asset
    }
}