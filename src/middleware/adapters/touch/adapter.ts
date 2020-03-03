import Pointer from "../../pointer";
import { PointerState, RichMiddleware } from "../../types";

export const pointerIdPrefix = "t/";

const buildPointerId = (touch: Touch) =>
  `${pointerIdPrefix}${touch.identifier}`;

const buildPointerDetail = (
  touch: Touch,
  event: TouchEvent,
  eventType = "move",
  identifier = buildPointerId(touch),
) => ({
  buttons: eventType === "end" ? 0 : 1,
  cancel: event.type === "touchcancel",
  clientX: touch.clientX,
  clientY: touch.clientY,
  event: touch,
  identifier,
  pressure: eventType === "end" ? 0 : touch.force || 1,
});

const buildPointer = <ID = string>(
  id: ID,
  event: TouchEvent,
  touch: Touch,
  eventType = "move",
  identifier = buildPointerId(touch),
) =>
  new Pointer<ID>(id, buildPointerDetail(touch, event, eventType, identifier), {
    device: "touch",
    startTime: event.timeStamp,

    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
  });

/** Iterates touches. */
export const forEachTouch = (
  touches: TouchList,
  callback: (touch: Touch) => void,
) => {
  const { length } = touches;

  for (let index = 0; index < length; index++) {
    callback(touches[index]);
  }
};

/** Touch adapter, generates & tracks pointer data for touch events. */
const touchAdapter = <
  ID = string,
  T extends PointerState<ID> = PointerState<ID>
>(): RichMiddleware<T, ID> => (data, processor) => {
  if (data.device !== "touch") return;

  const type = data.eventType;
  let pointers = processor.get("pointers");
  let currentPointers: Pointer<ID>[] | undefined;

  if (type === "start") {
    // Get id from caller arguments
    const id = data.args[0];

    if (id !== undefined) {
      const { event } = data;
      if (!pointers) pointers = {};
      currentPointers = [];

      // Iterate changed touches
      forEachTouch((event as TouchEvent).changedTouches, (touch) => {
        const pointerId = buildPointerId(touch);

        // Create pointer
        const pointer = buildPointer(
          id,
          event as TouchEvent,
          touch,
          type,
          pointerId,
        );

        (pointers as PointerState<ID>["pointers"])![pointerId] = pointer;
        currentPointers!.push(pointer);
      });

      // Write id to context
      data.ids = [id];

      // Write pointers to state
      processor.set("pointers", pointers as PointerState<ID>["pointers"]);
    }
  } else if (pointers) {
    const { event } = data;
    let ids: Set<ID> | undefined;

    // Iterate changed touches
    forEachTouch((event as TouchEvent).changedTouches, (touch) => {
      const pointerId = buildPointerId(touch);

      // Get registered pointer (if any)
      const pointer = (pointers as { [key: string]: Pointer<ID> })[pointerId];

      if (pointer) {
        if (!currentPointers) currentPointers = [];
        currentPointers.push(pointer);

        // Update pointer
        pointer.detail = buildPointerDetail(
          touch,
          event as TouchEvent,
          type,
          pointerId,
        );

        // Get id & write to dedupe set
        if (!ids) ids = new Set();
        ids.add(pointer.id);

        if (type === "end") {
          // Delete pointer
          delete (pointers as { [key: string]: Pointer<ID> })[pointerId];
        }
      }
    });

    // Write ids to context
    if (ids) data.ids = Array.from(ids);
  }

  // Write pointers to context
  if (currentPointers) data.pointers = currentPointers;
};

export default touchAdapter;
