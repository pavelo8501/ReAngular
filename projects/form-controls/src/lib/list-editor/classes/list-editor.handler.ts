import { bindProperty, ComponentHandlerBase, PropertyBinding } from "@pavelo8501/data-helpers";
import { IEditorItem } from "./editor-item.interface";
import { ListItem } from "./list.item-model";


export class ListEditorHandler<T extends object, I extends object> extends ComponentHandlerBase<T> {

    
    items: IEditorItem[] = [];
    listDelegate: PropertyBinding<T, I[]>
    listItems: ListItem<I>[] = []

    constructor(
        receiver: T,
        private listPropery: keyof T,
        public contentProperty: keyof I
    ){
        super(receiver)
        this.listDelegate = bindProperty(receiver, listPropery)
    }

    applyChanges(){
        this.receiver
            
    }

}