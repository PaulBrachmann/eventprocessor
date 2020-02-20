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

```javascript
import DragHandler from "eventprocessor/presets/draghandler";

// Create event handler
const dragHandler = new DragHandler();

// Add event listener(s) to handler
dragHandler.on(["start", "move", "end"], (event) => {
  const { detail } = event;

  console.log(
    detail.id, // Object id
    detail.offset.translateX, // X movement
    detail.offset.translateY, // Y movement
    detail.offset.scale, // Scale factor
    detail.context, // Context object (assign properties as you please)
  );
});

// Listen to events
document.body.addEventListener("mousemove", dragHandler.dispatch);
document.body.addEventListener("mouseup", dragHandler.dispatch);
document.body.addEventListener("touchmove", dragHandler.dispatch);
document.body.addEventListener("touchend", dragHandler.dispatch);

const listener = (event) => dragHandler.dispatch(event, "id");
document.getElementById("elementId").addEventListener("mousedown", listener);
document.getElementById("elementId").addEventListener("touchstart", listener);
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
