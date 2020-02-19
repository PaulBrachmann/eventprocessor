import { BreakException } from "../eventprocessor";
import {
  EventData,
  EventLike,
  EventMiddleware,
  IEventProcessor,
} from "../types";
import { DeviceType, EventType, RichMiddleware } from "./types";

/** Default mouse/touch event map */
const defaultEventMap: {
  [type: string]: [DeviceType, EventType];
} = {
  DOMMouseScroll: ["wheel", "wheel"],
  keydown: ["key", "down"],
  keypress: ["key", "press"],
  keyup: ["key", "up"],
  mousedown: ["mouse", "start"],
  mousemove: ["mouse", "move"],
  mouseup: ["mouse", "end"],
  mousewheel: ["wheel", "wheel"],
  touchend: ["touch", "end"],
  touchmove: ["touch", "move"],
  touchstart: ["touch", "start"],
  wheel: ["wheel", "wheel"],
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
 * @param unknown Should events without associated id(s) be printed?
 * @param production Should events be printed in production?
 */
export const log = (
  unknown?: boolean,
  production?: boolean,
): EventMiddleware => ({ event, ids }) => {
  if (
    (unknown || ids !== undefined) &&
    (production || process.env.NODE_ENV !== "production")
  ) {
    // eslint-disable-next-line no-console
    console.log(event);
  }
};

/**
 * Prevent default middleware.
 *
 * @param unknown Should events without associated id(s) be handled?
 */
export const preventDefault = (unknown?: boolean): EventMiddleware => ({
  event,
  ids,
}) => {
  if ((unknown || ids !== undefined) && event.cancelable) {
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
 *
 * @param callback The side effect to be called
 * @param eventType An event type (or array of types) to filter events that trigger the `callback`
 */
export const sideFx = <T>(
  callback: (event: EventLike) => void,
  eventType?: string | string[],
): EventMiddleware<any, T> => (data) => {
  if (eventType) {
    const { type } = data.event;

    if (
      eventType === type ||
      (Array.isArray(eventType) && ~eventType.indexOf(type))
    ) {
      callback({ ...data });
    }
  } else {
    callback({ ...data });
  }
};
