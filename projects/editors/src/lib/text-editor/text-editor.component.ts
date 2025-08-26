import { Component, effect, input, model, OnInit, output, signal } from '@angular/core';
import { Editor } from 'ngx-editor';
import { TextEditorPayload } from './classes/text-editor-payload.model';
import { NgxEditorModule } from 'ngx-editor';

@Component({
  selector: 'ed-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.css',
  imports: [
    NgxEditorModule
  ]
})
export class TextEditorComponent<T extends object> implements OnInit {

  textEditor: Editor = new Editor()
  enabled = signal<boolean>(false)
  text = model<string>("")

  payload = model<TextEditorPayload<T> | undefined>(undefined)

  onSaving = output<string>()

  constructor(){

    // effect(
    //   ()=>{
    //       const payload = this.payload()
    //       if(payload != undefined){
    //         this.text.set(payload.textProperty.get())
    //       }
    //   }
    // )

  }


  ngOnInit(): void {

  }

  save(){
    this.onSaving.emit(this.text())
  }
  
}
