import { BehaviorSubject, map, Observable, Subject } from "rxjs";
import { User } from "../../../models/user/user";
import { WSRequestInterface } from "../requests/wsRequests";
import { DataSubscriberInterface } from "./webSocketSubscriber";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { WSResponseInterface, WSResponseWithRequestInterface, WSServiceResponseInterface } from "../responses/apiResponse";
import { WSService } from "../web-socket-service.service";
import { ErrorCodes, WSException } from "./wsExceptions";
import { json } from "stream/consumers";

type WSResponse<ResponseDataType> = WSResponseInterface<ResponseDataType> | WSServiceResponseInterface;

type WSMessage<RequestDataType, ResponseType> = WSRequestInterface<RequestDataType> | ResponseType;


export class WSDataSubscription<RequestDataType,ResponseDataType>{

      private parent : WSConnectionMethod<RequestDataType, ResponseDataType>
      public dataObservable: Observable<ResponseDataType>;

      constructor(dataSubject: Subject<ResponseDataType>, connectionMethod: WSConnectionMethod<RequestDataType, ResponseDataType>){
            this.parent = connectionMethod;
            this.dataObservable = dataSubject.asObservable();
      }

      public execute: (requestParam: RequestDataType | undefined) => Observable<ResponseDataType> = (requestParam: RequestDataType | undefined = undefined) => {
           this.parent.sendRequest(requestParam)
           return this.dataObservable;
      };
}

export class WSConnectionMethod<RequestDataType, ResponseDataType>{
      private parent: WebSocketConnector<RequestDataType, ResponseDataType>
      method: string
      subscriber: DataSubscriberInterface | undefined = undefined;
      private request: WSRequestInterface<RequestDataType>
      private websocket : WebSocketSubject<WSMessage<RequestDataType, WSResponse < ResponseDataType >>>

      private dataSubject = new Subject<ResponseDataType>();
      public dataObservable = this.dataSubject.asObservable();

      public dataSubscription: WSDataSubscription<RequestDataType, ResponseDataType>;

      constructor(
            request: WSRequestInterface<RequestDataType>, 
            subscribrer: DataSubscriberInterface | undefined,
            websocket: WebSocketSubject<WSMessage<RequestDataType, WSResponse<ResponseDataType>>>,
            parent: WebSocketConnector<RequestDataType, ResponseDataType>){
            this.request = request;
            this.method = request.action;
            this.subscriber = subscribrer;
            this.parent = parent;
            this.websocket = websocket;

            this.dataSubscription = new WSDataSubscription(this.dataSubject, this)
      }


      public submitData(data: ResponseDataType, onRequest: WSRequestInterface<RequestDataType> | undefined = undefined){

            if (onRequest != undefined){
                  if (this.subscriber != undefined) {
                        if (onRequest.subscriberId != undefined) {
                              if (this.subscriber.subscriberId == onRequest.subscriberId) {
                                    this.dataSubject.next((data as ResponseDataType))
                              }
                        }else{
                              throw new WSException("Trying to send subscribed specific response to subscriber that do not match with reponse", ErrorCodes.DATA_RECEPIENT_NOT_FOUND)
                        }
                  }
            }else{
                  this.dataSubject.next((data as ResponseDataType))
            }
      }

      public sendRequest(param: RequestDataType | undefined = undefined){
            try{
                  if(this.parent.connected == true){
                        if (param!=undefined){
                              //this.request.data = param
                              if(this.request.data != undefined){
                                    this.request.data.value = param
                              }
                        }
                        console.log("Sending request: " +  JSON.stringify(this.request));
                        this.websocket.next(this.request);
                  }else{
                        const json = JSON.stringify(this.request)
                        console.error(`Connection closed unable to send ${json}`);
                        this.dataSubject.error("Connection closed unable to send");
                        this.dataSubject.error("Trying to send " + json);
                  }

            } catch (e:any){
                  if (e instanceof Error) {
                        this.dataSubject.error(e.message);
                  } else {
                        this.dataSubject.error("An unknown error occurred");
                  }
            }
      }
}


export class WebSocketConnector<RequestDataType, ResponseDataType> {
      
      private websocket$: WebSocketSubject<WSMessage<RequestDataType, WSResponse<ResponseDataType>>>;

      private _connected = false;
      get connected(): boolean {
            return this._connected;
      }
      private set connected(val: boolean) {
            if (val != this._connected) {
                  this._connected = val;
                  if (this.connected == true) {
                        console.log("connection open")
                  } else {
                        console.log("connection closed")
                  }
            }
      }

