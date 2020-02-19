/* Event-like interface matching native events & React's synthetic events */
export interface EventLike {
  bubbles: boolean;
  cancelable: boolean;
  currentTarget: EventTarget | null;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  preventDefault: () => void;
  stopImmediatePropagation?: () => void;
  stopPropagation: () => void;
  target: EventTarget | null;
  timeStamp: number;
  type: string;
}

/** Event processor data interface (passed to middleware). */
export interface EventData {
  /** The original arguments passed to `dispatch`. */
  args: any[];
  /** The original event. */
  event: EventLike;

  [key: string]: any;
}

/** Event processor middleware function signature. */
export type EventMiddleware<
  D extends EventData = EventData,
  T = { [key: string]: any }
> = (data: D, eventProcessor: IEventProcessor<D, T>) => void;

/** A nested array of middleware functions. */
export type MiddlewareChain<M = EventMiddleware> = (MiddlewareChain<M> | M)[];

export interface IEventProcessor<
  D extends EventData = EventData,
  T extends {} = { [key: string]: any }
> {
  /** Deletes a value from the event processor's state. */
  delete<K extends keyof T>(key: K): IEventProcessor<D, T>;

  /** Triggers an event chain. */
  dispatch(event: EventLike, ...args: any[]): IEventProcessor<D, T>;

  /** Gets a value from the event procesor's state. */
  get<K extends keyof T>(key: K): T[K] | undefined;

  /** Sets a value in the event processor's state. */
  set<K extends keyof T>(key: K, value: any): IEventProcessor<D, T>;

  /** Updates a value in the event processor's state. */
  update<K extends keyof T>(
    key: K,
    updater: (value: any) => any,
  ): IEventProcessor<D, T>;

  /** Applies middleware. */
  use(
    ...middlewares: MiddlewareChain<EventMiddleware<D, T>>
  ): IEventProcessor<D, T>;
}
