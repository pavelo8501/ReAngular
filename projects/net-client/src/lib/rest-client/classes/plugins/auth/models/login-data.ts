export class LoginData{
    
    login: string  = ""
    password: string = ""

    constructor(login: string = "", password: string = ""){
        if(login.length > 0){
            this.login = login
        }
        if(password.length>0){
            this.password = password
        }
    }
}