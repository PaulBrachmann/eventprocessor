/* eslint-disable import/prefer-default-export */

export type NestedArray<T> = (NestedArray<T> | T)[];

/** Flattens an array of arrays */
export const flattenArray = <T>(
  array: NestedArray<T>,
  flattened: T[] = [],
): T[] => {
  if (array.length === 0) return array as [];

  array.forEach((value: T | NestedArray<T>) => {
    if (Array.isArray(value)) {
      flattenArray(value, flattened);
    } else {
      flattened.push(value);
    }
  });

  return flattened;
};
