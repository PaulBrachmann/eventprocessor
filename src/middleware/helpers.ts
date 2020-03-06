import { GestureEvent } from "./gesturizer";

/** Returns the translation delta to zoom to a given point for one axis. */
export const getZoomToCursorDelta = (
  cursorPosition: number,
  transformOrigin: number,
  scaleFactor: number,
) => (transformOrigin - cursorPosition) * (scaleFactor - 1);

/**
 * Computes a transformation that counters any offset
 * with respect to the actual zoom target from a gesture event.
 * **Warning:** This mutates the original transform data stored in the event.
 *
 * @param event The gesture event
 * @param transformOriginX The x position of the actual transform origin.
 * @param transformOriginX The y position of the actual transform origin.
 */
export const getZoomToCursorTransform = <ID = string>(
  { detail }: GestureEvent<ID>,
  transformOriginX = 0,
  transformOriginY = 0,
) =>
  detail.transform.counterZoomOffset(
    detail.origin,
    transformOriginX,
    transformOriginY,
  );
