import { formatTitle } from "../utils";
import ElementBuilder from "./element";
import { KnownBlock } from "@slack/bolt";

export default class BlockBuilder {
  static buildBeforeClockIn(slackUser: string): KnownBlock[] {
    return new BlockBuilder(slackUser).addBeforeClockInSection().addBeforeClockInActions().build();
  }

  static buildClockInAndScheduleClockOut(slackUser: string): KnownBlock[] {
    return new BlockBuilder(slackUser).addClockInAndScheduleClockOutSection().addClockInAndScheduleClockOutActions().build();
  }

  static buildDoNotScheduleClockOut(slackUser: string): KnownBlock[] {
    return new BlockBuilder(slackUser).addDoNotScheduleClockOutSection().addDoNotScheduleClockOutActions().build();
  }

  static buildClockOut(slackUser: string): KnownBlock[] {
    return new BlockBuilder(slackUser).addClockOutSection().build();
  }

  static buildDoNotClockIn(slackUser: string): KnownBlock[] {
    return new BlockBuilder(slackUser).addDoNotClockInSection().addDoNotClockInActions().build();
  }

  static buildMessage(slackUser: string, message: string): KnownBlock[] {
    return new BlockBuilder(slackUser).addMessageSection(message).build();
  }

  _slackUser: string;
  _blocks: KnownBlock[];

  constructor(slackUser: string) {
    this._slackUser = slackUser;
    this._blocks = [];
  }

  build(): KnownBlock[] {
    return this._blocks;
  }

  addBeforeClockInSection(): BlockBuilder {
    this._blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${formatTitle(this._slackUser)}\nLet's see... :thinking_face:`,
      },
    });

    return this;
  }

  addBeforeClockInActions(): BlockBuilder {
    this._blocks.push({
      type: "actions",
      elements: ElementBuilder.buildBeforeClockIn(this._slackUser),
    });

    return this;
  }

  addClockInAndScheduleClockOutSection(): BlockBuilder {
    this._blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${formatTitle(this._slackUser)}\nI'm working on schedule :innocent:`,
      },
    });

    return this;
  }

  addClockInAndScheduleClockOutActions(): BlockBuilder {
    this._blocks.push({
      type: "actions",
      elements: ElementBuilder.buildClockInAndScheduleClockOut(this._slackUser),
    });

    return this;
  }

  addDoNotScheduleClockOutSection(): BlockBuilder {
    this._blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${formatTitle(this._slackUser)}\nI'm working :face_with_monocle:`,
      },
    });

    return this;
  }

  addDoNotScheduleClockOutActions(): BlockBuilder {
    this._blocks.push({
      type: "actions",
      elements: ElementBuilder.buildDoNotScheduleClockOut(this._slackUser),
    });

    return this;
  }

  addClockOutSection(): BlockBuilder {
    this._blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${formatTitle(this._slackUser)}\nI finished working :sunglasses:`,
      },
    });

    return this;
  }

  addDoNotClockInSection(): BlockBuilder {
    this._blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${formatTitle(this._slackUser)}\nI'm off today :sleeping:`,
      },
    });

    return this;
  }

  addDoNotClockInActions(): BlockBuilder {
    this._blocks.push({
      type: "actions",
      elements: ElementBuilder.buildDoNotClockIn(this._slackUser),
    });

    return this;
  }

  addMessageSection(message: string): BlockBuilder {
    this._blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${formatTitle(this._slackUser)}\n${message}`,
      },
    });

    return this;
  }
}
