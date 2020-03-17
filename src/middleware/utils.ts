import { BreakException } from "../eventprocessor";
import {
  EventData,
  EventLike,
  EventMiddleware,
  IEventProcessor,
} from "../types";
import { doesMatchFilter } from "../utils";
import {
  Action,
  DeviceType,
  EventType,
  RichEventData,
  RichEventState,
  RichMiddleware,
} from "./types";

/** Default mouse/touch event map */
const defaultEventMap: {
  [type: string]: [DeviceType, EventType];
} = {
  gesturestart: ["_gesture", "start"],
  gesturemove: ["_gesture", "move"],
  gestureend: ["_gesture", "end"],
  keydown: ["key", "start"],
  keyup: ["key", "end"],
  mousedown: ["mouse", "start"],
  mousemove: ["mouse", "move"],
  mouseup: ["mouse", "end"],
  pointercancel: ["pointer", "end"],
  pointerdown: ["pointer", "start"],
  pointermove: ["pointer", "move"],
  pointerup: ["pointer", "end"],
  touchcancel: ["touch", "end"],
  touchend: ["touch", "end"],
  touchmove: ["touch", "move"],
  touchstart: ["touch", "start"],
  wheel: ["wheel", "move"],
};
export { defaultEventMap as eventMap };

/**
 * Classification middleware.
 * Adds `data.device` and `data.eventType` fields.
 *
 * @param eventMap An object mapping from `event.type` to `[deviceName, eventClass]`
 */
export const classify = <T>(
  eventMap: {
    [type: string]: [DeviceType, EventType];
  } = defaultEventMap,
): RichMiddleware<T> => (data) => {
  const type = eventMap[data.event.type];

  if (type) {
    [data.device, data.eventType] = type;
  }
};

/**
 * Event logging middleware.
 *
 * @param handleUnidentified Should events without associated id(s) be printed?
 * @param runInProduction Should events be printed in production?
 */
export const log = (
  handleUnidentified?: boolean,
  runInProduction?: boolean,
): EventMiddleware => ({ event, ids }) => {
  if (
    (handleUnidentified || ids !== undefined) &&
    (runInProduction || process.env.NODE_ENV !== "production")
  ) {
    // eslint-disable-next-line no-console
    console.log(event);
  }
};

/**
 * Calls preventDefault & stopPropagation on the given event
 * if `preventDefault` is set in the processor's state.
 *
 * @param event The event
 * @param processor The event processor
 */
export const preventDefaultHelper = <D extends EventData = EventData>(
  event: EventLike,
  processor: IEventProcessor<D, RichEventState>,
) => {
  if (processor.get("preventDefault")) {
    event.preventDefault();
    event.stopPropagation();
  }
};

/**
 * Prevent default middleware.
 *
 * @param handleUnidentified Should events without associated id(s) be handled?
 */
export const preventDefault = (
  handleUnidentified?: boolean,
): EventMiddleware => ({ event, ids }) => {
  if ((handleUnidentified || ids !== undefined) && event.cancelable) {
    event.preventDefault();
    event.stopPropagation();
  }
};

/**
 * Filter middleware.
 * Terminates the middleware chain if the `predicate` returns false for the current event.
 *
 * @param predicate
 */
export const filter = <
  D extends EventData = EventData,
  T = { [key: string]: any }
>(
  predicate: (data: D, processor: IEventProcessor<D, T>) => boolean,
): EventMiddleware<D, T> => (data, processor) => {
  if (!predicate(data, processor)) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new BreakException();
  }
};

/**
 * Side effects middleware.
 * The callback is called for each event.
 *
 * @param callback The side effect to be called
 * @param eventType An event type (or array of types) to filter events that trigger the `callback`
 */
export const forEvent = <T>(
  callback: (event: EventLike) => void,
  eventType?: string | string[],
): EventMiddleware<any, T> => (data) => {
  if (doesMatchFilter(data.event.type, eventType)) {
    callback(data.event);
  }
};

/**
 * Side effects middleware.
 * The callback is called for each action generated from an event.
 *
 * @param callback The side effect to be called
 * @param actionType An action type (or array of types) to filter events that trigger the `callback`
 */
export const forAction = <T>(
  callback: (action: Action) => void,
  actionType?: string | string[],
): EventMiddleware<RichEventData, T> => (data) => {
  if (!data.actions) return;

  data.actions.forEach((action) => {
    if (doesMatchFilter(action.type, actionType)) {
      callback(action);
    }
  });
};
