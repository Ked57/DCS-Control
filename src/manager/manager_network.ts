import dgram from "dgram";

const port = 15488;
const host = "127.0.0.1";

export type BroadcasterPayload = {
  port: number;
};

export const isBroadcasterPayload = (
  payload: any
): payload is BroadcasterPayload => typeof payload.port === "number";

export const initBroadcastListener = (onData: (data: Buffer) => void) => {
  const socket = dgram.createSocket("udp4");
  socket.on("listening", () => {
    console.log("Broadcast listener is up");
  });

  socket.on("message", onData);

  socket.on("error", err => {
    console.error("Broadcast listener error: ", err.stack);
    socket.close();
  });

  socket.bind(port, host);
};
