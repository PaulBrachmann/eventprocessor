# Middleware-based event-handling system

[![wercker status](https://app.wercker.com/status/dde652a7dfb59a9f59316dfdfb72a225/s/master "wercker status")](https://app.wercker.com/project/byKey/dde652a7dfb59a9f59316dfdfb72a225)

EventProcessor provides a modular & extensible solution for UI event handling.

The default configuration enables you to easily process drag & drop mouse input and multi-touch gestures.

## Install

using [yarn](https://yarnpkg.com/en/)

```shell
yarn add eventprocessor
```

or npm

```shell
npm install --save eventprocessor
```

## Usage

### Example

```ts
import EventProcessor, { EventLike } from "eventprocessor";
import {
  adapters,
  RichEventData,
  PointerState,
  classify,
  preventDefault,
  mapPointers,
  forAction,
  Pointer,
} from "eventprocessor/middleware";

// Create event processor
const processor = new EventProcessor<RichEventData, PointerState>();

const buildPointerAction = (type: string, pointer: Pointer) => ({
  type,
  id: pointer.id,
  device: pointer.context.device,
  clientX: pointer.detail.clientX,
  clientY: pointer.detail.clientY,
});

// Register middleware
processor.use(
  classify(),
  adapters(),
  preventDefault(true),
  mapPointers((pointer) => buildPointerAction("GRAB", pointer), "start"),
  mapPointers((pointer) => buildPointerAction("MOVE", pointer), "move"),
  mapPointers((pointer) => buildPointerAction("DROP", pointer), "end"),
  mapKeys({ keys: ["Control", "+"], mapper: () => ({ type: "ZOOM_IN" }) })
  forAction((action) => {
    console.log(`${action.device} ${action.type}s ${action.id}`);
  }, ["GRAB", "MOVE", "DROP"]),
  forAction((action) => {
    console.log("Enhance!");
  }, "ZOOM_IN"),
);

// Add global event listeners
document.addEventListener("keydown", processor.dispatch);
document.addEventListener("keyup", processor.dispatch);
document.addEventListener("mousemove", processor.dispatch);
document.addEventListener("mouseup", processor.dispatch);
document.addEventListener("touchmove", processor.dispatch);
document.addEventListener("touchend", processor.dispatch);

// Add element event listeners
const listener = (event: EventLike) => processor.dispatch(event, "id");
document.getElementById("elementId")?.addEventListener("mousedown", listener);
document.getElementById("elementId")?.addEventListener("touchstart", listener);

// Dragging `#elementId` around now results in:
// mouse GRABs id
// mouse MOVEs id
// ...
// mouse DROPs id

// Pressing Ctrl + +:
// Enhance!
```

## Development

In the project directory, you can run:

### `yarn format`

Runs automated code formatting on all applicable file types.

### `yarn lint`

Lints all applicable files and prints the output.

### `yarn compile`

Dry-runs the TypeScript compiler. This is especially useful to check whether any types or references broke after a big refactoring.

### `yarn test`

Launches the test runner.

Coverage can be collected using `yarn coverage`.

### `yarn build`

Builds the library for production to the `dist` folder.
