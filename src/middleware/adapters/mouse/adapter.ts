import Pointer from "../../pointer";
import { PointerState, RichMiddleware } from "../../types";

export const pointerId = "mouse";

const buildPointerDetail = (event: MouseEvent) => ({
  clientX: event.clientX,
  clientY: event.clientY,
  event,
  identifier: pointerId,
});

const buildPointer = <ID = string>(id: ID, event: MouseEvent) =>
  new Pointer<ID>(id, buildPointerDetail(event), {
    device: "mouse",
    startTime: event.timeStamp,

    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    mouseButton: event.button,
    shiftKey: event.shiftKey,
  });

/**
 * Mouse adapter, generates & tracks pointer data for mouse events.
 *
 * @param handleUnidentified If set, events not associated to an entity are
 * still recorded in `data.unidentifiedPointers`.
 */
const mouseAdapter = <
  ID = string,
  T extends PointerState<ID> = PointerState<ID>
>(
  handleUnidentified = false,
): RichMiddleware<T, ID> => (data, processor) => {
  if (data.device !== "mouse") return;

  const type = data.eventType;
  let pointers = processor.get("pointers");

  if (type === "start") {
    // Get id from caller arguments
    const id = data.args[0];

    if (id !== undefined) {
      // Create pointer
      const pointer = buildPointer(id, data.event as MouseEvent);

      // Write id & pointer to context
      data.ids = [id];
      data.pointers = [pointer];

      // Write pointer to state
      if (!pointers) pointers = {};
      (pointers as PointerState<ID>["pointers"])![pointerId] = pointer;
      processor.set("pointers", pointers);
    }
  } else if (pointers) {
    // Get registered pointer (if any)
    const pointer = pointers[pointerId];

    if (pointer) {
      // Update pointer
      pointer.detail = buildPointerDetail(data.event as MouseEvent);

      // Write id & pointer to context
      data.ids = [pointer.id];
      data.pointers = [pointer];

      if (type === "end") {
        delete pointers[pointerId];
      }
    }
  }

  if (handleUnidentified && !data.ids) {
    data.unidentifiedPointers = [
      buildPointer(undefined, data.event as MouseEvent),
    ];
  }
};

export default mouseAdapter;
