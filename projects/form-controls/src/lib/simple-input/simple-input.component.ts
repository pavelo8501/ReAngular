import { CommonModule } from '@angular/common';
import {  Component, input, model } from '@angular/core';

@Component({
  selector: 'fc-simple-input',
  imports: [
    CommonModule
  ],
  template: `<input [name]="inputName()" class="text-input" [ngClass]="classes()"  type="text" [(value)]="inputValue"  />`,
  styleUrl: './simple-input.component.css'
})
export class SimpleInputComponent {

  inputName  = input.required<string>()

  classes = model<string[]>()
  inputValue = model<string>()





 }
