import { Observable } from "rxjs"


export interface IUser{
    id?:number
    login:string
    name:string
    email:string
    password:string
    group:string
}

export interface AuthServiceInterface{

    getUser(login:string|undefined):IUser
    refreshToken(login:string):Observable<string|undefined>
    getToken(login:string | undefined):string|undefined

    logout(user: IUser | undefined):boolean
    throwAway():boolean

}