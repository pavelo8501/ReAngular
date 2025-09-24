import { RestCommonAsset } from "./rest-common.asset"
import { RestConnection } from "../connection/rest-client-connection"
import { ResponseBase } from "../dataflow/rest-response"
import { CallParamInterface } from "../dataflow/call-param"
import { Observable } from "rxjs"
import { RestMethod } from "./rest-asset.enums"
import { AssetParams } from "./rest-assets.model"

export interface RestTypedAssetInterface {
    endpoint: string
    secured: boolean
}

export class RestPostAsset<DATA> extends RestCommonAsset<DATA> {

    constructor(endpoint: string, secured: boolean, connection: RestConnection<ResponseBase<DATA>>, params: AssetParams = new AssetParams()) {
        super({ endpoint: endpoint, method: RestMethod.POST, secured: secured }, params,  connection)
    }

    makeCall(requestData: DATA, queryParams?: Record<string, string | number>): Observable<DATA>
    makeCall<REQUEST>(request: REQUEST, queryParams?: Record<string, string | number>): Observable<DATA> {
        this.callPost<REQUEST>(request, queryParams)
        return this.responseSubject.asObservable()
    }
}

export class RestGetAsset<DATA> extends RestCommonAsset<DATA> {

    constructor(endpoint: string, secured: boolean, connection: RestConnection<ResponseBase<DATA>>, params: AssetParams = new AssetParams()) {

        console.log(`Params received for Get `)
        console.log(params)

        super({ endpoint: endpoint, method: RestMethod.GET, secured: secured }, params, connection)
    }
    makeCall(params: CallParamInterface[]): Observable<DATA> {
        this.callGet(params)
        return this.responseSubject.asObservable()
    }
}

//CallableFunction.call<T, A extends any[], R>(this: (this: T, ...args: A) => R, thisArg: T, ...args: A): R

export class RestPutAsset<DATA> extends RestCommonAsset<DATA> {
    constructor(endpoint: string, secured: boolean, connection: RestConnection<ResponseBase<DATA>>, params: AssetParams = new AssetParams()) {
        super({ endpoint: endpoint, method: RestMethod.PUT, secured: secured },params, connection)
    }

    makeCall(data: DATA): Observable<DATA>{
        this.callPut(data)
        return this.responseSubject.asObservable()
    }

    callAsync = (data: DATA) => this.asyncCallPut(data);

    callWith<T>(subject:T, data:DATA,  fn: (this:DATA, subject :T)=> T | undefined) {
        this.callAsync(data).then((result)=>{
            if(result){
                fn.call(result, subject)
                return data
            }else{
                return undefined
            }
        }, ()=>{
            return undefined
        })
    }
}