export abstract class ObjectRegistryBase<T>{
    
    constructor(public constructorType?: new (...args: any[]) => T){

    }
}

export class RegistryKey{


}

export function normalizeWithRegistry<T>(source: any, registry: any): T {
  const result: any = {};

  for (const key in registry) {
    const regValue = registry[key];
    const srcValue = source[key];

    if (typeof regValue === 'object' && regValue instanceof ObjectRegistryBase) {
      if (Array.isArray(srcValue)) {
        result[key] = srcValue.map(item => normalizeWithRegistry(item, regValue));
      } else if (srcValue !== undefined && srcValue !== null) {
        result[key] = normalizeWithRegistry(srcValue, regValue);
      }
    } else {
      result[key] = srcValue;
    }
  }

  return result;
}

export function hydrateFromRegistry<T>(
  cls: new (...args: any[]) => T,
  raw: any,
  registry: any
): T {
  const instance: any = new cls();

  for (const key in registry) {
    const regValue = registry[key];
    const rawValue = raw?.[key];

    if (regValue instanceof ObjectRegistryBase) {
      if (Array.isArray(rawValue)) {
        instance[key] = rawValue.map((item: any) =>
          hydrateFromRegistry((regValue as any).constructorType, item, regValue)
        );
      } else if (rawValue !== undefined && rawValue !== null) {
        instance[key] = hydrateFromRegistry(
          (regValue as any).constructorType,
          rawValue,
          regValue
        );
      }
    } else {
      instance[key] = rawValue;
    }
  }

  return instance;
}