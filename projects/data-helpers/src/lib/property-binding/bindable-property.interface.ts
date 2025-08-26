export interface IBindableProperty<T, V>{

    get():V
    set(value:V):void
    subscribe(callback:(newValue:V, oldValue: V) => void ): () => void

} 