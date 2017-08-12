/**
 * @file Gesturizer middleware test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import EventProcessor from '../../eventprocessor';
import { reduceIds } from './middleware';

describe('middleware', () => {
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
});
