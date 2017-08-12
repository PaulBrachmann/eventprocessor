/**
 * Event Processor Utilities
 * @module eventprocessor/utils
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

/** Flatten an array of arrays */
export const flattenArray = <T>(array: T[], result: T[] = []): T[] => {
  if (array.length === 0) return array;

  array.forEach((value: T | T[]) => {
    if (Array.isArray(value)) {
      flattenArray(value, result);
    } else {
      result.push(value);
    }
  });

  return result;
};

/** Middleware's ```next()``` function signature */
export type Next = () => void;
/** Middleware function signature */
export type Middleware<T> = (next: Next, ...args: T[]) => void;

/** Compose middleware functions */
export const composeMiddleware = <T>(...args: T[]) =>
  (...middleware: Middleware<T>[]): Next => {
    const _middleware = flattenArray(middleware);
    const middlewareCount = _middleware.length;

    if (!middlewareCount) return () => {/* continue */};

    const dispatch = (position: number): Next => () => {
      const current = _middleware[position];
      const next = position < (middlewareCount - 1) ?
        dispatch(position + 1)
      : () => {/* continue */};

      current(next, ...args);
    };

    return dispatch(0);
  };
