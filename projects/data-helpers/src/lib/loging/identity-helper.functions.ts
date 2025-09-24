import { IComponentIdentity, Identity } from "./idententity.interface";


export function identity(source: IComponentIdentity, extra?: string): Identity {
  return { source, optionalString: extra };
}