/* eslint-disable import/prefer-default-export */

import { EventLike } from "./types";

export type NestedArray<T> = (NestedArray<T> | T)[];

/** Flattens an array of arrays. */
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

/** Returns true if the filter is satisfied. */
export const doesMatchFilter = <T>(value: T, filter?: T | T[]) =>
  !!(
    filter === undefined ||
    value === filter ||
    (Array.isArray(filter) && ~filter.indexOf(value))
  );

/**
 * Returns a clone of the given event with all properties given in `override`
 * replaced by their respective values.
 *
 * @param event
 * @param event
 */
export const deriveEvent = <E extends EventLike, O extends Partial<E>>(
  event: E,
  override: O = {} as any,
) => {
  function ClonedEvent(this: E) {}
  const derived = new ((ClonedEvent as any) as { new (): E })();

  let property: keyof E;
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (property in event) {
    const descriptor = Object.getOwnPropertyDescriptor(event, property);
    if (descriptor && (descriptor.get || descriptor.set)) {
      Object.defineProperty(derived, property, descriptor);
    } else {
      derived[property] = event[property];
    }
  }
  Object.assign(derived, override);
  Object.setPrototypeOf(derived, event);
  return derived;
};
