import logger from "./logger";
import { readFileSync } from "fs";
import { z } from "zod";

const User = z.object({
  slackUser: z.string(),
  kingOfTimeUserId: z.string(),
  kingOfTimePassword: z.string(),
  clockInCronExpression: z.string(),
  clockOutInterval: z.number(),
  workingHours: z.number(),
  skipWeekend: z.boolean().optional(),
  skipJpHoliday: z.boolean().optional(),
});

const Config = z.object({
  channel: z.string(),
  users: z.array(User),
});

let json = process.env.CONFIG_JSON;

if (!json) {
  try {
    json = readFileSync("config.json", "utf8");
  } catch (error) {
    const message = `Error reading from config.json: ${error}`;
    logger.error(message);
    throw new Error(message);
  }
}

let config: z.infer<typeof Config>;

try {
  const data = JSON.parse(json);
  config = Config.parse(data);
} catch (error) {
  const message = `Error parsing config.json: ${error}`;
  logger.error(message);
  throw new Error(message);
}

export default config;
export type Config = z.infer<typeof Config>;
export type User = z.infer<typeof User>;
