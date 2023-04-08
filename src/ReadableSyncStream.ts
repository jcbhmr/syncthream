const buffer = new WeakMap<ReadableSyncStream, SharedArrayBuffer>();
const meta = new WeakMap<ReadableSyncStream, Int32Array>();

const controller = new WeakMap<
  ReadableSyncStream,
  ReadableSyncStreamDefaultController | ReadableSyncByteStreamController
>();
const disturbed = new WeakMap<ReadableSyncStream, boolean>();
const reader = new WeakMap<
  ReadableSyncStream,
  ReadableSyncStreamDefaultReader | ReadableSyncStreamBYOBReader | undefined
>();
const state = new WeakMap<
  ReadableSyncStream,
  "readable" | "closed" | "errored"
>();
const storedError = new WeakMap<ReadableSyncStream, any>();

class ReadableSyncStream<R = any> {
  static from(buffer: SharedArrayBuffer) {
    if (typeof SharedArrayBuffer === "undefined") {
      throw new ReferenceError("SharedArrayBuffer is not defined");
    }

    if (!(buffer instanceof SharedArrayBuffer)) {
      throw new TypeError();
    }

    await sharedBuffer; // Wait for the shared buffer to be ready
    const readableSyncStream = new ReadableSyncStream({ start: () => {} });
    readableSyncStream.sharedBuffer = await sharedBuffer;
    return readableSyncStream;
  }

  constructor({ start }) {
    // TODO: Add better QoL message
    if (typeof SharedArrayBuffer === "undefined") {
      throw new ReferenceError("SharedArrayBuffer is not defined");
    }

    buffer.set(
      this,
      new SharedArrayBuffer(4 * Int32Array.BYTES_PER_ELEMENT, {
        maxByteLength: 64 * 1024,
      })
    );
    meta.set(this, new Int32Array(buffer.get(this), 0, 4));
    controller.set(this, {
      enqueue(chunk) {},
    });
  }

  getReader() {
    return {
      read() {
        // Wait until meta[0] (bytes in read queue) is not zero
        // while(meta[0] === 0) {}
        while (Atomics.wait(meta.get(this), 0, 0) === "ok") {}

        return 
      },
    };
  }
}

export default ReadableSyncStream;
