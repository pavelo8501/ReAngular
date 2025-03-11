import { HtmlTag } from "./../enums/html-tag.enum";



export type ContainerSelector  = {

  tag: HtmlTag;
  id: string;

  };

  export interface SelectorInterface{
    selector : ContainerSelector
 }
 

 const singletonSelectors = new Map<string, ContainerSelector>();

 export function createContainerSelector(tag: HtmlTag, id: string): ContainerSelector {
    const key = `${tag}-${id}`;
    if (!singletonSelectors.has(key)) {
      singletonSelectors.set(key, { tag, id });
    }
    return singletonSelectors.get(key)!;
  }