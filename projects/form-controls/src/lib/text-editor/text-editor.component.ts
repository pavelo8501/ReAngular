import { Component, effect, forwardRef, input, model, OnInit, output, signal } from '@angular/core';

import { Editor, NgxEditorModule } from 'ngx-editor';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TextEditorHandler } from './classes/text-editor.handler';

import { ANIMATABLE_ITEM, AnimatableBase, IAnimationHandler, identity, whenDefined} from "@pavelo8501/data-helpers"

@Component({
  selector: 'fc-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css', "./../styles/buttons.css"],
  imports: [
    NgxEditorModule,
    CommonModule,
    FormsModule
  ],
  providers: [{ provide: ANIMATABLE_ITEM, useExisting: forwardRef(() => TextEditorComponent) }]
})
export class TextEditorComponent<T extends object> extends AnimatableBase{

  componentName: string = "TextEditorComponent"

  textEditor: Editor = new Editor()
  disabled = signal<boolean>(false)
  text = model<string>("")

  textEditorHandler = model<TextEditorHandler<T>>()

  onSaving = output<string>()

  onPayloadSaving = output<{ receiver: T; value: string }>()

  onSave = output<{ receiver: T; value: string }>()
  onCancel = output<{ receiver: T; value: string }>()

  constructor() {
    super()
    effect(() =>{
        this.disabled.set(false)
        whenDefined(this.textEditorHandler(), handler=>{
          handler.provideComponent(this)
          this.handleAnimation()
           const inputText = handler.textDelegate.get()
           this.text.set(inputText)
        })
      }
    )
  }

  private handleAnimation(){
    whenDefined(this.animationHandler, animationHandler=>{
       animationHandler.subscribeSaveRequest(this, this.onSaveRequest)
       animationHandler.subscribeCancelRequest(this, this.onCancelRequest)
       animationHandler.show(this)
    }, identity(this))
  }

  private onSaveRequest = () => {
    this.save()
  }

  private onCancelRequest = () => {
    whenDefined(this.animationHandler, animationHandler => {
      animationHandler.hide(this)
    });
    this.clear()
  }

  override provideAnimationHandler(handler: IAnimationHandler): void {
    this.animationHandler = handler
  }

  override applyChanges(): void {
      
  }

  clear() {
    console.log("claer")

    this.text.set("")
    this.disabled.set(true)
  }

  save() {
     whenDefined(this.textEditorHandler(), handler => {
      const textToSave = this.text();
      handler.provideValueToSave(textToSave);
      this.onSaving.emit(textToSave)
    });
   // this.clear()
  }


  saveBtnClick(event:MouseEvent){

    whenDefined(this.textEditorHandler(), handler => {
      const textToSave = this.text();
      this.onSave.emit({ receiver: handler.receiver, value:textToSave})
    });
  }

  cancelBtnClick(event:MouseEvent){
    const textToSave = this.text();
    whenDefined(this.textEditorHandler(), handler => {
       this.onCancel.emit({receiver: handler.receiver, value:textToSave})
    })
  }

}
