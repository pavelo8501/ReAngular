import { Component, effect,  model, signal} from '@angular/core';
import { ContainerHandler } from './classes/handler.class';
import { ContainerPlaceholderComponent } from './components/container-placeholder/container-placeholder.component';
import { AnimatableBase, IComponentIdentity, identity, OutputMode, whenDefined} from '@pavelo8501/data-helpers';

@Component({
  selector: 'vc-animated-container',
  imports: [
    
  ],
  templateUrl: "./animated-container.component.html",
  styleUrls: ['./animated-container.component.css', "./../styles/buttons.css"],
})
export class AnimatedContainerComponent  implements IComponentIdentity {
  
   private registred:ContainerPlaceholderComponent[] = []
   private activePlaceholder?:ContainerPlaceholderComponent
  
   componentName: string = "AnimatedContainerComponent"
   outputMode:OutputMode = OutputMode.Output

   readonly containerHandler: ContainerHandler = new ContainerHandler(this)

   private manualShown = signal<boolean | null>(null)

   isVisible = model<boolean>(false)

   currentVisibility:boolean = false

   
   // isShown = computed(() => {
   //    const manual = this.manualShown();
   //    return manual !== null ? manual : this.isVisible();
   // });

   constructor(){
      effect(()=>{
         const isVisible = this.isVisible()
          if(isVisible){
            console.log(`Effect triggered visibility ${isVisible}`)
          }else{
            console.log(`Effect triggered visibility ${isVisible}`)
             this.hideContainer()
          }
      })
   }

   private getPlaceholderOfAnimatable(animatable: AnimatableBase):ContainerPlaceholderComponent | undefined{
      return this.registred.find(placeholder =>
        placeholder.animatables().some(x => x === animatable)
      )
   }

   private hideAll(butPlaceholder?: ContainerPlaceholderComponent){
      this.registred.forEach(placeholder=> placeholder.hide())
      butPlaceholder?.show()
   }

  private setShown(value: boolean) {
      this.manualShown.set(value);
  }

   registerPlaceholder(placeholder: ContainerPlaceholderComponent){
      placeholder.hide()
      this.registred.push(placeholder)
   }

   saveBtnClick(event:MouseEvent){

      whenDefined(this.activePlaceholder, placeholder=>{
         this.containerHandler.saveRequest.triggerFor(placeholder.animatables(), true, true)
       }, { source: this } )   

   }

   cancelBtnClick(event:MouseEvent){
      whenDefined(this.activePlaceholder, placeholder=>{
           this.containerHandler.saveRequest.triggerFor(placeholder.animatables(), true, true)
         placeholder.hide()
      })
      this.fadeOut()
   }

   notifiedShow(caller:AnimatableBase){
       this.popup()
       whenDefined(this.getPlaceholderOfAnimatable(caller), placeholder=>{
         this.activePlaceholder = placeholder
         this.hideAll(placeholder)
       }, identity(this) )
   }

   notifiedHide(caller:AnimatableBase){
      whenDefined(this.getPlaceholderOfAnimatable(caller), placeholder=>{
         placeholder.hide()
      })
   }

   fadeOut(){
      this.registred.forEach(x=>x.hide())
      this.setShown(false)
   }

   hideContainer(){
      console.log("Hide all trigerred")
      this.hideAll()
   }

   popup(){
      this.setShown(true)
   }

   popupShowingbyIndex(placeholderIndex: number){
      this.setShown(true)
      this.registred[placeholderIndex]?.show()
   }

   popupShowing(caller:AnimatableBase){
      this.setShown(true)
      this.notifiedShow(caller)
   }

//    toggle() {

//     const  isShown = this.isShown()
//     if(isShown){
//       this.fadeOut()
//     }else{
//       this.popup()
//     }
//   }

}
