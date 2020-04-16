import { KeysPressedState, RichEventState, RichMiddleware } from "../../types";

const deriveCtrlKeyEvent = (event: KeyboardEvent) => ({
  ...event,
  code: event.location === 2 ? "ControlRight" : "ControlLeft",
  key: "Control",
  which: 17,
});
const cmdKey = "Meta";

/**
 * Keyboard adapter, writes the the currently pressed keys to the event processor's state.
 *
 * @param options.cmdIsCtrl If set, the command key on Mac keyboards can also
 * trigger key bindings that require the "Control" key.
 */
const keyAdapter = <
  ID = string,
  T extends RichEventState & KeysPressedState = RichEventState &
    KeysPressedState
>(options?: {
  cmdIsCtrl?: boolean;
}): RichMiddleware<T, ID> => (data, processor) => {
  if (data.device !== "key") return;

  processor.update("keysPressed", (keysPressed = {}) => {
    const event = data.event as KeyboardEvent;
    if (data.eventType === "start" && !event.repeat) {
      keysPressed[event.key] = true;
    } else if (data.eventType === "end") {
      keysPressed[event.key] = false;
    }

    if (options?.cmdIsCtrl && event.key === cmdKey) {
      processor.dispatch(
        new KeyboardEvent(event.type, deriveCtrlKeyEvent(event)),
      );
    }

    return keysPressed;
  });
};

export default keyAdapter;
