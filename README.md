# Synchronous streams

🌊 Synchronous version of `ReadableStream`, `WritableStream`, `TransformStream`, and
`BidirectionalStream`

<div align="center">

![]()

</div>

⏱ Completely synchronous `.read()` \
⚛️ Perfect for WebAssembly operations \
💽 Serializes objects across thread boundaries

## Installation

![npm](https://img.shields.io/static/v1?style=for-the-badge&message=npm&color=CB3837&logo=npm&logoColor=FFFFFF&label=)
![jsDelivr](https://img.shields.io/static/v1?style=for-the-badge&message=jsDelivr&color=E84D3D&logo=jsDelivr&logoColor=FFFFFF&label=)

## Usage

![Google Chrome](https://img.shields.io/static/v1?style=for-the-badge&message=Google+Chrome&color=4285F4&logo=Google+Chrome&logoColor=FFFFFF&label=)
![Node.js](https://img.shields.io/static/v1?style=for-the-badge&message=Node.js&color=339933&logo=Node.js&logoColor=FFFFFF&label=)

This package can be used in the browser or in a Node.js environment. It doesn't come reliant on a `Worker` implementation, so you're free to use Node.js' native `node:worker_threads` instead. Just make sure that you have cross origin isolation turned on in your browser! You'll need to set the `Cross-Origin-Embedder-Policy: require-corp` and the `Cross-Origin-Opener-Policy: same-origin` headers to make `SharedArrayBuffer` available. This is needed so that two separate threads can share memory and use `Atomics.wait()` to 

```js
import { ReadableSyncStream } from "@jcbhmr/streams-sync";

let controller;
const stream = new ReadableStreamSync({ start: (c) => (controller = c) });
controller.enqueue("Hello world!");
setTimeout(() => controller.enqueue("Goodbye!"), 1000);

const worker = new Worker("worker.js");
worker.postMessage(stream.buffer);
```

```js
import { ReadableSyncStream } from "@jcbhmr/streams-sync";

const buffer = await new Promise((resolve) => {
  globalThis.addEventListener("message", e => resolve(event.data.buffer), { once: true });
});

const stream = ReadableSyncStream.from(buffer);
const reader = stream.getReader();

setTimeout(() => console.log("10ms passed!"), 10)
for (let { value, done } = reader.read(); !done; ({ value, done } = reader.read())) {
  console.log(value);
}

reader.releaseLock();
```

```js
import { ReadableSyncStream } from "@jcbhmr/streams-sync";

const stream = new ReadableStreamSync({
  async pull(c) {
    const response = await fetch("https://example.org/");
    const text = await response.text();
    c.enqueue(text);
  }
});

const worker = new Worker("worker.js");
worker.postMessage({ type: "now", sharedBuffer: stream.sharedBuffer });
```

```js
// worker.js
import { ReadableSyncStream } from "@jcbhmr/streams-sync";

const sharedBuffer = new Promise((resolve) => {
  globalThis.addEventListener("message", function f(event) {
    if (event.data?.type === "now") {
      resolve(event.data.sharedBuffer);
      globalThis.removeEventListener("message", f);
    }
  });
});

const stream = ReadableSyncStream.from(sharedBuffer);
const reader = stream.getReader();
const text = reader.read();
reader.releaseLock();
console.log(text);
```

---

```js
// main.js
import { BidirectionalSyncStream } from "@jcbhmr/streams-sync";

const stream = new ReadableStreamSync({
  async pull(c) {
    const response = await fetch("https://example.org/");
    const text = await response.text();
    c.enqueue(text);
  }
});

const worker = new Worker("worker.js");
worker.postMessage({ type: "now", sharedBuffer: stream.sharedBuffer });
```
