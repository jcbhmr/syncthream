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

/**
 * A readable stream represents a source of data, from which you can read. In other words, data comes out of a readable stream. Concretely, a readable stream is an instance of the ReadableStream class.

Although a readable stream can be created with arbitrary behavior, most readable streams wrap a lower-level I/O source, called the underlying source. There are two types of underlying source: push sources and pull sources.

Push sources push data at you, whether or not you are listening for it. They may also provide a mechanism for pausing and resuming the flow of data. An example push source is a TCP socket, where data is constantly being pushed from the OS level, at a rate that can be controlled by changing the TCP window size.

Pull sources require you to request data from them. The data may be available synchronously, e.g. if it is held by the operating system’s in-memory buffers, or asynchronously, e.g. if it has to be read from disk. An example pull source is a file handle, where you seek to specific locations and read specific amounts.

Readable streams are designed to wrap both types of sources behind a single, unified interface. For web developer–created streams, the implementation details of a source are provided by an object with certain methods and properties that is passed to the ReadableStream() constructor.

Chunks are enqueued into the stream by the stream’s underlying source. They can then be read one at a time via the stream’s public interface, in particular by using a readable stream reader acquired using the stream’s getReader() method.

Code that reads from a readable stream using its public interface is known as a consumer.

Consumers also have the ability to cancel a readable stream, using its cancel() method. This indicates that the consumer has lost interest in the stream, and will immediately close the stream, throw away any queued chunks, and execute any cancellation mechanism of the underlying source.

Consumers can also tee a readable stream using its tee() method. This will lock the stream, making it no longer directly usable; however, it will create two new streams, called branches, which can be consumed independently.

For streams representing bytes, an extended version of the readable stream is provided to handle bytes efficiently, in particular by minimizing copies. The underlying source for such a readable stream is called an underlying byte source. A readable stream whose underlying source is an underlying byte source is sometimes called a readable byte stream. Consumers of a readable byte stream can acquire a BYOB reader using the stream’s getReader() method.
 */
class ReadableSyncStream<R = any> {
  #buffer: SharedArrayBuffer;
  #meta: Int32Array;
  #controller: ReadableSyncstreamDefaultController;
  constructor(
    underlyingSource: UnderlyingSyncByteSource,
    strategy?: { highWaterMarkBytes?: number }
  ): ReadableSyncStream<Uint8Array>;
  constructor<R = any>(
    underlyingSource: UnderlyingSyncDefaultSource<R>,
    strategy?: BufferQueuingStrategy<R>
  ): ReadableStream<R>;
  constructor<R = any>(
    underlyingSource?: UnderlyingSyncSource<R>,
    strategy?: BufferQueuingStrategy<R>
  ): ReadableStream<R>;
  constructor(
    underlyingSource: UnderlyingSyncSource<R> | null | undefined = undefined,
    strategy: BufferQueuingStrategy<R> = {}
  ) {
    // TODO: Add better QoL message
    if (typeof SharedArrayBuffer === "undefined") {
      throw new ReferenceError("SharedArrayBuffer is not defined");
    }

    if (!underlyingSource) {
      underlyingSource = null;
    }

    const underlyingSourceDict = underlyingSource;

    InitializeReadableSyncStream(this);

    if (underlyingSourceDict["type"] === "bytes") {
      if (strategy["size"] != null) {
        throw new RangeError();
      }

      const highWaterMarkBytes = ExtractHighWaterMarkBytes(strategy, 0);

      SetUpReadableSyncByteStreamControllerFromUnderlyingSource(
        this,
        underlyingSource,
        underlyingSourceDict,
        highWaterMarkBytes
      );
    }
    //
    else {
      console.assert(underlyingSourceDict["type"] == null);

      const sizeAlgorithm = ExtractSizeAlgorithm(strategy);

      const highWaterMarkBytes = ExtractHighWaterMarkBytes(strategy, 1);

      SetUpReadableSyncStreamDefaultControllerFromUnderlyingSyncSource(
        this,
        underlyingSource,
        underlyingSourceDict,
        highWaterMarkBytes,
        sizeAlgorithm
      );
    }
  }

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

  write(data) {
    if (!this.readable) {
      throw new Error("Stream is not readable");
    }

    const dataArray = new Uint8Array(this.sharedBuffer);
    const dataLength = data.length;

    if (this.readPosition + dataLength > this.sharedBuffer.byteLength) {
      throw new Error("Buffer overflow");
    }

    for (let i = 0; i < dataLength; i++) {
      dataArray[this.readPosition + i] = data[i];
    }

    this.readPosition += dataLength;
    this.bytesWritten += dataLength;
    this.controller.enqueue(data);
  }

  read(length) {
    const dataArray = new Uint8Array(this.sharedBuffer);
    const endPosition = Math.min(this.readPosition + length, this.bytesWritten);
    const result = new Uint8Array(
      dataArray.subarray(this.readPosition, endPosition)
    );
    this.readPosition = endPosition;
    return result;
  }

  cancel() {
    this.readable = false;
    this.bytesWritten = 0;
    this.readPosition = 0;
  }

  wait(timeout) {
    if (!this.readable) {
      return false;
    }

    const waitResult = Atomics.wait(
      new Int32Array(this.sharedBuffer),
      0,
      0,
      timeout
    );
    return waitResult === "ok";
  }
}

export default ReadableSyncStream;
