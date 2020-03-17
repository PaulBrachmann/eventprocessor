import { RichMiddleware, InteractionMap, RichEventData } from "../../types";
import { preventDefaultHelper } from "../../utils";

export enum WheelInteractionType {
  "Up" = 0,
  "None" = 1,
  "Down" = 2,
}

/** Wheel mapper, generates actions from wheel interactions. */
const mapWheel = <ID = string, T = { [key: string]: any }>(
  map: InteractionMap<WheelInteractionType, ID, WheelEvent>,
): RichMiddleware<T, ID> => (data, processor) => {
  if (data.device !== "wheel") return;

  preventDefaultHelper(data.event, processor);

  const mappingFunction =
    map[
      (Math.sign((data.event as WheelEvent).deltaY) + 1) as WheelInteractionType
    ];
  if (!mappingFunction) return;

  const action = mappingFunction(data as RichEventData<ID, WheelEvent>);
  if (!action) return;

  if (data.actions) {
    data.actions.push(action);
  } else {
    data.actions = [action];
  }
};

export default mapWheel;
