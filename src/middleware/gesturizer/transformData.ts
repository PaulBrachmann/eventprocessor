import Pointer from "../pointer";

const flipSign = (value: number) => (value ? -value : 0);

/** Transform data, stores pointer transform/offset data. */
class TransformData {
  /** Generates transform data from an array of pointers. */
  public static fromPointers<ID>(pointers: Pointer<ID>[]): TransformData {
    const pointerCount = pointers.length;

    let translateX = 0;
    let translateY = 0;
    let scale = 1;
    let rotate2d = 0;

    // Compute average position (transform origin)
    pointers.forEach(({ detail }) => {
      translateX += detail.clientX;
      translateY += detail.clientY;
      if (detail.scale) scale *= detail.scale;
      if (detail.rotate2d) rotate2d += detail.rotate2d;
    });
    translateX /= pointerCount;
    translateY /= pointerCount;

    return new TransformData(
      // Average x position
      translateX,
      // Average y position
      translateY,
      // Average distance from transform origin
      (pointers.reduce(
        (sum, { detail }) =>
          sum +
          Math.sqrt(
            (detail.clientX - translateX) ** 2 +
              (detail.clientY - translateY) ** 2,
          ),
        0,
      ) / pointerCount || 1) * scale,
      // TODO: Rotation angle of all involved pointers
      rotate2d,
    );
  }

  constructor(
    /** X position/offset in px. */
    public translateX: number = 0,
    /** Y position/offset in px. */
    public translateY: number = 0,
    /** Distance/scale (zoom) as factor. */
    public scale: number = 1,
    /** Angle/rotation offset in degrees. */
    public rotate2d: number = 0,
  ) {
    if (this.scale === 0) this.scale = 1;
  }

  /** Creates a new set of identical transform values. */
  public clone(): TransformData {
    return new TransformData(
      this.translateX,
      this.translateY,
      this.scale,
      this.rotate2d,
    );
  }

  /** Inverts the transform data. */
  public invert(): TransformData {
    this.translateX = flipSign(this.translateX);
    this.translateY = flipSign(this.translateY);
    this.scale = 1 / this.scale;
    this.rotate2d = flipSign(this.rotate2d);
    return this;
  }

  /** Merges another set of transform data additively into this one. */
  public add(otherTransform: TransformData): TransformData {
    this.translateX += otherTransform.translateX;
    this.translateY += otherTransform.translateY;
    this.scale *= otherTransform.scale;
    this.rotate2d += otherTransform.rotate2d;
    return this;
  }

  /** Sets new transform values. */
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

  /** Merges another set of transform data subtractively into this one. */
  public subtract(otherTransform: TransformData): TransformData {
    this.translateX -= otherTransform.translateX;
    this.translateY -= otherTransform.translateY;
    this.scale /= otherTransform.scale;
    this.rotate2d -= otherTransform.rotate2d;
    return this;
  }

  /**
   * Offsets `translateX`/`translateY` so that the given zoom target
   * (e.g. mouse position) stays fixed in place with respect to the zoom.
   *
   * This eliminates any perceived displacement/shifting resulting from a zoom.
   *
   * @param zoomTarget The point to zoom around (e.g. mouse position).
   * @param actualZoomCenterX The x-coordinate of the point the actual (DOM)
   * scaling originates from (usually top left of the element)
   * @param actualZoomCenterY The y-coordinate of the point the actual (DOM)
   * scaling originates from (usually top left of the element)
   */
  public counterZoomOffset(
    zoomTarget: TransformData,
    actualZoomCenterX = 0,
    actualZoomCenterY = 0,
  ) {
    this.translateX -=
      (zoomTarget.translateX - actualZoomCenterX) * (this.scale - 1);
    this.translateY -=
      (zoomTarget.translateY - actualZoomCenterY) * (this.scale - 1);
    return this;
  }
}

export default TransformData;
