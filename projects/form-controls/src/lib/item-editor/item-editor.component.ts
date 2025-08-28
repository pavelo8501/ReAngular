import { Component, effect, model, output, signal } from '@angular/core';
import {EditorItemComponent} from './components/editor-item/editor-item.component'
import {EditorPayload, IEditorItem } from './classes/private-index';
import { Animatable, IAnimationHandler } from '@pavelo8501/data-helpers';

@Component({
  selector: 'fc-item-editor',
  imports: [
    EditorItemComponent
  ],
  templateUrl: './item-editor.component.html',
  styleUrl: './item-editor.component.css'
})

export class ItemEditorComponent<P,  T extends object> extends Animatable{

    payload = model<EditorPayload<P, T> | undefined>(undefined)

    items = model<IEditorItem[]>([])

    disabled = signal<boolean>(false)

    onDeleted = output<P>()
    onSave = output<P>()
    onNew = output()

    animationHandler = model<IAnimationHandler>()

  constructor(){
    super()
    effect(
      ()=>{
        const payload = this.payload()
        if(payload != undefined){
           payload.setEditorComponent(this)
           this.items.set(payload.items) 
        }
      }
    )
  }

  onAnimationContainerReady(handler: IAnimationHandler): void {
    console.log("Received animation handler in textEditor")
    console.log(handler)
    this.animationHandler.set(handler)
  }


  delete(item: IEditorItem){
    const payload =  this.payload()
    if(payload != undefined){
       payload.remove(item)
       this.payload.set(payload)
       this.onDeleted.emit(payload.source)
    }
  }

  addNew(){
    this.onNew.emit()
  }

  save(item: IEditorItem) {
    const editorPayload = this.payload()
    if( editorPayload != undefined){
        this.onSave.emit(editorPayload.source);
    }
  }

  clear(){
    console.log("clear in component")
    this.disabled.set(true)
    
  }
}
