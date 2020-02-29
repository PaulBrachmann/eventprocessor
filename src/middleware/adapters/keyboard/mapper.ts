import {
  KeysPressedState,
  MappingFunction,
  RichEventData,
  RichMiddleware,
} from "../../types";

/**
 * Keyboard mapper, generates actions from key events.
 *
 * @param bindings Key bindings, consisting of an array of
 * [`KeyboardEvent.key` values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
 * and a mapping function that may return an action gerenated by the key combination.
 */
const mapKeys = <ID = string, T extends KeysPressedState = KeysPressedState>(
  ...bindings: { keys: string[]; mapper: MappingFunction<ID, KeyboardEvent> }[]
): RichMiddleware<T, ID> => (data, processor) => {
  if (data.device !== "key" || data.eventType !== "start") return;

  const keysPressed = processor.get("keysPressed");
  if (!keysPressed) return;

  bindings.forEach((binding) => {
    if (
      binding.keys.includes((data.event as KeyboardEvent).key) &&
      !~binding.keys.findIndex((key) => !keysPressed[key])
    ) {
      const action = binding.mapper(data as RichEventData<ID, KeyboardEvent>);
      if (!action) return;

      if (data.actions) {
        data.actions.push(action);
      } else {
        data.actions = [action];
      }
    }
  });
};

export default mapKeys;
