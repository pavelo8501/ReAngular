import { Identity } from "../loging"


function makeWarning(methodName:string, warnOptions: string | Identity){
  let context = "";
  typeof warnOptions === "string"
    ? warnOptions
    : warnOptions
    ? `${warnOptions.source}${warnOptions.optionalString ? ": " + warnOptions.optionalString : ""}`
    : "";

    if (typeof warnOptions === "string") {
        // Case 1: plain string
        context = warnOptions;
    } else if (warnOptions) {
        // Case 2: Identy object (not null/undefined)
        context = warnOptions.source.componentName;
        if (warnOptions.optionalString) {
            context += ": " + warnOptions.optionalString;
        }
    } 
     console.warn(`${methodName} in ${context}. Did not execute since receiver is undefined.`)
}

export function withThisDo<T>(receiver:T, block : (receiver:T)=>void){
    block(receiver)
}


export function whenDefined<T>(
    receiver:T | null | undefined, 
    block : (receiver:T)=>void,
    warnOptions? : string | Identity
):boolean {
    const methodName = "WhenDefined"
    if(receiver != undefined && receiver != null){
         block(receiver)
         return true
    }else{
        if(warnOptions != undefined){
            makeWarning(methodName, warnOptions)
        }
        return false
    }
}


export function deleteFromList<T>(list:T[], itemToDelete:T, errorOnItemNotFound:boolean = false):T[] {
    const foundIndex = list.findIndex(x=> x === itemToDelete)
    if(foundIndex >= 0){
       list.splice(foundIndex, 1)
    }else{
        if(errorOnItemNotFound){
            const itemString = `${itemToDelete}`
            console.warn(itemToDelete)
            throw Error(`deleteFromList failed. Item ${itemString} not found`)
        }
    }
    return list
}
