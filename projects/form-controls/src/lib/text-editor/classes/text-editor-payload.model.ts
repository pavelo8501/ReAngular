
import { TextEditorComponent } from "../text-editor.component";
import { bindProperty, PropertyBinding } from "@pavelo8501/data-helpers";

export class TextEditorPayload<T extends object> {

    private parentComponent?: TextEditorComponent<any>

    textDelegate: PropertyBinding<T, string>

    constructor(
        public receiver: T,
        textProperty: keyof T
    ) {
        this.textDelegate = bindProperty(receiver, textProperty)
    }


    assignEditor(component: TextEditorComponent<any>) {
        this.parentComponent = component
    }

    clear() {
        this.parentComponent?.clear()
    }

    save() {
        const component = this.parentComponent
        if(component != null){
             this.textDelegate.set(component.text())
            component.save() 
        }
    }
}