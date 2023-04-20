import BufferMutex from "./BufferMutex.ts";

const bufferMutex = new WeakMap<BufferMutexHandle, BufferMutex>();
class BufferMutexHandle {
  get locked() {
    return bufferMutex.get(this)!.locked;
  }

  async releaseLock(): Promise<void> {
    await unlock(bufferMutex.get(this)!);
  }

  releaseLockSync(): void {
    unlockSync(bufferMutex.get(this)!);
  }
}

export default BufferMutexHandle;
