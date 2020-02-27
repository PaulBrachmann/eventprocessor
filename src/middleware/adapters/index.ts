import keyAdapter from "./keyboard";
import mouseAdapter from "./mouse";
import touchAdapter from "./touch";

export { keyAdapter, mouseAdapter, touchAdapter };
export { areKeysPressed } from "./keyboard";
export { mapMouse, MouseInteractionType, trackMousePosition } from "./mouse";

export default () => [keyAdapter(), mouseAdapter(), touchAdapter()];
