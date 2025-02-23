import { HttpHeaders } from "@angular/common/http";
import { RESTHeader } from "./rest-header";
import { RestMethod } from "../enums/rest-methos";
import { HeaderKey } from "../enums/header-key";

export interface RestCallOptionsInterface{
    headers?: HttpHeaders
    withCredentials : boolean
}

export class RestCallOptions{

    static toOptions(restHeaders: RESTHeader[]):object{
        console.log(restHeaders)
        let headers = new HttpHeaders()
        let withCredentials: boolean = false
        restHeaders.forEach(header=> {
            if(header.key == HeaderKey.AUTHORIZATION){
                headers = headers.set("Authorization", `Bearer ${header.value}`)
                withCredentials = true
            }else{
                console.log(`set ${header.value}`)
                headers = headers.append(header.key, [header.value])
            }
        })
        const options = {headers:  headers, withCredentials:withCredentials}
        console.log("created options object")
        console.log(options)
        return options
    }

    private appliedHeaders : RESTHeader[] = []

    setAppliedHeadders(headers : RESTHeader[]){
        headers.forEach(x=>{
            let found = this.appliedHeaders.find(f=>f.key == x.key)
            if(found == undefined){
                this.appliedHeaders.push(x)
            }else{
                found.value = x.value
            }
        })
        console.log("this.appliedHeaders")
        console.log(this.appliedHeaders)
    }

    seDefaultHeadders(headers : RESTHeader[]){
        headers.forEach(x=>{
            if(!this.appliedHeaders.find(f=>f.key === x.key)){
                this.appliedHeaders.push(x)
            }
        })
    }

    getHeaders():RESTHeader[]{
        console.log("getHeaders")
        console.log(this.appliedHeaders)
        return this.appliedHeaders
    }

}