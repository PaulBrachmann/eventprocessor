import {
  KeysPressedState,
  MappingFunction,
  RichEventData,
  RichEventState,
  RichMiddleware,
} from "../../types";
import { preventDefaultHelper } from "../../utils";

/**
 * Keyboard mapper, generates actions from key events.
 *
 * @param bindings Key bindings, consisting of an array of
 * [`KeyboardEvent.key` values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
 * and a mapping function that may return an action gerenated by the key combination.
 */
const mapKeys = <
  ID = string,
  T extends RichEventState & KeysPressedState = RichEventState &
    KeysPressedState
>(
  ...bindings: { keys: string[]; mapper: MappingFunction<ID, KeyboardEvent> }[]
): RichMiddleware<T, ID> => (data, processor) => {
  if (data.device !== "key" || data.eventType !== "start") return;

  const keysPressed = processor.get("keysPressed");
  if (!keysPressed) return;

  const matchingBinding = bindings.find(
    (binding) =>
      binding.keys.includes((data.event as KeyboardEvent).key) &&
      !~binding.keys.findIndex((key) => !keysPressed[key]),
  );

  if (matchingBinding) {
    preventDefaultHelper(data.event, processor);

    const action = matchingBinding.mapper(
      data as RichEventData<ID, KeyboardEvent>,
    );
    if (!action) return;

    if (data.actions) {
      data.actions.push(action);
    } else {
      data.actions = [action];
    }
  }
};

export default mapKeys;
