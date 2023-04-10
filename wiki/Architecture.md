## Layout

This package is designed to mirror the way the regular WHATWG Streams Standard
API is arranged with a `ReadableStream` and `WritableStream` interface being the
two primary classes. These classes do, of course, have supporting interfaces
like the `UnderlyingSyncSource` and friends. There's also the
`BidirectionalSyncStream` that was inspired by the naming of the
`WebTransportBidirectionalStream` class from the Web Transport API.

The codebase is arranged into the following high-level folders:

- **`src/`:** This is where all the magic happens. All the TypeScript source
  code is in this folder. See below for more details about how the file
  structure is arranged.

- **`wiki/`:** This project has adopted the idea of having a developer-specific
  wiki to document conventions, consensus, and other developer-related
  information. In fact, you're reading it right now!

- **`docs/`:** There's a primary `docs/` folder which holds all the user-facing
  documentation and stuff for how to **use** the library itself. There's a
  playground subproject in here too because it is a docs project, not a
  subpackage or some kind of monorepo package.

- **`docs/playground`:** The playground subproject is a special case. Since we
  need the `SharedArrayBuffer` to be available, we need to enable cross origin
  isolation by sending the `Cross-Origin-Embedder-Policy: require-corp` and
  `Cross-Origin-Opener-Policy: same-origin` headers on the HTML page when it's
  loaded. To do this, we **could** use a service worker hack, but instead we've
  chosen to host it on Netlify where we can control the headers that get sent.
  You can't currently control the headers on GitHub Pages.

In the docs component, there's also the `/api/*` routes which are handled by
TypeDoc which generates documentation directly from the main package source
code's TSDoc comments. This is then placed in `docs/dist/api/` to be deployed to
GitHub Pages as a sub-URL route alongside the main MkDocs deployment. The main
MkDocs is there for things that couldn't be included in raw TSDoc comments in
source code. Things like how to enable `SharedArrayBuffer` (which this library
**requires**), more detailed examples of how to serialize and hydrate things on
both sides of the streams, and more general advice that's not tied to a specific
function or class.

### Code patterns

Focusing on the `src/` folder, this project uses the pattern of splitting each
file into its own class, function, interface, type, or other atomic unit of
concern. There are some exceptions to this rule. For instance, the
`ReadableStreamSync` class might `export default` the class itself while also
`export { privateVar }`-ing some `WeakMap` instances.

This trick with the shared `WeakMap`s makes those variables more `protected` and
less `private`. Sort of like Java's package-protected variable scope. This lets
other classes (like the serialization code, the `TransformSyncStream`, etc.) use
private-ish variables. If we used the `#privateVar` syntax, we wouldn't be able
to share these private variables across `class {}` block boundaries.

```js
class A {
  #x = 1;
  #y = 2;
}

function computeSum(a: A): number {
  // SyntaxError: Private field '#x' must be declared in an enclosing class
  return a.#x + a.#y;
}
```

```js
const x = new WeakMap<B, number>();
const y = new WeakMap<B, number>();
class B {
  constructor() {
    x.set(this, 1);
    y.set(this, 2);
  }
}

function computeSum(b: B): number {
  // Works!
  return x.get(b)! + y.get(b)!;
}
```

## How it works

**TL;DR:** We need a `SharedArrayBuffer` so that we can `Atomics.wait()` synchronously
until an incoming byte is ready to recieve. Then, we resume!

To go one level deeper, we use a ring buffer of whatever size the `SharedArrayBuffer`
happens to be (minus a few control signaling bytes) as the incoming queue of bytes
to be read, or the outgoing stream of bytes written.

### Example demo

Imagine we want to transfer the string `"Hello world!"` across a readable stream
to another `Worker` thread synchronously. You can't do it with `.postMessage()`
since that relies on the consumer thread constantly polling the event loop to
see if there's any messages in queue. If you `Atomics.wait()`, you won't get
any messages incoming, so you have to use a `Promise`. That's not synchronous.
Instead, we preemptively pass in the `SharedArrayBuffer` at the start of the
thread execution to use it as a synchronous combo traffic signal and data dump.

Here's what the `SharedArrayBuffer` might look like:

<div align="center">

![](https://i.imgur.com/Ql4ZQWe.png)

![](https://i.imgur.com/PqC5pUm.png)

</div>


