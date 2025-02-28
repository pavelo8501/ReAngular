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

    constructor(
        endpoint: string,
        method: RestMethod,
        connection: RestConnection<ResponseBase<DATA>>,
        public type: AssetType,
        private tokenSubject: BehaviorSubject<string | undefined>
    ) {
        super({ endpoint: endpoint, method: method, secured: false }, connection)
    }


    getToken(login: string, password: string) {

        const request = {login: login, password: password }
        console.log(`Token requested body : ${request} `)

        this.callPost<{login: string, password: string}>(request)

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

}

