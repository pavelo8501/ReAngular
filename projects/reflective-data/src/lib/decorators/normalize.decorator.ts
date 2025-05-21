import 'reflect-metadata';

export interface NormalizeOptions {
  name?: string;
  transform?: (value: any) => any;
  nestedType?: new () => any;
}

const NORMALIZE_METADATA_KEY = Symbol('normalize:fields');

export function NormalizeField(options: NormalizeOptions = {}): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const existing: Record<string, NormalizeOptions> =
      Reflect.getMetadata(NORMALIZE_METADATA_KEY, target.constructor) ?? {};
    existing[propertyKey as string] = options;
    Reflect.defineMetadata(NORMALIZE_METADATA_KEY, existing, target.constructor);
  };
}

export function getNormalizeMetadata<T>(target: new () => T): Record<string, NormalizeOptions> {
  return Reflect.getMetadata(NORMALIZE_METADATA_KEY, target) ?? {};
}