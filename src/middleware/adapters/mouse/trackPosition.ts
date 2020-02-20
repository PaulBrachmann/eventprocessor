import { MousePositionState, RichMiddleware } from "../../types";

/** Mouse adapter, writes the last-recorded mouse position to the event processor's state. */
const trackMousePosition = <
  ID = string,
  T extends MousePositionState = MousePositionState
>(): RichMiddleware<T, ID> => (data, processor) => {
  if (data.device !== "mouse") return;

  // Update current mouse position
  processor.update("mousePosition", (mousePosition = {} as any) => {
    mousePosition.clientX = (data.event as MouseEvent).clientX;
    mousePosition.clientY = (data.event as MouseEvent).clientY;
    return mousePosition;
  });
};

export default trackMousePosition;
