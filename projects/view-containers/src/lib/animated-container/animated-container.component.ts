import {  AfterViewInit, Component, contentChildren, effect,  output,  signal} from '@angular/core';
import { ContainerHandler } from './classes/handler.class';
import { ContainerPlaceholderComponent } from './components/container-placeholder/container-placeholder.component';
import { AnimatableBase} from '@pavelo8501/data-helpers';


@Component({
  selector: 'vc-animated-container',
  imports: [
    
  ],
  templateUrl: "./animated-container.component.html",
  styleUrl: './animated-container.component.css',
})
export class AnimatedContainerComponent implements AfterViewInit  {
  
   placeholders = contentChildren<ContainerPlaceholderComponent>(ContainerPlaceholderComponent)
   animatable = contentChildren<AnimatableBase>(AnimatableBase)

   readonly  containerHandler: ContainerHandler = new ContainerHandler(this)
   isShown = signal(true);
  
   onHandlerReady = output<ContainerHandler>()
   
   constructor(){

    effect(
      ()=>{
        this.onHandlerReady.emit(this.containerHandler)
        const placeHolders = this.placeholders()
        console.log("Placeholders resolved", placeHolders.length)

        placeHolders.forEach(placeholder=>{
            placeholder.resolveHostingContainer(this)
        })

        const animatable = this.animatable()
        console.log("Animatable resolved", animatable.length)

      })
   }


   private getPlaceholderOfAnimatable(animatable: AnimatableBase):ContainerPlaceholderComponent | undefined{
      return this.placeholders().find(placeholder =>
        placeholder.animatable().some(x => x === animatable)
      )
   }

   private hideAllButThis(placeholder: ContainerPlaceholderComponent){
      this.placeholders().filter(p => p !== placeholder).forEach(p => p.hide());
   }

   ngAfterViewInit(): void {

   }

   notifiedShow(caller:AnimatableBase){
       console.log("notifiedShow from")
       console.log(caller)
       this.getPlaceholderOfAnimatable(caller)?.let(placeholder =>{
          this.hideAllButThis(placeholder)
       })
   }

   notifiedHide(caller:AnimatableBase){
      this.getPlaceholderOfAnimatable(caller)?.let(placeholder =>{
           placeholder.hide()
      })
   }

   fadeOut(){
      this.placeholders().forEach(x=>x.hide())
      this.isShown.set(false)
   }


   popup(){
      this.isShown.set(true)
   }

   popupShowingbyIndex(placeholderIndex: number){
      this.isShown.set(true)
      this.placeholders()[placeholderIndex].show()
   }

   popupShowing(caller:AnimatableBase){
      this.isShown.set(true)
      this.notifiedShow(caller)
   }


   toggle() {
    const  isShown = this.isShown()
    if(isShown){
      this.fadeOut()
    }else{
      this.popup()
    }
  }

}
