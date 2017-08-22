/**
 * Transform data
 * @module adapters/internal/transformdata
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import Pointer from '../../adapters/internal/pointer';

/** Transform data, stores pointer transform / offset data */
class TransformData {
  /** Generate transform data from an array of pointers */
  public static fromPointers<ID>(pointers: Pointer<ID>[]): TransformData {
    const pointerCount = pointers.length;

    let translateX = 0;
    let translateY = 0;
    let scale = 1;

    // Compute average position (transform origin)
    pointers.forEach(({ detail }) => {
      translateX += detail.clientX;
      translateY += detail.clientY;
      if (detail._scale) scale *= detail._scale;
    });
    translateX /= pointerCount;
    translateY /= pointerCount;

    return new TransformData(
      // Average x position
      translateX,
      // Average y position
      translateY,
      // Average distance from transform origin
      ((pointers.reduce(
        (sum, { detail }) =>
          sum + Math.sqrt(
            (detail.clientX - translateX) ** 2
            + (detail.clientY - translateY) ** 2,
          ),
        0,
      ) / pointerCount) || 1) * scale,
      // TODO: Rotation angle of all involved pointers
    );
  }

  constructor(
    /** X position / offset in px */
    public translateX: number = 0,
    /** Y position / offset in px */
    public translateY: number = 0,
    /** Distance / scale (zoom) as factor */
    public scale: number = 1,
    /** Angle / rotation offset in degrees */
    public rotate2d: number = 0,
  ) {
    if (this.scale === 0) this.scale = 1;
  }

  /** Create a new set of identical transform values */
  public clone(): TransformData {
    return new TransformData(this.translateX, this.translateY, this.scale, this.rotate2d);
  }

  /** Invert the transform data */
  public invert(): TransformData {
    this.translateX = -this.translateX;
    this.translateY = -this.translateY;
    this.scale = 1 / this.scale;
    this.rotate2d = -this.rotate2d;
    return this;
  }

  /** Merge another set of transform data */
  public merge(gesture: TransformData): TransformData {
    this.translateX += gesture.translateX;
    this.translateY += gesture.translateY;
    this.scale *= gesture.scale;
    this.rotate2d += gesture.rotate2d;
    return this;
  }

  /** Set new transform values */
  public set({
    translateX = this.translateX,
    translateY = this.translateY,
    scale = this.scale,
    rotate2d = this.rotate2d,
  }: Partial<TransformData>): TransformData {
    this.translateX = translateX;
    this.translateY = translateY;
    this.scale = scale || 1;
    this.rotate2d = rotate2d;

    return this;
  }
}

export default TransformData;
