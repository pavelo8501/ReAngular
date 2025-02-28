import { BehaviorSubject } from "rxjs"
import { ResponseBase } from "../dataflow/rest-response"
import { RestConnection } from "../connection/rest-client-connection"
import { AssetType, RestMethod } from "./rest-asset.enums"
import { RestCommonAsset } from "./rest-common.asset"
import { HttpErrorResponse } from "@angular/common/http"




export interface AuthRequestInterface {
    login: string,
    password: string
}

export class LoginRequest {

    data: AuthRequestInterface

    constructor(credentials: AuthRequestInterface) {
        this.data = credentials
    }
}

export class RestServiceAsset<DATA> extends RestCommonAsset<DATA> {

    private currentToken: DATA | undefined = undefined

    constructor(
        endpoint: string,
        method: RestMethod,
        connection: RestConnection<ResponseBase<DATA>>,
        public type: AssetType,
        private tokenSubject: BehaviorSubject<string | undefined>
    ) {
        super({ endpoint: endpoint, method: method, secured: false }, connection)
    }


    private login<DATA>(login: string, password: string) {

        console.log(`call Post to ${this.apiUrl}`)

        this.callPost<string | undefined>(JSON.stringify({ login: login, password: password }))

        this.responseSubject.subscribe({
            next: (token) => {
                console.warn(`token received in TokenAuthenticator`)
                console.log(token)
                if (token != undefined) {
                    this.tokenSubject.next(token as string)
                } else {
                    this.tokenSubject.next(undefined)
                }
            },
            error: (error: HttpErrorResponse) => {
                console.error(`token received ${error}`)
                this.tokenSubject.error(error)
                this.tokenSubject.next(undefined)
            }
        })
    }

    getToken(login: string, password: string) {
        console.log(`token requested for login : ${login}`)
        if (!this.currentToken) {
            this.login(login, password)
        } else {
            console.log(`supplying existent ${login}`)
            this.tokenSubject.next(this.currentToken as string)
        }
    }

}

