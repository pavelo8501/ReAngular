import { ResponseBase } from "../../dataflow"


export enum MockConnectionId{
    API_CONNECTION = 1
} 


export interface MockResponseInterface<DATA>{
    ok: boolean
    msg: string
    errorCode: number
    data? : DATA
}

export class MockResponse<DATA> implements MockResponseInterface<DATA>, ResponseBase<DATA>{

    public ok:boolean = false
    public  msg:string = ""
    public errorCode: number = 0
    public data? : DATA

    constructor(
        src: MockResponseInterface<DATA> | undefined = undefined, 
        public factoryFn? : (src : ResponseBase<DATA>)=>DATA ){
        if(src != undefined){
            this.ok = src.ok
            this.msg = src.msg
            this.errorCode = src.errorCode
            this.data = src.data
        }
    }

    extractData(src: ResponseBase<DATA>): DATA | undefined {
        console.log("toResponse")
        console.log(src)
        const resp = new MockResponse<DATA>(src as MockResponse<DATA>)
        return resp.data
    }
}