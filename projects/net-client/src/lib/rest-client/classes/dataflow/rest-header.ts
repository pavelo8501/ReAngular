import { RestMethod } from "../rest-assets";

export class RestHeader{

    constructor(
        public methodType: RestMethod, 
        public key:string, 
        public value:string|undefined){}

        setValue(value:string|undefined){
            this.value = value
        }
}