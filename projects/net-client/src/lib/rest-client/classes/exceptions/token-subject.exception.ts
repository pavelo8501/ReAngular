import {ErrorCode} from "./error-code"


export class TokenSubjectException extends Error {

   static throwPredefined(errorCode : ErrorCode):TokenSubjectException{
        switch(errorCode){
            case ErrorCode.TOKEN_INVALIDATED: 
              throw new TokenSubjectException("Token invalidated by connection. Unsubscribe and relogin", errorCode)
            break
        }
        return new TokenSubjectException("Token invalidated by connection. Unsubscribe and relogin", ErrorCode.TOKEN_DEFAULT_EXCEPTION)
    }

    errorCode: ErrorCode
    constructor(message: string, errorCode:ErrorCode) {
        super(message);
        this.name = 'TokenSubjectException';
        this.errorCode = errorCode;
        Object.setPrototypeOf(this, TokenSubjectException.prototype);
    }
    
}