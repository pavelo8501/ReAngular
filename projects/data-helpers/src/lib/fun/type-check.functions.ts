


export function castOrUndefined<T extends object>(constructor: new (...args: any[]) => T, obj: any ): T | undefined {

    if(obj instanceof constructor ){
           return  obj as T
    }else{
        return undefined
    }
}

export function withCasting<T extends object>(
  constructor: new (...args: any[]) => T, 
  obj: any, block: (casted:T)=>void ){
   
    if(obj instanceof constructor ){
        block(obj as T)
    }
}
