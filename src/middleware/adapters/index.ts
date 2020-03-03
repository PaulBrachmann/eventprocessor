import keyAdapter from "./keyboard";
import pointerAdapter from "./pointer";

export { keyAdapter, pointerAdapter };
export { areKeysPressed, mapKeys } from "./keyboard";
export {
  default as mouseAdapter,
  mapMouse,
  MouseInteractionType,
  trackMousePosition,
} from "./mouse";
export { default as touchAdapter } from "./touch";
export { mapWheel, WheelInteractionType } from "./wheel";

export default () => [keyAdapter(), pointerAdapter()];

/**
 * The event types of all events that require global event listeners
 * for the adapters to work.
 *
 * Should be used with `EventProcessor.register`.
 */
export const globalListenerTypes = [
  "keydown",
  "keyup",
  "pointercancel",
  "pointermove",
  "pointerup",
  "wheel",
];

/**
 * The event types of all events that require event listeners on elements
 * associated with the manipulated entities for the adapters to work.
 */
export const elementListenerTypes = ["pointerdown"];
