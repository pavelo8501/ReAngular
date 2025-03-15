import { ContainerSelector } from "../../common/models"

export interface InjectableI{

    selector: ContainerSelector
    angularSelector: string
    html: string

    setSource(payload: HTMLElement):void
    setSourceRawHtml(html: string):void
}