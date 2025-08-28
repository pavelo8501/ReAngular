

import { IAnimationHandler } from "./animation-handler.interface";

export interface IAnimatable{

    onAnimationContainerReady(handler:IAnimationHandler):void

}