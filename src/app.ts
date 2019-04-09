import { initDCSModule, send } from "./dcs/main";
import express from "express";

const app = express();
app.listen(3000, () =>
  console.log(
    "DCS-Control server started successfuly and listening to port 3000"
  )
);

initDCSModule();
setInterval(
  () => send({}, () => console.log("server isn't dead yet"), "noTimeout"),
  5000
);
