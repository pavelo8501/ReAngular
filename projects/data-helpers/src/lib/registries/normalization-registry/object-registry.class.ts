import { RegisteryContainer } from "./registry-hub.class"


export abstract class ObjectRegistryBase<T> {

   private constructorType?: new (...args: any[]) => T

  
    subRegistries : RegisteryContainer<any, ObjectRegistryBase<any>>[] = []

    constructor(cnsx: (new (...args: any[]) => T) | undefined = undefined ){
        if(cnsx){
          this.constructorType = cnsx
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

   addSubRegistry<T2, R extends ObjectRegistryBase<T2>>(
      key: string,
      constructor: new (...args: any[]) => T2,
      registry: R,
  ): void {
      registry.setConstructor(constructor)
      const container = new RegisteryContainer(key, constructor, registry)
      this.subRegistries.push(container)
  }
}

