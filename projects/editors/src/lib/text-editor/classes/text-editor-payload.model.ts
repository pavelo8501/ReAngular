import { IBindableProperty } from "../../../../../data-helpers/src/lib/property-binding/bindable-property.interface";
import { bindProperty, PropertyBinding} from "../../../../../data-helpers/src/public-api";


export class TextEditorPayload<T extends object>{

    textProperty:PropertyBinding<T, string>

    constructor(
        public receiver: T,
        public property: keyof T
    ){
        this.textProperty = bindProperty(receiver, property)  
    }


}