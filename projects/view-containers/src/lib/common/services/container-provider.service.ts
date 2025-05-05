
import { Injectable } from '@angular/core';
import { TypedCallbackObserver, TypedCallbackProvider } from './../classes';


@Injectable({ providedIn: 'root' })
export class ContainerProviderService<T = unknown, R = unknown> {
  private observer = new TypedCallbackObserver<T, R>();
  readonly provider = new TypedCallbackProvider(this.observer);



}


