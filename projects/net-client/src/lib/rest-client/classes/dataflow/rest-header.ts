import { RestMethod } from "../../enums/rest-methos"


export class RESTHeader{
    constructor(public methodType: RestMethod, public key:string, public value:string){}
}