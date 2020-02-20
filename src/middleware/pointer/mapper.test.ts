import Pointer from ".";
import EventProcessor from "../../eventprocessor";
import { RichEventData } from "../types";
import mapPointer from "./mapper";

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
    expect(mapPointer(() => ({ type: "test" }))(data, processor)).toBe(
      undefined,
    );
    expect(data.actions).toBe(undefined);

    data.pointers = undefined;
    expect(mapPointer(() => ({ type: "test" }))(data, processor)).toBe(
      undefined,
    );
    expect(data.actions).toBe(undefined);
  });

  it("should generate an action", () => {
    data.pointers!.push(
      new Pointer(
        "uuid",
        { clientX: 0, clientY: 0, identifier: "mouse" },
        { type: "mouse", startTime: 0 },
      ),
    );
    expect(
      mapPointer(({ device: { type } }) => ({ type }))(data, processor),
    ).toBe(undefined);
    expect(data.actions).toEqual([{ type: "mouse" }]);
  });
});
