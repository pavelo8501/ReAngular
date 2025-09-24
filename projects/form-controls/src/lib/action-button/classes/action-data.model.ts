export class ActionData<T>{


    caption:string = "Action Button"

    constructor(
        public data :T,
        public callback:(data:T) => void
    ){}


    setCaption(caption :string): ActionData<T>{
        this.caption = caption
        return this
    }
    
}