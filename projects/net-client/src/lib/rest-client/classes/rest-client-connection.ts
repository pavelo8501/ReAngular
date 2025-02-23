import { HttpErrorResponse } from "@angular/common/http";
import { ErrorCode } from "../enums/error-code";
import { HeaderKey } from "../enums/header-key";
import { RestMethod } from "../enums/rest-methos";
import { RESTClient } from "../rest-client.service";
import { RestResponseInterface } from "./dataflow/rest-response";
import { RestClientAsset, RestClientAssetInterface } from "./rest-client.asset";
import { RESTException } from "./rest-exceptions";
import { RESTHeader } from "./rest-header";
import { ContentNegotiationsInterface, ContentNegotiationsPlugin } from "./plugins/content-negotiations.plugin";
import { CallParamInterface } from "./call-param";
import { RestCallOptions, RestCallOptionsInterface } from "./rest-call-options";


export class RESTClientConnection<RESPONSE extends RestResponseInterface<any>>{
   
    assets: RestClientAsset<any>[] = []

    private _client: RESTClient|undefined
    get client():RESTClient{
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

    private contentNegotiations : ContentNegotiationsInterface<RESPONSE> | undefined

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

        this.installPlugin(new ContentNegotiationsPlugin<RESPONSE>(response))
    }

    onBeforeCallMethod(method: RestMethod, endpoint: string):RestCallOptions{
        console.log("onBeforeCallMethod on connection called")
        const callOptions =  this.client.createCallOption(method, endpoint)
        return callOptions
    }

    installPlugin(plugin : ContentNegotiationsInterface<RESPONSE>){
        this.contentNegotiations = plugin
    }

    callGet<DATA>(asset: RestClientAsset<DATA>, params:CallParamInterface[]){
    
       const  restOptions : RestCallOptions  = this.onBeforeCallMethod(RestMethod.GET, asset.endpoint)
       restOptions.seDefaultHeadders(this.defaultHeaders.filter(x=>x.methodType == RestMethod.GET)) 
        let paramStr = ""
        
        if(params.length>0){
            paramStr = "?"
            params.forEach(x=> paramStr+= `${x.key}=${x.value}&`)
            paramStr =  RestClientAsset.truncateTrailingChar(paramStr, '&')
        }
        const requestUrl = asset.url+paramStr
        console.log(`Making Get call with url : ${requestUrl}`)
        
        const callOptions = RestCallOptions.toOptions(restOptions.getHeaders())

        this.client.http.get<RESPONSE>(requestUrl, callOptions).subscribe({
            next:(response)=>{
                console.log("raw response")
                console.log(response)
                if(this.contentNegotiations != undefined){
                    const deserializeResult = this.contentNegotiations.deserialize<DATA>(response)
                    asset.submitResult(deserializeResult)
                 }
            },
            error: (err : HttpErrorResponse) => {
                console.warn("GET request error")
                console.error(err.message)
                throw new RESTException(err.message, ErrorCode.HTTP_CALL_ERROR)
            },
            complete:() => {}
        })
    }

    callPost<DATA, REQUEST>(asset: RestClientAsset<DATA>, requestData : REQUEST){
        const requestUrl = asset.url
        console.log(`Request url: ${requestUrl}`)
        const request : object = {data: requestData}
        console.log(`Request body: ${JSON.stringify(request)}`)
        this.client.http.post<RESPONSE>(requestUrl, JSON.stringify(request)).subscribe({
            next:(result)=>{
                console.log("Post returned result")
                console.log(result)
                if(this.contentNegotiations != undefined){
                   const deserializeResult =  this.contentNegotiations.deserialize<DATA>(result)
                   asset.submitResult(deserializeResult)
                   console.log(deserializeResult)
                }
            },
            error: (err : HttpErrorResponse) => {
                throw new RESTException(err.message, ErrorCode.HTTP_CALL_ERROR)
            },
            complete:() => {}
        })
    }

    initialize(client: RESTClient){
       this._client = client
    }

    createAsset<DATA>(endpoint: string, method:RestMethod, secured:boolean = false): RestClientAsset<DATA> {
        return  RestClientAsset.create(endpoint, method, secured, this)
    }

    registerAsset<T>(asset: RestClientAsset<T>):RestClientAsset<T>{
          const existingAssetIndex = this.assets.findIndex(x=>x.endpoint == asset.endpoint && x.method == asset.method)
          if(existingAssetIndex >= 0){
            return this.assets[existingAssetIndex]
          }else{
            asset.initialize(this.baseUrl, this.client.http)
            this.assets.push(asset)
            return asset
          }
    }

}