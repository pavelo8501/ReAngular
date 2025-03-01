import { RequestError } from "../enums/request-error.enum";

export class RequestEvent{

    constructor(public message:string, public error:RequestError){

    }
}