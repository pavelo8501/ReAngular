import { Component, Input, input, model, Signal, signal, ModelSignal } from '@angular/core';

@Component({
  selector: 'fc-test',
  imports: [],
  templateUrl: './test.html',
  styleUrl: './test.css'
})
export class TestComponent {
  @Input()  someInput:string = ""
  testInput = input<string>()
  testInputSignal : Signal<string> = signal<string>("ssss")
  testModel: ModelSignal<string> = model<string>("defaulValue")

}
