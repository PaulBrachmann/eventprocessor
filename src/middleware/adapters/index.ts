import keyAdapter from "./keyboard";
import mouseAdapter from "./mouse";
import touchAdapter from "./touch";

export { keyAdapter, mouseAdapter, touchAdapter };
export { areKeysPressed, mapKeys } from "./keyboard";
export { mapMouse, MouseInteractionType, trackMousePosition } from "./mouse";
export { mapWheel, WheelInteractionType } from "./wheel";

export default () => [keyAdapter(), mouseAdapter(), touchAdapter()];

/**
 * The event types of all events that require global event listeners
 * for the adapters to work.
 *
 * Should be used with `EventProcessor.register`.
 */
export const globalListenerTypes = [
  "keydown",
  "keyup",
  "mousemove",
  "mouseup",
  "touchmove",
  "touchend",
];

/**
 * The event types of all events that require event listeners on elements
 * associated with the manipulated entities for the adapters to work.
 */
export const elementListenerTypes = ["mousedown", "touchstart"];
