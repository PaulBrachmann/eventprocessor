import EventProcessor from "../../../eventprocessor";
import { KeysPressedState, RichEventData } from "../../types";
import { areKeysPressed } from "./utils";

describe("areKeysPressed", () => {
  const processor = new EventProcessor<RichEventData, KeysPressedState>();

  beforeEach(() => {
    processor.set("keysPressed", undefined);
  });

  it("should return false if no keys were ever recorded", () => {
    expect(areKeysPressed(processor, ["a"])).toBe(false);
    expect(areKeysPressed(processor, ["Control", "+"])).toBe(false);
  });

  it("should return true if there are no keys required to be pressed", () => {
    expect(areKeysPressed(processor, [])).toBe(true);
    processor.set("keysPressed", {});
    expect(areKeysPressed(processor, [])).toBe(true);
  });

  it("should return false if not all of the given keys are pressed", () => {
    processor.set("keysPressed", { a: true, b: false, Control: true });
    expect(areKeysPressed(processor, ["c"])).toBe(false);
    expect(areKeysPressed(processor, ["Shift", "b"])).toBe(false);
    expect(areKeysPressed(processor, ["Control", "+"])).toBe(false);
  });

  it("should return true if all of the given keys are pressed", () => {
    processor.set("keysPressed", {
      a: true,
      b: false,
      Control: true,
      "+": true,
    });
    expect(areKeysPressed(processor, ["a"])).toBe(true);
    expect(areKeysPressed(processor, ["Control", "+"])).toBe(true);
    expect(areKeysPressed(processor, ["Control", "+", "a"])).toBe(true);
  });
});
