import { HtmlTag } from '@pavelo8501/data-helpers'


export type ContainerSelector  = {
  tag: HtmlTag;
  id: string;
  key:string
  };

 export interface SelectorInterface{
    selector : ContainerSelector
 }
 
 const singletonSelectors = new Map<string, ContainerSelector>();

 export function createContainerSelector(tag: HtmlTag, id: string): ContainerSelector {
    const key = `${tag}|${id}`;
    if (!singletonSelectors.has(key)) {
      singletonSelectors.set(key, { tag, id, key });
    }
    return singletonSelectors.get(key)!;
  }
