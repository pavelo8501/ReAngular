import { HttpHeaders } from "@angular/common/http";
import { RestHeader } from "./rest-header";
import { RestMethod } from "../../classes/rest-assets";
import { HeaderKey } from "../../enums/header-key.enum";
import { RestCommonAsset } from "./../rest-assets/rest-common.asset";

export interface RestCallOptionsInterface {
    headers?: HttpHeaders
    withCredentials: boolean
}

export class RestCallOptions {

    toOptions(): object {
        console.log(this.appliedHeaders)
        let headers = new HttpHeaders()
        let withCredentials: boolean = false
        this.appliedHeaders.forEach(header => {
            if (header.key == HeaderKey.AUTHORIZATION) {
                if (header.value != undefined) {
                    headers = headers.set("Authorization", `Bearer ${header.value}`)
                    withCredentials = true
                } else {
                    console.warn(`Skipping Auth header for  ${this.asset.endpoint}|  ${this.asset.method}
                       reason, empty toke received  `)
                }
            } else {
                headers = headers.append(header.key, "")
            }
        })
        const options = { headers: headers, withCredentials: withCredentials }
        return options
    }

    private appliedHeaders: RestHeader[] = []

    constructor(private asset: RestCommonAsset<any>) {

    }

    createRestHeader(key: HeaderKey, value: string | undefined): RestHeader {
        return new RestHeader(this.asset.method, key, value)
    }

    private getAuthHeader(): RestHeader | undefined {
        return this.appliedHeaders.find(x => x.key == HeaderKey.AUTHORIZATION)
    }

    get hasJwtToken(): boolean {
        if (this.appliedHeaders.find(x => x.key == HeaderKey.AUTHORIZATION)?.value) {
            return true
        } else {
            return false
        }
    }

    replaceJwtToken(token: string) {

        const header = this.getAuthHeader()
        if (header != undefined) {
            header.value = token
        } else {
            const newHeader = this.createRestHeader(HeaderKey.AUTHORIZATION, token)
            this.appliedHeaders.push(newHeader)
        }
    }

    setAppliedHeadders(headers: RestHeader[]) {
        headers.forEach(x => {
            let found = this.appliedHeaders.find(f => f.key == x.key)
            if (found == undefined) {
                this.appliedHeaders.push(x)
            } else {
                found.value = x.value
            }
        })
        console.log("this.appliedHeaders")
        console.log(this.appliedHeaders)
    }

    setAuthHeader(token: string | undefined) {
        console.log(`setAuthHeader token : ${token} method : ${this.asset.method}`)

        if (this.asset.secured == true) {
            const authHeader = this.getAuthHeader()
            if (authHeader) {
                authHeader.setValue(token)
            } else {
                this.appliedHeaders.push(this.createRestHeader(HeaderKey.AUTHORIZATION, token))
                console.log(`applying new  header with token   ${token} to method ${this.asset.method}`)
            }
        } else {
            console.warn(`Trying to set token ${token} on non secured asset`)
        }
    }

    setDefaultHeadders(headers: RestHeader[]) {

        headers.filter(h => h.methodType == this.asset.method).forEach(x => {

            if (!this.appliedHeaders.find(f => f.key === x.key)) {
                this.appliedHeaders.push(x)
            }
        })
    }

    getHeaders(): RestHeader[] {
        return this.appliedHeaders
    }

}