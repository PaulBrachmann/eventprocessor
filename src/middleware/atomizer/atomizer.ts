/**
 * Atomizer Middleware
 * @module atomizer/atomizer
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { EventMiddleware } from '../../eventprocessor';

import Pointer from '../adapters/internal/pointer';
import { PointerContextState } from './types';

/** Create a new pointer event */
export const createPointerEvent = (
  type: string,
  pointer: Pointer<any>,
  context?: { [key: string]: any },
) =>
  new CustomEvent(type, {
    detail: {
      context,
      id: pointer.id,
      pointer,
    },
  });

/** Atomizer, manages pointer context & dispatches pointer events */
const atomizer = <
  ID extends number | string,
  T extends PointerContextState
>(): EventMiddleware<T> =>
  (
    next,
    data,
    eventProcessor,
  ) => {
    if (data.pointers) {
      const type = data.eventType;
      let pointerContexts = eventProcessor.get('pointerContexts');

      if (type === 'start') {
        data.pointers.forEach((pointer: Pointer<ID>) => {
          const pointerId = pointer.detail.identifier;

          // Create context
          const context = {};

          if (!pointerContexts) pointerContexts = {};

          // Write context to state
          pointerContexts[pointerId] = context;

          // Dispatch start event
          eventProcessor.dispatch(createPointerEvent('start', pointer, context));
        });
      } else {
        data.pointers.forEach((pointer: Pointer<ID>) => {
          const pointerId = pointer.detail.identifier;

          // Dispatch move/end event
          eventProcessor.dispatch(createPointerEvent(
            type,
            pointer,
            pointerContexts ? pointerContexts[pointerId] : undefined,
          ));

          // Delete context from state
          if (type === 'end' && pointerContexts) delete pointerContexts[pointerId];
        });
      }

      eventProcessor.set('pointerContexts', pointerContexts);
    }

    next();
  };

export default atomizer;
