import { BehaviorSubject, Observable, Subject } from "rxjs"
import { RestClient } from "../../../rest-client.service"
import { LoginRequest, AuthRequestInterface } from "./models/auth-service-request"
import { jwtDecode, JwtPayload } from "jwt-decode"
import { TokenPayloadInterface } from "./models/token-payload"
import { IUser } from "./models/user"


const TOKEN_KEY = 'jwt-token';

export class AuthService{

    private authenticated : boolean = false
    private currentToken : string | undefined
    private currentTokenPayload : JwtPayload | undefined

    private rest?: RestClient
  
    // let src :  RestTypedAssetInterface = {endpoint:"auth/login", secured: false}
    // this.loginAsset =  client.getConnection(0).createPostAsset<string>(src)
   
    constructor() {}

    setRestClient(client: RestClient) {
        this.rest = client
    }
  
    private authenticatedStatusSubject:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.authenticated);
    public  authenticatedStatus$ = this.authenticatedStatusSubject.asObservable();
  
    public isAuthenticated(disable:boolean = true): Observable<boolean> {
  
      if(disable){
        this.authenticatedStatusSubject.next(true);
      }else{
        const token =  window.sessionStorage.getItem(TOKEN_KEY)
        console.log("token from session storage " + token);
        this.authenticatedStatusSubject.next(this.authenticated);
      }
      return this.authenticatedStatusSubject
    }
  
    public getUser(login: string | undefined):IUser{
  
      const token =  window.sessionStorage.getItem(TOKEN_KEY);
      if(token == null){
          throw new Error("Fatal")
      }else{
        const tokenPayload = jwtDecode<TokenPayloadInterface<string>>(token)
        if(tokenPayload.user != undefined){
          const user =  JSON.parse(tokenPayload.user)
          console.log(`token payload user ${user}`)
          return user
        }else{
          throw new Error("Fatal")
        }
      }
    }
  
    public clean(){
      if (typeof window !== undefined) {
        window.sessionStorage.clear();
      }
    }
  
    // login(login: string, password: string){
    //     if(this.rest){
    //         let loginAsset =  this.rest.getConnection(0).createPostAsset<string>({endpoint:"auth/login", secured: false})
    //         loginAsset.makeCall<LoginRequest>(new LoginRequest(login, password)).subscribe({
    //             next:(token)=>{
    //               this.currentToken = token
    //               this.currentTokenPayload = jwtDecode(token)
    //               window.sessionStorage.removeItem(TOKEN_KEY)
    //               window.sessionStorage.setItem(TOKEN_KEY, this.currentToken)
    //               this.authenticated = true
    //               this.authenticatedStatusSubject.next(true)
    //             },
    //             error:(error)  =>{
    //               this.authenticated = false
    //               this.authenticatedStatusSubject.next(false)
    //               this.authenticatedStatusSubject.error(error)
    //             }
    //           })
    //     }
    // }
  
    getToken():string|undefined{
        return this.currentToken
    }
  
    private activeTokenSubject : Subject<string|undefined> = new Subject<string|undefined>();
    refreshToken():Observable<string|undefined>{
      return this.activeTokenSubject.asObservable()
    }
  
    private authLogoutSubject : Subject<boolean> = new Subject<boolean>();

    logout(user: IUser|undefined): boolean {
      this.authLogoutSubject.next(false)
      this.clean();
      window.location.reload();
      return true
    }
  
    throwAway():boolean{
      return true
    }
}