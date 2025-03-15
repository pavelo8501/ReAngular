import { Observable, Subject } from 'rxjs';

export interface DataWithCallback<T, R> {
    data: T | undefined;
    callback: (response: R) => void;
}

export class TwoWayObservable<T, R> {
    private subject = new Subject<DataWithCallback<T, R>>();

    sendData(data: T): Promise<R> {
        return new Promise((resolve) => {
            this.subject.next({
                data,
                callback: resolve
            });
        });
    }

    getObservable():Observable<DataWithCallback<T,R>> {
        return this.subject.asObservable();
    }
}