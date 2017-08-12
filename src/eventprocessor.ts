/**
 * Event Processor
 * @module eventprocessor/eventprocessor
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { EventLike } from './types';
import { composeMiddleware, Next } from './utils';

export { Next };
/** Event processor data interface (passed to middleware) */
export interface EventData {
  args: any[];
  event: EventLike;
  [key: string]: any;
}
/** Event processor middleware function signature */
export type EventMiddleware<T> = (
  next: Next,
  data: EventData,
  eventProcessor: EventProcessor<T>,
) => void;

/** Event Processor */
export default class EventProcessor<T extends {} = { [key: string]: any }> {
  /** The middleware hain */
  protected middleware: EventMiddleware<T>[] = [];

  /** Create a new event processor */
  constructor(
    /** The event processor's state */
    protected state: Partial<T> = (({} as any) as T),
  ) {
    this.dispatch = this.dispatch.bind(this);
  }

  /** Delete a value from the event processor's state */
  public delete<K extends keyof T>(key: K) {
    delete this.state[key];
    return this;
  }

  /** Trigger an event chain */
  public dispatch(event: EventLike, ...args: any[]) {
    try {
      composeMiddleware<any>({ event, args }, this)(...this.middleware)();
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error in event handling chain: ', error); // tslint:disable-line no-console
      }
    }
  }

  /** Get a value from the event procesor's state */
  public get<K extends keyof T>(key: K): T[K] | undefined {
    return this.state[key];
  }

  /** Set a value in the event processor's state */
  public set<K extends keyof T>(key: K, value: any) {
    this.state[key] = value;
    return this;
  }

  /** Update a value in the event processor's state */
  public update<K extends keyof T>(key: K, updater: (value: any) => any) {
    this.state[key] = updater(this.state[key]);
    return this;
  }

  /** Apply middleware */
  public use(...middlewares: EventMiddleware<T>[]) {
    this.middleware.push(...middlewares);
    return this;
  }
}
