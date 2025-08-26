import { Component, effect, input, model, OnInit, output, signal } from '@angular/core';
import { Editor } from 'ngx-editor';
import { TextEditorPayload } from './classes/text-editor-payload.model';

@Component({
  selector: 'ed-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.css',
  standalone: false
})
export class TextEditorComponent<T extends object> implements OnInit {

  textEditor: Editor = new Editor()
  enabled = signal<boolean>(false)
  text = model<string>("")

  editorPayload = input<TextEditorPayload<T>| undefined>(undefined)

  onSaving = output<string>()

  constructor(){

    effect(
      ()=>{
          const payload = this.editorPayload()
          if(payload != undefined){
            this.text.set(payload.textProperty.get())
          }
      }
    )

  }


  ngOnInit(): void {
    
  }

  save(){
    this.onSaving.emit(this.text())
  }
  
}
