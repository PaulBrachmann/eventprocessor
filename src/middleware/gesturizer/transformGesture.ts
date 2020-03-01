import TransformData from "./transformData";

/**
 * Transform gesture, used to compute the offset transformation
 * from the transformation origin to the gesture's target.
 */
class TransformGesture {
  /** Current gesture target. */
  protected target: TransformData = new TransformData();

  constructor(
    /** The initial gesture target. */
    protected origin: TransformData = new TransformData(),
    /** Gesture context (to store arbitrary data related to the gesture). */
    public context: { [key: string]: any } = {},
  ) {
    this.target.set(origin);
  }

  /** Returns the gesture's target. */
  public getTarget(): TransformData {
    return this.target;
  }

  /** Returns the transformation data resulting from the gesture. */
  public getTransform(): TransformData {
    return this.target.clone().subtract(this.origin);
  }

  /**
   * Replaces the origin (initial transformation data),
   * preserves resulting transformation.
   *
   * @param origin The new origin
   */
  public rebase(origin: TransformData): TransformGesture {
    this.origin = origin.clone().subtract(this.getTransform());
    return this.setTarget(origin);
  }

  /** Updates the gesture's target. */
  public setTarget(currentTarget: Partial<TransformData>): TransformGesture {
    this.target.set(currentTarget);
    return this;
  }
}

export default TransformGesture;
