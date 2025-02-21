import { Component, input, model, signal, output, computed } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { ActivationState } from '../classes/enums/activation-state';

@Component({
    selector: 'floating-checkbox',
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './floating-checkbox.component.html',
    styleUrl: './floating-checkbox.component.css'
})
export class FloatingCheckboxComponent {

  ActivationState = ActivationState
  
  id = input<string>()
  computedId = computed(() => this.id || `input-checkbox-${Math.random().toString(36).substring(2, 9)}`);

  isFocused = signal<boolean>(false)
  active = signal<boolean>(false)

  value = model<boolean>(false)

  state = computed<ActivationState>(()=>{
    if(this.isFocused() == true){
      return ActivationState.ACTIVE
    }else{
      return ActivationState.INACTIVE
    }
  })
 
  inputValueChange = output<boolean>()

  placeholder = input<string>()
  placeholderClass = input<string>()
  placeholderTextClass = input<string>()

  errorMessage = input<string>()
  hasErrors = computed<boolean>(()=>{
      if(this.formControl!=undefined){
          if(this.formControl?.touched && this.formControl?.invalid){
            return true
          }else{
            return false
          }
      }else{
        return false
      }
    })

    formControl : FormControl | undefined = undefined

    onCheckedChange(event: any) {
      const check : boolean = event.target.checked
      this.value.set(check)
      this.active.set(true)
    }

    handleOnFocus(): void {
      this.isFocused.set(true)
    }
  
    handleLostFocus(): void {
      console.log("Checkbox handleLostFocus")
      this.isFocused.set(false)
    }

}
