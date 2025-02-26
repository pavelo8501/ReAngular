
import {AuthEvent} from "./auth-event.enum"


export class TokenSubjectException extends Error {



   static throwPredefined(errorCode : AuthEvent, optionalMessage:string = ""):TokenSubjectException{
        let msg = ""
        switch(errorCode){
            case AuthEvent.TOKEN_INVALIDATED:
                msg = "Token invalidated by connection. Unsubscribe and relogin"
            break
        }
        msg = msg + optionalMessage
        return new TokenSubjectException(errorCode, msg)
    }

    errorCode: AuthEvent
    constructor(errorCode:AuthEvent, message: string = "") {
        super(errorCode);
        this.name = 'TokenSubjectException';
        this.errorCode = errorCode;
        Object.setPrototypeOf(this, TokenSubjectException.prototype);
    }
    
}