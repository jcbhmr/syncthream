```js
// service-worker.js
globalThis.addEventListener("install", (event) => {
  skipWaiting();
});

globalThis.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const response = await fetch(request);
      response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
      response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
      return response;
    })());
  }
});
```

```js
if (!navigator.serviceWorker.controller) {
  document.body.innerHTML = `<p>Loading service worker!</p>`;
  await navigator.serviceWorker.register("service-worker.js", { type: "module" });
  location.reload();
}

await navigator.serviceWorker.ready;

// Works! 😊
const buffer = new SharedArrayBuffer(64);
```

## Using Vite with Vite PWA

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(
    import.meta.env.PROD ? '/service-worker.js' : '/dev-sw.js?dev-sw',
    { type: import.meta.env.PROD ? 'classic' : 'module' }
  )
}
```

```ts
import { defineConfig } from "vite";
import pwa from "vite-plugin-pwa";

const config = defineConfig({
  root: "src",
  build: {
    distDir: "../dist",
  },
  plugins: [
    pwa({
      srcDir: "src",
      filename: "service-worker.js",
      strategies: "injectManifest",
      injectRegister: false,
      manifest: false,
      injectManifest: {
        injectionPoint: null,
      },
    })
  ]
})
```
