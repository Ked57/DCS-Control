import { BroadcasterPayload } from "./manager_network";

type RegisteredServer = {
  port: number;
};

const registeredServers: RegisteredServer[] = [];

export const shouldCreateANewDCSModule = (payload: BroadcasterPayload) => {
  return registeredServers.every(
    registeredServer => !(registeredServer.port === payload.port)
  );
};

export const registerDCSModule = (port: number) => {
  registeredServers.push({ port });
};
