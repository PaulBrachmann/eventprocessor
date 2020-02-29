import EventProcessor from "../../../eventprocessor";
import { RichEventData } from "../../types";
import mapWheel from "./mapper";

describe("mapWheel", () => {
  const processor = new EventProcessor<RichEventData>();
  let data: RichEventData;

  const interactionMap = {
    0: () => ({ type: "up" }),
    1: () => ({ type: "none" }),
    2: () => ({ type: "down" }),
  };

  beforeEach(() => {
    data = {
      args: [],
      device: "wheel",
      event: new WheelEvent("mousedown", {
        deltaY: 0,
      }),
      eventType: "move",
    };
  });

  it("should do nothing for an unclassified event", () => {
    data.device = undefined;
    expect(mapWheel(interactionMap)(data, processor)).toBe(undefined);
    expect(data.actions).toBe(undefined);
  });

  it("should do nothing for an unrecognized interaction", () => {
    expect(mapWheel({})(data, processor)).toBe(undefined);
    expect(data.actions).toBe(undefined);
  });

  it("should generate a none action", () => {
    expect(mapWheel(interactionMap)(data, processor)).toBe(undefined);
    expect(data.actions).toEqual([{ type: "none" }]);
  });

  it("should generate an up action", () => {
    data.event = new WheelEvent("mousedown", {
      deltaY: -3,
    });
    expect(mapWheel(interactionMap)(data, processor)).toBe(undefined);
    expect(data.actions).toEqual([{ type: "up" }]);
  });

  it("should generate a down action", () => {
    data.event = new WheelEvent("mousedown", {
      deltaY: 6,
    });
    expect(mapWheel(interactionMap)(data, processor)).toBe(undefined);
    expect(data.actions).toEqual([{ type: "down" }]);
  });
});
