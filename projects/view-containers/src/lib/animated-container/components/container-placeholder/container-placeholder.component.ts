import { AfterContentInit, Component, contentChildren, effect, inject, signal} from '@angular/core';
import { AnimatedContainerComponent } from '../../animated-container.component';
import { ANIMATABLE_ITEM, AnimatableBase, whenDefined } from '@pavelo8501/data-helpers';


@Component({
  selector: 'vc-container-placeholder',
  imports: [
    
  ],
  templateUrl: "./container-placeholder.component.html",
  styleUrl: './container-placeholder.component.css'
})
export class ContainerPlaceholderComponent implements AfterContentInit {

  container = inject(AnimatedContainerComponent);
  animatables = contentChildren<AnimatableBase>(ANIMATABLE_ITEM)

  isShown = signal(true);

  constructor(){
    effect(()=>{
      whenDefined(this.animatables(), animatables=>{
        animatables.forEach(animatable=> animatable.provideAnimationHandler(this.container.containerHandler))
      })
    })
  }

  show(){
    this.isShown.set(true)
  }

  hide(){
    this.isShown.set(false)
  }

  toggle() {
    this.isShown.update((isShown) => !isShown);
  }

  ngAfterContentInit() {
    this.container.registerPlaceholder(this)
  }
 }
