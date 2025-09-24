

export function guard<T extends any[]>(condition: (...args: T) => boolean, fn: (...args: T) => void): (...args: T) => void {
  return (...args: T) => {
    if (!condition(...args)) return
    return fn(...args)
  }
}