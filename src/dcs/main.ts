import { validatePayload, dataFromDcsJsonToObject } from "./payload_validator";
import { connect, networkSend } from "./network/network_manager";
import {
  addDispatch,
  verifiyInputDispatch,
  getDispatch,
  removeDispatch
} from "./dispatcher/dispatcher";
import Dispatch from "./dispatcher/types/dispatch";
import Callback from "./dispatcher/types/callback";
import InputPayload from "./network/types/input_payload";
import Function from "./game/types/callback/function";
import NoTimeout from "./game/types/callback/no_timeout";
import { enQueue, initQueue } from "./queue/queue";

const initDCSModule = async (port: number): Promise<number> => {
  initQueue(networkSend);
  setInterval(
    () => send({}, () => console.log("server isn't dead yet"), "noTimeout"),
    5000
  );
  return connect(
    port,
    "localhost",
    (data: any) => {
      try {
        receive(dataFromDcsJsonToObject(data.toString()));
      } catch (err) {
        console.error(err);
      }
    }
  );
};

const formPaylaod = (dispatch: Dispatch, type: string) => {
  return {
    type,
    callbackId: dispatch.callbackId,
    data: dispatch.data
  } as InputPayload;
};

const send = async (
  data: { [key: string]: any },
  callback: Callback,
  type: string
) => {
  const dispatch: Dispatch = {
    data: data,
    callback: callback,
    callbackId: ""
  };

  try {
    enQueue(
      formPaylaod(await addDispatch(await verifiyInputDispatch(dispatch)), type)
    );
  } catch (err) {
    console.error(err);
  }
};

const receive = async (data: { [key: string]: any }) => {
  try {
    console.log("received", data);
    await handlePayload(await validatePayload(data));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const payloadIsFunction = (payload: any): payload is Function =>
  payload.type === "function";
const payloadIsNoTimeout = (payload: any): payload is NoTimeout =>
  payload.type === "noTimeout";

const handlePayload = async (payload: Function | NoTimeout) => {
  try {
    if (payloadIsFunction(payload)) {
      const dispatch = await getDispatch(payload);
      removeDispatch(dispatch);
      return dispatch.callback(payload.data);
    } else if (payloadIsNoTimeout(payload)) {
      return;
    } else {
      throw Error("Couldnt dispatch the received payload");
    }
  } catch (err) {
    throw Error(err);
  }
};

export { initDCSModule, send, receive };
