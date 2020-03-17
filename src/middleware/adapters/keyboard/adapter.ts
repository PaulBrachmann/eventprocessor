import { KeysPressedState, RichEventState, RichMiddleware } from "../../types";

/** Keyboard adapter, writes the the currently pressed keys to the event processor's state. */
const keyAdapter = <
  ID = string,
  T extends RichEventState & KeysPressedState = RichEventState &
    KeysPressedState
>(): RichMiddleware<T, ID> => (data, processor) => {
  if (data.device !== "key") return;

  processor.update("keysPressed", (keysPressed = {}) => {
    const { event } = data;
    if (data.eventType === "start" && !(event as KeyboardEvent).repeat) {
      keysPressed[(event as KeyboardEvent).key] = true;
    } else if (data.eventType === "end") {
      keysPressed[(event as KeyboardEvent).key] = false;
    }
    return keysPressed;
  });
};

export default keyAdapter;
