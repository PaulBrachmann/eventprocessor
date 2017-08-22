/**
 * Pointer
 * @module adapters/internal/pointer
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { EventLike } from '../../../types';

export interface PointerDetail {
  _scale?: number;
  clientX: number;
  clientY: number;
  event?: EventLike | Touch;
  identifier: string;
  [prop: string]: any;
}

/** Pointer */
class Pointer<ID> {
  constructor(
    /** Associates the pointer with an ui element */
    public id: ID,
    /** Pointer detail, stores pointer position */
    public detail: PointerDetail,
    /** The device identifier (e.g. 'mouse' or 'touch') */
    public device: string,
  ) {}
}

export default Pointer;
