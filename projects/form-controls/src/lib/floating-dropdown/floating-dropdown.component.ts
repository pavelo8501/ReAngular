import { Component, OnInit, OnDestroy, signal, output, input, computed, model } from '@angular/core';
import { ReactiveFormsModule,FormsModule, FormControl } from '@angular/forms';
import { DropdownOption } from './classes/dropdown-option';
import { ActivationState } from '../classes/enums/activation-state';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'floating-dropdown',
    imports: [
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './floating-dropdown.component.html',
    styleUrl: './floating-dropdown.component.css'
})
export class FloatingDropdownComponent implements OnInit, OnDestroy {

  ActivationState = ActivationState

  id = input<string>()
  computedId = computed(() => this.id() || `input-${Math.random().toString(36).substring(2, 9)}`);

  value = model<string>("")

  selectedValue = model<string>();
  control = input<FormControl>()

  isFocused = signal<boolean>(false);
  isActive =  computed<boolean>(()=>{
    if(this.selectedValue() !=  undefined ){
      return true
    }else{
      return false
    }
  })

  private get effectiveValue():string{
    const ctrl = this.control()
    if(ctrl != undefined){
      return ctrl.value
    }else{
      return this.selectedValue()?? ""
    }
  }

  state = computed<ActivationState>(()=>{
      console.log(`Effective Value ${this.effectiveValue}`)
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

  

  showEmptyOption = input<boolean>()
  options = input<DropdownOption[]>([])

  inputValueChange = output<string>()

  placeholderLabelClass = input<string>("")
  placeholder = input<string>()
  placeholderClass = input<string>()
  placeholderTextClass = input<string>()

  errorMessage = input<string>()


   onSubmitValues = input<Subject<boolean>>()
   private unsubscribe$ = new Subject<void>();

  onChange(event:any){
    console.log(event)
    console.log(this.selectedValue())
  
  }

  ngOnInit(): void {
    const emptyOption = this.options().find(option => option.value == "")
    if(emptyOption != undefined){
      emptyOption.label = this.placeholder()?? "-"
      this.selectedValue.set("")
    }

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
    console.log(`Setting ${this.effectiveValue}  to ${this.value()}`)
    this.value.set(this.effectiveValue)
  }

  handleOnFocus(): void {
    this.isFocused.set(true)
  }

  handleLostFocus(): void {
    this.isFocused.set(false)
  }

}
