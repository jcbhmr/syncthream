import bufferSourceToView from "./bufferSourceToView.ts";
import bufferSourceToBytes from "./bufferSourceToBytes.ts";
import nextReadIndex from "./nextReadIndex.ts";
import nextWriteIndex from "./nextWriteIndex.ts";

const view = new WeakMap<SyncBufferHandle, DataView>();
class SyncBufferHandle {
  #data: Uint8Array;
  constructor(buffer: BufferSource) {
    if (buffer.byteLength < 16) {
      throw new TypeError(
        "buffer must be at least 16 bytes to hold controller metadata"
      );
    }

    view.set(this, bufferToView(buffer));
    this.#data = new Uint8Array(
      view.get(this)!.buffer,
      view.get(this)!.byteOffset + 10,
      view.get(this)!.byteLength
    );
  }

  read(buffer: BufferSource): number {
    const bytes = bufferToBytes(buffer);

    bytes.set();
  }

  write(buffer: BufferSource): number {}

  close(): void {}
}

export default SyncBufferHandle;
export { view };
