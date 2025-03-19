import { HtmlTag } from "../../common/enums";
import { ContainerSelector, createContainerSelector } from "../../common/models";


export type  GroupedSelectorEntry = {
   entries: {lang: string, selectorEntries: SelectorEntry[] }
}

export type  SelectorEntry = {

    selector : ContainerSelector, 
    id:number,
    classes: {key:number, value:string}[], 
        html:string,
    data:any,
    childEntries: SelectorEntry[] 
}

export class SelectorGroup{
    constructor(
        public lang:string,
        public selectors: RendererSelector[]
    ){

    }
}


export interface SelectableI{

    selector: ContainerSelector,
    angularSelector: string,
    classList: {key:number, value:string}[]
    childSelectors: RendererSelector[]
}

export class RendererSelector implements SelectableI {


    static createSelector(
        selector: ContainerSelector, 
        angularSelector: string, 
        classList:{key:number,value:string}[],
        html: string, 
        dataModel: any,
        ):RendererSelector{
        return new RendererSelector(selector, angularSelector, classList, html, dataModel)
    }


    public originalData:any

    public id: number =0
    public lang:string ="lv"

    childSelectors: RendererSelector[] = []
    public html: string = ""
    public classList:{key:number, value: string}[] = []

    get name():string{
        return `${this.selector.tag}|${this.selector.id}`
    }
    get personalName():string{
        return `RendererSelector[${this.name}]`
    }

    private dataModel: any
  

    private subscriptions: { onSelectors: ((childSelectors: RendererSelector[]) => void) | undefined}
    constructor(
        public selector: ContainerSelector,
        public angularSelector: string,
        classList: {key:number, value:string}[],
        content: string,
        dataModel: any
    ) {
        this.classList = classList
        this.dataModel = dataModel


        this.subscriptions = {
            onSelectors:  undefined 
        };
        if (content) {
            this.html = content
        }
    }

    getDataModel():any{
        return this.dataModel
    }

    addChildSelectors(selectors: RendererSelector[]) {
        let existentUpdated = 0
        let newEntries = 0
        console.log(`Receiving selectors  ${selectors.length} `) 
        console.log(selectors)
        console.log("----------------")
        selectors.forEach(x => {
            const existingSelector = this.childSelectors.find(f => f.selector == x.selector)
            if (existingSelector) {
                existentUpdated++
                existingSelector.html = x.html
            } else {
                newEntries++
                this.childSelectors.push(x)
            }
        })
        if (this.subscriptions) {
            if(this.subscriptions.onSelectors){
                this.subscriptions.onSelectors(this.childSelectors)
            }
        } else {
            console.warn(`Child selectors updated from within but nobidy listens ${this.selector.tag}| ${this.selector.id}`)
        }
    }

    getChild(onUpdate: ((childSelectors: RendererSelector[]) => void) | undefined = undefined): RendererSelector[]{
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
