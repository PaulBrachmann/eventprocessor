/**
 * Mouse Adapter
 * @module adapters/mouse
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { EventMiddleware } from '../../eventprocessor';

import Pointer from './internal/pointer';
import { PointerState } from './types';

export const pointerId = 'mouse';

/** Mouse adapter, generates & tracks pointer data for mouse events */
const mouseAdapter = <ID, T extends PointerState<ID>>(): EventMiddleware<T> =>
  (
    next,
    data,
    eventProcessor,
  ) => {
    if (data.device === 'mouse') {
      const type = data.eventType;

      let pointers = eventProcessor.get('pointers');
      let pointer: Pointer<ID> | undefined;

      if (type === 'start') {
        // Get id from caller arguments
        const id = data.args[0];

        if (id !== undefined) {
          const { event } = data;
          // Create pointer
          pointer = new Pointer(
            id,
            {
              clientX: (event as MouseEvent).clientX,
              clientY: (event as MouseEvent).clientY,
            },
            data.device,
          );

          // Write id to context
          data.ids = [id];
        }
      } else if (pointers) {
        // Get registered pointer (if any)
        pointer = pointers[pointerId];

        if (pointer) {
          if (type === 'move') {
            const { event } = data;
            // Update pointer
            pointer.detail = {
              clientX: (event as MouseEvent).clientX,
              clientY: (event as MouseEvent).clientY,
            };
          }

          // Get id & write to context
          data.ids = [pointer.id];

          if (type === 'end') {
            // Prevent write
            pointer = undefined;
            // Delete pointer
            delete pointers[pointerId];
          }
        }
      }

      if (pointer) {
        // Write pointer to state
        if (!pointers) pointers = {};
        pointers[pointerId] = pointer;
        eventProcessor.set('pointers', pointers);
      }
    }

    next();
  };

export default mouseAdapter;
