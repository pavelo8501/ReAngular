import { ResponseBase } from "../dataflow/rest-response"
import { RESTException, ErrorCode } from "../exceptions"
import { RestConnection } from "../rest-client-connection"
import { CommonRestAsset, RestAssetInterface} from "./rest-client.asset"
import { HttpErrorResponse } from "@angular/common/http"
import { BehaviorSubject, Observable, Subject } from "rxjs"
import { AssetType } from "./rest-asset.enums"
import { RestMethod } from "../../enums/rest-method.enum"


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
        public type: AssetType,
        private tokenSubject: BehaviorSubject<string|undefined>
    ){
        super({endpoint:endpoint, method: method, secured: false}, connection)
    }


    private login(login: string, password: string){
        console.log(`call Post to ${this.apiUrl}`)
        this.callPost<LoginRequest>(new LoginRequest(login, password))
        this.responseSubject.subscribe({
             next:(response)=>{
                    console.warn(`token received in RestServiceAsset ${response}`)

                    this.tokenSubject.next(response as string)
                },
            error:(error: HttpErrorResponse)  =>{
                console.error(`token received ${error}`)
                 this.tokenSubject.error(error)
            }
        })
    }

    getToken(login: string, password: string){
        console.log(`token requested for login : ${login}`)
        if(!this.currentToken){
            this.login(login, password)
        }else{
            console.log(`supplying existent ${login}`)
            this.tokenSubject.next(this.currentToken as string)
        }
    }

}

