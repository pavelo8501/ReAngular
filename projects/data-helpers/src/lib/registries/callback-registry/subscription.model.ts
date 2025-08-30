
export class CallbackSubscription<T>{

    constructor(
        public subscriber:object,
        public callback:(param:T)=>void
    ){

    }

}