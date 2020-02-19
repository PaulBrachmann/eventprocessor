import Pointer from "../internal/pointer";
import { PointerState, RichMiddleware } from "../types";

export const pointerId = "mouse";

/** Mouse adapter, generates & tracks pointer data for mouse events */
const mouseAdapter = <
  ID = string,
  T extends PointerState<ID> = PointerState<ID>
>(): RichMiddleware<T> => (data, processor) => {
  if (data.device === "mouse") {
    const type = data.eventType;

    let pointers = processor.get("pointers");
    let pointer: Pointer<ID> | undefined;

    if (type === "start") {
      // Get id from caller arguments
      const id = data.args[0];

      if (id !== undefined) {
        const { event } = data;
        // Create pointer
        pointer = new Pointer(
          id,
          {
            clientX: (event as MouseEvent).clientX,
            clientY: (event as MouseEvent).clientY,
            event,
            identifier: pointerId,
          },
          "mouse",
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
  }
};

export default mouseAdapter;
