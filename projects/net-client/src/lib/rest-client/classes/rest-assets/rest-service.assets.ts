import { ErrorCode } from "net-client"
import { ResponseBase } from "../dataflow/rest-response"
import { RESTException } from "../exceptions"
import { RestConnection } from "../rest-client-connection"
import { CommonRestAsset, RestAssetInterface} from "./rest-client.asset"
import { HttpErrorResponse } from "@angular/common/http"
import { BehaviorSubject, Observable } from "rxjs"


export interface AuthRequestInterface<T>{
    data: T
}

export class LoginRequest{
    constructor(public login:string, public  password:string){}
}

export class RestServiceAsset<DATA> extends CommonRestAsset<DATA>{

    private sourceAsset :  CommonRestAsset<DATA>
    private currentToken: DATA | undefined = undefined

    constructor(asset: RestAssetInterface, connection : RestConnection<ResponseBase<DATA>>){
        super({endpoint:asset.endpoint, method: asset.method, secured: asset.secured}, connection)
        this.sourceAsset = asset as CommonRestAsset<DATA>
    }

    private tokenSubject = new BehaviorSubject<DATA|undefined>(this.currentToken);
    private login(login: string, password: string){
        console.log(`call Post to ${this.url}`)
        this.callPost<LoginRequest>(new LoginRequest(login, password))
        this.responseSubject.subscribe({
             next:(response)=>{
                    console.log(`token received ${response}`)
                  this.tokenSubject.next(response)
                },
            error:(error: HttpErrorResponse)  =>{
                console.error(`token received ${error}`)
                throw new RESTException(error.message, ErrorCode.FATAL_INIT_FAILURE)
            }
        })
    }

    getToken(login: string, password: string):Observable<DATA|undefined>{
        console.log(`token requested for login ${login}`)
        if(!this.currentToken){
            this.login(login, password)
        }else{
            console.log(`supplying existent ${login}`)
            this.tokenSubject.next(this.currentToken)
        }
        return this.tokenSubject.asObservable()
    }

}

