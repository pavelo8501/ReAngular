
export class RegistryKey{

}

export enum RegistryFieldType{
    STRING,
    NUMBER,
    SUBREG
}

export class RegistryFieldBase<T> {


  constructor(  public readonly type: RegistryFieldType) {}


  private _value : T | undefined

  get value():T{
    if(this._value == undefined){
        throw Error("Attempt to read value before assignment")
    }
    return this._value
  }

  private _key : Extract<keyof any, string> | undefined
  get key():Extract<keyof any, string>{
    if(!this._key){
        throw Error("Attempt to read key before assignment")
    }
    return this._key
  }

  setKeyValuePair(key: Extract<keyof any, string>,  val:T){
    this._key = key
    this._value = val
  }
}

export const StrKey: RegistryFieldBase<string> = new RegistryFieldBase(RegistryFieldType.STRING);
export const NumKey: RegistryFieldBase<number> = new RegistryFieldBase(RegistryFieldType.NUMBER);