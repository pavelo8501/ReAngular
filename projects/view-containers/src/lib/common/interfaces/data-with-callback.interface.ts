

export interface DataWithCallback<T, R> {
    data: T;
    callback: (response: R) => void;
  }