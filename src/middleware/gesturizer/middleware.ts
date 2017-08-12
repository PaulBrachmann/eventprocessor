/**
 * Additional middleware
 * @module gesturizer/middleware
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { EventMiddleware } from '../../eventprocessor';

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
