import { ObjectRegistryBase } from "./object-registry.class";


export class RegisteryContainer<T, R extends ObjectRegistryBase<T>>{

    constructor(public className : string, public construcctor: new (...args: any[]) => T, public registery : R ){

    }
}


export class RegistryHub{
    registeries : RegisteryContainer<any, ObjectRegistryBase<any>>[] = []

    addRegistry<T, R extends ObjectRegistryBase<T>>(className : string, construcctor: new (...args: any[]) => T, registery : R ){
       const record = new RegisteryContainer(className, construcctor, registery)
       this.registeries.push(record)
       console.log("New rec add")
    }
    getRegistery<T, R extends ObjectRegistryBase<T>>(name:string): R{
        const found = this.registeries.find(x=>x.className == name)
        if(!found){
            throw Error(`Unable to find registry record. Searching for : ${name} `)
        }
        return found.registery as R
    }
}


export const registryHub = new RegistryHub()