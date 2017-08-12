/**
 * @file Mouse adapter test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import EventProcessor, { Next } from '../../eventprocessor';
import Pointer from './internal/pointer';
import { PointerState } from './types';

import mouseAdapter from './mouse';

describe('mouse adapter', () => {
  const processor = new EventProcessor<PointerState<string>>();
  let pointer: Pointer<string>;

  let next: Next;
  beforeEach(() => {
    next = jest.fn();
  });

  it('should do nothing for an unclassified event', () => {
    expect(mouseAdapter()(
      next,
      {
        args: [],
        event: new MouseEvent('mousedown', { clientX: 0, clientY: 0 }),
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointers')).toBe(undefined);
  });

  it('should do nothing for an unrecognized event', () => {
    expect(mouseAdapter()(
      next,
      {
        args: ['uuid'],
        device: 'mouse',
        event: new MouseEvent('mousedown', { clientX: 0, clientY: 0 }),
        eventType: 'undef',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointers')).toBe(undefined);
  });

  it('should do nothing if no id is passed with start event', () => {
    expect(mouseAdapter()(
      next,
      {
        args: [],
        device: 'mouse',
        event: new MouseEvent('mousedown', { clientX: 0, clientY: 0 }),
        eventType: 'start',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointers')).toBe(undefined);
  });

  it('should create a new pointer', () => {
    expect(mouseAdapter()(
      next,
      {
        args: ['uuid'],
        device: 'mouse',
        event: new MouseEvent('mousedown', { clientX: 32, clientY: 24 }),
        eventType: 'start',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);

    pointer = new Pointer('uuid', { clientX: 32, clientY: 24 }, 'mouse');
    expect(processor.get('pointers')).toEqual({ mouse: pointer });
  });

  it('should update a pointer', () => {
    expect(mouseAdapter()(
      next,
      {
        args: [],
        device: 'mouse',
        event: new MouseEvent('mousemove', { clientX: 64, clientY: 32 }),
        eventType: 'move',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);

    pointer.detail = { clientX: 64, clientY: 32 };
    expect(processor.get('pointers')).toEqual({ mouse: pointer });
  });

  it('should delete a pointer', () => {
    expect(mouseAdapter()(
      next,
      {
        args: [],
        device: 'mouse',
        event: new MouseEvent('mouseup', { clientX: 64, clientY: 32 }),
        eventType: 'end',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointers')).toEqual({});
  });

  it('should do nothing when trying to modify a non-existent pointer', () => {
    expect(mouseAdapter()(
      next,
      {
        args: [],
        device: 'mouse',
        event: new MouseEvent('mousemove', { clientX: 64, clientY: 32 }),
        eventType: 'move',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointers')).toEqual({});
  });
});
