import { of } from "rxjs";

export interface RestResponseInterface<DATA>{

    factoryFn? : (src:RestResponseInterface<DATA>)=> DATA 
    extractData(src: RestResponseInterface<DATA>):DATA | undefined;

}