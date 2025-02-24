import { RestResponseInterface } from "../../dataflow/rest-response";



export interface ContentNegotiationsInterface<RESPONSE extends RestResponseInterface<any>>{
    
    type: string

    deserialize<T>(response:RESPONSE):T

}

export class JsNegotiationsPlugin<RESPONSE extends RestResponseInterface<any>> implements ContentNegotiationsInterface<RESPONSE>{

    type = 'jsNegotiations'

    deserialize<T>(response:RESPONSE):T{
        const jsObj: RESPONSE = response
        console.log(jsObj)
        const dataObject : T = this.responseTemplate.extractData(response)
        console.log(dataObject)
        return dataObject
    }

    constructor(private responseTemplate : RESPONSE){
        
    }

}