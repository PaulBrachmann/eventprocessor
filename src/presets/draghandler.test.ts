/**
 * @file Drag handler test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import EventProcessor from '../eventprocessor';

import DragHandler from './draghandler';

describe('drag handler', () => {
  it('should be a valid event processor', () => {
    expect(new DragHandler()).toBeInstanceOf(EventProcessor);
  });

  it('should allow you to register callbacks', () => {
    const dragHandler = new DragHandler();
    expect(dragHandler.on(undefined, () => {/**/})).toBe(dragHandler);
    expect(dragHandler.on('type', () => {/**/})).toBe(dragHandler);
  });
});
