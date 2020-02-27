import { EventData, IEventProcessor } from "../../../types";
import { KeysPressedState } from "../../types";

/* eslint-disable import/prefer-default-export */

/**
 * Returns true if all of the given keys are currently pressed.
 * This utility can only be used after the `keyAdapter`.
 * @param processor The event processor (as passed to the middleware)
 * @param keys An array of the keys that are required to be pressed (e.g. ["Control", "+"])
 */
export const areKeysPressed = <
  D extends EventData = EventData,
  T extends KeysPressedState = KeysPressedState
>(
  processor: IEventProcessor<D, T>,
  keys: string[],
): boolean => {
  const keysPressed = processor.get("keysPressed");
  if (!keysPressed) return keys.length === 0;
  return !~keys.findIndex((key) => !keysPressed[key]);
};
