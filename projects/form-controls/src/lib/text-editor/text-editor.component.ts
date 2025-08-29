import { Component, effect, input, model, OnInit, output, signal } from '@angular/core';

import { Editor } from 'ngx-editor';
import { TextEditorPayload } from './classes/text-editor-payload.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';

import {AnimatableBase, IAnimationHandler}  from "@pavelo8501/data-helpers"

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
export class TextEditorComponent<T extends object> extends AnimatableBase implements OnInit  {

  textEditor: Editor = new Editor()
  disabled = signal<boolean>(false)
  text = model<string>("")

  payload = model<TextEditorPayload<T> | undefined>(undefined)

  onSaving = output<string>()
  onPayloadSaving = output<{receiver: T; value: string }>()


  animationHandler = model<IAnimationHandler>()


  constructor(){

    super()

    effect(
      ()=>{
          const payload = this.payload()
          if(payload != undefined){
            this.disabled.set(false)
            this.text.set(payload.textDelegate.get())
            payload.assignEditor(this)
          }
      }
    )
  }

  ngOnInit(): void {

  }


  saveBtnClick(event:MouseEvent){
      this.save()

      const handler = this.animationHandler()
      if(handler != undefined){
        handler.hide(this)
      }else{
        console.warn("Handler is not there")
      }
  }

  cancelBtnClick(event:MouseEvent){


  }

  onAnimationContainerReady(handler: IAnimationHandler): void {
    console.log("Received animation handler in textEditor")
    console.log(handler)
    this.animationHandler.set(handler)
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

        payload.textDelegate.set(textToSave)
        this.onPayloadSaving.emit( { receiver:  payload.receiver, value: payload.textDelegate.get() })
    }
  }
  
}
