

import { bindProperty, ComponentHandlerBase, PropertyBinding } from "@pavelo8501/data-helpers";


export class TextEditorHandler<T extends object> extends ComponentHandlerBase<T, string> {

    textDelegate: PropertyBinding<T, string>

    constructor(
        receiver: T,
        textProperty: keyof T,
    ) {
        super(receiver)
        this.textDelegate = bindProperty(receiver, textProperty)
    }
}