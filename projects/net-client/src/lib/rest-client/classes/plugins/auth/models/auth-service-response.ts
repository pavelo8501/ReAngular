
export interface AuthServiceResponseInterface<T>{
    data? : T
    ok : boolean
    msg: string
    errorCode: number
}