import { Component, effect, input, model } from '@angular/core';
import { ActionData } from './classes/action-data.model';

@Component({
  selector: 'fc-action-button',
  imports: [

  ],
  templateUrl: "./action-button.component.html",
  styleUrl: './action-button.component.css',
})
export class ActionButtonComponent<T> {


  id = input<number>(0)
  caption = model<string>("Action Button")
  qualifiedId: string = `${this.id()}_action_button`
  actionItem = model<ActionData<T>>()

  constructor() {
    effect(() => {
      const actionItem = this.actionItem()
      if (actionItem) {
        this.caption.set(actionItem.caption)
      }
    })
  }

  onClick() {
    const actionData = this.actionItem()
    if (actionData) {
      actionData.callback?.(actionData.data)
    } else {
      console.warn(`Action button ${this.qualifiedId} action net set`)
    }
  }

}
