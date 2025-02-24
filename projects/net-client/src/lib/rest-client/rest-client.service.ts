import { HttpClient} from '@angular/common/http';
import {Injectable } from '@angular/core';
import { CommonRestAsset } from './classes/rest-assets/rest-client.asset';
import { RestCallOptions } from './classes/dataflow/rest-call-options';
import { RestMethod } from './enums/rest-method.enums';
import { RESTException } from './classes/exceptions/rest-exceptions';
import { ErrorCode } from './classes/exceptions/error-code';
import { RESTHeader } from './classes/dataflow/rest-header';
import { HeaderKey } from './enums/header-key';
import { AuthService } from './classes/plugins/auth/authentication.plugin';
import { RestConnection } from './classes/rest-client-connection';
import { RestConnectionConfig } from './classes/config';
import { ResponseBase } from '../../public-api';
import { AssetType } from './classes/rest-assets/rest-asset.enums';


@Injectable({
  providedIn: 'root'
})
export class RestClient{

  private connections : RestConnection<any>[] = []
  private authService : AuthService| undefined

  constructor(
    private http: HttpClient
  ){
    
  }

  private getAuthHeaders2(method:RestMethod): RESTHeader|undefined {
    if(this.authService == undefined){
      return undefined
    }else{
      const token =  this.authService.getToken()
      if(token != undefined){
        return new RESTHeader(method, HeaderKey.AUTHORIZATION, token)
      }else{
        return undefined
      }
    }
  }

  createConnection<T extends ResponseBase<any>>(config: RestConnectionConfig<T>){
    console.log(`Create connection call`)
    const newConnection =  new RestConnection<T>(config.id, config.baseUrl, config.responseTemplate)
    newConnection.initialize(this, this.http)
    if(config.withJwtAuth){
        const authEndpoint = config.withJwtAuth.getTokenEndpoint
        const refreshEndpoint = config.withJwtAuth.getTokenEndpoint
        const method = config.withJwtAuth.method

       newConnection.createServiceAsset<string|undefined>(
            authEndpoint,
            method,
            AssetType.ATHENTICATE
       )

       newConnection.createServiceAsset<string|undefined>(
            refreshEndpoint,
            method,
            AssetType.REFRESH
       )
    }
    this.connections.push(newConnection)  
    this.restClientInfo()
  }

  getConnection(id:number):RestConnection<any>{
    const found = this.connections.find(x=>x.connectionId == id)
     if(found != undefined){
       return found
     }else{
       throw new RESTException(`Connection with id : ${id} not found`, ErrorCode.NOT_FOUND)
     }
  }

  connectionList():RestConnection<any>[]{
    return this.connections
  }


 createCallOption2(asset:CommonRestAsset<any>): RestCallOptions{
    console.log("createCallOptions call by callback")
    let restOptions = new RestCallOptions()
    if(asset.secured){
     const authHeader = this.getAuthHeaders2(asset.method)
     if(authHeader){
       restOptions.setAppliedHeadders([authHeader])
     }else{
       console.warn("autth header null")
      }
    }
    return restOptions
 }

 injectAuthService(service : AuthService){
      this.authService = service
      this.connections.forEach(x=>x.initialize(this, this.http))
 }

  restClientInfo(){
    console.log(`Number of connections applied ${this.connections.length}`)
    let yesNo : string  = "no"
    if(this.authService){
      yesNo = "yes"
    }
    console.log(`Is auth module injected?  ${yesNo}`)
      yesNo = "no"
      if(this.http){
        yesNo = "yes"
      }
      console.log(`Is httpClient injected?  ${yesNo}`)
  }
}
