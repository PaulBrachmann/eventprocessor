/**
 * @file Gesturizer entry point
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

/**
 * Gesturizer
 * @module gesturizer
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import gesturizer from './gesturizer';
import { reduceIds } from './middleware';

// Reexport types for generated type declarations
import EventProcessor, { EventData } from '../../eventprocessor';
import { PointerState } from '../adapters/types';
import { GestureState } from './types';
export { EventData, EventProcessor, GestureState, PointerState };

export default () => [gesturizer(), reduceIds()];
