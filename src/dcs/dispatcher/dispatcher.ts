import Dispatch from "./types/dispatch";
import ToBeDispatched from "./types/to_be_dispatched";
import Function from "../game/types/callback/function";
import uuid from "uuid/v1";

const dispatchList: Map<String, Dispatch> = new Map();

const verifiyInputDispatch = (dispatch: Dispatch): Dispatch => {
  if (
    dispatch &&
    dispatch.data &&
    dispatch.callback &&
    typeof dispatch.callback === "function"
  ) {
    return dispatch;
  } else throw Error("Invalid input dispatch properties");
};

const verifyDispatchPayload = (
  dispatch: ToBeDispatched
): Function | undefined => {
  if (dispatch && dispatch.data && dispatch.callbackId && dispatch.type) {
    if (dispatch.type === "function") {
      const func: Function = {
        data: dispatch.data,
        type: dispatch.type,
        callbackId: dispatch.type
      };
      return func;
    }
  } else {
    throw Error("Invalid payload dispatch properties");
  }
};

const getDispatch = (func: Function): Dispatch => {
  const dispatch = dispatchList.get(func.callbackId);
  if (dispatch) {
    func.callback = dispatch.callback;
    return dispatch;
  } else {
    throw Error("Couldn't find callback, aborting");
  }
};

const addDispatch = (dispatch: Dispatch): Dispatch => {
  if (!dispatch)
    throw Error("Couldn't add dispatch probably because it's  invalid");
  const callbackId = uuid();
  dispatch.callbackId = callbackId;
  dispatchList.set(dispatch.callbackId, dispatch);
  return dispatch;
};

const removeDispatch = (dispatchObject: Dispatch) => {
  const result = dispatchList.delete(dispatchObject.callbackId);
  if (!result) {
    console.log(`Couldnt find any entry for id ${dispatchObject.callbackId}`);
  }
};

const displayDispatchList = () => {
  console.log(dispatchList);
};

export {
  verifiyInputDispatch,
  verifyDispatchPayload,
  getDispatch,
  addDispatch,
  removeDispatch,
  displayDispatchList
};
