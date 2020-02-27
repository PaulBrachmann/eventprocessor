import {
  KeysPressedState,
  MappingFunction,
  RichEventData,
  RichMiddleware,
} from "../../types";

/** Keyboard mapper, generates actions from key events. */
const mapKeys = <T extends KeysPressedState = KeysPressedState, ID = string>(
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
