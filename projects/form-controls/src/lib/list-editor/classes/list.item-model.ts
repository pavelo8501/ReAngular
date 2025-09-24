import { bindProperty, Colour, info, PropertyBinding } from "@pavelo8501/data-helpers"
import { IEditorItem } from "./editor-item.interface"



export class ListItem<I extends object> implements IEditorItem{

    text = ""
    editing: boolean = false
    contentDelegate: PropertyBinding<I, string>

    constructor(
        public source: I,
        contentProperty: keyof I
    ){
        this.contentDelegate = bindProperty(source, contentProperty)
        this.text = this.contentDelegate.get()
    }

    save(value:string){
       this.text = value 
       this.contentDelegate.set(value)
    }

    saveText(){
        info("Saving this Text", Colour.Yellow)
        this.contentDelegate.set(this.text)
    }

    setText(text:string):ListItem<I>{
        this.text = text
        return this
    }

}