import Action from "./action";
import BlockBuilder from "./builders/block";
import Command from "./command";
import config, { User } from "./config";
import logger from "./logger";
import { SlackKingOfTImeOptions } from "./options";
import {
  formatSlackChannel,
  formatTitle,
  getJpStartOfToday,
  isJpHoliday,
  isJpToday,
  isJpWeekend,
  messageTsToDate,
} from "./utils";
import {
  App,
  BlockAction,
  BlockElementAction,
  ButtonAction,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { addHours } from "date-fns";
import dotenv from "dotenv";
import cron from "node-cron";
import PuppetKingOfTime from "puppet-king-of-time";
import { PuppetKingOfTimeOptions } from "puppet-king-of-time/dist/options";

dotenv.config();

export default class SlackKingOfTime {
  _loginUrl?: string;
  _options: SlackKingOfTImeOptions;
  _app: App;

  constructor(options: SlackKingOfTImeOptions = {}) {
    const signingSecret = options.signingSecret || process.env.SLACK_SIGNING_SECRET;
    const token = options.botToken || process.env.SLACK_BOT_TOKEN;
    const appToken = options.appToken || process.env.SLACK_APP_TOKEN;
    this._validateTokens(signingSecret, token, appToken);

    this._loginUrl = options.loginUrl || process.env.LOGIN_URL;
    this._options = options;
    this._app = this._options.app ? this._options.app : new App({ signingSecret, token, appToken, socketMode: true });
  }

  async start(): Promise<void> {
    if (this._options.app == null) {
      await this._app.start();
      logger.info("App is running!");
    }

    this._watch();
    this._listen();
  }

  _validateTokens(signingSecret: string | undefined, botToken: string | undefined, appToken: string | undefined): void {
    const missingTokens: string[] = [];

    if (!signingSecret) {
      missingTokens.push("signingSecret");
    }
    if (!botToken) {
      missingTokens.push("botToken");
    }
    if (!appToken) {
      missingTokens.push("appToken");
    }

    if (missingTokens.length) {
      const message =
        `Missing settings: ${missingTokens.join(", ")}. ` +
        "Please provide them in environment variables or pass them as arguments.";
      logger.error(message);
      throw new Error(message);
    }
  }

  _watch(): void {
    config.users.forEach((user) => {
      this._watchClockIn(user);
      this._watchClockOut(user);
    });
  }

  _watchClockIn(user: User): void {
    cron.schedule(user.clockInCronExpression, async () => {
      const date = new Date();
      if (!!user.skipWeekend && isJpWeekend(date)) return;
      if (!!user.skipJpHoliday && isJpHoliday(date)) return;

      const ts = await this._findMessageTs(formatTitle(user.slackUser));
      if (ts) return;

      const blocks = BlockBuilder.buildBeforeClockIn(user.slackUser);
      await this._app.client.chat.postMessage({ channel: config.channel, blocks });
    });
  }

  _watchClockOut(user: User): void {
    setInterval(async () => {
      const date = new Date();
      if (!!user.skipWeekend && isJpWeekend(date)) return;
      if (!!user.skipJpHoliday && isJpHoliday(date)) return;

      const ts = await this._findMessageTs(`${formatTitle(user.slackUser)}\nI'm working on schedule :innocent:`);
      if (!ts) return;

      const clockInDate = messageTsToDate(ts);
      const clockOutDate = addHours(clockInDate, user.workingHours);
      if (date < clockOutDate) return;

      let puppetKOT;
      try {
        puppetKOT = await PuppetKingOfTime.launch(this._getSlackKingOfTimeOptions(user));
        await puppetKOT.clockOut();
      } catch (error) {
        const message = `Error clocking out: ${error}`;
        logger.error(message);
        throw new Error(message);
      } finally {
        if (puppetKOT) {
          await puppetKOT.close();
        }
      }

      const blocks = BlockBuilder.buildClockOut(user.slackUser);
      await this._app.client.chat.update({ channel: config.channel, blocks, ts });
    }, user.clockOutInterval);
  }

  async _listen(): Promise<void> {
    this._app.action(Action.ClockInAndScheduleClockOut, this._handleClockInAndScheduleClockOutAction.bind(this));
    this._app.action(Action.DoNotClockIn, this._handleDoNotClockInAction.bind(this));
    this._app.action(Action.DoNotScheduleClockOut, this._handleDoNotScheduleClockOutAction.bind(this));
    this._app.action(Action.ClockOut, this._handleClockOutAction.bind(this));
    this._app.action(Action.ScheduleClockOut, this._handleScheduleClockInAction.bind(this));
    this._app.command(Command.KOT, this._handleKOTCommand.bind(this));
  }

  async _handleClockInAndScheduleClockOutAction(args: SlackActionMiddlewareArgs<BlockAction>): Promise<void> {
    await args.ack();

    const user = this._findUser(args.action);
    const ts = this._getMessageTs(args.body);
    const date = messageTsToDate(ts);
    if (!isJpToday(date)) {
      const blocks = BlockBuilder.buildMessage(user.slackUser, "Timecard cannot be modified for past dates :sweat:");
      await this._app.client.chat.update({ channel: config.channel, blocks, ts });
      return;
    }

    let puppetKOT;
    try {
      puppetKOT = await PuppetKingOfTime.launch(this._getSlackKingOfTimeOptions(user));
      await puppetKOT.clockIn();
    } catch (error) {
      logger.error(`Error clocking in: ${error}`);
    } finally {
      if (puppetKOT) {
        await puppetKOT.close();
      }
    }

    const blocks = BlockBuilder.buildClockInAndScheduleClockOut(user.slackUser);
    await this._app.client.chat.update({ channel: config.channel, blocks, ts });
  }

  async _handleDoNotClockInAction(args: SlackActionMiddlewareArgs<BlockAction>): Promise<void> {
    await args.ack();

    const user = this._findUser(args.action);
    const ts = this._getMessageTs(args.body);
    const date = messageTsToDate(ts);
    if (!isJpToday(date)) {
      const blocks = BlockBuilder.buildMessage(user.slackUser, "Timecard cannot be modified for past dates :sweat:");
      await this._app.client.chat.update({ channel: config.channel, blocks, ts });
      return;
    }

    const blocks = BlockBuilder.buildDoNotClockIn(user.slackUser);
    await this._app.client.chat.update({ channel: config.channel, blocks, ts });
  }

  async _handleDoNotScheduleClockOutAction(args: SlackActionMiddlewareArgs<BlockAction>): Promise<void> {
    await args.ack();

    const user = this._findUser(args.action);
    const ts = this._getMessageTs(args.body);
    const date = messageTsToDate(ts);
    if (!isJpToday(date)) {
      const blocks = BlockBuilder.buildMessage(user.slackUser, "Timecard cannot be modified for past dates :sweat:");
      await this._app.client.chat.update({ channel: config.channel, blocks, ts });
      return;
    }

    const blocks = BlockBuilder.buildDoNotScheduleClockOut(user.slackUser);
    await this._app.client.chat.update({ channel: config.channel, blocks, ts });
  }

  async _handleClockOutAction(args: SlackActionMiddlewareArgs<BlockAction>): Promise<void> {
    await args.ack();

    const user = this._findUser(args.action);
    const ts = this._getMessageTs(args.body);
    const date = messageTsToDate(ts);
    if (!isJpToday(date)) {
      const blocks = BlockBuilder.buildMessage(user.slackUser, "Timecard cannot be modified for past dates :sweat:");
      await this._app.client.chat.update({ channel: config.channel, blocks, ts });
      return;
    }

    let puppetKOT;
    try {
      puppetKOT = await PuppetKingOfTime.launch(this._getSlackKingOfTimeOptions(user));
      await puppetKOT.clockOut();
    } catch (error) {
      const message = `Error clocking out: ${error}`;
      logger.error(message);
      throw new Error(message);
    } finally {
      if (puppetKOT) {
        await puppetKOT.close();
      }
    }

    const blocks = BlockBuilder.buildClockOut(user.slackUser);
    await this._app.client.chat.update({ channel: config.channel, blocks, ts });
  }

  async _handleScheduleClockInAction(args: SlackActionMiddlewareArgs<BlockAction>): Promise<void> {
    await args.ack();

    const user = this._findUser(args.action);
    const ts = this._getMessageTs(args.body);
    const date = messageTsToDate(ts);
    if (!isJpToday(date)) {
      const blocks = BlockBuilder.buildMessage(user.slackUser, "Timecard cannot be modified for past dates :sweat:");
      await this._app.client.chat.update({ channel: config.channel, blocks, ts });
      return;
    }

    const blocks = BlockBuilder.buildClockInAndScheduleClockOut(user.slackUser);
    await this._app.client.chat.update({ channel: config.channel, blocks, ts });
  }

  async _handleKOTCommand(args: SlackCommandMiddlewareArgs): Promise<void> {
    await args.ack();

    if (args.body.channel_id !== config.channel) {
      await args.respond(`The command \`/kot\` needs to be executed in ${formatSlackChannel(config.channel)}`);
      return;
    }

    const user = config.users.find((user) => user.slackUser === args.body.user_id);
    if (!user) {
      await args.respond(`Your Slack User ID ${args.body.user_id} is not configured`);
      return;
    }

    const ts = await this._findMessageTs(`${formatTitle(user.slackUser)}`);
    if (ts) {
      await args.respond("Your timecard is already posted");
      return;
    }

    const blocks = BlockBuilder.buildBeforeClockIn(user.slackUser);
    await this._app.client.chat.postMessage({ channel: config.channel, blocks });
  }

  _findUser(action: BlockElementAction): User {
    const user = config.users.find((user) => user.slackUser === (action as ButtonAction).value);
    if (user == null) {
      const message = `User not found: ${(action as ButtonAction).value}`;
      logger.error(message);
      throw new Error(message);
    }

    return user;
  }

  async _findMessageTs(text: string): Promise<string | null> {
    const jpStartOfToday = getJpStartOfToday();
    const oldest = Math.floor(jpStartOfToday.getTime() / 1000).toString();

    const response = await this._app.client.conversations.history({ channel: config.channel, oldest });
    const message = response?.messages?.find((message) => message.blocks?.[0]?.text?.text?.startsWith(text));
    return message?.ts ?? null;
  }

  _getMessageTs(body: BlockAction): string {
    return (body as unknown as SlackEventMiddlewareArgs<"message">["body"]).message.ts;
  }

  _getSlackKingOfTimeOptions(user: User): PuppetKingOfTimeOptions {
    return { ...this._options, loginUrl: this._loginUrl, id: user.kingOfTimeUserId, password: user.kingOfTimePassword };
  }
}
