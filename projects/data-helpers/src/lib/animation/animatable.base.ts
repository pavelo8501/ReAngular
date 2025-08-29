
import { Directive, forwardRef, InjectionToken, model } from "@angular/core";
import { IAnimatable } from "./animatable.interface";
import { IAnimationHandler } from "./animation-handler.interface";


export const ANIMATABLE_ITEM = new InjectionToken<AnimatableBase>('animatable-item');

@Directive({
  providers: [{provide: ANIMATABLE_ITEM, useExisting: forwardRef(() => AnimatableBase) }]
})
export abstract class AnimatableBase implements IAnimatable {

  animationContainerHandler = model<IAnimationHandler>()


 // abstract onAnimationContainerReady(handler: IAnimationHandler): void;

}