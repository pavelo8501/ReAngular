import { RestMethod } from "../rest-assets";



export class RESTHeader{
    constructor(public methodType: RestMethod, public key:string, public value:string){}
}