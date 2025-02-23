import { Observable } from "rxjs"

export interface AuthServiceInterface{

    refreshToken(login:string):Observable<string|undefined>
    getToken(login:string|undefined):string|undefined

    logout():boolean
    throwOut():boolean

}