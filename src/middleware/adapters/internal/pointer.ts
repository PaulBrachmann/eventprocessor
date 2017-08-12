/**
 * Pointer
 * @module adapters/internal/pointer
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

export interface PointerDetail {
  clientX: number;
  clientY: number;
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
