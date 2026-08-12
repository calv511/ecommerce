import { TextDecoder, TextEncoder } from "node:util";

// jsdom omits these Node/web globals, but react-router v7 needs them at import time.
Object.assign(globalThis, { TextEncoder, TextDecoder });

import "@testing-library/jest-dom";
