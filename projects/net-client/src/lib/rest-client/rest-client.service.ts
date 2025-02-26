import { HttpClient} from '@angular/common/http';
import {Injectable } from '@angular/core';
import { RESTException } from './classes/exceptions/rest-exceptions';
import { ErrorCode } from './classes/exceptions/error-code';
import { RestConnection } from './classes/rest-client-connection';
import { RestConnectionConfig} from './classes/config';
import { AuthEventEmitterService, ResponseBase, RestExceptionCode, TokenSubjectException } from '../../public-api';
import { AssetType } from './classes/rest-assets/rest-asset.enums';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class RestClient{

    private  tokenKey(connection : RestConnection<any>){
       return `auth_token_${connection.connectionId}`
    }

    private tokens: Map<string, string> = new Map()

    production: boolean = false

    private connections : RestConnection<any>[] = []

    private onInitialized? : () => void
    initialized = (callback: () => void) => {
        console.log("RestClient initialized callback set.");
        this.onInitialized = callback  
    }

    constructor(
       readonly http: HttpClient,
       private cookieService: CookieService,
       private eventEmitter : AuthEventEmitterService
    ){
       if(!this.production){console.log("Starting config")}
    }

    createConnection<T extends ResponseBase<any>>(config: RestConnectionConfig<T>){
        const newConnection =  new RestConnection<T>(config, this.http, this)

        const token = this.cookieService.get(this.tokenKey(newConnection)) || undefined;
        
        if(token){ this.setToken(newConnection, token) }
        newConnection.initialize(this.eventEmitter, token)

        if(config.withJwtAuth){
            const authEndpoint = config.withJwtAuth.getTokenEndpoint
            const refreshEndpoint = config.withJwtAuth.refreshTokenEndpoint
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
    }

    setToken(connection:RestConnection<any>, token: string): void {
        this.tokens.set(this.tokenKey(connection), token)
        this.cookieService.set(this.tokenKey(connection), token, { secure: true, sameSite: 'Strict' });
    }

    getToken(connection: RestConnection<any>): string{
        try{
            return this.cookieService.get(this.tokenKey(connection))
        }catch(err:any){
           throw  TokenSubjectException.createPredefined(RestExceptionCode.PRE_FAILED_CALL)
        }
    }

    clearToken(connection: RestConnection<any>): void {
        this.tokens.delete(this.tokenKey(connection))
        this.cookieService.delete(this.tokenKey(connection));
    }

    isTokenInPlace(connection: RestConnection<any>): boolean {
        return !!this.getToken(connection)
    }

    configComplete() {
        if (this.onInitialized) {
            this.onInitialized();
        }

        if (!this.production) {
            console.log("On Config Complete");
            this.restClientInfo()
        }
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

    restClientInfo(){
        console.log(`Number of connections applied ${this.connections.length}`)
        let yesNo : string  = "no"
        if(this.http){
            yesNo = "yes"
        }
        console.log(`Is httpClient injected?  ${yesNo}`)
        console.log(`production : ${this.production}`)
    }

}
