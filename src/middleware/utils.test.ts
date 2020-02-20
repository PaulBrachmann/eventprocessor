import EventProcessor, { BreakException } from "../eventprocessor";
import { EventData } from "../types";
import {
  classify,
  filter,
  log,
  preventDefault,
  forEvent,
  forAction,
} from "./utils";
import { RichEventData } from "./types";

/* eslint-disable no-console */

let processor: EventProcessor;

beforeEach(() => {
  processor = new EventProcessor();
});

describe("classify", () => {
  const classifier = classify({ type: ["mouse", "start"] });

  it("should classify events", () => {
    const data: EventData = { event: new Event("type"), args: [] };
    expect(classifier(data, processor)).toBe(undefined);
    expect(data.device).toBe("mouse");
    expect(data.eventType).toBe("start");
  });

  it("should not classify unknown events", () => {
    const data2: EventData = { event: new Event("undef"), args: [] };
    expect(classifier(data2, processor)).toBe(undefined);
    expect(data2.device).toBe(undefined);
    expect(data2.eventType).toBe(undefined);
  });
});

describe("log", () => {
  const initialConsoleLog = console.log;

  const data: EventData = { event: new Event("type"), args: [] };
  const data2: EventData = {
    event: new Event("type"),
    args: ["uuid"],
    ids: ["uuid"],
  };

  beforeEach(() => {
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = initialConsoleLog;
  });

  it("should only log known events", () => {
    expect(log()(data, processor)).toBe(undefined);
    expect(console.log).toHaveBeenCalledTimes(0);

    expect(log()(data2, processor)).toBe(undefined);
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it("should also log unknown events", () => {
    expect(log(true)(data, processor)).toBe(undefined);
    expect(console.log).toHaveBeenCalledTimes(1);

    expect(log(true)(data2, processor)).toBe(undefined);
    expect(console.log).toHaveBeenCalledTimes(2);
  });

  // TODO: Test production environment
});

describe("preventDefault", () => {
  /* eslint-disable @typescript-eslint/unbound-method */
  const event = new CustomEvent("type", {
    cancelable: true,
  });

  beforeEach(() => {
    event.preventDefault = jest.fn();
    event.stopPropagation = jest.fn();
  });

  it("should handle all events", () => {
    expect(preventDefault(true)({ event, args: [] }, processor)).toBe(
      undefined,
    );
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("should not handle events without associated id(s)", () => {
    expect(preventDefault()({ event, args: [] }, processor)).toBe(undefined);
    expect(event.preventDefault).toHaveBeenCalledTimes(0);
    expect(event.stopPropagation).toHaveBeenCalledTimes(0);
  });

  it("should handle events with associated id(s)", () => {
    expect(
      preventDefault()({ event, args: [], ids: ["uuid"] }, processor),
    ).toBe(undefined);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
  });
  /* eslint-enable @typescript-eslint/unbound-method */
});

describe("filter", () => {
  it("should not abort if the predicate holds", () => {
    expect(() => {
      filter((data) => data.propagate)(
        { event: new Event("type"), args: [], propagate: true },
        processor,
      );
    }).not.toThrow();
  });

  it("should abort if the predicate does not hold", () => {
    expect(() => {
      filter((data) => !data.abort)(
        { event: new Event("type"), args: [], abort: true },
        processor,
      );
    }).toThrowError(BreakException);
  });
});

describe("forEvent", () => {
  const callback = jest.fn();

  const event = new Event("type");
  const data = { event, args: [] };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should execute side effects for all events", () => {
    expect(forEvent(callback)(data, processor)).toBe(undefined);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(data);
  });

  it("should execute side effects for a given event type", () => {
    expect(forEvent(callback, "type")(data, processor)).toBe(undefined);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(data);
  });

  it("should not execute side effects for a different event type than given", () => {
    expect(forEvent(callback, "otherType")(data, processor)).toBe(undefined);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it("should execute side effects for a listed event type", () => {
    expect(
      forEvent(callback, ["type", "type2"])(
        { event: new Event("type2"), args: [] },
        processor,
      ),
    ).toBe(undefined);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not execute side effects for an unlisted event type", () => {
    expect(
      forEvent(callback, ["type", "type2"])(
        { event: new Event("type3"), args: [] },
        processor,
      ),
    ).toBe(undefined);
    expect(callback).toHaveBeenCalledTimes(0);
  });
});

describe("forAction", () => {
  const callback = jest.fn();

  const event = new Event("type");
  let data: RichEventData = { event, actions: [], args: [] };

  beforeEach(() => {
    data = { event, actions: [], args: [] };
    jest.clearAllMocks();
  });

  it("should not execute side effects if there are no actions", () => {
    expect(forAction(callback)(data, processor)).toBe(undefined);
    data.actions = undefined;
    expect(forAction(callback)(data, processor)).toBe(undefined);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it("should not execute side effects for each action", () => {
    data.actions!.push({ type: "test" }, { type: "test" });

    expect(forAction(callback)(data, processor)).toBe(undefined);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
