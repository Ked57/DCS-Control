import InputPayload from "../network/types/input_payload";

const queue: InputPayload[] = [];

const enQueue = (payload: InputPayload) => {
  queue.push(payload);
};

const deQueue = (): InputPayload | undefined => {
  const payload = queue.shift();
  return payload;
};

const initQueue = (func: (payload: InputPayload) => void) => {
  setInterval(() => processQueue().map(func), 1000);
};

const processQueue = (): InputPayload[] => {
  if (queue.length <= 0) {
    return [];
  }
  try {
    const payload = deQueue();
    if (!payload) {
      return [];
    }
    return [...[payload], ...processQueue()];
  } catch (err) {
    console.error(err);
    return [];
  }
};

const getQueue = () => queue;

export { initQueue, processQueue, getQueue, enQueue, deQueue };
