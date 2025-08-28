
import { IAnimationHandler } from "./animation-handler.interface";

export abstract class Animatable {
  abstract onAnimationContainerReady(handler: IAnimationHandler): void;
}