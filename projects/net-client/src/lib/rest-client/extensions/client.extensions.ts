

import {RestCommonAsset}  from "./../classes/rest-assets/rest-common.asset"



(RestCommonAsset.prototype as any).info = function <T>(this: RestCommonAsset<T>, message:string ) {
  
  const assetName = `Asset ${this.method} to endpint ${this.endpoint}`
  console.log(`${assetName} : ${message}`)


};



RestCommonAsset.prototype.notify = function <T>(
    this: RestCommonAsset<T>, 
    message : {url: string, params: string, secured:boolean}, 
    callback?: (value: RestCommonAsset<T>) => void) {

      console.warn(`Executong notify as extension`)

      const assetName = `Asset ${this.method} to endpint ${this.endpoint}`

      
      if(this.params.notifyRequestParams){
          console.log(`${assetName} makeing  ${message.secured? "secured":"unsecured"} api call to ${message.url} with data params ${message.params}`)
          console.log(`request heraders`, this.callOptions.getHeaders().map(m=> `[ ${m.key} : ${m.value}], `))
      }

      console.log(`Asset ${this.method} notify  a warning`)
      if(callback){
        callback(this);
      }
};
    
(RestCommonAsset.prototype as any).warn = function <T>(callback: (value: RestCommonAsset<T>) => void) {
  
  console.warn(`Asset ${this.method} raised a warning`)

  callback(this as RestCommonAsset<T>);

};

export {};