import { Component, computed, input, model, OnInit, output, signal } from '@angular/core';
import {EditorItemComponent} from './components/editor-item/editor-item.component'
import {EditorPayload, IEditorItem } from './classes/private-index';

@Component({
  selector: 'fc-item-editor',
  imports: [
    EditorItemComponent
  ],
  templateUrl: './item-editor.component.html',
  styleUrl: './item-editor.component.css'
})

export class ItemEditorComponent<P,  T extends object> implements OnInit {


  payload  = model<EditorPayload<P, T> | undefined>(undefined)


  items =computed<IEditorItem[]>(
    ()=>{
      return this.payload()?.items as IEditorItem[] ??[]
    }
  )

  onDeleted = output<P>()
  onSave = output<P>()
  onNew = output()


  ngOnInit(){

    console.log("ngOnInit")
    console.log(this.payload())

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

}
