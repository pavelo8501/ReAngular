import { Component, effect, input, model } from '@angular/core';
import { ActionData } from './classes/action-data.model';

@Component({
  selector: 'fc-action-button',
  imports: [

  ],
  templateUrl: "./action-button.component.html",
  styleUrls: ['./action-button.component.css', "./../../../styles/buttons.css"],
})
export class ActionButtonComponent<T> {


  id = input<number>(0)

  qualifiedId: string = `${this.id()}_action_button`

  actionItem = model<ActionData<T>>()
  

  caption:string = ""


  constructor() {

    effect(() => {
      const actionItem = this.actionItem()
      if (actionItem) {
        this.caption = actionItem.caption
      }
    })
  }

  onClick() {

    const actionData = this.actionItem()

    if (actionData) {
        actionData.callback?.(actionData.data)
    } else {
      console.warn(`Action button ${this.qualifiedId} action not set`)
    }
  }

}
