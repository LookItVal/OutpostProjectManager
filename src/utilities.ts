import { unknownFunction } from './interfaces';

/*
export function benchmark(targetFunction: unknownFunction): unknownFunction {
  return function(...args: unknown[]): unknown {
    console.time(`${targetFunction.name} benchmark`);
    try {
      const result = targetFunction(...args);
      console.timeEnd(`${targetFunction.name} benchmark`);
      return result;
    } catch (e: unknown) {
      console.timeEnd(`${targetFunction.name} benchmark`);
      throw e;
    }
  };
}
*/

export function verboseLog(
  target: object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<unknownFunction>
): unknown {
  const originalMethod = descriptor.value as unknownFunction;
  descriptor.value = function (...args: unknown[]): unknown {
    console.log(`Starting ${propertyKey}...`);
    try {
      console.log(`Evaluating ${propertyKey} with arguments: ${args}`);
      const result = originalMethod.apply(this, args);
      console.log(`Finished ${propertyKey} with result: ${result}`);
      return result;
    }
    catch (e: unknown) {
      console.warn(`Problem finishing ${propertyKey}...`);
      throw e;
    }
  };
  return undefined;
}