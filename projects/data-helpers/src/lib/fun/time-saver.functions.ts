


export function withThisDo<T>(receiver:T, block : (receiver:T)=>void){
    block(receiver)
}


export function whenDefined<T>(receiver:T | undefined, block : (receiver:T)=>void){
    if(receiver != undefined ){
         block(receiver)
    }
}


declare global {
  interface Object {
    let<T, R>(this: T | null | undefined, block: (value: T) => R): R | undefined
  }
}

Object.prototype.let = function (block: Function) {
  return this == null ? undefined : block(this)
}