/**
 * Shared Types
 * @module gesturizer/types
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import Gesture from './internal/gesture';
import TransformData from './internal/transformdata';

export { Gesture, TransformData };
export interface GestureState {
  gestures: { [id: string]: Gesture, [id: number]: Gesture };
}
