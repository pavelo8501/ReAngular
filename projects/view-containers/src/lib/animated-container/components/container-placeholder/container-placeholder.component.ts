import { AfterContentInit, AfterViewInit, Component, contentChildren, effect, signal, Type} from '@angular/core';
import { AnimatedContainerComponent } from '../../animated-container.component';
import { ANIMATABLE_ITEM, AnimatableBase } from '@pavelo8501/data-helpers';


@Component({
  selector: 'vc-container-placeholder',
  imports: [
    
  ],
  templateUrl: "./container-placeholder.component.html",
  styleUrl: './container-placeholder.component.css'
})
export class ContainerPlaceholderComponent implements AfterContentInit, AfterViewInit {

  private hostingContainer?:AnimatedContainerComponent
  animatable = contentChildren<AnimatableBase>(ANIMATABLE_ITEM)


  isShown = signal(true);

  constructor(){

    effect(
      ()=>{
        const animatables = this.animatable()
        if(animatables != undefined){
          animatables.forEach(x=>{
             console.log(x)
          })
        }
      }
    )
  }


  show() {
    this.isShown.set(true)
  }

  hide(){
    this.isShown.set(false)
  }

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }


  resolveHostingContainer(container: AnimatedContainerComponent){
    console.log("resolveHostingContainer")
    this.hostingContainer = container
  }

  ngAfterContentInit() {
    

  }


  ngAfterViewInit(): void {
   

  }


 }
