


export interface AuthRequestInterface<T>{
    data: T
}

export class LoginRequest{
    constructor(public login:string, public  password:string){}
}