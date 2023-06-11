#!/usr/bin/env node
import SlackKingOfTime from "./";

const ARGS = ["--no-sandbox"];

(async () => {
  const slackKOT = new SlackKingOfTime({ args: ARGS });
  await slackKOT.start();
})();
