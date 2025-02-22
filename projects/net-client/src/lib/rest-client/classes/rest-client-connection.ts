import { RestMethod } from "../enums/rest-methos";
import { RestResponseInterface } from "./dataflow/rest-response";
import { RestClientAsset } from "./rest-client.asset";
import { RESTHeader } from "./rest-header";



export class RESTClientConnection<T>{
   
    assets: RestClientAsset<any>[] = []

    private defaultHeaders : RESTHeader[]= []
    private compare(str1:string, str2:string):boolean{
        if(str1.toLocaleLowerCase() == str2.toLocaleLowerCase()){
            return true
        }
        return false
    }

    private createdDefaultHeaders(){
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

    constructor(public connectionId : number, public baseUrl:string, public response: RestResponseInterface<T>, private headers: RESTHeader[] = []){
        this.createdDefaultHeaders()
        if(headers.length > 0){
            headers.forEach(x=> this.addOrOverrideHeader(x))
        }
    }
}