
import { bindProperty, PropertyBinding} from "./property-binding";


export class TextEditorPayload<T extends object>{

    textProperty:PropertyBinding<T, string>

    constructor(
        public receiver: T,
        public property: keyof T
    ){
        this.textProperty = bindProperty(receiver, property)  
    }


}