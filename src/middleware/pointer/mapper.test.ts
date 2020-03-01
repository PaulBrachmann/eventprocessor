import Pointer from ".";
import EventProcessor from "../../eventprocessor";
import { RichEventData } from "../types";
import mapPointers from "./mapper";

describe("mapPointer", () => {
  const processor = new EventProcessor<RichEventData>();
  let data: RichEventData;

  beforeEach(() => {
    data = {
      args: [],
      device: "mouse",
      event: new MouseEvent("mousedown"),
      eventType: "start",
      pointers: [],
    };
  });

  it("should do nothing is there are no pointers", () => {
    expect(mapPointers(() => ({ type: "test" }))(data, processor)).toBe(
      undefined,
    );
    expect(data.actions).toBe(undefined);

    data.pointers = undefined;
    expect(mapPointers(() => ({ type: "test" }))(data, processor)).toBe(
      undefined,
    );
    expect(data.actions).toBe(undefined);
  });

  it("should generate an action", () => {
    data.pointers!.push(
      new Pointer(
        "uuid",
        {
          buttons: 1,
          clientX: 0,
          clientY: 0,
          identifier: "mouse",
          pressure: 1,
        },
        { device: "mouse", startTime: 0 },
      ),
    );
    expect(
      mapPointers(({ context: { device: type } }) => ({ type }))(
        data,
        processor,
      ),
    ).toBe(undefined);
    expect(data.actions).toEqual([{ type: "mouse" }]);
  });
});
