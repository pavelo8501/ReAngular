import { HttpErrorResponse } from "@angular/common/http";


export class RequestEvent{

    message :string
    status: number
    url: string
    headers: string[] = []

    constructor(error : HttpErrorResponse){
       
       Object.entries(error.headers).forEach(key=>  {
            const values =  key[1] as string[]
            this.headers.push(`${key[0]} : ${values.map(x=>x)}`)
        })
        this.message = error.message
        this.status =  error.status
        this.url = error.url ?? "unknown"
    }

    toString():string{
        return `Url: ${this.url}  message: ${this.message}`
    }
}