      get completeUrl(): string {
            return this.parent.baseUrl + this.request.actionPath;
      }

      private user: User;
      public request: WSRequestInterface<RequestDataType>
      private parent: WSService;

      private webMethods: WSConnectionMethod<RequestDataType, ResponseDataType>[] = [];
   
      constructor(user: User, request: WSRequestInterface<RequestDataType>, subscriber: DataSubscriberInterface| undefined, serviss: WSService) {
            this.request = request;
            this.parent = serviss;
            this.user = user;
            this.websocket$ = this.initConnection(request, subscriber);
      }

      public addMethod(
            request: WSRequestInterface<RequestDataType>, 
            subscriber: DataSubscriberInterface | undefined = undefined
      ): WSConnectionMethod<RequestDataType, ResponseDataType>{

            let existentMethod: WSConnectionMethod<any, any> | undefined ;
            if(subscriber == undefined){
                  existentMethod = this.webMethods.find(x => x.method == request.action);
            }else{
                  existentMethod = this.webMethods.find(x => x.method == request.action && subscriber == x.subscriber);
            }
                  
            if(existentMethod == undefined){
                  const newMethod = new WSConnectionMethod<RequestDataType, ResponseDataType>(request, subscriber, this.websocket$, this);
                  this.webMethods.push(newMethod);
                  console.log(`new web method: ${request.action} for subscriber created`);
                  return newMethod
            }else{
                  return existentMethod
            }
      }

      private initConnection(request: WSRequestInterface<RequestDataType>, subscriber: DataSubscriberInterface| undefined = undefined): WebSocketSubject<WSMessage<RequestDataType, WSResponse<ResponseDataType>>> {
            
            
            const connStatusSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
            const openObserver = new Subject<Event>();
            openObserver.pipe(map((_) => true)).subscribe(connStatusSubject);
            const closeObserver = new Subject<CloseEvent>();
            closeObserver.pipe(map((_) => false)).subscribe(connStatusSubject);

            const websocket$ = webSocket<WSMessage<RequestDataType, WSResponse<ResponseDataType>>>({
                  url: this.completeUrl,
                  openObserver,
                  closeObserver,
            });

            websocket$.subscribe({
                  next: (response) => {
                        console.log("Response Received", response)
                        if (this.isServiceMessage(response)) {
                              console.log("Service essage Received")
                              this.handleServiceMessage(response);
                        } else {
                              this.handleResponseMessage((response as WSResponseWithRequestInterface<ResponseDataType,RequestDataType>));
                        }
                  },
                  error: (err) => {
                        console.error(err);
                  },
            });

            connStatusSubject.subscribe({
                  next: (open) => {
                        this.connected = open
                  }
            })
            return websocket$;
      }

      private isServiceMessage(message: WSMessage<RequestDataType, WSResponse<ResponseDataType>>): message is WSServiceResponseInterface {
            return (message as WSServiceResponseInterface).serviceMessage !== undefined;
      }

      private handleServiceMessage(message: WSServiceResponseInterface) {
            if(message.ok){
                  console.log("Service message", message.serviceMessage);
            }else{
                  console.error("Service message", `${message.serviceMessage} Error Code: ${message.errorCode}`);
            }
      }

      private handleResponseMessage(message: WSResponseWithRequestInterface<ResponseDataType,RequestDataType>) {
            console.log("Data message received:", message);
            if(message.ok){

                  //Select subscribers that accept broadcast meessages
                  const broadcastSubscribers = this.webMethods.filter(x => x.method == message.request.action && x.subscriber == undefined);
                  if (message.result != undefined){
                        const dataReceived = message.result;
                        broadcastSubscribers.forEach(x => x.submitData(dataReceived));

                        // sellect subscribers with specific subscriberId
                        // Normaly should be only one. If not warning is issued.
                        const specificSubscribers = this.webMethods.filter(x => x.method == message.request.action && x.subscriber?.subscriberId == message.request.subscriberId);
                        if (specificSubscribers.length > 1) {
                              console.warn(specificSubscribers.length + ` subscribers for method ${message.request.action} with subscriberId ${message.request.subscriberId} . Normally should be only one subscriber`);
                        }
                        specificSubscribers.forEach(x => x.submitData(dataReceived, message.request));

                  }
            }
      }
}
