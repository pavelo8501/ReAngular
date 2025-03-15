export interface BackendResponseInterface<DATA>{
    ok: boolean
    msg: string
    errorCode: number
    data? : DATA
}


export interface MockedResponseBase<DATA>{

    factoryFn? : (src:MockedResponseBase<DATA>)=> DATA 
    extractData(src: MockedResponseBase<DATA>):DATA | undefined;

}

export class MockedResponse<DATA> implements BackendResponseInterface<DATA>, MockedResponseBase<DATA>{

    public ok:boolean = false
    public  msg:string = ""
    public errorCode: number = 0
    public data? : DATA

    constructor(
        src: BackendResponseInterface<DATA> | undefined = undefined, 
        public factoryFn? : (src : MockedResponseBase<DATA>)=>DATA ){
        if(src != undefined){
            this.ok = src.ok
            this.msg = src.msg
            this.errorCode = src.errorCode
            this.data = src.data
        }
    }

    extractData(src: MockedResponseBase<DATA>): DATA | undefined {
        console.log("toResponse")
        console.log(src)
        const resp = new MockedResponse<DATA>(src as MockedResponse<DATA>)
        return resp.data
    }
}