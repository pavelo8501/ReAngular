import { RestResponseInterface } from "../dataflow/rest-response";

export interface ContentNegotiationsInterface<RESPONSE extends RestResponseInterface<any>>{

    deserialize<T>(response:RESPONSE):T

}

export class ContentNegotiationsPlugin<RESPONSE extends RestResponseInterface<any>> implements ContentNegotiationsInterface<RESPONSE>{

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