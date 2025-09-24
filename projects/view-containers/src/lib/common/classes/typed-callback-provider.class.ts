import { Observable, Subject } from 'rxjs';
import { TypedCallbackObserver } from './typed-callback-observer.class';
import { DataWithCallback } from './../interfaces';



export class TypedCallbackProvider<T, R> {
  constructor(private observer: TypedCallbackObserver<T, R>) {}

  receive(): Observable<DataWithCallback<T, R>> {
    return this.observer.getObservable()
  }

  send(data: T): Promise<R> {
    return this.observer.sendData(data);
  }
}