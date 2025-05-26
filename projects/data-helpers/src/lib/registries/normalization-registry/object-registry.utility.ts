import { ObjectRegistryBase } from "./object-registry.class"
import { RegistryFieldBase, RegistryFieldType} from "./registry-key.model"
import { registryHub} from "./registry-hub.class"

function isPrimitiveKey(val: any): val is RegistryFieldBase<any> {
    return val instanceof RegistryFieldBase;
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
