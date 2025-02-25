import { RestMethod } from "../../enums/rest-method.enum"


export class RESTHeader{
    constructor(public methodType: RestMethod, public key:string, public value:string){}
}