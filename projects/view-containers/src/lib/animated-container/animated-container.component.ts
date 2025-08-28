import {  AfterViewInit, Component, ContentChildren, contentChildren, effect, model, output, QueryList, signal, viewChildren } from '@angular/core';
import { ContainerHandler } from './classes/handler.class';
import { Animatable } from '@pavelo8501/data-helpers';
import { ContainerPlaceholderComponent } from './components/container-placeholder/container-placeholder.component';

@Component({
  selector: 'vc-animated-container',
  imports: [],
  templateUrl: "./animated-container.component.html",
  styleUrl: './animated-container.component.css',
})
export class AnimatedContainerComponent implements AfterViewInit  {
  
   placeholders = contentChildren<ContainerPlaceholderComponent>(ContainerPlaceholderComponent)

   @ContentChildren(Animatable) animatables!: QueryList<Animatable>;


  readonly  containerHandler: ContainerHandler = new ContainerHandler(this)

  isShown = signal(false);
  
  onHandlerReady = output<ContainerHandler>()
   

   constructor(){

    effect(
      ()=>{
        this.onHandlerReady.emit(this.containerHandler)
      }
    )
   }

   ngAfterViewInit(): void {

    this.placeholders().forEach(placeholder=>{
        console.log("resolveHostingContainer for ")
        
        placeholder.resolveHostingContainer(this)
    })


    this.animatables.changes.subscribe(children => {
      const asAnimatables = children as Animatable[]
      console.log("Found some animatables")
      asAnimatables.forEach(c => c.onAnimationContainerReady(this.containerHandler));
    });
   }

   popup(){
      this.isShown.set(true)
   }

   fadeOut(){
      this.isShown.set(false)
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
