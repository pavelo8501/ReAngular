

export class AssetParams{

    notifyRequestParams:boolean = false
    notifyResponseAsJson:boolean = false
    notifyDataSent:boolean = false
    httpErrorVerbouse:boolean = false

    constructor(conf : {
            notifyRequestParams : boolean, 
            notifyResponseAsJson : boolean,  
            notifyDataSent: boolean,  
            httpErrorVerbouse:boolean
            } | undefined = undefined ){
        if(conf){
            this.notifyRequestParams = conf.notifyRequestParams
            this.notifyResponseAsJson = conf.notifyResponseAsJson
            this.notifyDataSent = conf.notifyDataSent
            this.httpErrorVerbouse = conf.httpErrorVerbouse

        }
    }

}