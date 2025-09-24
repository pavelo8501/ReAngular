import { getNormalizeMetadata } from '../decorators/normalize.decorator';

export function normalize<T>(instance: any): T {
  const result: any = {};
  const meta = getNormalizeMetadata(instance.constructor);

  for (const key in meta) {
    const { name, transform } = meta[key];
    const value = instance[key];
    result[name ?? key] = transform ? transform(value) : value;
  }

  return result;
}

// export function hydrate<T>(cls: new () => T, raw: any): T {
//   const instance = new cls();
//   const meta = getNormalizeMetadata(cls);

//   for (const key in meta) {
//     const { name, transform, nestedType } = meta[key];
//     const rawKey = name ?? key;
//     const value = raw[rawKey];

//     if (nestedType && Array.isArray(value)) {
//       instance[key] = value.map((v: any) => hydrate(nestedType, v));
//     } else if (nestedType && value !== undefined) {
//       instance[key] = hydrate(nestedType, value);
//     } else if (transform && value !== undefined) {
//       instance[key] = transform(value);
//     } else {
//       instance[key] = value;
//     }
//   }

//   return instance;
// }