/**
 * @file Touch adapter test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import EventProcessor, { Next } from '../../eventprocessor';
import Pointer from './internal/pointer';
import { PointerState } from './types';

import touchAdapter from './touch';

describe.only('touch adapter', () => {
  const processor = new EventProcessor<PointerState<string>>();
  let pointer: Pointer<string>;
  let pointer2: Pointer<string>;

  let next: Next;
  beforeEach(() => {
    next = jest.fn();
  });

  const createTouch = (identifier: number, clientX: number = 0, clientY: number = 0): Touch => ({
    clientX,
    clientY,
    identifier,
    pageX: clientX,
    pageY: clientY,
    screenX: clientX,
    screenY: clientY,
    target: document.createElement('div'),
  });
  const createTouchEvent = (type: string, changedTouches: Touch[]) => ({
    altKey: false,
    changedTouches,
    targetTouches: [],
    touches: changedTouches,
    type,
  }) as any;

  it('should do nothing for an unclassified event', () => {
    expect(touchAdapter()(
      next,
      {
        args: [],
        event: createTouchEvent('touchstart', [createTouch(0), createTouch(1)]),
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointers')).toBe(undefined);
  });

  it('should do nothing for an unrecognized event', () => {
    expect(touchAdapter()(
      next,
      {
        args: ['uuid'],
        device: 'touch',
        event: createTouchEvent('touchstart', [createTouch(0), createTouch(1)]),
        eventType: 'undef',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointers')).toBe(undefined);
  });

  it('should do nothing if no id is passed with start event', () => {
    expect(touchAdapter()(
      next,
      {
        args: [],
        device: 'touch',
        event: createTouchEvent('touchstart', [createTouch(0), createTouch(1)]),
        eventType: 'start',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointers')).toBe(undefined);
  });

  it('should create a new pointer', () => {
    expect(touchAdapter()(
      next,
      {
        args: ['uuid'],
        device: 'touch',
        event: createTouchEvent('touchstart', [createTouch(0, 0, 0), createTouch(1, 64, 64)]),
        eventType: 'start',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);

    pointer = new Pointer(
      'uuid',
      { clientX: 0, clientY: 0, event: createTouch(0, 0, 0), identifier: 't/0' },
      'touch',
    );
    pointer2 = new Pointer(
      'uuid',
      { clientX: 64, clientY: 64, event: createTouch(1, 64, 64), identifier: 't/1' },
      'touch',
    );
    expect(processor.get('pointers')).toEqual({ 't/0': pointer, 't/1': pointer2 });
  });

  it('should update a pointer', () => {
    expect(touchAdapter()(
      next,
      {
        args: [],
        device: 'touch',
        event: createTouchEvent('touchmove', [createTouch(0, 64, 16), createTouch(1, 32, 24)]),
        eventType: 'move',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);

    pointer.detail = {
      clientX: 64,
      clientY: 16,
      event: createTouch(0, 64, 16),
      identifier: 't/0',
    };
    pointer2.detail = {
      clientX: 32,
      clientY: 24,
      event: createTouch(1, 32, 24),
      identifier: 't/1',
    };
    expect(processor.get('pointers')).toEqual({ 't/0': pointer, 't/1': pointer2 });
  });

  it('should delete a pointer', () => {
    expect(touchAdapter()(
      next,
      {
        args: [],
        device: 'touch',
        event: createTouchEvent('touchend', [createTouch(0), createTouch(1)]),
        eventType: 'end',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointers')).toEqual({});
  });

  it('should do nothing when trying to modify a non-existent pointer', () => {
    expect(touchAdapter()(
      next,
      {
        args: [],
        device: 'touch',
        event: createTouchEvent('touchmove', [createTouch(0), createTouch(1)]),
        eventType: 'move',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointers')).toEqual({});
  });
});
