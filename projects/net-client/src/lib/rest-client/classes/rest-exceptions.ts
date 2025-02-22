import { ErrorCode } from "../enums/error-code";

export class RESTException extends Error {
    
    errorCode: ErrorCode
    
    constructor(message: string, errorCode:ErrorCode) {
        super(message);
        this.name = 'RESTException';
        this.errorCode = errorCode;
        Object.setPrototypeOf(this, RESTException.prototype);
    }
}