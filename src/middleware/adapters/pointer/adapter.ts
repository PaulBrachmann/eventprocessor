import Pointer from "../../pointer";
import {
  DeviceType,
  PointerState,
  RichEventState,
  RichMiddleware,
} from "../../types";
import { preventDefaultHelper } from "../../utils";

const buildPointerId = (event: PointerEvent) => `${event.pointerId}`;

const buildPointerDetail = (
  event: PointerEvent,
  identifier = buildPointerId(event),
) => ({
  buttons: event.buttons,
  cancel: event.type === "pointercancel",
  clientX: event.clientX,
  clientY: event.clientY,
  event,
  identifier,
  pressure: event.buttons ? event.pressure || 1 : 0,
});

const buildPointer = <ID = string>(
  id: ID,
  event: PointerEvent,
  identifier = buildPointerId(event),
) =>
  new Pointer<ID>(id, buildPointerDetail(event, identifier), {
    device: event.pointerType as DeviceType,
    startTime: event.timeStamp,

    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    button: event.button,
    shiftKey: event.shiftKey,
  });

/**
 * Pointer adapter, generates & tracks pointer data for pointer events.
 *
 * @param handleUnidentified If set, events not associated to an entity are
 * still recorded in `data.unidentifiedPointers`.
 */
const pointerAdapter = <
  ID = string,
  T extends RichEventState & PointerState<ID> = RichEventState &
    PointerState<ID>
>(
  handleUnidentified = false,
): RichMiddleware<T, ID> => (data, processor) => {
  if (data.device !== "pointer") return;

  const type = data.eventType;
  let pointers = processor.get("pointers");

  if (type === "start") {
    // Get id from caller arguments
    const id = data.args[0];

    if (id !== undefined) {
      preventDefaultHelper(data.event, processor);

      // Create pointer
      const pointer = buildPointer(id, data.event as PointerEvent);

      // Write id & pointer to context
      data.ids = [id];
      data.pointers = [pointer];

      // Write pointer to state
      if (!pointers) pointers = {};
      (pointers as PointerState<ID>["pointers"])![
        buildPointerId(data.event as PointerEvent)
      ] = pointer;
      processor.set("pointers", pointers);
    }
  } else if (pointers) {
    // Get registered pointer (if any)
    const pointer = pointers[buildPointerId(data.event as PointerEvent)];

    if (pointer) {
      preventDefaultHelper(data.event, processor);

      // Update pointer
      pointer.detail = buildPointerDetail(data.event as PointerEvent);

      // Write id & pointer to context
      data.ids = [pointer.id];
      data.pointers = [pointer];

      if (type === "end") {
        delete pointers[buildPointerId(data.event as PointerEvent)];
      }
    }
  }

  if (handleUnidentified && !data.ids) {
    preventDefaultHelper(data.event, processor);
    data.unidentifiedPointers = [
      buildPointer(undefined, data.event as PointerEvent),
    ];
  }
};

export default pointerAdapter;
