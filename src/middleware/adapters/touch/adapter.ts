import Pointer from "../../pointer";
import { PointerState, RichMiddleware } from "../../types";

export const pointerIdPrefix = "t/";

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
        const pointerId = `${pointerIdPrefix}${touch.identifier}`;

        // Create pointer
        const pointer = new Pointer(
          id,
          {
            clientX: touch.clientX,
            clientY: touch.clientY,
            event: touch,
            identifier: pointerId,
          },
          {
            device: "touch",
            startTime: event.timeStamp,
            altKey: (event as TouchEvent).altKey,
            ctrlKey: (event as TouchEvent).ctrlKey,
            shiftKey: (event as TouchEvent).shiftKey,
          },
        );

        (pointers as PointerState<ID>["pointers"])[pointerId] = pointer;
        currentPointers!.push(pointer);
      });

      // Write id to context
      data.ids = [id];

      // Write pointers to state
      processor.set("pointers", pointers as PointerState<ID>["pointers"]);
    }
  } else if (pointers) {
    let ids: Set<ID> | undefined;

    // Iterate changed touches
    forEachTouch((data.event as TouchEvent).changedTouches, (touch) => {
      const pointerId = `${pointerIdPrefix}${touch.identifier}`;

      // Get registered pointer (if any)
      const pointer = (pointers as { [key: string]: Pointer<ID> })[pointerId];

      if (pointer) {
        if (!currentPointers) currentPointers = [];
        currentPointers.push(pointer);

        if (type === "move") {
          // Update pointer
          pointer.detail = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            event: touch,
            identifier: pointerId,
          };
        }

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
