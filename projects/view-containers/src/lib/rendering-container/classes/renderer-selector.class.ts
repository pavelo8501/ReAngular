import { HtmlTag } from "../../common/enums";
import { ContainerSelector, createContainerSelector } from "../../common/models";
import { InjectableI } from "../interfaces/injectable.interface";


// export type  GroupedSelectorEntry = {
//    entries: {lang: string, selectorEntries: SelectorEntry[] }
// }

// export type  SelectorEntry = {

//     selector : ContainerSelector, 
//     id:number,
//     classes: {key:number, value:string}[], 
//         html:string,
//     data:any,
//     childEntries: SelectorEntry[] 
// }

export class SelectorGroup{

    readonly lang_id:number	
    readonly  selectors: RendererSelector<any>[]

    constructor(lang_id:number, selectors: RendererSelector<any>[]){
        this.lang_id = lang_id,
        this.selectors = selectors
    }
}


export interface SelectableI<T>{

    selector: ContainerSelector,
    angularSelector: string,
    classList: {key:number, value:string}[]
    readonly dataModel : T
    childSelectors: RendererSelector<any>[]
}

export class RendererSelector<T extends InjectableI> implements SelectableI<T> {

    static createSelector<T extends InjectableI>(
        selector: ContainerSelector, 
        angularSelector: string, 
        html: string, 
        dataModel: T,
        ):RendererSelector<T>{
        return new RendererSelector(selector, angularSelector, html, dataModel)
    }

    public originalData:any

    public id: number =0
    public lang:string ="lv"

    public  childSelectors: RendererSelector<any>[]
    
    get name():string{
        return `${this.selector.tag}|${this.selector.id}`
    }
    get personalName():string{
        return `RendererSelector[${this.name}]`
    }

    get classList(): {key:number, value:string}[]{
        return this.dataModel.class_list
    }

    get content():string{
        return this.dataModel.content
    }

    private subscriptions: { onSelectors: ((childSelectors: RendererSelector<any>[]) => void) | undefined}
    constructor(
        public selector: ContainerSelector,
        public angularSelector: string,
        public html : string,
        public readonly dataModel: T
    ) {
      
        this.subscriptions = {
            onSelectors:  undefined 
        };
        this.childSelectors = []

        console.log("HOW MANY THERE CHILD ON DATA MOSL ????")
        console.log(dataModel)
    }

    exractDataSource():T{
       const model =  this.dataModel
       //const childModels = this.childSelectors.map(x=>x.exractDataSource())
       return model
    }


    // addChildSelectors(selectors: RendererSelector<any>[]) {
    //     let existentUpdated = 0
    //     let newEntries = 0
    //     console.log(`Receiving selectors  ${selectors.length} `) 
    //     console.log(selectors)
    //     console.log("----------------")
    //     selectors.forEach(x => {
    //         const existingSelector = this.childSelectors.find(f => f.selector == x.selector)
    //         if (existingSelector) {
    //             existentUpdated++
    //             existingSelector.html = x.html
    //         } else {
    //             newEntries++
    //             this.childSelectors.push(x)
    //         }
    //     })
    //     if (this.subscriptions) {
    //         if(this.subscriptions.onSelectors){
    //             this.subscriptions.onSelectors(this.childSelectors)
    //         }
    //     } else {
    //         console.warn(`Child selectors updated from within but nobidy listens ${this.selector.tag}| ${this.selector.id}`)
    //     }
    // }

    getChild(onUpdate: ((childSelectors: RendererSelector<any>[]) => void) | undefined = undefined): RendererSelector<any>[]{
        if (onUpdate) {
            if (this.subscriptions) {
                this.subscriptions.onSelectors = onUpdate
            } else {
                console.warn(`Trying to subscribe onSelectors callback but this.subscriptions is undefined in RendererSelector ${this.selector.tag}|${this.selector.id}`)
            }
        }
        return this.childSelectors
    }
}
