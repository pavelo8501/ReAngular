import { RestMethod } from "../../enums/rest-method.enums"


export class RESTHeader{
    constructor(public methodType: RestMethod, public key:string, public value:string){}
}