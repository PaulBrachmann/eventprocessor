import { EventLike } from "../../types";
import { MouseInteractionType } from "../adapters/mouse";
import { DeviceType } from "../types";

/**
 * Pointer button values according to the
 * [PointerEvent documentation](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
 */
export enum PointerButton {
  Unchanged = -1,
  LMB = 0,
  MMB = 1,
  RMB = 2,
  Back = 3,
  Forward = 4,
  Eraser = 5,
}

export interface PointerContext {
  device: DeviceType;
  startTime: DOMTimeStamp | DOMHighResTimeStamp;

  altKey?: boolean;
  ctrlKey?: boolean;
  button?: PointerButton;
  shiftKey?: boolean;
}

export interface PointerDetail {
  event?: EventLike | Touch;
  identifier: string;

  buttons: number;
  clientX: number;
  clientY: number;
  pressure: number;
  rotate2d?: number;
  scale?: number;
  [prop: string]: any;
}

/**
 * A generic pointer.
 * Represents a (virtual) pointer interaction like mouse or touch point input.
 */
class Pointer<ID = string> {
  constructor(
    /** Associates the pointer with a ui element. */
    public id: ID,
    /** Pointer detail, stores the current pointer position. */
    public detail: PointerDetail,
    /** Pointer metadata, recorded on pointer creation. */
    public context: PointerContext,
  ) {}
}

export default Pointer;
export { default as mapPointers } from "./mapper";
