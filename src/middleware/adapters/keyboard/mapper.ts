import {
  KeysPressedState,
  MappingFunction,
  RichEventData,
  RichEventState,
  RichMiddleware,
} from "../../types";
import { preventDefaultHelper } from "../../utils";

export interface KeyBinding<ID = string> {
  /**
   * The key combination that needs to be pressed to trigger the binding.
   * If an array of arrays is given, the binding triggers for all combinations
   * given in the top-level array.
   */
  keys: string[] | string[][];

  /** The mapping function that is called when the binding activates. */
  mapper: MappingFunction<ID, KeyboardEvent>;
}

const matchKeys = (
  keys: string[],
  currentKey: string,
  keysPressed: { [key: string]: boolean },
) => keys.includes(currentKey) && !~keys.findIndex((key) => !keysPressed[key]);

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
  ...bindings: KeyBinding<ID>[]
): RichMiddleware<T, ID, KeyboardEvent> => (data, processor) => {
  if (data.device !== "key" || data.eventType !== "start") return;

  const keysPressed = processor.get("keysPressed");
  if (!keysPressed) return;

  const matchingBinding = bindings.find(({ keys }) =>
    Array.isArray(keys[0])
      ? ~(keys as string[][]).findIndex((combination) =>
          matchKeys(combination, data.event.key, keysPressed!),
        )
      : matchKeys(keys as string[], data.event.key, keysPressed!),
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
