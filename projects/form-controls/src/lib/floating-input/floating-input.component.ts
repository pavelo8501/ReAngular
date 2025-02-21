import { Component, OnInit, OnDestroy, input, model,  output, signal, computed, effect } from '@angular/core';

import { ControlState } from '../classes/enums/control-state';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule ,ValidationErrors, FormControl } from '@angular/forms';
import { ActivationState } from '../classes/enums/activation-state';
import { Subject, takeUntil } from 'rxjs';
import { InputType } from '../classes/enums/input-type';

@Component({
    selector: 'floating-input',
    imports: [
        CommonModule,
        ReactiveFormsModule,
    ],
    templateUrl: './floating-input.component.html',
    styleUrl: './floating-input.component.css'
})
export class FloatingInputComponent implements OnInit, OnDestroy{

  ControlState = ControlState
  ActivationState = ActivationState
  InputType = InputType

  control = input<FormControl>(new FormControl())
  inputType = input<InputType>(InputType.TEXT)

  controlDirty = signal<boolean>(false)
  controlInvalid = signal<boolean>(false)
  controlTouched = signal<boolean>(false)

  value = model<string|undefined>()

  private get effectiveValue():string{
    return this.control().value ?? ""
  }
  isFocused = signal<boolean>(false);

  id = input<string>()
  computedId = computed(() => this.id() || `input-text-${Math.random().toString(36).substring(2, 9)}`);
  name = input<string>(this.computedId())

  state = computed<ActivationState>(()=>{
    if(this.effectiveValue.length > 0){
      return ActivationState.COMPLETE
    }else{
      if(this.isFocused() == true){
        return ActivationState.ACTIVE
      }else{
        return ActivationState.INACTIVE
      }
    }
  })
 
  requestControl = output<(control:FormControl)=>void>();

  placeholderLabelClass = input<string>("")
  placeholder = input<string>()
 
  errorMessage = input<string>("Control has errors")
  hasErrors = computed<boolean>(()=>{
    if((this.controlDirty()) && this.controlInvalid()){
      console.log("has errors")
      return true
    }else{
      return false
    }
  })

  errors = signal<ValidationErrors|null>(null) 
  
  onSubmitValues = input<Subject<boolean>>()
  private unsubscribe$ = new Subject<void>();

  constructor(){
    
    effect( ()=>{
      const ctrl = this.control()
      if(ctrl){
        this.isFocused()
        this.controlDirty.set(ctrl.dirty);
        this.controlInvalid.set(ctrl.invalid)
        this.controlTouched.set(ctrl.touched)
      }
    })
  }

  printFormControlStats(){
    console.log(`Printing FloatInput ${this.name()} formControl Stats`)
    console.log(`Touched ${this.control()?.touched}`)
    console.log(`Dirty ${this.control()?.dirty}`)
    console.log(`Invalid ${this.control()?.invalid}`)
    console.log(`Errors ${this.control()?.errors}`)
    console.log(`Value ${this.control()?.value}`)
  }

  ngOnInit(): void {
    this.onSubmitValues()?.pipe(takeUntil(this.unsubscribe$)).subscribe(event => {
      if(event == true){
        this.submitValue();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  submitValue(){
    console.log("SUBMITTING VALUE")
    console.log(`Setting ${this.effectiveValue} to ${this.value()}`)
    this.value.set(this.effectiveValue)
  }

  handleOnFocus(): void {
    this.isFocused.set(true)
  }

  handleLostFocus(): void {
    this.isFocused.set(false)
  }

  onInputChange(event: Event) {
    console.log(`onInputChange ${event}`)
    const inputValue =  (event.target as HTMLInputElement).value
    if(inputValue != null){
      this.control().setValue(inputValue)
      if(this.control().valid){
        this.value.set(inputValue)
      }else{
        this.value.set("")

      }
    }
  }
}
