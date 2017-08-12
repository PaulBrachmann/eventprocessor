/**
 * @file Entry point test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

/**
 * Important: This test also serves as a point to
 * import the entire lib for coverage reporting
 */

import EventProcessor, * as lib from './';

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
});

describe('drag handler', () => {
  it('should be a valid event processor', () => {
    expect(new lib.DragHandler()).toBeInstanceOf(EventProcessor);
  });

  it('should allow you to register callbacks', () => {
    const dragHandler = new lib.DragHandler();
    expect(dragHandler.on(undefined, () => {/**/})).toBe(dragHandler);
    expect(dragHandler.on('type', () => {/**/})).toBe(dragHandler);
  });
});
