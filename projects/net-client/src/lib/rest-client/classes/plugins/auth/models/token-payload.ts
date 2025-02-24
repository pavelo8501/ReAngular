

export interface TokenPayloadInterface<T>{
    aud:string
    iss:string
    login:string
    exp:number
    user?: T
}

export class TokenPayload<T> implements TokenPayloadInterface<T> {
    aud:string
    iss:string
    login:string
    exp:number
    user?: T

    constructor(private _aud:string = "", private _iss:string = "", private _login:string = "", private _exp:number = 0, private _user?: T){
        
        this.aud = _aud
        this.iss = _iss
        this.login = _login
        this.exp = _exp
        this.user = _user
    }
}