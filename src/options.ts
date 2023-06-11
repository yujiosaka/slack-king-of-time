import { App } from "@slack/bolt";

export interface SlackKingOfTImeOptions {
  app?: App;
  signingSecret?: string;
  botToken?: string;
  appToken?: string;

  // PuppetKingOfTime launch options
  loginUrl?: string;
  idSelector?: string;
  passwordSelector?: string;
  loginSelector?: string;
  clockInSelector?: string;
  clockOutSelector?: string;
  notificationSelector?: string;
  loginNotificationContent?: string;
  clockInNotificationContent?: string;
  clockOutNotificationContent?: string;
  timeout?: number;

  // Puppeteer launch options
  ignoreHTTPSErrors?: boolean;
  headless?: boolean;
  executablePath?: string;
  slowMo?: number;
  args?: string[];
  ignoreDefaultArgs?: boolean;
  handleSIGINT?: boolean;
  handleSIGTERM?: boolean;
  handleSIGHUP?: boolean;
  dumpio?: boolean;
  userDataDir?: string;
  env?: Record<string, string | undefined>;
  devtools?: boolean;
}
