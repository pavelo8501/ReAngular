import { HttpHeaders } from "@angular/common/http";

export interface RestCallOptionsInterface{
    headers?: HttpHeaders
    withCredentials : boolean
}

export class RestCallOptions implements RestCallOptionsInterface{

    headers?: HttpHeaders = undefined
    withCredentials : boolean = false

    static toOptions(callOtions : RestCallOptionsInterface|undefined):object|undefined {
        if(callOtions != undefined){
            return {headers: callOtions.headers, withCredentials : callOtions.withCredentials }
        }else{
            return undefined
        }
    }
}