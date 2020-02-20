import Pointer from "../../pointer";
import { PointerState, RichMiddleware } from "../../types";

export const pointerId = "mouse";

/** Mouse adapter, generates & tracks pointer data for mouse events. */
const mouseAdapter = <
  ID = string,
  T extends PointerState<ID> = PointerState<ID>
>(): RichMiddleware<T, ID> => (data, processor) => {
  if (data.device !== "mouse") return;

  const type = data.eventType;
  let pointers = processor.get("pointers");
  let pointer: Pointer<ID> | undefined;
  if (type === "start") {
    // Get id from caller arguments
    const id = data.args[0];

    if (id !== undefined) {
      const { event } = data;
      // Create pointer
      pointer = new Pointer<ID>(
        id,
        {
          clientX: (event as MouseEvent).clientX,
          clientY: (event as MouseEvent).clientY,
          event,
          identifier: pointerId,
        },
        {
          type: "mouse",

          altKey: (event as MouseEvent).altKey,
          ctrlKey: (event as MouseEvent).ctrlKey,
          mouseButton: (event as MouseEvent).button,
          shiftKey: (event as MouseEvent).shiftKey,
        },
      );

      // Write id & pointer to context
      data.ids = [id];
      data.pointers = [pointer];
    }
  } else if (pointers) {
    // Get registered pointer (if any)
    pointer = pointers[pointerId];

    if (pointer) {
      if (type === "move") {
        const { event } = data;
        // Update pointer
        pointer.detail = {
          clientX: (event as MouseEvent).clientX,
          clientY: (event as MouseEvent).clientY,
          event,
          identifier: pointerId,
        };
      }

      // Write id & pointer to context
      data.ids = [pointer.id];
      data.pointers = [pointer];

      if (type === "end") {
        // Prevent write
        pointer = undefined;

        delete pointers[pointerId];
      }
    }
  }

  if (pointer) {
    // Write pointer to state
    if (!pointers) pointers = {};
    (pointers as PointerState<ID>["pointers"])[pointerId] = pointer;
    processor.set("pointers", pointers);
  }
};

export default mouseAdapter;
