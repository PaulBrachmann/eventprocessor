import mouseAdapter from "./mouse";

export { mouseAdapter };
export { mapMouse, MouseInteractionType, trackMousePosition } from "./mouse";

export default () => [mouseAdapter()];
