

export interface IImageData{
    href:string
    filename:string
}

export class ImageMetaData implements IImageData{

    constructor(
        public href:string,
        public filename:string,
    ){

    }

    static fromJson(jsonSting:string):ImageMetaData | undefined {
      return  JSON.parse(jsonSting)
    }
}