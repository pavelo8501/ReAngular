
import { Observable, Subject } from "rxjs";
import { DataWithCallback } from "./../interfaces/data-with-callback.interface";



export class TypedCallbackObserver<T, R> {
    private subject = new Subject<DataWithCallback<T, R>>();
  
    sendData(data: T): Promise<R> {
      return new Promise((resolve) => {
        this.subject.next({ data, callback: resolve });
      });
    }
  
    getObservable(): Observable<DataWithCallback<T, R>> {
      return this.subject.asObservable();
    }
  }
  