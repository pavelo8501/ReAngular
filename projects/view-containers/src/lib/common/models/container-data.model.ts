import { HtmlTag } from "../enums";
import { ContainerSelector, SelectorInterface, createContainerSelector } from "./container-selector.model";

export interface SectionItemDataInterface{
    name:string
    content:string
    tag: HtmlTag
    classes: string[]
    meta_tag_type : string |  undefined
    meta_tag_content : string |  undefined
}


export class SectionItemData implements SectionItemDataInterface , SelectorInterface{


    static asUndefined(htmlTag: HtmlTag):SectionItemData{
       const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36)}`;
       const src: SectionItemDataInterface = {
            name: "undefined" , 
            content:"CONTENT MISSING",  
            tag: htmlTag,
            classes:[], 
            meta_tag_type:"", 
            meta_tag_content:""
        }
        const undefinedItem = new SectionItemData(src)
        undefinedItem.id =  undefinedItem.id + generateUniqueId()
        return  undefinedItem
    }


    selector: ContainerSelector

    id:string

    name:string
    content:string
    tag: HtmlTag
    classes: string[]
    meta_tag_type : string |  undefined
    meta_tag_content : string |  undefined


    constructor(src: SectionItemDataInterface){
        this.name =  src.name
        this.content =  src.content
        this.tag =  src.tag
        this.classes =  src.classes
        this.meta_tag_type =  src.meta_tag_type
        this.meta_tag_content = src.meta_tag_content
        this.id = this.name

        this.selector = createContainerSelector(src.tag, src.name)
    }
}

export interface SectionDataInterface  {

    tag: HtmlTag
    name:string
    content:string
    classes: string[]
    json_ld:string|undefined
    meta_tag_type : string |  undefined
    meta_tag_content : string |  undefined
    section_items: SectionItemDataInterface[]
}


export class SectionData implements SelectorInterface , SectionDataInterface{

    selector: ContainerSelector;
    name: string
    content:string
    tag: HtmlTag
    classes: string[]
    json_ld:string|undefined
    meta_tag_type : string |  undefined
    meta_tag_content : string |  undefined


    section_items: SectionItemData[] = []

    constructor(src : SectionDataInterface){
        this.tag = src.tag
        this.content = src.content
        this.name = src.name
        this.json_ld = src.json_ld
        this.classes = src.classes
        this.meta_tag_type = src.meta_tag_type
        this.meta_tag_content = src.meta_tag_content

        this.selector = createContainerSelector(src.tag, src.name)

        src.section_items.forEach(x=>{ this.section_items.push(new SectionItemData(x))})
    }

}