import { initDCSModule } from "./dcs/main";
import express from "express";
import {
  initBroadcastListener,
  isBroadcasterPayload
} from "./manager/manager_network";
import {
  shouldCreateANewDCSModule,
  registerDCSModule
} from "./manager/manager";
import { tooglePause } from "./dcs/game/game_functions";

const app = express();

app.get("/toogle-pause", (req, res) => {
  tooglePause(() => res.sendStatus(200));
});

app.listen(3000, () =>
  console.log(
    "DCS-Control server started successfuly and listening to port 3000"
  )
);

initBroadcastListener(async (data: Buffer) => {
  const payload = JSON.parse(data.toString());
  console.log(payload);
  if (!isBroadcasterPayload(payload)) {
    console.error("Received a wrong broadcast payload");
    return;
  }
  console.log("port is ", payload.port);
  if (shouldCreateANewDCSModule(payload)) {
    registerDCSModule(await initDCSModule(payload.port));
  }
});
