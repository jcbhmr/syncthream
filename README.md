# sync-streams

```js
// main.js
import { ReadableSyncStream } from "@jcbhmr/streams-sync";

let controller;
const stream = new ReadableStreamSync({ start: (c) => controller = c });
controller.enqueue("Hello world!");

const worker = new Worker("worker.js");
worker.postMessage({ type: "readme", sharedBuffer: stream.sharedBuffer });

setTimeout(() => controller.enqueue("Goodbye!"), 1000);
```

```js
// worker.js
import { ReadableSyncStream } from "@jcbhmr/streams-sync";

const sharedBuffer = new Promise((resolve) => {
  globalThis.addEventListener("message", function f(event) {
    if (event.data?.type === "readme") {
      resolve(event.data.sharedBuffer);
      globalThis.removeEventListener("message", f);
    }
  });
});

setTimeout(() => console.log("10ms passed!"), 10)

const stream = ReadableSyncStream.from(sharedBuffer);
const reader = stream.getReader();
while (true) {
  const { value, done } = reader.read();
  if (done) {
    break;
  }
  console.log(value);
}
reader.releaseLock();
```
