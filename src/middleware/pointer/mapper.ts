import { doesMatchFilter } from "../../utils";
import { EventType, RichEventData, RichMiddleware, Action } from "../types";
import Pointer from ".";

/** Pointer mapper, generates actions from pointers. */
const mapPointers = (
  mappingFunction: (
    pointer: Pointer,
    data: RichEventData,
  ) => Action | void | undefined,
  filter?: EventType | EventType[],
): RichMiddleware => (data) => {
  if (!data.pointers || !doesMatchFilter(data.eventType, filter)) return;

  data.pointers.forEach((pointer) => {
    const action = mappingFunction(pointer, data);

    if (!action) return;

    if (data.actions) {
      data.actions.push(action);
    } else {
      data.actions = [action];
    }
  });
};

export default mapPointers;

/** Hover pointer mapper, generates actions from pointers in a hovering state. */
export const mapHoverPointers = (
  mappingFunction: (
    pointer: Pointer<undefined>,
    data: RichEventData,
  ) => Action | void | undefined,
): RichMiddleware => (data) => {
  if (!data.unidentifiedPointers || data.eventType !== "move") return;

  data.unidentifiedPointers.forEach((pointer) => {
    const { buttons } = pointer.detail.event as MouseEvent;
    if (buttons === undefined || buttons === 0) {
      const action = mappingFunction(pointer, data);

      if (!action) return;

      if (data.actions) {
        data.actions.push(action);
      } else {
        data.actions = [action];
      }
    }
  });
};
