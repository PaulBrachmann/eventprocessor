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

import EventProcessor from './eventprocessor';
import adapters from './middleware/adapters';
import gesturizer from './middleware/gesturizer';
import { classify, preventDefault, sideFx } from './middleware/utils';
import { EventLike } from './types';

export default EventProcessor;
export { EventLike };

/** Default mouse/touch event map */
export const eventMap = {
  mousedown: ['mouse', 'start'],
  mousemove: ['mouse', 'move'],
  mouseup: ['mouse', 'end'],
  touchend: ['touch', 'end'],
  touchmove: ['touch', 'move'],
  touchstart: ['touch', 'start'],
  // wheel: ['wheel', 'wheel'], // TODO
};

/** Generic drag handler */
export class DragHandler extends EventProcessor {
  /** Create a new drag handler */
  constructor() {
    super();

    this.set('ids', []);
    this.init();
  }

  /** Register an event listener */
  public on(
    type: string | string[] | undefined,
    callback: (event: EventLike) => void,
  ): DragHandler {
    this.use(sideFx(callback, type));
    return this;
  }

  /** Initialize */
  private init() {
    this.use(
      classify(eventMap),
      ...adapters(),
      ...gesturizer(),
      preventDefault(),
    );
  }
}
