import mouseAdapter from "./mouse";

export { mouseAdapter };
export { mouseMapper, MouseInteractionType, trackMousePosition } from "./mouse";

export default () => [mouseAdapter()];
