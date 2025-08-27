


export function castOrUndefinded<T extends object>(constructor: new (...args: any[]) => T, obj: any ): T | undefined {

    if(obj instanceof constructor ){
           return  obj as T
    }else{
        return undefined
    }
}