/**
 * @file atomizer test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import EventProcessor, { Next } from '../../eventprocessor';
import Pointer from '../adapters/internal/pointer';
import { PointerContextState } from './types';

import atomizer, { createPointerEvent } from './atomizer';

describe('utils', () => {

  it('should create a pointer event', () => {
    const pointer = new Pointer('uuid', { clientX: 0, clientY: 0, identifier: 't/0' }, 'touch');
    const event = createPointerEvent('start', pointer, {});
    expect(event.type).toBe('start');
    expect(event.detail).toEqual({ context: {}, id: 'uuid', pointer });
  });
});

describe('atomizer', () => {
  const pointers = [
    new Pointer('uuid', { clientX: 0, clientY: 0, identifier: 't/0' }, 'touch'),
    new Pointer('uuid2', { clientX: 32, clientY: 8, identifier: 't/1' }, 'touch'),
    new Pointer('uuid', { clientX: 128, clientY: 128, identifier: 't/2' }, 'touch'),
  ];
  const processor = new EventProcessor<PointerContextState>();

  let next: Next;
  beforeEach(() => {
    next = jest.fn();
    processor.dispatch = jest.fn();
  });

  it('should do nothing for an unrecognized event', () => {
    expect(atomizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'start',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointerContexts')).toBe(undefined);

    expect(processor.dispatch).toHaveBeenCalledTimes(0);
  });

  it('should not fail when trying to remove or update a pointer on the initial state', () => {
    expect(atomizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'move',
        pointers,
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointerContexts')).toBe(undefined);

    expect(processor.dispatch).toHaveBeenCalledTimes(3);
    const event = createPointerEvent('move', pointers[0]);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[0][0].type).toBe(event.type);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[0][0].detail).toEqual(event.detail);
    const event2 = createPointerEvent('move', pointers[1]);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[1][0].type).toBe(event2.type);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[1][0].detail).toEqual(event2.detail);
    const event3 = createPointerEvent('move', pointers[2]);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[2][0].type).toBe(event3.type);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[2][0].detail).toEqual(event3.detail);

    expect(atomizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'end',
        pointers,
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(2);
    expect(processor.get('pointerContexts')).toBe(undefined);

    expect(processor.dispatch).toHaveBeenCalledTimes(6);
  });

  it('should create a new pointer context', () => {
    expect(atomizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'start',
        pointers,
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointerContexts')).toEqual({ 't/0': {}, 't/1': {}, 't/2': {} });

    expect(processor.dispatch).toHaveBeenCalledTimes(3);

    const event = createPointerEvent('start', pointers[0], {});
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[0][0].type).toBe(event.type);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[0][0].detail).toEqual(event.detail);
    const event2 = createPointerEvent('start', pointers[1], {});
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[1][0].type).toBe(event2.type);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[1][0].detail).toEqual(event2.detail);
    const event3 = createPointerEvent('start', pointers[2], {});
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[2][0].type).toBe(event3.type);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[2][0].detail).toEqual(event3.detail);
  });

  it('should not fail when trying to remove or update a non-existent pointer', () => {
    const pointer4 = new Pointer(
      'uuid',
      { clientX: 128, clientY: 128, identifier: 't/4' },
      'touch',
    );

    expect(atomizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'move',
        pointers: [pointer4],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('pointerContexts')).toEqual({ 't/0': {}, 't/1': {}, 't/2': {} });

    expect(processor.dispatch).toHaveBeenCalledTimes(1);
    const event = createPointerEvent('move', pointer4);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[0][0].type).toBe(event.type);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[0][0].detail).toEqual(event.detail);

    expect(atomizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'end',
        pointers: [pointer4],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(2);
    expect(processor.get('pointerContexts')).toEqual({ 't/0': {}, 't/1': {}, 't/2': {} });

    expect(processor.dispatch).toHaveBeenCalledTimes(2);
    const event2 = createPointerEvent('end', pointer4);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[1][0].type).toBe(event2.type);
    expect((processor.dispatch as jest.Mock<{}>).mock.calls[1][0].detail).toEqual(event2.detail);
  });
});
