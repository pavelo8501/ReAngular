

export class PropertyBinding<T> {


  constructor(
    private getter: () => T,
    private setter: (value: T) => void,
  ) {}

  get value(): T {
    return this.getter();
  }

  set value(v: T) {
    this.setter(v);
  }
  
}