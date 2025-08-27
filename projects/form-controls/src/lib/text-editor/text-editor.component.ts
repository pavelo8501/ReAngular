import { Component, effect, input, model, OnInit, output, signal } from '@angular/core';

import { Editor } from 'ngx-editor';
import { TextEditorPayload } from './classes/text-editor-payload.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';

@Component({
  selector: 'fc-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.css',
  imports: [
    NgxEditorModule,
    CommonModule,
    FormsModule
  ]
})
export class TextEditorComponent<T extends object> implements OnInit {

  textEditor: Editor = new Editor()
  disabled = signal<boolean>(false)
  text = model<string>("")

  payload = model<TextEditorPayload<T> | undefined>(undefined)

  onSaving = output<string>()
  onPayloadSaving = output<{receiver: T; value: string }>()

  constructor(){
    effect(
      ()=>{
          const payload = this.payload()
          if(payload != undefined){
            this.disabled.set(false)
            this.text.set(payload.textProperty.get())
            payload.assignEditor(this)
          }
      }
    )
  }

  ngOnInit(): void {

  }

  clear(){
    this.payload.set(undefined)
    this.text.set("")
    this.disabled.set(true)
  }

  save(){
    const textToSave = this.text()
    this.onSaving.emit(textToSave)
    const payload = this.payload()
    if(payload != undefined){
        payload.textProperty.set(textToSave)
        this.onPayloadSaving.emit( { receiver:  payload.receiver, value: payload.textProperty.get() })
    }
  }
  
}
