import { RestCommonAsset } from "./rest-common.asset"
import { RestConnection } from "../connection/rest-client-connection"
import { ResponseBase } from "../dataflow/rest-response"
import { CallParamInterface } from "../dataflow/call-param"
import { Observable } from "rxjs"
import { RestMethod } from "./rest-asset.enums"

export interface RestTypedAssetInterface {
    endpoint: string
    secured: boolean
}

export class RestPostAsset<DATA> extends RestCommonAsset<DATA> {

    constructor(endpoint: string, secured: boolean, connection: RestConnection<ResponseBase<DATA>>) {
        super({ endpoint: endpoint, method: RestMethod.POST, secured: secured }, connection)
    }

    makeCall(request: DATA): Observable<DATA> {
        this.callPost(request)
        return this.responseSubject.asObservable()
    }
}

export class RestGetAsset<DATA> extends RestCommonAsset<DATA> {

    constructor(endpoint: string, secured: boolean, connection: RestConnection<ResponseBase<DATA>>) {
        super({ endpoint: endpoint, method: RestMethod.GET, secured: secured }, connection)
    }
    makeCall(params: CallParamInterface[]): Observable<DATA> {
        this.callGet(params)
        return this.responseSubject.asObservable()
    }
}

export class RestPutAsset<DATA> extends RestCommonAsset<DATA> {

    constructor(endpoint: string, secured: boolean, connection: RestConnection<ResponseBase<DATA>>) {
        super({ endpoint: endpoint, method: RestMethod.PUT, secured: secured }, connection)
    }

    makeCall(data: DATA): Observable<DATA> {
        this.callPut(data)
        return this.responseSubject.asObservable()
    }
}