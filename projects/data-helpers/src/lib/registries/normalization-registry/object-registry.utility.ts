import { ObjectRegistryBase } from "./object-registry.class"
import { RegistryFieldBase} from "./registry-key.model"

function isPrimitiveKey(val: any): val is RegistryFieldBase<any> {
    return val instanceof RegistryFieldBase;
}


export function normalizeWithRegistry<T>(
  source: any,
  registry: ObjectRegistryBase<T>
): T {
  const result: any = {};

  for (const key in registry) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    const regValue = (registry as any)[key];
    const srcValue = source?.[key];
    if (srcValue === undefined || srcValue === null) continue;

    if (isPrimitiveKey(regValue)) {
      result[key] = srcValue;
    }

    else if (regValue instanceof ObjectRegistryBase) {
      if (Array.isArray(srcValue)) {
        result[key] = srcValue.map(item =>
          normalizeWithRegistry(item, regValue)
        );
      } else {
        result[key] = normalizeWithRegistry(srcValue, regValue);
      }
    }
  }
  //delete result.constructorType;
  return result;
}

export function  hydrateFromRegistry<T, R extends ObjectRegistryBase<T>>(
    cls: new (...args: any[]) => T,
    raw: any,
    registry: R
): T 
{
  const objectInstance = new cls();
  registry.setConstructor(cls)
  for (const key in registry) {
    const regValue = (registry as any)[key];
    const rawValue = raw?.[key];

    if (isPrimitiveKey(regValue) && rawValue !== undefined) {
      regValue.setKeyValuePair(key, rawValue);
      (objectInstance as any)[key] = regValue.value;
    }

    if (regValue instanceof ObjectRegistryBase && rawValue !== undefined) {
      if (Array.isArray(rawValue)) {
        const hydratedArray = rawValue.map(item =>
          hydrateFromRegistry(
            regValue.getConstructor(),
            item,
            regValue
          )
        );
        (objectInstance as any)[key] = hydratedArray;
      } else {
        const nestedObject = hydrateFromRegistry(
          regValue.getConstructor(),
          rawValue,
          regValue
        );
        (objectInstance as any)[key] = nestedObject;
      }
    }
  }
  return objectInstance;
}
