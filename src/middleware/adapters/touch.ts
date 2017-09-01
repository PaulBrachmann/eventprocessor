/**
 * Touch Adapter
 * @module adapters/touch
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { EventMiddleware } from '../../eventprocessor';

import Pointer from './internal/pointer';
import { PointerState } from './types';

export const pointerIdPrefix = 't/';

/** Iterate touches */
export const forEachTouches = (touches: TouchList, callback: (touch: Touch) => void) => {
  let { length } = touches;

  while (~(length -= 1)) { // tslint:disable-line no-conditional-assignment
    callback(touches[length]);
  }
};

/** Touch adapter, generates & tracks pointer data for touch events */
const touchAdapter = <ID, T extends PointerState<ID>>(): EventMiddleware<T> =>
  (
    next,
    data,
    eventProcessor,
  ) => {
    if (data.device === 'touch') {
      const type = data.eventType;

      let pointers = eventProcessor.get('pointers');
      const currentPointers = data.pointers || [];

      if (type === 'start') {
        // Get id from caller arguments
        const id = data.args[0];

        if (id !== undefined) {
          // Iterate changed touches
          forEachTouches((data.event as TouchEvent).changedTouches, (touch) => {
            if (!pointers) pointers = {};

            const pointerId = `${pointerIdPrefix}${touch.identifier}`;

            // Create pointer
            const pointer = new Pointer(
              id,
              {
                clientX: touch.clientX,
                clientY: touch.clientY,
                event: touch,
                identifier: pointerId,
              },
              'touch',
            );

            pointers[pointerId] = pointer;
            currentPointers.push(pointer);
          });

          // Write id to context
          data.ids = [id];

          // Write pointers to state
          eventProcessor.set('pointers', pointers);
        }

        return next();
      } else if (pointers) {
        const ids: { [id: string]: true } = {};

        // Iterate changed touches
        forEachTouches((data.event as TouchEvent).changedTouches, (touch) => {
          const pointerId = `${pointerIdPrefix}${touch.identifier}`;

          // Get registered pointer (if any)
          const pointer = (pointers as { [key: string]: Pointer<ID> })[pointerId];
          currentPointers.push(pointer);

          if (pointer) {
            if (type === 'move') {
              // Update pointer
              pointer.detail = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                event: touch,
                identifier: pointerId,
              };
            }

            // Get id & write to dedupe map
            (ids as any)[pointer.id] = true;

            if (type === 'end') {
              // Delete pointer
              delete (pointers as { [key: string]: Pointer<ID> })[pointerId];
            }
          }
        });

        // Write ids to context
        data.ids = Object.keys(ids);

        // Write pointers to context
        data.pointers = currentPointers;
      }
    }

    next();
  };

export default touchAdapter;
