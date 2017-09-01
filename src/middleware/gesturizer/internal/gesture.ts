/**
 * Gesture
 * @module gesturizer/internal/gesture
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import TransformData from './transformdata';

/** Gesture, stores pointer transforms & computes gesture offset */
class Gesture {
  /** Current pointer transform data */
  public current: TransformData = new TransformData();
  /** Static offset for internal corrections  */
  public offset: TransformData = new TransformData();

  constructor(
    /** Initial pointer transform data */
    public origin: TransformData = new TransformData(),
    /** Gesture context (to store arbitrary data related to the gesture) */
    public context: { [key: string]: any } = {},
  ) {
    this.current.set(origin);
  }

  /** Get the current offset */
  public getOffset(): TransformData {
    return this.origin.clone().invert()
      // Compute current offset
      .merge(this.current)
      // Static offset
      .merge(this.offset);
  }

  /** Replace the initial transform data, preserve transforms */
  public rebase(origin: TransformData): Gesture {
    // Compute new offset
    this.offset.set(this.getOffset());

    // Replace initial transform data
    this.origin = origin;

    // Set new pointer position
    this.setPointer(origin);

    return this;
  }

  /** Set the current pointer transform data */
  public setPointer(current: Partial<TransformData>): Gesture {
    this.current.set(current);
    return this;
  }
}

export default Gesture;
