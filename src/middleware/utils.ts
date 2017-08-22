/**
 * Event Handler Middleware
 * @module eventprocessor/middleware/utils
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { EventMiddleware } from '../eventprocessor';
import { EventLike } from '../types';

/** Classification middleware - adds ```data.device``` and ```data.eventType``` fields */
export const classify = <T>(
  eventMap: { [type: string]: string[] },
): EventMiddleware<T> =>
  (next, data) => {
    const type = eventMap[data.event.type];

    if (type) {
      data.device = type[0];
      data.eventType = type[1];
    }

    next();
  };

/** Default mouse/touch event map */
const defaultEventMap = {
  DOMMouseScroll: ['wheel', 'wheel'],
  mousedown: ['mouse', 'start'],
  mousemove: ['mouse', 'move'],
  mouseup: ['mouse', 'end'],
  mousewheel: ['wheel', 'wheel'],
  touchend: ['touch', 'end'],
  touchmove: ['touch', 'move'],
  touchstart: ['touch', 'start'],
  wheel: ['wheel', 'wheel'],
};
export { defaultEventMap as eventMap };

/** Event logging middleware */
export const log = <T>(unknown?: boolean, production?: boolean): EventMiddleware<T> =>
  (next, { event, ids }) => {
    if ((unknown || ids !== undefined) && (production || process.env.NODE_ENV !== 'production')) {
      console.log(event); // tslint:disable-line no-console
    }
    next();
  };

/** Prevent default middleware */
export const preventDefault = <T>(unknown?: boolean): EventMiddleware<T> =>
  (next, { event, ids }) => {
    if ((unknown || ids !== undefined) && event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }
    next();
  };

/** Id reducer middleware */
export const reduceIds = <ID, T extends { ids: ID[] }>(): EventMiddleware<T> =>
  (next, { event }, eventProcessor) => {
    switch (event.type) {
      case 'start': {
        eventProcessor.update('ids', (ids: ID[] = []) => {
          ids.push((event as CustomEvent).detail.id);
          return ids;
        });
        break;
      }

      case 'end': {
        const { detail } = (event as CustomEvent);
        if (detail) {
          const { id } = detail;
          eventProcessor.update('ids', (ids?: ID[]) =>
            ids ? ids.filter((_id) => _id !== id) : undefined,
          );
        }
        break;
      }
    }

    next();
  };

/* Side effects middleware */
export const sideFx = <T>(
  callback: (event: EventLike) => void,
  eventType?: string | string[],
): EventMiddleware<T> =>
  (next, { event }) => {
    if (eventType) {
      const { type } = event;

      if (!(eventType === type
        || Array.isArray(eventType) && ~eventType.indexOf(event.type))
      ) return next();
    }

    callback(event);
    next();
  };
