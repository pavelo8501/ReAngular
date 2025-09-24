import {ResponseBase} from "./../../dataflow/rest-response"

export interface ContentNegotiationsInterface<RESPONSE extends ResponseBase<any>>{
    type: string
    deserialize<T>(response:RESPONSE):T|undefined
}

export class JsNegotiationsPlugin<RESPONSE extends ResponseBase<any>> implements ContentNegotiationsInterface<RESPONSE>{

    type = 'jsNegotiations'

    deserialize<T>(response:RESPONSE):T|undefined{

        try{
            const jsObj: RESPONSE = response
            const dataObject : T = this.responseTemplate.extractData(response)
            return dataObject
        }catch(err:any){
            console.error(`JsNegotiationsPlugin erro on deserialize ${err}`)
            return undefined
        }

    }
    constructor(private responseTemplate : RESPONSE){}

}