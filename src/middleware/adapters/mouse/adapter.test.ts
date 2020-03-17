import EventProcessor from "../../../eventprocessor";
import Pointer from "../../pointer";
import { PointerState, RichEventData, RichEventState } from "../../types";
import mouseAdapter from "./adapter";

describe("mouseAdapter", () => {
  const processor = new EventProcessor<
    RichEventData,
    RichEventState & PointerState
  >();
  let pointer: Pointer<any>;

  beforeEach(() => {
    pointer = new Pointer(
      "uuid",
      {
        buttons: 1,
        clientX: 32,
        clientY: 24,
        event: new MouseEvent("mousedown", {
          buttons: 1,
          clientX: 32,
          clientY: 24,
        }),
        identifier: "mouse",
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
      event: new MouseEvent("mousedown", {
        buttons: 1,
        clientX: 0,
        clientY: 0,
      }),
    };

    expect(mouseAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toBe(undefined);
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should do nothing for an unrecognized event", () => {
    const data: RichEventData = {
      args: ["uuid"],
      device: "mouse",
      event: new MouseEvent("mousedown", {
        buttons: 1,
        clientX: 0,
        clientY: 0,
      }),
      eventType: "undef" as any,
    };

    expect(mouseAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toBe(undefined);
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should do nothing if no id is passed with start event", () => {
    const data: RichEventData = {
      args: [],
      device: "mouse",
      event: new MouseEvent("mousedown", {
        buttons: 1,
        clientX: 0,
        clientY: 0,
      }),
      eventType: "start",
    };

    expect(mouseAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toBe(undefined);
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should create a new pointer", () => {
    const data: RichEventData = {
      args: ["uuid"],
      device: "mouse",
      event: new MouseEvent("mousedown", {
        buttons: 1,
        clientX: 32,
        clientY: 24,
      }),
      eventType: "start",
    };

    expect(mouseAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toEqual({ mouse: pointer });
    expect(data.pointers).toEqual([pointer]);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toEqual(["uuid"]);
  });

  it("should update a pointer", () => {
    const data: RichEventData = {
      args: [],
      device: "mouse",
      event: new MouseEvent("mousemove", {
        buttons: 1,
        clientX: 64,
        clientY: 32,
      }),
      eventType: "move",
    };

    expect(mouseAdapter()(data, processor)).toBe(undefined);

    pointer.detail = {
      buttons: 1,
      clientX: 64,
      clientY: 32,
      event: new MouseEvent("mousemove", {
        buttons: 1,
        clientX: 64,
        clientY: 32,
      }),
      identifier: "mouse",
      pressure: 1,
    };
    expect(processor.get("pointers")).toEqual({ mouse: pointer });
    expect(data.pointers).toEqual([pointer]);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toEqual(["uuid"]);
  });

  it("should delete a pointer", () => {
    const data: RichEventData = {
      args: [],
      device: "mouse",
      event: new MouseEvent("mouseup", { clientX: 64, clientY: 32 }),
      eventType: "end",
    };

    expect(mouseAdapter()(data, processor)).toBe(undefined);

    pointer.detail = {
      buttons: 0,
      clientX: 64,
      clientY: 32,
      event: new MouseEvent("mouseup", { clientX: 64, clientY: 32 }),
      identifier: "mouse",
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
      device: "mouse",
      event: new MouseEvent("mousemove", {
        buttons: 1,
        clientX: 64,
        clientY: 32,
      }),
      eventType: "move",
    };

    expect(mouseAdapter()(data, processor)).toBe(undefined);

    expect(processor.get("pointers")).toEqual({});
    expect(data.pointers).toBe(undefined);
    expect(data.unidentifiedPointers).toBe(undefined);
    expect(data.ids).toBe(undefined);
  });

  it("should handle an unidentified pointer", () => {
    const data: RichEventData = {
      args: [],
      device: "mouse",
      event: new MouseEvent("mousemove", { clientX: 64, clientY: 32 }),
      eventType: "move",
    };

    expect(mouseAdapter(true)(data, processor)).toBe(undefined);

    pointer.id = undefined;
    pointer.detail = {
      buttons: 0,
      clientX: 64,
      clientY: 32,
      event: new MouseEvent("mousemove", { clientX: 64, clientY: 32 }),
      identifier: "mouse",
      pressure: 0,
    };
    expect(processor.get("pointers")).toEqual({});
    expect(data.unidentifiedPointers).toEqual([pointer]);
    expect(data.ids).toBe(undefined);
  });
});
