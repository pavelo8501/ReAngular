import { bindProperty, ComponentHandlerBase, PropertyBinding } from "@pavelo8501/data-helpers";
import { ListEditorComponent } from "../list-editor.component";
import { IEditorItem } from "./editor-item.interface";
import { ListItem } from "./list.item-model";


export class ListEditorHandler<T extends object, I extends object> extends ComponentHandlerBase<T, I[]> {

    // editing: boolean = false;
    // private editingMap = new WeakMap<T, boolean>();

    items: IEditorItem[] = [];
    listDelegate: PropertyBinding<T, I[]>
    listItems: ListItem<I>[] = []

    // private arrayKey: keyof P;

    // private hostingComponent?:ItemEditorComponent<T>

    constructor(
        receiver: T,
        private listPropery: keyof T,
        public contentProperty: keyof I
    ){
        super(receiver)
        this.listDelegate = bindProperty(receiver, listPropery)

        // // Extract models from source using arrayKey
        // const models: T[] = source[arrayKey] as T[];
        // if (!Array.isArray(models)) {
        //     throw new Error(`Property ${String(arrayKey)} is not an array on source`);
        // }

        // this.arrayKey = arrayKey;
        // this.items = models.map(m => this.createProxy(m));
    }

    // private createProxy(model: T): IEditorItem {
    //     return new Proxy(model as any, {
    //         get: (target, prop) => {
    //             if (prop === "text") return target[this.key];
    //             if (prop === "editing") return this.editingMap.get(target) ?? false;
    //             return target[prop];
    //         },
    //         set: (target, prop, value) => {
    //             if (prop === "text") target[this.key] = value;
    //             else if (prop === "editing") this.editingMap.set(target, value);
    //             else target[prop] = value;
    //             return true;
    //         },
    //     }) as IEditorItem;
    // }

    // setEditorComponent(component: ItemEditorComponent<P, T>){
    //     this.hostingComponent = component
    // }

    // addItem(item: T) {

    //     console.log("Adding new item")

    //     this.items.push(this.createProxy(item));
    //     (this.source[this.arrayKey] as T[]).push(item)
    // }

    // remove(item: IEditorItem) {
    //     const index = this.items.indexOf(item);
    //     if (index >= 0) {
    //         this.items.splice(index, 1);
    //         (this.source[this.arrayKey] as T[]).splice(index, 1);
    //     }
    // }

    // save(): P {
    //     return this.source;
    // // }

    // clear(){

    //     console.log("clear")
    //     this.items = []
    //     this.editing = false
    //     this.hostingComponent?.clear()
    // }
}