import {CommonRestAsset} from "./rest-client.asset"
import { RestConnection } from "../rest-client-connection"
import { RestMethod } from "../../enums/rest-method.enum"
import { ResponseBase } from "../dataflow/rest-response"
import { RestCallOptions } from "../dataflow/rest-call-options"
import { RESTException, ErrorCode } from "../exceptions"
import { CallParamInterface } from "../call-param"
import { HttpErrorResponse } from "@angular/common/http"
import { Observable } from "rxjs"

export interface RestTypedAssetInterface{
    endpoint:string
    secured:boolean
}

export class RestPostAsset<DATA> extends CommonRestAsset<DATA>{

    constructor(endpoint :string, secured: boolean , connection : RestConnection<ResponseBase<DATA>>){
        super({endpoint : endpoint, method : RestMethod.POST, secured: secured}, connection)
    }

   
    makeCall<REQUEST>(request: REQUEST): Observable<DATA>{
        this.callPost(request)
        return this.responseSubject.asObservable()
    }
}

export class RestGetAsset<DATA> extends CommonRestAsset<DATA>{
    
    constructor(endpoint : string,  secured : boolean, connection : RestConnection<ResponseBase<DATA>>){
        super({endpoint : endpoint, method : RestMethod.GET, secured: secured}, connection)
    }
    makeCall<REQUEST>(params: CallParamInterface[]): Observable<DATA>{
        this.callGet(params)
        return this.responseSubject.asObservable()
    }
}

export class RestPutAsset<DATA> extends CommonRestAsset<DATA>{
    
    constructor(endpoint : string,  secured : boolean, connection : RestConnection<ResponseBase<DATA>>){
        super({endpoint:endpoint, method: RestMethod.PUT, secured:secured}, connection)
    }

    makeCall<REQUEST>(id:number, data: DATA): Observable<DATA>{
        this.callPut(id, data)
        return this.responseSubject.asObservable()
    }
}