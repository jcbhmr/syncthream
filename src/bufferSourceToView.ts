function bufferSourceToView(buffer: BufferSource): DataView {
  if (buffer instanceof DataView) {
    return buffer;
  } else if (ArrayBuffer.isView(buffer)) {
    return new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else if (
    buffer instanceof ArrayBuffer ||
    (typeof SharedArrayBuffer !== "undefined" &&
      buffer instanceof SharedArrayBuffer)
  ) {
    return new DataView(buffer);
  } else {
    throw new TypeError("buffer is not a BufferSource");
  }
}

export default bufferSourceToView;
