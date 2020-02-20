import { doesMatchFilter } from "../../utils";
import { EventType, RichEventData, RichMiddleware, Action } from "../types";
import Pointer from ".";

/** Pointer mapper, generates actions from pointers. */
const mapPointer = (
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

export default mapPointer;
