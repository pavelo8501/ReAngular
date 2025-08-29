

import { ModelSignal } from "@angular/core";
import { IAnimationHandler } from "./animation-handler.interface";

export interface IAnimatable{

     animationContainerHandler: ModelSignal<IAnimationHandler | undefined>

   // onAnimationContainerReady(handler:IAnimationHandler):void

}