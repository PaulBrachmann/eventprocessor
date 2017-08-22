/**
 * Shared Types
 * @module atomizer/types
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

export interface PointerContextState {
  pointerContexts: { [pointerId: string]: { [key: string]: any } };
}
