import { EventData, EventMiddleware, EventLike } from "../types";
import Pointer from "./pointer";
import { TransformGesture } from "./gesturizer";

/** Devices that can dispatch events to the middleware chain. */
export type DeviceType = "key" | "mouse" | "touch" | "wheel" | "_gesture";

/**
 * An abstraction of event-types to provide a uniform
 * interface for different devices, e.g. mouse/touch.
 */
export type EventType = "start" | "move" | "end";

export interface Action {
  type: string;
  [key: string]: any;
}

/**
 * An extended EventData interface.
 * Most of the pre-built middleware assumes an opinionated middleware
 * chain using this EventData.
 */
export interface RichEventData<ID = string, E extends EventLike = EventLike>
  extends EventData<E> {
  /**
   * The user-defined actions this event is going to trigger.
   * This field should be filled by an event mapper or custom middleware.
   * It provides a semantical context to the event/gesture.
   */
  actions?: Action[];

  /**
   * The name of the device that issued the currently processed event.
   * This field should be generated by the `classify` middleware.
   */
  device?: DeviceType;

  /**
   * The (abstract) type of the currently processed event.
   * This field should be generated by the `classify` middleware.
   */
  eventType?: EventType;

  /**
   * The ids of (model) objects this event targets.
   * This field should be generated by the respective device's adapter.
   */
  ids?: ID[];

  /**
   * The pointers derived from this event that can be associated to an entity.
   * This field should be generated by the respective device's adapter.
   */
  pointers?: Pointer<ID>[];

  /**
   * The pointers derived from this event that do not have an id assigned to them.
   * This field should be generated by the respective device's adapter.
   */
  unidentifiedPointers?: Pointer<undefined>[];
}

/** Middleware using the opinionated RichEventData. */
export type RichMiddleware<
  T = { [key: string]: any },
  ID = string,
  E extends EventLike = EventLike
> = EventMiddleware<RichEventData<ID, E>, T>;

/** Event processor state extension to capture the current pointers. */
export interface PointerState<ID = string> {
  pointers?: { [pointerId: string]: Pointer<ID> };
}

export interface GestureState<ID extends string | number | symbol = string> {
  gestures?: Partial<Record<ID, TransformGesture>>;
}

/** Event processor state extension to capture the last-recorded mouse position. */
export interface MousePositionState {
  mousePosition?: { clientX: number; clientY: number };
}

/** Event processor state extension to capture the currently held-down keys. */
export interface KeysPressedState {
  keysPressed?: { [keyName: string]: boolean };
}

export type MappingFunction<ID = string, E extends EventLike = EventLike> = (
  data: RichEventData<ID, E>,
) => Action | false | void | undefined;

export type InteractionMap<
  T extends string | number | symbol = string,
  ID = string,
  E extends EventLike = EventLike
> = Partial<Record<T, MappingFunction<ID, E>>>;
