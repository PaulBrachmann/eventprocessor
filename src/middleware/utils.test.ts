/**
 * @file Utility middleware test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import EventProcessor, { EventData } from '../eventprocessor';
import { classify, log, preventDefault, reduceIds, sideFx } from './utils';

describe('middleware', () => {
  it('should classify events', () => {
    const processor = new EventProcessor();
    const next = jest.fn();
    const classifier = classify({ type: ['device', 'action'] });

    const data: EventData = { event: new Event('type'), args: [] };
    expect(classifier(next, data, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(data.device).toBe('device');
    expect(data.eventType).toBe('action');

    // Test unknown event type
    const data2: EventData = { event: new Event('undef'), args: [] };
    expect(classifier(next, data2, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(2);
    expect(data2.device).toBe(undefined);
    expect(data2.eventType).toBe(undefined);
  });

  it('should log events', () => {
    const processor = new EventProcessor();
    const next = jest.fn();

    const data: EventData = { event: new Event('type'), args: [] };
    const data2: EventData = { event: new Event('type'), args: ['uuid'], ids: ['uuid'] };

    const initialConsoleLog = console.log;
    console.log = jest.fn();

    expect(log()(next, data, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledTimes(0);

    expect(log()(next, data2, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledTimes(1);

    expect(log(true)(next, data, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(3);
    expect(console.log).toHaveBeenCalledTimes(2);

    expect(log(true)(next, data2, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(4);
    expect(console.log).toHaveBeenCalledTimes(3);

    // TODO: Test production environment

    console.log = initialConsoleLog;
  });

  it('should prevent the default event action', () => {
    const processor = new EventProcessor();
    const next = jest.fn();

    const event = new CustomEvent('type', {
      cancelable: true,
    });
    event.preventDefault = jest.fn();
    event.stopPropagation = jest.fn();

    expect(preventDefault(true)(next, { event, args: [] }, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);

    expect(preventDefault()(next, { event, args: [] }, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(2);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);

    expect(preventDefault()(next, { event, args: [], ids: ['uuid'] }, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(3);
    expect(event.preventDefault).toHaveBeenCalledTimes(2);
    expect(event.stopPropagation).toHaveBeenCalledTimes(2);
  });

  it('should reduce the active ids', () => {
    const processor = new EventProcessor<{ ids: string[] }>();
    const next = jest.fn();

    expect(processor.get('ids')).toBe(undefined);

    // Test removing an id on initial state (ids = undefined)
    expect(reduceIds()(
      next,
      { event: new CustomEvent('end', { detail: { id: 'uuid' } }), args: [] },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(processor.get('ids')).toBe(undefined);

    // Test adding an id
    expect(reduceIds()(
      next,
      { event: new CustomEvent('start', { detail: { id: 'uuid' } }), args: [] },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(2);
    expect(processor.get('ids')).toEqual(['uuid']);

    expect(reduceIds()(
      next,
      { event: new CustomEvent('start', { detail: { id: 'uuid2' } }), args: [] },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(3);
    expect(processor.get('ids')).toEqual(['uuid', 'uuid2']);

    // Test unrecognized eventType
    expect(reduceIds()(
      next,
      { event: new CustomEvent('move', { detail: { id: 'uuid2' } }), args: [] },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(4);
    expect(processor.get('ids')).toEqual(['uuid', 'uuid2']);

    // Test adding an id
    expect(reduceIds()(
      next,
      { event: new CustomEvent('start', { detail: { id: 'uuid' } }), args: [] },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(5);
    expect(processor.get('ids')).toEqual(['uuid', 'uuid2', 'uuid']);

    // Test removing an id
    expect(reduceIds()(
      next,
      { event: new CustomEvent('end', { detail: { id: 'uuid2' } }), args: [] },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(6);
    expect(processor.get('ids')).toEqual(['uuid', 'uuid']);

    // Test id not sepcified
    expect(reduceIds()(
      next,
      { event: new CustomEvent('end'), args: [] },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(7);
    expect(processor.get('ids')).toEqual(['uuid', 'uuid']);

    // Test removing multiple ids
    expect(reduceIds()(
      next,
      { event: new CustomEvent('end', { detail: { id: 'uuid' } }), args: [] },
      processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(8);
    expect(processor.get('ids')).toEqual([]);
  });

  it('should execute side effects', () => {
    const processor = new EventProcessor();
    const next = jest.fn();

    const callback = jest.fn();

    const event = new Event('type');
    expect(sideFx(callback)(next, { event, args: [] }, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(event);

    jest.clearAllMocks();
    expect(sideFx(callback, 'type')(next, { event, args: [] }, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(event);

    jest.clearAllMocks();
    expect(sideFx(callback, 'otherType')(next, { event, args: [] }, processor)).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(0);

    jest.clearAllMocks();
    expect(sideFx(callback, ['type', 'type2'])(
      next, { event: new Event('type2'), args: [] }, processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();
    expect(sideFx(callback, ['type', 'type2'])(
      next, { event: new Event('type3'), args: [] }, processor,
    )).toBe(undefined);
    expect(next).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(0);
  });
});
