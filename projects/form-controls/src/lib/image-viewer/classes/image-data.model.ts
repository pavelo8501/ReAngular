

export interface IImageData{
    href:string
    filename:string
}

export class ImageData implements IImageData{

    constructor(
        public href:string,
        public filename:string,
    ){

    }


    static fromJson(jsonSting:string):ImageData | undefined {
        // JSON.parse(jsonSting, (key, value)=>{
            
        // })

      return  JSON.parse(jsonSting)
    }
}