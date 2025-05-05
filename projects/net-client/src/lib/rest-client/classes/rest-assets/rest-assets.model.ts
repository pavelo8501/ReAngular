

export class AssetParams{

    public notifyRequestParams : boolean = true
    public notifyResponseAsJson: boolean = true
    public notifyDataSent: boolean = true
    public httpErrorVerbouse: boolean = true


    constructor(private source? : AssetParams){
        if(source){
            this.notifyRequestParams = source.notifyRequestParams
            this.notifyResponseAsJson = source.notifyResponseAsJson
            this.notifyDataSent = source.notifyDataSent
            this.httpErrorVerbouse = source.httpErrorVerbouse
        }
    }
}