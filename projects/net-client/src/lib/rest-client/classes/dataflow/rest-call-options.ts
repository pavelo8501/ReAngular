import { HttpHeaders } from "@angular/common/http";
import { RESTHeader } from "./rest-header";
import { RestMethod } from "../../enums/rest-method.enum";
import { HeaderKey } from "../../enums/header-key.enum";

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
                if(header.value.length> 0){
                    headers = headers.set("Authorization", `Bearer ${header.value}`)
                    withCredentials = true
                }else{
                    console.warn(`Unable to set header's ${HeaderKey.AUTHORIZATION}  value, provaded RestHeader has empty value`)
                }
            }else{
                headers = headers.append(header.key, [header.value])
            }
        })
        const options = {headers:  headers, withCredentials:withCredentials}
        return options
    }

    private appliedHeaders : RESTHeader[] = []

    private getAuthHeader(): RESTHeader | undefined{
      return  this.appliedHeaders.find(x=>x.key == HeaderKey.AUTHORIZATION)
    }

    get hasJwtToken():boolean{
        if(this.appliedHeaders.find(x=>x.key == HeaderKey.AUTHORIZATION)?.value.length?? 0  > 0 ){
            return true
        }else{
             return false
        }
    }

    replaceJwtToken(token:string):boolean{
        const  header = this.getAuthHeader()
        if(!header){
            return false
        }
        header.value = token
        return true
    }

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

    setAuthHeader(token:string, method: RestMethod){
       const authHeader = this.getAuthHeader()
       if(authHeader){
            authHeader.value = token
       }else{
            this.appliedHeaders.push(new RESTHeader(method, HeaderKey.AUTHORIZATION, token))
       }
    }

    setDefaultHeadders(headers : RESTHeader[]){
        headers.forEach(x=>{
            if(!this.appliedHeaders.find(f=>f.key === x.key)){
                this.appliedHeaders.push(x)
            }
        })
    }

    getHeaders():RESTHeader[]{
        return this.appliedHeaders
    }

}