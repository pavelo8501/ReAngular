import { ResponseBase } from "../dataflow/rest-response"
import { RESTException, ErrorCode } from "../exceptions"
import { RestConnection } from "../rest-client-connection"
import { CommonRestAsset, RestAssetInterface} from "./rest-client.asset"
import { HttpErrorResponse } from "@angular/common/http"
import { BehaviorSubject, Observable, Subject } from "rxjs"
import { AssetType } from "./rest-asset.enums"
import { RestMethod } from "net-client"


export interface AuthRequestInterface<T>{
    data: T
}

export class LoginRequest{
    constructor(public login:string, public  password:string){}
}

export class RestServiceAsset<DATA> extends CommonRestAsset<DATA>{

    private currentToken: DATA | undefined = undefined

    constructor(
        endpoint:string, 
        method:RestMethod,   
        connection : RestConnection<ResponseBase<DATA>>, 
        public type: AssetType
    ){
        super({endpoint:endpoint, method: method, secured: false}, connection)
    }

    private tokenSubject = new Subject<DATA|undefined>();

    private login(login: string, password: string){
        console.log(`call Post to ${this.apiUrl}`)
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
        console.log(`token requested for login : ${login}`)
        if(!this.currentToken){
            this.login(login, password)
        }else{
            console.log(`supplying existent ${login}`)
            this.tokenSubject.next(this.currentToken)
        }
        return this.tokenSubject.asObservable()
    }

}

