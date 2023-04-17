import { test, expect, assert } from "vitest";
import { dedent } from "ts-dedent";
import WritableBufferStream from "../src/WritableBufferStream.ts";

if (typeof Worker === "undefined") {
  const { default: Worker } = await import("web-worker");
  globalThis.Worker = Worker;
}

function js(strings: TemplateStringsArray, ...inserts: any[]): string {
  console.assert(inserts.length === 0);
  const string = dedent(String.raw({ raw: strings }, ...inserts));
  const blob = new Blob([string], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  return url;
}

assert(typeof SharedArrayBuffer !== "undefined");

test("works", () => {
  const response = await fetch("https://example.org/");
  const writable = new WritableBufferStream(100);
  const { buffer } = writable;
  response.body!.pipeTo(writable).catch(() => {});
  await new Promise((r) => setTimeout(r, 1000));

  // Now we should have a completely full buffer.
  // bytes[0-4 uint32_t] is the writableIndex (index of next byte to WRITE)
  // bytes[5-8 uint32_t] is the readableIndex (index of next byte to READ)
  assert(new Uint32Array(buffer)[0] === 0);
  assert(new Uint32Array(buffer)[1] === 0);

  await response.body!.cancel();
});
