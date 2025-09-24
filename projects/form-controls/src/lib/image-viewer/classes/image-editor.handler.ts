import { ComponentHandlerBase } from "@pavelo8501/data-helpers";
import { ImageDataEditorComponent } from "./../components/image-data-editor/image-data-editor.component";


export class ImageEditorHandler<T extends object> extends ComponentHandlerBase<T>  {

    constructor(
        receiver: T
    ){
        super(receiver)
    }
  
}