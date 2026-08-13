import { TextDecoder, TextEncoder } from "node:util";

// jsdom omits these Node/web globals, but react-router v7 needs them at import time.
Object.assign(globalThis, { TextEncoder, TextDecoder });

// jsdom implements no SVG layout, so `getBBox` is missing entirely. The star
// rating in ProductCard measures itself with it and throws without this.
if (typeof SVGElement !== "undefined" && !("getBBox" in SVGElement.prototype)) {
  Object.defineProperty(SVGElement.prototype, "getBBox", {
    writable: true,
    value: () => ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON: () => ({}),
    }),
  });
}

import "@testing-library/jest-dom";
