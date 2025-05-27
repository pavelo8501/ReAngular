import { RegisteryContainer } from "./registry-hub.class"


export abstract class ObjectRegistryBase<T> {

    private constructorType?: new (...args: any[]) => T

    constructor(ctr: (new (...args: any[]) => T) | undefined = undefined ){
        if(ctr){
          this.constructorType = ctr
        }
    }
    setConstructor(constructor: new (...args: any[]) => T){
        this.constructorType = constructor
    }

    getConstructor(): new (...args: any[]) => T{
      if(!this.constructorType){
        throw Error("Constructor Not Set")
      }
      return this.constructorType
    }
}

