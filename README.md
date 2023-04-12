# Buffer streams toolkit

🌊 Low-level idiomatic utilities for sync/async cross-thread streaming

<table align="center"><td>

```js
// main.js
import { WritableBufferStream } from "@jcbhmr/buffer-streams";

const response = await fetch("https://example.org/");

const writable = new WritableBufferStream(100);
response.body.pipeTo(writable);

const worker = new Worker("worker.js");
worker.postMessage(writable.buffer);
```

<td>

```js
// worker.js
const syncStream = new ReadableBufferSyncStream(buffer);
const decoder = new TextDecoder();
let string = "";
for (const chunk of syncStream) {
  string += decoder.decode(chunk, { stream: true });
}
string += decoder.decode();

console.log(string);
```

</table>

⚛️ Perfect for WebAssembly operations \
🔟 Only works with raw buffers & bytes \
💽 Works great with [BSON]

## Installation

![npm](https://img.shields.io/static/v1?style=for-the-badge&message=npm&color=CB3837&logo=npm&logoColor=FFFFFF&label=)
![jsDelivr](https://img.shields.io/static/v1?style=for-the-badge&message=jsDelivr&color=E84D3D&logo=jsDelivr&logoColor=FFFFFF&label=)

You can install this package locally using npm, or import it directly from an
npm CDN like [ESM>CDN] or [jsDelivr].

```sh
npm install @jcbhmr/sab-streams
```

```js
import {} from "https://esm.sh/@jcbhmr/sab-streams";
```

If you're in the browser, you'll need to make sure your site (or even just the
page that you want to use it on) is [cross-origin isolated]. You can do this by
setting the `Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp` headers. If you're stuck on a
hosting platform and you can't edit server-side headers (like GitHub Pages), you
can [use a service worker to add headers].

## Usage

![Google Chrome](https://img.shields.io/static/v1?style=for-the-badge&message=Google+Chrome&color=4285F4&logo=Google+Chrome&logoColor=FFFFFF&label=)
![Node.js](https://img.shields.io/static/v1?style=for-the-badge&message=Node.js&color=339933&logo=Node.js&logoColor=FFFFFF&label=)

```js
// worker.js
import { ReadableSyncBufferHandle } from "@jcbhmr/buffer-streams";
import { pEvent } from "p-event";

const { data: buffer } = await pEvent(globalThis, "message");
const handle = new ReadableSyncBufferHandle(buffer);

const buffer = new ArrayBuffer(16);
let readByteLength = 0;
const decoder = new TextDecoder();
let string = "";
while ((readByteLength = handle.read(buffer))) {
  const chunk = new Uint8Array(buffer, 0, readByteLength);
  string += decoder.decode(chunk, { stream: true });
}
string += decoder.decode();
```

<!-- prettier-ignore-start -->
[cross-origin isolated]: https://web.dev/cross-origin-isolation-guide/
[use a service worker to add headers]: https://dev.to/stefnotch/enabling-coop-coep-without-touching-the-server-2d3n
[bson]: https://bsonspec.org/
<!-- prettier-ignore-end -->
