function bufferSourceToBytes(buffer: BufferSource): Uint8Array {
  if (buffer instanceof Uint8Array) {
    return buffer;
  } else if (ArrayBuffer.isView(buffer)) {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else if (
    buffer instanceof ArrayBuffer ||
    (typeof SharedArrayBuffer !== "undefined" &&
      buffer instanceof SharedArrayBuffer)
  ) {
    return new Uint8Array(buffer);
  } else {
    throw new TypeError("buffer is not a BufferSource");
  }
}

export default bufferSourceToBytes;
