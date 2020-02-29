/* eslint-disable max-classes-per-file */
import {
  EventData,
  EventLike,
  EventMiddleware,
  MiddlewareChain,
  IEventProcessor,
} from "./types";
import { flattenArray } from "./utils";

export class BreakException implements Error {
  public message = "";

  public name = "BreakException";
}

/** Event Processor. */
export default class EventProcessor<
  D extends EventData = EventData,
  T extends {} = { [key: string]: any }
> implements IEventProcessor<D, T> {
  /** The middleware chain. */
  protected middlewares: EventMiddleware<D, T>[] = [];

  /** The afterware chain. */
  protected afterwares: EventMiddleware<D, T>[] = [];

  constructor(
    /** The event processor's state */
    protected state: Partial<T> = {},
  ) {}

  public delete<K extends keyof T>(key: K) {
    delete this.state[key];
    return this;
  }

  public dispatch = (event: EventLike, ...args: any[]) => {
    const eventData = { event, args };
    try {
      this.middlewares.forEach((middleware) => {
        middleware(eventData as any, this);
      });
      this.dispatchAfter(eventData as any);
    } catch (error) {
      if (error instanceof BreakException) {
        this.dispatchAfter(eventData as any);
        return this;
      }

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("Error in event handling chain: ", error);
      }
    }
    return this;
  };

  public get<K extends keyof T>(key: K): T[K] | undefined {
    return this.state[key];
  }

  public register(eventTypes: string[], element: EventTarget = document) {
    eventTypes.forEach((eventType) => {
      element.addEventListener(eventType, this.dispatch);
    });
    return this;
  }

  public set<K extends keyof T>(key: K, value: any) {
    this.state[key] = value;
    return this;
  }

  public unregister(eventTypes: string[], element: EventTarget = document) {
    eventTypes.forEach((eventType) => {
      element.removeEventListener(eventType, this.dispatch);
    });
    return this;
  }

  public update<K extends keyof T>(key: K, updater: (value: any) => any) {
    this.state[key] = updater(this.state[key]);
    return this;
  }

  public use(...middlewares: MiddlewareChain<EventMiddleware<D, T>>) {
    this.middlewares.push(...flattenArray<EventMiddleware<D, T>>(middlewares));
    return this;
  }

  public useAfter(...afterwares: MiddlewareChain<EventMiddleware<D, T>>) {
    this.afterwares.push(...flattenArray<EventMiddleware<D, T>>(afterwares));
    return this;
  }

  /** Triggers the afterware chain. */
  protected dispatchAfter(data: D) {
    this.afterwares.forEach((afterware) => {
      try {
        afterware(data, this);
      } catch (error) {
        if (
          !(error instanceof BreakException) &&
          process.env.NODE_ENV !== "production"
        ) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    });
  }
}
