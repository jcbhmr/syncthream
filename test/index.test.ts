import { test, assert, expect } from "vitest";

test("all exports exist", async () => {
  const {
    ReadableBufferStream,
    WritableBufferStream,
    BididrectionalBufferStream,
    ReadableSyncBufferHandle,
    WritableSyncBufferHandle,
  } = await import("../src/index.ts");

  assert(ReadableBufferStream);
  assert(WritableBufferStream);
  assert(BididrectionalBufferStream);
  assert(ReadableSyncBufferHandle);
  assert(WritableSyncBufferHandle);
});
