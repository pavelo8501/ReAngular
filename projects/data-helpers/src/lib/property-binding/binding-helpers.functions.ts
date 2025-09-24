

import { PropertyBinding } from "./property-binding.class";


export function bindProperty<T, V>(
    receiver: T,
    property: keyof T
): PropertyBinding<T, V> {
    return new PropertyBinding(
        receiver,
        (obj) => obj[property] as V,
        (obj, value) => { obj[property] = value as T[keyof T]; }
    )
}