
import { RenderingItemComponent } from "../rendering-container-parts"
import { RenderComponentInterface, RenderModelInterface } from "../interfaces"
import { ContainerEventType } from "../../common/enums"

export class ContainerEvent<T extends RenderModelInterface, P> {
  constructor(
    public caller: RenderComponentInterface<T>,
    public eventType : ContainerEventType,
    public hostingItem: RenderingItemComponent,
    public payload: P
  ) {
    
   }
}


export function configureCaller<T extends RenderModelInterface>(
  caller: RenderComponentInterface<T>,
  hostingItem: RenderingItemComponent
) {
  return function<P>(
    eventType: ContainerEventType,
    payload: P
  ): ContainerEvent<T, P> {
    return new ContainerEvent(caller, eventType, hostingItem, payload);
  };
}
