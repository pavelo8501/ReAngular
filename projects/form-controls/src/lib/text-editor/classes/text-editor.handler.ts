

import { bindProperty, ComponentHandlerBase, PropertyBinding } from "@pavelo8501/data-helpers";
import { TextEditorComponent} from "./../text-editor.component"

export class TextEditorHandler<T extends object> extends ComponentHandlerBase<T> {

    textDelegate: PropertyBinding<T, string>

    override owningComponent?: TextEditorComponent<T> = undefined

    constructor(
        receiver: T,
        textProperty: keyof T,
    ){
        super(receiver)
        this.textDelegate = bindProperty(receiver, textProperty)
    }


    override provideComponent(component: TextEditorComponent<T>): void {
       this.owningComponent = component
    }

    override clear(){
      this.owningComponent?.clear() 
    }
}