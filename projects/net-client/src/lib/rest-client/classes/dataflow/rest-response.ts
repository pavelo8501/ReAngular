

export interface ResponseBase<DATA>{

    factoryFn? : (src:ResponseBase<DATA>)=> DATA 
    extractData(src: ResponseBase<DATA>):DATA | undefined;

}