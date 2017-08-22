/**
 * @file Atomic handler test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import EventProcessor from '../eventprocessor';

import AtomicHandler from './atomichandler';

describe('drag handler', () => {
  it('should be a valid event processor', () => {
    expect(new AtomicHandler()).toBeInstanceOf(EventProcessor);
  });

  it('should allow you to register callbacks', () => {
    const atomicHandler = new AtomicHandler();
    expect(atomicHandler.on(undefined, () => {/**/})).toBe(atomicHandler);
    expect(atomicHandler.on('type', () => {/**/})).toBe(atomicHandler);
  });
});
