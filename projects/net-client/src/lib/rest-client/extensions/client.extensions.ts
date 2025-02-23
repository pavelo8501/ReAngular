import { RestResponseInterface } from "../classes/dataflow/rest-response";
import { CommonRestAsset, RestAssetInterface } from "../classes/rest-assets/rest-client.asset";
import { RESTClientConnection } from "../classes/rest-client-connection";

// declare module "../classes/rest-client-connection" {
    
//     interface RESTClientConnection<RESPONSE extends RestResponseInterface<any>> {
//         registerAsset<T>(
//         assetFactory: (conn: RESTClientConnection<RestResponseInterface<any>>) =>  CommonRestAsset<T>
//         ): RestAssetInterface<any>;
//     }
// }
    
      
    
//   declare module "../classes/rest-client-connection" {
    
//     interface RESTClientConnection<RESPONSE extends RestResponseInterface<any>> {
//       registerAsset<T>(
//         assetFactory: (conn: RESTClientConnection<RestResponseInterface<any>>) => CommonRestAsset<T>
//       ): RestAssetInterface<any>;
//     }
//   }

  

//   RESTClientConnection.prototype.registerAsset = function<T>(
    
//     assetFactory: <T>(conn: RESTClientConnection<RestResponseInterface<any>>) => CommonRestAsset<T>
//   ): RestAssetInterface<T> {
//         const asset = assetFactory(this)
//         const existingAssetIndex = this.assets.findIndex(
//             (x: RestAssetInterface<T>) => x.endpoint === asset.endpoint && x.method === asset.method
//           );
//     if (existingAssetIndex >= 0) {
//         return this.assets[existingAssetIndex] as CommonRestAsset<T>;
//     }else{
//         asset.initialize(this);
//         this.assets.push(asset);
//         return asset;
//     }
//   }

  export {};