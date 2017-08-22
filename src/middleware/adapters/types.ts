/**
 * Shared Types
 * @module adapters/types
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import Pointer from './internal/pointer';

export { Pointer };
export interface PointerState<ID> {
  pointers: { [pointerId: string]: Pointer<ID> };
}
