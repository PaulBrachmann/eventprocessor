/**
 * Gesturizer Middleware
 * @module gesturizer/gesturizer
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { EventMiddleware } from '../../eventprocessor';

import Pointer from '../adapters/internal/pointer';
import { PointerState } from '../adapters/types';
import Gesture from './internal/gesture';
import TransformData from './internal/transformdata';
import { GestureState } from './types';

/** Create an array of pointers for the given id */
export const filterPointers = <ID extends number | string>(
  pointers: { [pointerId: string]: Pointer<ID> },
  id: ID,
): Pointer<ID>[] =>
  // Create an array of pointers from the input map
  (typeof (Object as { [key: string]: any }).values === 'function' ?
    (Object as { [key: string]: any }).values(pointers)
  : Object.keys(pointers).map((key) => pointers[key]))
    // Filter pointers by id
    .filter((pointer: Pointer<ID>) => pointer.id === id);

/** Create a new gesture event */
export const createGestureEvent = <ID>(type: string, gesture: Gesture, id: ID) =>
  new CustomEvent(type, {
    detail: {
      context: gesture.context,
      id,
      offset: gesture.getOffset(),
    },
  });

/** Gesturizer, manages gestures & dispatches gesture events */
const gesturizer = <
  ID extends number | string,
  T extends GestureState & PointerState<ID>
>(): EventMiddleware<T> =>
  (
    next,
    data,
    eventProcessor,
  ) => {
    const { ids } = data;

    if (ids) {
      const pointers = eventProcessor.get('pointers');
      if (pointers) {
        let gestures = eventProcessor.get('gestures');

        switch (data.eventType) {
          case 'start':
            // Handle each changed id
            ids.forEach((id: string | number) => {
              let gesture = gestures ? gestures[id] : undefined;
              if (gesture) { // Check if other pointers are already involved in this gesture
                // Rebase gesture
                gesture.rebase(TransformData.fromPointers(
                  filterPointers(pointers, id),
                ));
              } else {
                // Create new gesture
                gesture = new Gesture(
                  TransformData.fromPointers(
                    filterPointers(pointers, id),
                  ),
                  { id },
                );

                if (!gestures) gestures = {};

                // Write gesture to state
                gestures[id] = gesture;

                // Dispatch start event
                eventProcessor.dispatch(createGestureEvent('start', gesture, id));
              }
            });
            break;

          case 'move':
            if (gestures) {
              // Handle each changed id
              ids.forEach((id: string | number) => {
                const gesture = (gestures as GestureState['gestures'])[id];
                if (gesture) {
                  // Update gesture
                  gesture.setPointer(TransformData.fromPointers(
                    filterPointers(pointers, id),
                  ));

                  // Dispatch move event
                  eventProcessor.dispatch(createGestureEvent('move', gesture, id));
                }
              });
            }
            break;

          case 'end':
            if (gestures) {
              // Handle each changed id
              ids.forEach((id: string | number) => {
                const gesture = (gestures as GestureState['gestures'])[id];
                if (gesture) {
                  const currentPointers = filterPointers(pointers, id);
                  // Check if more pointers are involved in this gesture
                  if (currentPointers.length) {
                    // Rebase gesture
                    gesture.rebase(TransformData.fromPointers(currentPointers));
                  } else {
                    // Delete gesture from state
                    delete (gestures as GestureState['gestures'])[id];

                    // Dispatch end event
                    eventProcessor.dispatch(createGestureEvent('end', gesture, id));
                  }
                }
              });
            }
            break;
        }

        eventProcessor.set('gestures', gestures);
      }
    }

    next();
  };

export default gesturizer;
