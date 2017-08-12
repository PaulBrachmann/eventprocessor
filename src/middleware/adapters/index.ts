/**
 * @file Event adapters entry point
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

/**
 * Event adapters
 * @module adapters
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import mouse from './mouse';
import touch from './touch';

// Reexport types for generated type declarations
import EventProcessor, { EventData } from '../../eventprocessor';
import { PointerState } from './types';
export { EventData, EventProcessor, PointerState };

export default () => [mouse(), touch()];
