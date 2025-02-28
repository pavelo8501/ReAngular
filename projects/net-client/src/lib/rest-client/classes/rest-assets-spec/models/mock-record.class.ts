
export interface MockRecorInterface{
    id:number
    str:string
    val:number
}

export class MockRecord implements MockRecorInterface{

    constructor(public id:number, public str:string, public val:number){

    }
}