/**
 * Drag Handler
 * @module eventprocessor/presets/draghandler
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import EventProcessor from '../eventprocessor';
import adapters from '../middleware/adapters';
import gesturizer from '../middleware/gesturizer';
import { classify, eventMap, preventDefault, reduceIds, sideFx } from '../middleware/utils';
import { EventLike } from '../types';

/** Generic drag handler */
export default class DragHandler extends EventProcessor {
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
      gesturizer(),
      reduceIds(),
      preventDefault(),
    );
  }
}
