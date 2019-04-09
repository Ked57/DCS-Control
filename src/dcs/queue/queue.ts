import InputPayload from "../network/types/input_payload";
import { networkSend } from "../network/network_manager";

const queue: InputPayload[] = [];

const enQueue = (payload: InputPayload) => {
  queue.push(payload);
};

const deQueue = (): InputPayload | undefined => {
  const payload = queue.shift();
  return payload;
};

const initQueue = (func: (payload: InputPayload) => void) => {
  setInterval(() => processQueue(func).map(networkSend), 1000);
};

const processQueue = (
  func: (payload: InputPayload) => void
): InputPayload[] => {
  if (queue.length <= 0) {
    return [];
  }
  try {
    const payload = deQueue();
    if (!payload) {
      return [];
    }
    func(queue[0]);
    return [...[payload], ...processQueue(func)];
  } catch (err) {
    console.error(err);
    return [];
  }
};

const getQueue = () => queue;

export { initQueue, processQueue, getQueue, enQueue, deQueue };
