import { RichMiddleware, GestureState, PointerState } from "../types";
import TransformData from "./transformData";
import TransformGesture from "./transformGesture";
import Pointer from "../pointer";

export { TransformData, TransformGesture };

/** Returns a new gesture event. */
export const createGestureEvent = <ID>(
  type: string,
  gesture: TransformGesture,
  id: ID,
) =>
  new CustomEvent(type, {
    detail: {
      context: gesture.context,
      id,
      transform: gesture.getTransform(),
    },
  });

/** Returns an array of only those pointers that belong to the given entity id. */
export const filterPointers = <ID>(pointers: Pointer<ID>[], id: ID) =>
  Object.values(pointers).filter((pointer) => pointer.id === id);

/** Gesturizer, manages transform gestures and dispatches gesture events. */
const gesturize = <
  ID extends number | string | symbol = string,
  T extends GestureState<ID> & PointerState<ID> = GestureState<ID> &
    PointerState<ID>
>(): RichMiddleware<T, ID> => (data, processor) => {
  const { ids } = data;
  if (!ids || !data.pointers) return;

  const pointerMap = processor.get("pointers");
  if (!pointerMap) return;
  const pointers = Object.values(pointerMap!);

  let gestures = processor.get("gestures");

  switch (data.eventType) {
    case "start":
      ids.forEach((id) => {
        let gesture: TransformGesture | undefined = gestures
          ? gestures[id]
          : undefined;
        if (gesture) {
          gesture.rebase(
            TransformData.fromPointers(filterPointers(pointers, id)),
          );
        } else {
          gesture = new TransformGesture(
            TransformData.fromPointers(filterPointers(pointers, id)),
            { id },
          );

          // Write new gesture to state
          if (!gestures) gestures = {};
          gestures[id] = gesture;

          // Dispatch start event
          processor.dispatch(createGestureEvent("gesturestart", gesture, id));
        }
      });
      break;
    case "move":
      if (!gestures) return;
      ids.forEach((id) => {
        const gesture: TransformGesture | undefined = gestures![id];
        if (!gesture) return;

        gesture.setTarget(
          TransformData.fromPointers(filterPointers(pointers, id)),
        );

        // Dispatch move event
        processor.dispatch(createGestureEvent("gesturemove", gesture, id));
      });
      break;
    case "end":
      if (!gestures) return;
      ids.forEach((id) => {
        const gesture: TransformGesture | undefined = gestures![id];
        if (!gesture) return;

        gesture.setTarget(
          TransformData.fromPointers(
            filterPointers([...pointers, ...data.pointers!], id),
          ),
        );

        const currentPointers = filterPointers(pointers, id);
        // Check if more pointers are involved in this gesture
        if (currentPointers.length) {
          gesture.rebase(TransformData.fromPointers(currentPointers));
        } else {
          delete gestures![id];
        }

        // Dispatch end event
        processor.dispatch(createGestureEvent("gestureend", gesture, id));
      });
      break;
    default:
      break;
  }
};

export default gesturize;
