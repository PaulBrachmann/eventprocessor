/**
 * Shared Types
 * @module eventprocessor/types
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

/* Event-like interface matching native events & React's synthetic events */
export interface EventLike {
  bubbles: boolean;
  cancelable: boolean;
  currentTarget: EventTarget;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  preventDefault: () => void;
  stopImmediatePropagation?: () => void;
  stopPropagation: () => void;
  target: EventTarget;
  timeStamp: number;
  type: string;
}
