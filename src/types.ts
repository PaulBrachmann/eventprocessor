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
export interface EventData<E extends EventLike = EventLike> {
  /** The original arguments passed to `dispatch`. */
  args: any[];
  /** The original event. */
  event: E;

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

  /**
   * Adds event listeners for the given event types to an element.
   *
   * @param eventTypes The event types
   * @param element The element (defaults to `document`)
   */
  register(eventTypes: string[], element?: EventTarget): IEventProcessor<D, T>;

  /** Sets a value in the event processor's state. */
  set<K extends keyof T>(key: K, value: T[K]): IEventProcessor<D, T>;

  /**
   * Removes event listeners for the given event types from an element.
   *
   * @param eventTypes The event types
   * @param element The element (defaults to `document`)
   */
  unregister(
    eventTypes: string[],
    element?: EventTarget,
  ): IEventProcessor<D, T>;

  /** Updates a value in the event processor's state. */
  update<K extends keyof T>(
    key: K,
    updater: (value: T[K]) => T[K],
  ): IEventProcessor<D, T>;

  /** Applies middleware. */
  use(
    ...middlewares: MiddlewareChain<EventMiddleware<D, T>>
  ): IEventProcessor<D, T>;

  /**
   * Applies afterware.
   * This is different from `use` (which applies middleware) in so far that the afterware
   * chain can not break and is always executed after the middleware chain completes
   * (even if it terminated early through e.g. the `filter` middleware).
   */
  useAfter(
    ...afterwares: MiddlewareChain<EventMiddleware<D, T>>
  ): IEventProcessor<D, T>;
}
