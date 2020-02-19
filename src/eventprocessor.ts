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

  constructor(
    /** The event processor's state */
    protected state: Partial<T> = {},
  ) {}

  public delete<K extends keyof T>(key: K) {
    delete this.state[key];
    return this;
  }

  public dispatch = (event: EventLike, ...args: any[]) => {
    try {
      const eventData = { event, args };
      this.middlewares.forEach((middleware) => {
        middleware(eventData as any, this as any);
      });
    } catch (error) {
      if (
        !(error instanceof BreakException) &&
        process.env.NODE_ENV !== "production"
      ) {
        // eslint-disable-next-line no-console
        console.error("Error in event handling chain: ", error);
      }
    }
    return this;
  };

  public get<K extends keyof T>(key: K): T[K] | undefined {
    return this.state[key];
  }

  public set<K extends keyof T>(key: K, value: any) {
    this.state[key] = value;
    return this;
  }

  public update<K extends keyof T>(key: K, updater: (value: any) => any) {
    this.state[key] = updater(this.state[key]);
    return this;
  }

  /** Applies middleware. */
  public use(...middlewares: MiddlewareChain<EventMiddleware<D, T>>) {
    this.middlewares.push(...flattenArray<EventMiddleware<D, T>>(middlewares));
    return this;
  }
}
