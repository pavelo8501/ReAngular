
import { Directive, forwardRef, InjectionToken, model } from "@angular/core";
import { IAnimatable } from "./animatable.interface";
import { IAnimationHandler } from "./animation-handler.interface";
import { IComponentIdentity, OutputMode } from "../loging";


export const ANIMATABLE_ITEM = new InjectionToken<AnimatableBase>('animatable-item');

@Directive({
  providers: [{provide: ANIMATABLE_ITEM, useExisting: forwardRef(() => AnimatableBase) }]
})
export abstract class AnimatableBase implements IComponentIdentity{

  abstract componentName: string

  outputMode:OutputMode = OutputMode.Silent
  animationHandler?:IAnimationHandler

  abstract provideAnimationHandler(handler: IAnimationHandler):void

}