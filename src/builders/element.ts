import Action from "../action";
import { Button } from "@slack/bolt";

export default class ElementBuilder {
  static CLOCK_IN_AND_SCHEDULE_CLOCK_OUT_BUTTON: Button = {
    type: "button",
    text: {
      type: "plain_text",
      text: "Clock in",
    },
    style: "primary",
    value: "<slack user to be updated>",
    action_id: Action.ClockInAndScheduleClockOut,
  };

  static DO_NOT_CLOCK_IN_BUTTON: Button = {
    type: "button",
    text: {
      type: "plain_text",
      text: "I'm off today",
    },
    value: "<slack user to be updated>",
    action_id: Action.DoNotClockIn,
  };

  static DO_NOT_SCHEDULE_CLOCK_OUT_BUTTON: Button = {
    type: "button",
    text: {
      type: "plain_text",
      text: "Cancel schedule",
    },
    style: "danger",
    value: "<slack user to be updated>",
    action_id: Action.DoNotScheduleClockOut,
  };

  static CLOCK_OUT_BUTTON: Button = {
    type: "button",
    text: {
      type: "plain_text",
      text: "Clock out",
    },
    style: "primary",
    value: "<slack user to be updated>",
    action_id: Action.ClockOut,
  };

  static SCHEDULE_CLOCK_OUT_BUTTON: Button = {
    type: "button",
    text: {
      type: "plain_text",
      text: "Schedule clock out",
    },
    style: "danger",
    value: "<slack user to be updated>",
    action_id: Action.ScheduleClockOut,
  };

  static buildBeforeClockIn(slackUser: string): Button[] {
    return new ElementBuilder(slackUser).addClockInAndScheduleClockOutButton().addDoNotClockInButton().build();
  }

  static buildClockInAndScheduleClockOut(slackUser: string): Button[] {
    return new ElementBuilder(slackUser).addClockOutButton().addDoNotScheduleClockOutButton().build();
  }

  static buildDoNotScheduleClockOut(slackUser: string): Button[] {
    return new ElementBuilder(slackUser).addClockOutButton().addScheduleClockOutButton().build();
  }

  static buildDoNotClockIn(slackUser: string): Button[] {
    return new ElementBuilder(slackUser).addClockInAndScheduleClockOutButton().build();
  }

  _slackUser: string;
  _elements: Button[];

  constructor(slackUser: string) {
    this._slackUser = slackUser;
    this._elements = [];
  }

  build(): Button[] {
    return this._elements;
  }

  addClockInAndScheduleClockOutButton(): ElementBuilder {
    this._elements.push({ ...ElementBuilder.CLOCK_IN_AND_SCHEDULE_CLOCK_OUT_BUTTON, value: this._slackUser });

    return this;
  }

  addDoNotClockInButton(): ElementBuilder {
    this._elements.push({ ...ElementBuilder.DO_NOT_CLOCK_IN_BUTTON, value: this._slackUser });

    return this;
  }

  addDoNotScheduleClockOutButton(): ElementBuilder {
    this._elements.push({ ...ElementBuilder.DO_NOT_SCHEDULE_CLOCK_OUT_BUTTON, value: this._slackUser });

    return this;
  }

  addClockOutButton(): ElementBuilder {
    this._elements.push({ ...ElementBuilder.CLOCK_OUT_BUTTON, value: this._slackUser });

    return this;
  }

  addScheduleClockOutButton(): ElementBuilder {
    this._elements.push({ ...ElementBuilder.SCHEDULE_CLOCK_OUT_BUTTON, value: this._slackUser });

    return this;
  }
}
