/**
 * Atomic Handler
 * @module eventprocessor/presets/atomichandler
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import EventProcessor from '../eventprocessor';
import adapters from '../middleware/adapters';
import atomizer from '../middleware/atomizer';
import { classify, eventMap, preventDefault, reduceIds, sideFx } from '../middleware/utils';
import { EventLike } from '../types';

/** Atomic pointer handler */
export default class AtomicHandler extends EventProcessor {
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
  ): AtomicHandler {
    this.use(sideFx(callback, type));
    return this;
  }

  /** Initialize */
  private init() {
    this.use(
      classify(eventMap),
      ...adapters(),
      atomizer(),
      reduceIds(),
      preventDefault(),
    );
  }
}
