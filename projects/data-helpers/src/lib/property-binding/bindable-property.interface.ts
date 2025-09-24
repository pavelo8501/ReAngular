

export interface IBindableProperty<T, V>{


    receiver: T

    get():V
    set(value:V):void
    subscribe(callback:(newValue:V, oldValue: V) => void ): () => void

} 