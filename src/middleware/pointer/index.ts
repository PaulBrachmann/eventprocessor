import { EventLike } from "../../types";
import { MouseInteractionType } from "../adapters/mouse";
import { DeviceType } from "../types";

export interface PointerContext {
  device: DeviceType;
  startTime: DOMTimeStamp | DOMHighResTimeStamp;

  altKey?: boolean;
  ctrlKey?: boolean;
  mouseButton?: MouseInteractionType;
  shiftKey?: boolean;
}

export interface PointerDetail {
  event?: EventLike | Touch;
  identifier: string;

  clientX: number;
  clientY: number;
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
