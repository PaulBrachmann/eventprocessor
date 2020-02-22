import Pointer from "../../pointer";
import { PointerState, RichMiddleware } from "../../types";

export const pointerIdPrefix = "t/";

/** Iterates touches. */
export const forEachTouch = (
  touches: TouchList,
  callback: (touch: Touch) => void,
) => {
  let { length } = touches;
  while (~(length -= 1)) {
    callback(touches[length]);
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
  const currentPointers: Pointer<ID>[] = [];

  if (type === "start") {
    // Get id from caller arguments
    const id = data.args[0];

    if (id !== undefined) {
      const { event } = data;
      if (!pointers) pointers = {};

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
        currentPointers.push(pointer);
      });

      // Write id to context
      data.ids = [id];

      // Write pointers to state
      processor.set("pointers", pointers as PointerState<ID>["pointers"]);
    }
  } else if (pointers) {
    const ids: { [id: string]: true } = {};

    // Iterate changed touches
    forEachTouch((data.event as TouchEvent).changedTouches, (touch) => {
      const pointerId = `${pointerIdPrefix}${touch.identifier}`;

      // Get registered pointer (if any)
      const pointer = (pointers as { [key: string]: Pointer<ID> })[pointerId];

      if (pointer) {
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

        // Get id & write to dedupe map
        (ids as any)[pointer.id] = true; // TODO: Use Set

        if (type === "end") {
          // Delete pointer
          delete (pointers as { [key: string]: Pointer<ID> })[pointerId];
        }
      }
    });

    // Write ids to context
    data.ids = (Object.keys(ids) as any) as ID[];
  }

  // Write pointers to context
  data.pointers = currentPointers;
};

export default touchAdapter;
