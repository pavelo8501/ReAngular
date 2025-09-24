

import { ContainerEventType } from "../../common/enums"
import { IContainerPayload } from "@pavelo8501/data-helpers";


export class ContainerEvent<T extends object> {
  constructor(
    public caller: IContainerPayload<T>,
    public eventType : ContainerEventType
  ) {
    
   }
}


export function configureCaller<T extends object>(
  caller: IContainerPayload<T>
) {
  return function(
    eventType: ContainerEventType,
  ): ContainerEvent<T> {
    return new ContainerEvent(caller, eventType);
  };
}
