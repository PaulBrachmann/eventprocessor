import { EventLike } from "../../types";
import { MouseInteractionType } from "../adapters/mouse";
import { DeviceType } from "../types";

export interface PointerDevice {
  type: DeviceType;

  altKey?: boolean;
  ctrlKey?: boolean;
  mouseButton?: MouseInteractionType;
  shiftKey?: boolean;
}

export interface PointerDetail {
  clientX: number;
  clientY: number;
  event?: EventLike | Touch;
  identifier: string;
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
    /** Pointer detail, stores pointer position. */
    public detail: PointerDetail,
    /** Metadata about the device this pointer originates from. */
    public device: PointerDevice,
  ) {}
}

export default Pointer;
export { default as pointerMapper } from "./mapper";
