/**
 * @file Utilities test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import { composeMiddleware, flattenArray } from './utils';

describe('utilities', () => {
  it('should flatten arrays', () => {
    expect(flattenArray([])).toEqual([]);
    expect(flattenArray([1, 2, 3])).toEqual([1, 2, 3]);

    expect(flattenArray([[]])).toEqual([]);
    expect(flattenArray([1, [2], 3])).toEqual([1, 2, 3]);
    expect(flattenArray([1, [2, 3]])).toEqual([1, 2, 3]);
    expect(flattenArray([[1, [2, [[3], [[4]]]]]])).toEqual([1, 2, 3, 4]);
  });

  it('should compose middleware functions', () => {
    const args = ['val', 1, [], { k: 'v' }];

    // Test w/o middleware
    expect(composeMiddleware()()()).toBe(undefined);
    expect(composeMiddleware(...args)()()).toBe(undefined);

    // Test w/ middleware calling next
    const mock = jest.fn((next) => { next(); });
    expect(composeMiddleware(...args)(mock, mock, mock)()).toBe(undefined);

    expect(mock).toHaveBeenCalledTimes(3);
    expect(mock.mock.calls[0].filter((_: any, k) => k !== 0)).toEqual(args);
    expect(mock.mock.calls[1].filter((_: any, k) => k !== 0)).toEqual(args);
    expect(mock.mock.calls[2].filter((_: any, k) => k !== 0)).toEqual(args);

    // Test w/ dumb middleware
    const mock2 = jest.fn();
    expect(composeMiddleware(...args)(mock2, mock2, mock2)()).toBe(undefined);
    expect(mock2).toHaveBeenCalledTimes(1);
    expect(mock.mock.calls[0].filter((_: any, k) => k !== 0)).toEqual(args);
  });
});
