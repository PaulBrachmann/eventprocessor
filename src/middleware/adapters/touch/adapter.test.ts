import EventProcessor from "../../../eventprocessor";
import Pointer from "../../pointer";
import { PointerState, RichEventData, RichEventState } from "../../types";
import touchAdapter from "./adapter";

const createTouch = (identifier: number, clientX = 0, clientY = 0): Touch =>
  (({
    clientX,
    clientY,
    identifier,
    pageX: clientX,
    pageY: clientY,
    screenX: clientX,
    screenY: clientY,
    target: document.createElement("div"),
  } as any) as Touch);

const createTouchEvent = (type: string, changedTouches: Touch[]) =>
  new TouchEvent(type, {
    changedTouches,
    targetTouches: [],
    touches: changedTouches,
  });

describe("touchAdapter", () => {
  const processor = new EventProcessor<
    RichEventData,
    RichEventState & PointerState
  >();
  let pointer: Pointer;
  let pointer2: Pointer;

  beforeEach(() => {
    pointer = new Pointer(
      "uuid",
      {
        buttons: 1,
        cancel: false,
        clientX: 0,
        clientY: 0,
        event: createTouch(0, 0, 0),
        identifier: "t/0",
        pressure: 1,
      },
      {
        device: "touch",
        startTime: expect.anything(),
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      },
    );
    pointer2 = new Pointer(
      "uuid",
      {
        buttons: 1,
        cancel: false,
        clientX: 64,
        clientY: 64,
        event: createTouch(1, 64, 64),
        identifier: "t/1",
        pressure: 1,
      },
      {
        device: "touch",
        startTime: expect.anything(),
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      },
    );
  });

  it("should do nothing for an unclassified event", () => {
    const data: RichEventData = {
      args: [],
      event: createTouchEvent("touchstart", [createTouch(0), createTouch(1)]),
    };

    expect(touchAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toBe(undefined);
    expect(data.pointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should do nothing for an unrecognized event", () => {
    const data: RichEventData = {
      args: ["uuid"],
      device: "touch",
      event: createTouchEvent("touchstart", [createTouch(0), createTouch(1)]),
      eventType: "undef" as any,
    };

    expect(touchAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toBe(undefined);
    expect(data.pointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should do nothing if no id is passed with start event", () => {
    const data: RichEventData = {
      args: [],
      device: "touch",
      event: createTouchEvent("touchstart", [createTouch(0), createTouch(1)]),
      eventType: "start",
    };

    expect(touchAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toBe(undefined);
    expect(data.pointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should create a new pointer", () => {
    const data: RichEventData = {
      args: ["uuid"],
      device: "touch",
      event: createTouchEvent("touchstart", [
        createTouch(0, 0, 0),
        createTouch(1, 64, 64),
      ]),
      eventType: "start",
    };

    expect(touchAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toEqual({
      "t/0": pointer,
      "t/1": pointer2,
    });
    expect(data.pointers).toEqual([pointer, pointer2]);
    expect(data.ids).toEqual(["uuid"]);
  });

  it("should update a pointer", () => {
    const data: RichEventData = {
      args: [],
      device: "touch",
      event: createTouchEvent("touchmove", [
        createTouch(0, 64, 16),
        createTouch(1, 32, 24),
      ]),
      eventType: "move",
    };

    expect(touchAdapter()(data, processor)).toBe(undefined);

    pointer.detail = {
      buttons: 1,
      cancel: false,
      clientX: 64,
      clientY: 16,
      event: createTouch(0, 64, 16),
      identifier: "t/0",
      pressure: 1,
    };
    pointer2.detail = {
      buttons: 1,
      cancel: false,
      clientX: 32,
      clientY: 24,
      event: createTouch(1, 32, 24),
      identifier: "t/1",
      pressure: 1,
    };
    expect(processor.get("pointers")).toEqual({
      "t/0": pointer,
      "t/1": pointer2,
    });
    expect(data.pointers).toEqual([pointer, pointer2]);
    expect(data.ids).toEqual(["uuid"]);
  });

  it("should delete a pointer", () => {
    const data: RichEventData = {
      args: [],
      device: "touch",
      event: createTouchEvent("touchend", [
        createTouch(0, 0, 0),
        createTouch(1, 64, 64),
      ]),
      eventType: "end",
    };

    expect(touchAdapter()(data, processor)).toBe(undefined);

    pointer.detail.buttons = 0;
    pointer2.detail.buttons = 0;
    pointer.detail.pressure = 0;
    pointer2.detail.pressure = 0;
    expect(processor.get("pointers")).toEqual({});
    expect(data.pointers).toEqual([pointer, pointer2]);
    expect(data.ids).toEqual(["uuid"]);
  });

  it("should do nothing when trying to modify a non-existent pointer", () => {
    const data: RichEventData = {
      args: [],
      device: "touch",
      event: createTouchEvent("touchmove", [createTouch(0), createTouch(1)]),
      eventType: "move",
    };

    expect(touchAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toEqual({});
    expect(data.pointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });
});
