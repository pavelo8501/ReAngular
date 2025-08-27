
import { RenderingItemComponent } from "../rendering-container-parts"
import { RenderComponentInterface, RenderModelInterface } from "../interfaces"
import { ContainerEventType } from "../../common/enums"



export class ContainerEvent<T extends object> {
  constructor(
    public caller: T,
    public eventType : ContainerEventType
  ) {
    
   }
}


export function configureCaller<T extends object>(
  caller: T
) {
  return function(
    eventType: ContainerEventType,
  ): ContainerEvent<T> {
    return new ContainerEvent(caller, eventType);
  };
}
