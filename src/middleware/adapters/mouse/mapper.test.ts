import EventProcessor from "../../../eventprocessor";
import { RichEventData } from "../../types";
import mapMouse from "./mapper";

describe("mapMouse", () => {
  const processor = new EventProcessor<RichEventData>();
  let data: RichEventData;

  beforeEach(() => {
    data = {
      args: [],
      device: "mouse",
      event: new MouseEvent("mousedown", {
        button: 3,
      }),
      eventType: "start",
    };
  });

  it("should do nothing for an unclassified event", () => {
    data.device = undefined;
    expect(mapMouse({ 3: () => ({ type: "test" }) })(data, processor)).toBe(
      undefined,
    );
    expect(data.actions).toBe(undefined);
  });

  it("should do nothing for an unrecognized interaction", () => {
    expect(mapMouse({})(data, processor)).toBe(undefined);
    expect(data.actions).toBe(undefined);
  });

  it("should generate an action", () => {
    expect(mapMouse({ 3: () => ({ type: "test" }) })(data, processor)).toBe(
      undefined,
    );
    expect(data.actions).toEqual([{ type: "test" }]);
  });

  it("should do nothing for a move event", () => {
    data.event = new MouseEvent("mousemove", {
      button: 3,
    });
    data.eventType = "move";

    expect(mapMouse({ 3: () => ({ type: "test" }) })(data, processor)).toBe(
      undefined,
    );
    expect(data.actions).toBe(undefined);
  });
});
