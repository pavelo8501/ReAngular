
import {AuthEvent} from "./auth-event.enum"

export enum RestExceptionCode{
    MAX_ATTEMPTS_REACHED = 5001,
    TOKEN_INVALIDATED = 5002,
    PRE_FAILED_CALL = 5003
    
}


export class TokenSubjectException extends Error {

   static createPredefined(errorCode : RestExceptionCode, optionalMessage:string = ""):TokenSubjectException{
        let msg = ""
        switch(errorCode){
            case RestExceptionCode.TOKEN_INVALIDATED:
                msg = "Token invalidated by connection. Unsubscribe and Relogin"
            break
            case RestExceptionCode.MAX_ATTEMPTS_REACHED:
              msg = `Maximum number ${optionalMessage} retries reached.`
            break
        }
        return new TokenSubjectException(msg, errorCode)
    }

    errorCode: RestExceptionCode
    constructor(message: string = "", errorCode:RestExceptionCode) {
        super(message);
        this.name = 'TokenSubjectException';
        this.errorCode = errorCode;
        Object.setPrototypeOf(this, Error.prototype);
    }
    
}