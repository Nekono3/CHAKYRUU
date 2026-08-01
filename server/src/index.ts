import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { env } from "./lib/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Chakyruu API listening on port ${env.port} (${env.nodeEnv})`);
});
