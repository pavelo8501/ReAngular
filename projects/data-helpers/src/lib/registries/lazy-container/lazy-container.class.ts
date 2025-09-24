

export class LazyContainer<T extends object>{

    private receiver?:T

    constructor(
        public provider:()=>T
    ){
        
    }

    getValue():T{
        const value = this.receiver
        if(value != undefined){
            return value
        }else{
            this.receiver = this.provider()
            return this.receiver
        }
    }
    
}