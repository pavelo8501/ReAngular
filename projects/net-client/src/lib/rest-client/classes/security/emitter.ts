import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AuthEvent } from './auth-event.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthEventEmitterService {
  private authEventSubject = new Subject<{ event: AuthEvent; payload?: any }>();

  /** Observable that components/services can subscribe to */
  get authEvents$(): Observable<{ event: AuthEvent; payload?: any }> {
    return this.authEventSubject.asObservable();
  }

  /** Emit an authentication-related event */
  emit(event: AuthEvent, payload?: any): void {
    console.log(`[Auth Event] ${event}`, payload);
    this.authEventSubject.next({ event, payload });
  }
}