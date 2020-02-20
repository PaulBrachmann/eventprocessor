import EventProcessor from "../../../eventprocessor";
import Pointer from "../../pointer";
import { PointerState, RichEventData } from "../../types";
import mouseAdapter from "./adapter";

describe("mouseAdapter", () => {
  const processor = new EventProcessor<RichEventData, PointerState>();
  const pointer = new Pointer(
    "uuid",
    {
      clientX: 32,
      clientY: 24,
      event: new MouseEvent("mousedown", { clientX: 32, clientY: 24 }),
      identifier: "mouse",
    },
    { type: "mouse", mouseButton: 0 },
  );

  it("should do nothing for an unclassified event", () => {
    expect(
      mouseAdapter()(
        {
          args: [],
          event: new MouseEvent("mousedown", { clientX: 0, clientY: 0 }),
        },
        processor,
      ),
    ).toBe(undefined);
    expect(processor.get("pointers")).toBe(undefined);
  });

  it("should do nothing for an unrecognized event", () => {
    expect(
      mouseAdapter()(
        {
          args: ["uuid"],
          device: "mouse",
          event: new MouseEvent("mousedown", { clientX: 0, clientY: 0 }),
          eventType: "undef" as any,
        },
        processor,
      ),
    ).toBe(undefined);
    expect(processor.get("pointers")).toBe(undefined);
  });

  it("should do nothing if no id is passed with start event", () => {
    expect(
      mouseAdapter()(
        {
          args: [],
          device: "mouse",
          event: new MouseEvent("mousedown", { clientX: 0, clientY: 0 }),
          eventType: "start",
        },
        processor,
      ),
    ).toBe(undefined);
    expect(processor.get("pointers")).toBe(undefined);
  });

  it("should create a new pointer", () => {
    expect(
      mouseAdapter()(
        {
          args: ["uuid"],
          device: "mouse",
          event: new MouseEvent("mousedown", { clientX: 32, clientY: 24 }),
          eventType: "start",
        },
        processor,
      ),
    ).toBe(undefined);

    expect(processor.get("pointers")).toEqual({ mouse: pointer });
  });

  it("should update a pointer", () => {
    expect(
      mouseAdapter()(
        {
          args: [],
          device: "mouse",
          event: new MouseEvent("mousemove", { clientX: 64, clientY: 32 }),
          eventType: "move",
        },
        processor,
      ),
    ).toBe(undefined);

    pointer.detail = {
      clientX: 64,
      clientY: 32,
      event: new MouseEvent("mousemove", { clientX: 64, clientY: 32 }),
      identifier: "mouse",
    };
    expect(processor.get("pointers")).toEqual({ mouse: pointer });
  });

  it("should delete a pointer", () => {
    expect(
      mouseAdapter()(
        {
          args: [],
          device: "mouse",
          event: new MouseEvent("mouseup", { clientX: 64, clientY: 32 }),
          eventType: "end",
        },
        processor,
      ),
    ).toBe(undefined);
    expect(processor.get("pointers")).toEqual({});
  });

  it("should do nothing when trying to modify a non-existent pointer", () => {
    expect(
      mouseAdapter()(
        {
          args: [],
          device: "mouse",
          event: new MouseEvent("mousemove", { clientX: 64, clientY: 32 }),
          eventType: "move",
        },
        processor,
      ),
    ).toBe(undefined);
    expect(processor.get("pointers")).toEqual({});
  });
});
