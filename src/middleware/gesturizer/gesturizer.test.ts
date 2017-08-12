/**
 * @file Gesturizer test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import EventProcessor, { Next } from '../../eventprocessor';
import Pointer from '../adapters/internal/pointer';
import { PointerState } from '../adapters/types';
import Gesture from './internal/gesture';
import TransformData from './internal/transformdata';
import { GestureState } from './types';

import gesturizer, { createGestureEvent, filterPointers } from './gesturizer';

describe('utils', () => {
  it('should create a filtered array of pointers', () => {
    const pointers = {
      pointer: new Pointer('uuid', { clientX: 24, clientY: 0 }, 'touch'),
      pointer2: new Pointer('uuid2', { clientX: 16, clientY: 64 }, 'touch'),
      pointer3: new Pointer('uuid', { clientX: 256, clientY: 512 }, 'touch'),
    };

    const initialObjectValues = (Object as { [key: string]: any }).values;

    // Test w/o Object.values
    (Object as { [key: string]: any }).values = undefined;
    expect(filterPointers(pointers, 'uuid')).toEqual([pointers.pointer, pointers.pointer3]);

    // Test w/ polyfilled Object.values
    (Object as { [key: string]: any }).values = (object: { [key: string]: any }) =>
      Object.keys(object).map((key) => object[key]);
    expect(filterPointers(pointers, 'uuid')).toEqual([pointers.pointer, pointers.pointer3]);

    (Object as { [key: string]: any }).values = initialObjectValues;
  });

  it('should create a gesture event', () => {
    const gesture = new Gesture();
    const event = createGestureEvent('start', gesture, 'uuid');
    expect(event.type).toBe('start');
    expect(event.detail).toEqual({ context: {}, id: 'uuid', offset: gesture.getOffset() });
  });
});

describe('gesturizer', () => {

  const pointers: { [key: string]: Pointer<string> } = {
    pointer: new Pointer('uuid', { clientX: 0, clientY: 0 }, 'touch'),
    pointer2: new Pointer('uuid2', { clientX: 32, clientY: 8 }, 'touch'),
    pointer3: new Pointer('uuid', { clientX: 128, clientY: 128 }, 'touch'),
  };
  const processor = new EventProcessor<PointerState<string> & GestureState>();
  let gesture: Gesture;
  let gesture2: Gesture;

  let next: Next;
  beforeEach(() => {
    next = jest.fn();
    processor.dispatch = jest.fn();
  });

  it('should do nothing if the pointers field is missing in the processor\'s state', () => {
    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'start',
        ids: ['uuid'],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('gestures')).toBe(undefined);

    expect(processor.dispatch).toHaveBeenCalledTimes(0);

    // Set pointers field for following tests
    processor.set('pointers', pointers);
  });

  it('should do nothing for an unrecognized event', () => {
    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'start',
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('gestures')).toBe(undefined);

    expect(processor.dispatch).toHaveBeenCalledTimes(0);
  });

  it('should do nothing when trying to remove or update a gesture on the initial state', () => {
    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'move',
        ids: ['uuid'],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('gestures')).toBe(undefined);

    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'end',
        ids: ['uuid'],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(2);
    expect(processor.get('gestures')).toBe(undefined);

    expect(processor.dispatch).toHaveBeenCalledTimes(0);
  });

  it('should create a new gesture', () => {
    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'start',
        ids: ['uuid'],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);

    gesture = new Gesture(
      TransformData.fromPointers([pointers.pointer, pointers.pointer3]),
      { id: 'uuid' },
    );
    expect(processor.get('gestures')).toEqual({ uuid: gesture });

    expect(processor.dispatch).toHaveBeenCalledTimes(1);
    const args = (processor.dispatch as jest.Mock<{}>).mock.calls[0];
    expect(args.length).toBe(1);
    const event = createGestureEvent('start', gesture, 'uuid');
    expect(args[0]).toEqual(event);
    expect(args[0].type).toBe(event.type);
    expect(args[0].detail).toEqual(event.detail);

    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'start',
        ids: ['uuid2'],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(2);

    gesture2 = new Gesture(
      TransformData.fromPointers([pointers.pointer2]),
      { id: 'uuid2' },
    );
    expect(processor.get('gestures')).toEqual({ uuid: gesture, uuid2: gesture2 });

    expect(processor.dispatch).toHaveBeenCalledTimes(2);
    const args2 = (processor.dispatch as jest.Mock<{}>).mock.calls[1];
    expect(args2.length).toBe(1);
    const event2 = createGestureEvent('start', gesture2, 'uuid2');
    expect(args2[0]).toEqual(event2);
    expect(args2[0].type).toBe(event2.type);
    expect(args2[0].detail).toEqual(event2.detail);
  });

  it('should add a pointer to an existing gesture', () => {
    pointers.pointer4 = new Pointer('uuid', { clientX: 64, clientY: 64 }, 'touch');

    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'start',
        ids: ['uuid'],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);

    gesture.rebase(
      TransformData.fromPointers([pointers.pointer, pointers.pointer3, pointers.pointer4]),
    );
    expect(processor.get('gestures')).toEqual({ uuid: gesture, uuid2: gesture2 });

    expect(processor.dispatch).toHaveBeenCalledTimes(0);
  });

  it('should do nothing when trying to remove or update a non-existent gesture', () => {
    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'move',
        ids: ['uuid3'],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('gestures')).toEqual({ uuid: gesture, uuid2: gesture2 });

    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'end',
        ids: ['uuid3'],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(2);
    expect(processor.get('gestures')).toEqual({ uuid: gesture, uuid2: gesture2 });

    expect(processor.dispatch).toHaveBeenCalledTimes(0);
  });

  it('should update a gesture', () => {
    pointers.pointer.detail = { clientX: 64, clientY: 128 };
    pointers.pointer3.detail = { clientX: 512, clientY: 256 };

    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'move',
        ids: ['uuid'],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);

    gesture.setPointer(
      TransformData.fromPointers([pointers.pointer, pointers.pointer3, pointers.pointer4]),
    );
    expect(processor.get('gestures')).toEqual({ uuid: gesture, uuid2: gesture2 });

    expect(processor.dispatch).toHaveBeenCalledTimes(1);
    const args = (processor.dispatch as jest.Mock<{}>).mock.calls[0];
    expect(args.length).toBe(1);
    const event = createGestureEvent('move', gesture, 'uuid');
    expect(args[0]).toEqual(event);
    expect(args[0].type).toBe(event.type);
    expect(args[0].detail).toEqual(event.detail);
  });

  it('should delete a pointer from an existing gesture', () => {
    delete pointers.pointer3;

    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'end',
        ids: ['uuid'],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);

    gesture.rebase(
      TransformData.fromPointers([pointers.pointer, pointers.pointer4]),
    );
    expect(processor.get('gestures')).toEqual({ uuid: gesture, uuid2: gesture2 });

    expect(processor.dispatch).toHaveBeenCalledTimes(0);
  });

  it('should delete a gesture', () => {
    delete pointers.pointer;
    delete pointers.pointer4;

    expect(gesturizer()(
      next,
      {
        args: [],
        event: new Event('type'),
        eventType: 'end',
        ids: ['uuid'],
      },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);

    expect(processor.get('gestures')).toEqual({ uuid2: gesture2 });

    expect(processor.dispatch).toHaveBeenCalledTimes(1);
    const args = (processor.dispatch as jest.Mock<{}>).mock.calls[0];
    expect(args.length).toBe(1);
    const event = createGestureEvent('end', gesture, 'uuid');
    expect(args[0]).toEqual(event);
    expect(args[0].type).toBe(event.type);
    expect(args[0].detail).toEqual(event.detail);
  });
});
