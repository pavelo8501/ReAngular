import { IBindableProperty } from "./bindable-property.interface";


export class PropertyBinding<T, V> implements IBindableProperty<T, V> {

  private callbacks: Array<(newValue:V, oldValue:V) => void> = []

  constructor(
    public receiver : T,
    private getter: (obj:T)=>V,
    private setter : (obj:T, value:V) => void

  ) {}

  private notifySubscribers(newValue:V, oldValue:V){
    this.callbacks.forEach(callback => callback(newValue, oldValue))
  }

  get(): V {
    return this.getter(this.receiver);
  }

  set(value: V) {
    const oldValue = this.get()
    this.setter(this.receiver, value)
    this.notifySubscribers(value, oldValue)
  }


  subscribe(callback: (newValue: V, oldValue: V) => void): () => void {
    this.callbacks.push(callback);
    return () => {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
  
}

