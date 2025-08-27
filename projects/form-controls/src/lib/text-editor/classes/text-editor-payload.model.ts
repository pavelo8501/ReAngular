
import { TextEditorComponent } from "../text-editor.component";
import { bindProperty, PropertyBinding } from "../../../../../data-helpers/src/public-api";

export class TextEditorPayload<T extends object> {

    private parentComponent?: TextEditorComponent<any>

    textProperty: PropertyBinding<T, string>

    constructor(
        public receiver: T,
        private property: keyof T
    ) {
        this.textProperty = bindProperty(receiver, property)
    }


    assignEditor(component: TextEditorComponent<any>) {
        this.parentComponent = component
    }

    clear() {
        this.parentComponent?.clear()
    }

    save() {
        this.parentComponent?.save()
    }
}