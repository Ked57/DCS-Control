import { send } from "../main";
import Callback from "../dispatcher/types/callback";

const tooglePause = (callback: Callback) => {
  send(
    {
      name: "tooglePause",
      args: {}
    },
    callback,
    "function"
  );
};

export { tooglePause };
