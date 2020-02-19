import { EventData, EventMiddleware } from "../types";
import Pointer from "./internal/pointer";

export type DeviceType = "key" | "mouse" | "touch" | "wheel";

export type EventType =
  | "start"
  | "move"
  | "end"
  | "up"
  | "down"
  | "press"
  | "wheel";

export interface RichEventData extends EventData {
  /** The name of the device that issued the currently processed event. */
  device?: DeviceType;
  /** The (abstract) type of the currently processed event. */
  eventType?: EventType;
}

export type RichMiddleware<T = { [key: string]: any }> = EventMiddleware<
  RichEventData,
  T
>;

// eslint-disable-next-line import/prefer-default-export
export { Pointer };
export interface PointerState<ID = string> {
  pointers: { [pointerId: string]: Pointer<ID> };
}
