


export function castOrUndefined<T extends object>(constructor: new (...args: any[]) => T, obj: any ): T | undefined {

    if(obj instanceof constructor ){
           return  obj as T
    }else{
        return undefined
    }
}

declare global {
  interface Object {
    castOrUndefined<T extends object>(this: T | null | undefined, constructor: new (...args: any[]) => T): T | undefined 
  }
}

Object.prototype.castOrUndefined = function <T extends object>(constructor: new (...args: any[]) => T) {
    if (this != null && this instanceof constructor) {
        return this as T
    }
    return undefined
}