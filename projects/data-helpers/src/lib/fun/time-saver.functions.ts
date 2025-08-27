


export function withThisDo<T>(receiver:T, block : (receiver:T)=>void){
    block(receiver)
}


export function whenDefined<T>(receiver:T | undefined, block : (receiver:T)=>void){
    if(receiver != undefined ){
         block(receiver)
    }
}