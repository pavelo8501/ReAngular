import { HtmlTag } from "../../common/enums";
import { ContainerSelector } from "../../common/models";


export class RendererSelector {

    private childSelectors: RendererSelector[] = []
    public html: string = ""

    get name():string{
        return `${this.selector.tag}|${this.selector.id}`
    }
    get personalName():string{
        return `RendererSelector[${this.name}]`
    }
    get classList():string[]{
        return this.classes.map(x=>x.value)
    }

    private subscriptions: { onSelectors: ((childSelectors: RendererSelector[]) => void) | undefined}
    constructor(
        public selector: ContainerSelector,
        public angularSelector: string,
        private classes: {key:number, value:string}[],
        html: string | undefined = undefined
    ) {
        this.subscriptions = {
            onSelectors:  undefined 
        };
        if (html) {
            this.html = html
        }
    }

    addChildSelectors(selectors: RendererSelector[]) {
        let existentUpdated = 0
        let newEntries = 0
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