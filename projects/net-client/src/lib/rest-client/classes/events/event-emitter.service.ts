import { Subject, Observable } from 'rxjs';
import { RequestEvent } from './models/request-event.class';
import { IncidentEvent } from './models/incident-event.class';
import { IncidentCode } from './enums/incident-code.enum';
import { HttpErrorResponse } from '@angular/common/http';


export class EventEmitterService {


  private requestEventSubject = new Subject<RequestEvent>()
  private incidentEventSubject = new Subject<IncidentEvent>()

  constructor(private production:boolean){

  }

  /** Observable that components/services can subscribe to for incident Events*/
  get  incidentEvents$(): Observable<IncidentEvent> {
    return this.incidentEventSubject.asObservable();
  }

  /** Observable that components/services can subscribe to for request Events*/
  get requestEvents$(): Observable<RequestEvent> {
    return this.requestEventSubject.asObservable();
  }

  private notityConsole(msg:string, errorCode?:number){
    if(!this.production){
      if(errorCode){
        console.warn(`${msg} with ErrorCode : ${errorCode}`)
      }else{
        console.log(msg)
      }
    }
  }

  /** Emit request response events */
  emitRequestError(error: HttpErrorResponse){
    const requestEvent  = new RequestEvent(error)
    this.notityConsole(requestEvent.toString(), error.status)
    this.requestEventSubject.next(new RequestEvent(error))
  }

  emitError(message: string, errCode:IncidentCode){
    this.notityConsole(`${message} ${errCode}`)
    this.incidentEventSubject.next(new IncidentEvent(errCode, message));
  }



  /** Emit an incident registration events */
  emitIncidentEvent(incidentCode: IncidentCode, payload?: any): void {
    this.notityConsole(`${incidentCode} ${payload}`)
    this.incidentEventSubject.next(new IncidentEvent(incidentCode,payload));
  }

}