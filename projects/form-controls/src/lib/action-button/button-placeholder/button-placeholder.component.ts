import { Component, input, model } from '@angular/core';
import { ActionButtonComponent } from './../action-button.component';
import { ActionData, Orientation } from './../classes';

@Component({
  selector: 'fc-button-placeholder',
  imports: [
    ActionButtonComponent,
],
  templateUrl: "./button-placeholder.component.html",
  styleUrl: './button-placeholder.component.css'
})

export class ButtonPlaceholderComponent<T> {

  Orientation = Orientation

  data = model<ActionData<T>[]>([])

  testModel = model<string>()

  orientation = input<Orientation>(Orientation.Vertical)


 }
