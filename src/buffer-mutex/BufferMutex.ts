/**
 * ```cpp
 * struct view {
 *   int32_t counter;
 * }
 * ```
 */
class BufferMutex implements ArrayBufferView {
  #ownLock = false;
  #signal: Int32Array;
  constructor(
    buffer: ArrayBuffer | SharedArrayBuffer,
    byteOffset: number = 0,
    length: number | undefined = undefined
  ) {
    this.#signal = new Int32Array(
      buffer,
      byteOffset,
      length ?? buffer.byteLength / 4
    );
  }

  get buffer(): ArrayBuffer | SharedArrayBuffer {
    return this.#signal.buffer;
  }

  get byteOffset(): number {
    return this.#signal.byteOffset;
  }

  get byteLength(): number {
    return this.#signal.byteLength;
  }

  get locked(): boolean {
    return !!this.#signal[0];
  }

  getLockSync(): void {
    if (this.#ownLock) {
      throw new DOMException(
        "Already locked by this! You would be waiting forever!"
      );
    }

    while (true) {
      // Attempt to atomically compare and exchange the value in the buffer
      // from 0 to 1, and store the previous value in prevValue
      const prevValue = Atomics.compareExchange(this.#signal, 0, 0, 1);
      // The `Atomics.compareExchange()` function is used to atomically compare the value in the buffer
      // with the expected value (0) and exchange it with the new value (1) if the expected value matches
      // the current value in the buffer. This operation is performed in a single atomic step, ensuring
      // that it cannot be interrupted by other threads, thus providing thread-safe synchronization.
      // This function is chosen because it allows us to atomically acquire the lock by setting the value
      // in the buffer from 0 to 1 if it is currently 0, effectively acquiring the lock in a thread-safe manner.

      if (prevValue === 0) {
        // If the previous value was 0, it means the mutex was unlocked and we
        // have successfully acquired the lock
        this.#ownLock = true;
        break;
      } else {
        // If the previous value was not 0, it means the mutex was locked by
        // another thread. We use Atomics.wait() to wait for the mutex to be
        // released and then try again.
        Atomics.wait(this.int32Array, 0, prevValue);
        // The `Atomics.wait()` function is used to block the current thread until a certain condition is met.
        // In this case, it is used to wait for the mutex to be released by another thread, as indicated by the
        // value in the buffer being set back to 0. This function is chosen because it allows us to wait in a
        // thread-safe manner without using busy-waiting or spinning, which can be resource-intensive and less
        // efficient. It also allows the thread to be woken up by a `Atomics.notify()` call from another thread,
        // ensuring that the waiting thread can resume execution as soon as the mutex is released, reducing
        // unnecessary delays and improving overall performance.
      }
    }

    return {
      #done: false,
      releaseLockSync(): void {
        if (!this.locked) {
          throw new DOMException("This is not locked!");
        }
        if (!this.#ownLock) {
          throw new DOMException("This does not own the lock!");
        }

        // Release the lock by setting the value in the buffer back to 0 using `Atomics.store()`
        // This operation is performed atomically, ensuring thread-safe synchronization
        Atomics.store(this.int32Array, 0, 0);
        // The `Atomics.store()` function is used to atomically set the value in the buffer to 0,
        // effectively releasing the lock by resetting the mutex state. This operation is performed
        // atomically, ensuring thread-safe synchronization, and reverses the operation performed in
        // the `lock()` function where the mutex state was set to 1 to acquire the lock.

        // Notify any waiting threads that the lock has been released using `Atomics.notify()`
        // The second parameter (0) specifies the index in the buffer to apply the notification
        // The third parameter (1) specifies the number of threads to notify
        // This operation is performed atomically, ensuring thread-safe synchronization
        Atomics.notify(this.int32Array, 0, 1);
        // The `Atomics.notify()` function is used to notify waiting threads that the lock has been
        // released and they can resume execution. It takes two parameters: the buffer and index at
        // which the notification should be applied, and the number of threads to notify. In this case,
        // we specify the buffer and index as 0, which corresponds to the buffer used for the mutex state,
        // and the number of threads to notify as 1, indicating that one thread waiting on the mutex
        // should be notified. This operation is performed atomically, ensuring thread-safe synchronization.
      }
    }
  }


}

export default BufferMutex;
