/**
 * The ReadableStream() constructor accepts as its first argument a JavaScript object representing the underlying source. Such objects can contain any of the following properties:
 *
 * The type of the controller argument passed to the start() and pull() methods depends on the value of the type option. If type is set to undefined (including via omission), then controller will be a ReadableStreamDefaultController. If it’s set to "bytes", then controller will be a ReadableByteStreamController.
 */
interface UnderlyingSyncSource {
  /**
   *start(controller), of type UnderlyingSourceStartCallback

A function that is called immediately during creation of the ReadableStream.

Typically this is used to adapt a push source by setting up relevant event listeners, as in the example of § 10.1 A readable stream with an underlying push source (no backpressure support), or to acquire access to a pull source, as in § 10.4 A readable stream with an underlying pull source.

If this setup process is asynchronous, it can return a promise to signal success or failure; a rejected promise will error the stream. Any thrown exceptions will be re-thrown by the ReadableStream() constructor.
   */
  start: UnderlyingSyncSourceStartCallback;

  /**
   * pull(controller), of type UnderlyingSourcePullCallback

A function that is called whenever the stream’s internal queue of chunks becomes not full, i.e. whenever the queue’s desired size becomes positive. Generally, it will be called repeatedly until the queue reaches its high water mark (i.e. until the desired size becomes non-positive).

For push sources, this can be used to resume a paused flow, as in § 10.2 A readable stream with an underlying push source and backpressure support. For pull sources, it is used to acquire new chunks to enqueue into the stream, as in § 10.4 A readable stream with an underlying pull source.

This function will not be called until start() successfully completes. Additionally, it will only be called repeatedly if it enqueues at least one chunk or fulfills a BYOB request; a no-op pull() implementation will not be continually called.

If the function returns a promise, then it will not be called again until that promise fulfills. (If the promise rejects, the stream will become errored.) This is mainly used in the case of pull sources, where the promise returned represents the process of acquiring a new chunk. Throwing an exception is treated the same as returning a rejected promise.
   */
  pull: UnderlyingSyncSourcePullCallback;

  /**
   * cancel(reason), of type UnderlyingSourceCancelCallback
A function that is called whenever the consumer cancels the stream, via stream.cancel() or reader.cancel(). It takes as its argument the same value as was passed to those methods by the consumer.

Readable streams can additionally be canceled under certain conditions during piping; see the definition of the pipeTo() method for more details.

For all streams, this is generally used to release access to the underlying resource; see for example § 10.1 A readable stream with an underlying push source (no backpressure support).

If the shutdown process is asynchronous, it can return a promise to signal success or failure; the result will be communicated via the return value of the cancel() method that was called. Throwing an exception is treated the same as returning a rejected promise.

Note: Even if the cancelation process fails, the stream will still close; it will not be put into an errored state. This is because a failure in the cancelation process doesn’t matter to the consumer’s view of the stream, once they’ve expressed disinterest in it by canceling. The failure is only communicated to the immediate caller of the corresponding method.

This is different from the behavior of the close and abort options of a WritableStream's underlying sink, which upon failure put the corresponding WritableStream into an errored state. Those correspond to specific actions the producer is requesting and, if those actions fail, they indicate something more persistently wrong.
   */
  cancel: UnderlyingSyncSourceCancelCallback;

  /**
   * type (byte streams only), of type ReadableStreamType

Can be set to "bytes" to signal that the constructed ReadableStream is a readable byte stream. This ensures that the resulting ReadableStream will successfully be able to vend BYOB readers via its getReader() method. It also affects the controller argument passed to the start() and pull() methods; see below.

For an example of how to set up a readable byte stream, including using the different controller interface, see § 10.3 A readable byte stream with an underlying push source (no backpressure support).

Setting any value other than "bytes" or undefined will cause the ReadableStream() constructor to throw an exception.
   */
  type: ReadableSyncStreamType;
}

const UnderlyingSyncSource = {
  from(o: unknown) {
    return o;
  },
};

export default UnderlyingSyncSource;
