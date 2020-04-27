import { getZoomToCursorDelta, getZoomToCursorTransform } from "./helpers";
import {
  createGestureEvent,
  TransformGesture,
  TransformData,
} from "./gesturizer";

describe("getZoomToCursorDelta", () => {
  it("should not output any delta if the zoom level stays constant", () => {
    expect(getZoomToCursorDelta(0, 0, 1) === 0).toBe(true);
    expect(getZoomToCursorDelta(255, 10, 1) === 0).toBe(true);
  });

  it("should not output any delta if the cursor and transform origin match", () => {
    expect(getZoomToCursorDelta(0, 0, 3) === 0).toBe(true);
    expect(getZoomToCursorDelta(-312, -312, 0.765) === 0).toBe(true);
  });

  it("should not output the correct delta", () => {
    expect(getZoomToCursorDelta(20, 0, 0.5)).toBe(10);
    expect(getZoomToCursorDelta(247, 0, 2)).toBe(-247);
  });
});

describe("getZoomToCursorTransform", () => {
  it("should not output any delta if the zoom level stays constant", () => {
    const event = createGestureEvent(
      "gesturemove",
      new TransformGesture(new TransformData(248, 328)),
      "uuid",
      [],
    );
    expect(getZoomToCursorTransform(event)).toEqual(new TransformData());
  });

  it("should not output any delta if the cursor and transform origin match", () => {
    const event = createGestureEvent(
      "gesturemove",
      new TransformGesture().setTarget(new TransformData(0, 0, 2)),
      "uuid",
      [],
    );
    expect(getZoomToCursorTransform(event)).toEqual(new TransformData(0, 0, 2));
  });

  it("should not output the correct delta", () => {
    const event = createGestureEvent(
      "gesturemove",
      new TransformGesture(new TransformData(80, 80)).setTarget(
        new TransformData(80, 80, 2),
      ),
      "uuid",
      [],
    );
    expect(getZoomToCursorTransform(event)).toEqual(
      new TransformData(-80, -80, 2),
    );
  });
});
