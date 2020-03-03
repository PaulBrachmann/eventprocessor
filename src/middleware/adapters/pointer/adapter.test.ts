import EventProcessor from "../../../eventprocessor";
import Pointer from "../../pointer";
import { PointerState, RichEventData } from "../../types";
import pointerAdapter from "./adapter";

const buildPointerEvent = (type: string, data: Partial<PointerEvent>) =>
  ({
    type,
    button: 0,
    buttons: 0,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    timeStamp: 0,
    ...data,
  } as PointerEvent);

describe("pointerAdapter", () => {
  const processor = new EventProcessor<RichEventData, PointerState>();
  let pointer: Pointer<any>;

  beforeEach(() => {
    pointer = new Pointer(
      "uuid",
      {
        buttons: 1,
        cancel: false,
        clientX: 32,
        clientY: 24,
        event: buildPointerEvent("pointerdown", {
          buttons: 1,
          clientX: 32,
          clientY: 24,
          pointerId: 0,
          pointerType: "mouse",
        }),
        identifier: "0",
        pressure: 1,
      },
      {
        device: "mouse",
        startTime: expect.anything(),
        altKey: false,
        ctrlKey: false,
        button: 0,
        shiftKey: false,
      },
    );
  });

  it("should do nothing for an unclassified event", () => {
    const data: RichEventData = {
      args: [],
      event: buildPointerEvent("pointerdown", {
        buttons: 1,
        clientX: 0,
        clientY: 0,
        pointerId: 0,
        pointerType: "mouse",
      }),
    };

    expect(pointerAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toBe(undefined);
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should do nothing for an unrecognized event", () => {
    const data: RichEventData = {
      args: ["uuid"],
      device: "pointer",
      event: buildPointerEvent("pointerdown", {
        buttons: 1,
        clientX: 0,
        clientY: 0,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "undef" as any,
    };

    expect(pointerAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toBe(undefined);
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should do nothing if no id is passed with start event", () => {
    const data: RichEventData = {
      args: [],
      device: "pointer",
      event: buildPointerEvent("pointerdown", {
        buttons: 1,
        clientX: 0,
        clientY: 0,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "start",
    };

    expect(pointerAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toBe(undefined);
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should create a new pointer", () => {
    const data: RichEventData = {
      args: ["uuid"],
      device: "pointer",
      event: buildPointerEvent("pointerdown", {
        buttons: 1,
        clientX: 32,
        clientY: 24,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "start",
    };

    expect(pointerAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toEqual({ 0: pointer });
    expect(data.pointers).toEqual([pointer]);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toEqual(["uuid"]);
  });

  it("should update a pointer", () => {
    const data: RichEventData = {
      args: [],
      device: "pointer",
      event: buildPointerEvent("pointermove", {
        buttons: 1,
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "move",
    };

    expect(pointerAdapter()(data, processor)).toBe(undefined);

    pointer.detail = {
      buttons: 1,
      cancel: false,
      clientX: 64,
      clientY: 32,
      event: buildPointerEvent("pointermove", {
        buttons: 1,
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      identifier: "0",
      pressure: 1,
    };
    expect(processor.get("pointers")).toEqual({ 0: pointer });
    expect(data.pointers).toEqual([pointer]);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toEqual(["uuid"]);
  });

  it("should delete a pointer", () => {
    const data: RichEventData = {
      args: [],
      device: "pointer",
      event: buildPointerEvent("pointerup", {
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "end",
    };

    expect(pointerAdapter()(data, processor)).toBe(undefined);

    pointer.detail = {
      buttons: 0,
      cancel: false,
      clientX: 64,
      clientY: 32,
      event: buildPointerEvent("pointerup", {
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      identifier: "0",
      pressure: 0,
    };
    expect(processor.get("pointers")).toEqual({});
    expect(data.pointers).toEqual([pointer]);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toEqual(["uuid"]);
  });

  it("should do nothing when trying to modify a non-existent pointer", () => {
    const data: RichEventData = {
      args: [],
      device: "pointer",
      event: buildPointerEvent("pointermove", {
        buttons: 1,
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "move",
    };

    expect(pointerAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toEqual({});
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should handle an unidentified pointer", () => {
    const data: RichEventData = {
      args: [],
      device: "pointer",
      event: buildPointerEvent("pointermove", {
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      eventType: "move",
    };

    expect(pointerAdapter(true)(data, processor)).toBe(undefined);

    pointer.id = undefined;
    pointer.detail = {
      buttons: 0,
      cancel: false,
      clientX: 64,
      clientY: 32,
      event: buildPointerEvent("pointermove", {
        clientX: 64,
        clientY: 32,
        pointerId: 0,
        pointerType: "mouse",
      }),
      identifier: "0",
      pressure: 0,
    };
    expect(processor.get("pointers")).toEqual({});
    expect(data.unidentifiedPointers).toEqual([pointer]);
    expect(data.ids).toBe(undefined);
  });
});
