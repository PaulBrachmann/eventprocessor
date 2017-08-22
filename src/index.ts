/**
 * @file Main entry point
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

/**
 * Drag Handler
 * @module eventprocessor
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import EventProcessor, { EventData, EventMiddleware } from './eventprocessor';
import { EventLike } from './types';

export default EventProcessor;
export { EventData, EventLike, EventMiddleware };
