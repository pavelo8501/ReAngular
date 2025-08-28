import { AfterViewInit, Component, ContentChildren, QueryList } from '@angular/core';
import { AnimatedContainerComponent } from '../../animated-container.component';
import { Animatable } from '@pavelo8501/data-helpers';

@Component({
  selector: 'vc-container-placeholder',
  imports: [
    
  ],
  templateUrl: "./container-placeholder.component.html",
  styleUrl: './container-placeholder.component.css'
})
export class ContainerPlaceholderComponent implements AfterViewInit {

  private hostingContainer?:AnimatedContainerComponent

   @ContentChildren(Animatable) animatables!: QueryList<Animatable>;


  private tryInitializeAnimatables(container: AnimatedContainerComponent):boolean{
     let initialized:boolean = false
      this.animatables.forEach(
        animatable=>{
            initialized = true
            console.log("Passing handler to")
            console.log(animatable)
            animatable.onAnimationContainerReady(container.containerHandler) 
        }
      )
      return initialized
  } 



  resolveHostingContainer(container: AnimatedContainerComponent){
    this.hostingContainer = container

   const result = this.tryInitializeAnimatables(container)

   if(!result){
     this.animatables.changes.subscribe(children => {
      const asAnimatables = children as Animatable[]
      console.log("Animatables resolved by subscription")
      asAnimatables.forEach(animatable => {
        console.log("Passing handler to")
        console.log(animatable)
        animatable.onAnimationContainerReady(container.containerHandler) 
      })
    })
   }
  }


  ngAfterViewInit(): void {

   
   }

 }
