/**
 * @file Gesturizer entry point test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

/**
 * Important: This test also serves as a point to
 * import the entire lib for coverage reporting
 */

import middleware, * as lib from './';

describe('entry point', () => {
  it('should have exports', () => {
    expect(lib).toBeTruthy();
    expect(Object.keys(lib).length).not.toBe(0);
  });

  // Typescript type exports appear as undefined while testing
  xit('should not have undefined exports', () => {
    Object.keys(lib).forEach((key) => {
      expect((lib as { [key: string]: any })[key]).toBeTruthy();
    });
  });

  it('should export a function that emits an array of middleware', () => {
    const middlewareArray = middleware();
    expect(middlewareArray.length);
    middlewareArray.forEach((fn) => {
      expect(typeof fn).toBe('function');
    });
  });
});
