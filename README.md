# slack-king-of-time [![CI/CD](https://github.com/yujiosaka/slack-king-of-time/actions/workflows/ci_cd.yaml/badge.svg)](https://github.com/yujiosaka/slack-king-of-time/actions/workflows/ci_cd.yaml)

###### [Usage](https://github.com/yujiosaka/slack-king-of-time#how-to-use) | [Installation](https://github.com/yujiosaka/slack-king-of-time#installation) | [Development](https://github.com/yujiosaka/slack-king-of-time#development) | [Deployment](https://github.com/yujiosaka/slack-king-of-time#local-deployment) | [Configuration](https://github.com/yujiosaka/slack-king-of-time#configuration) | [Changelog](https://github.com/yujiosaka/slack-king-of-time/blob/master/docs/CHANGELOG.md) | [License](https://github.com/yujiosaka/slack-king-of-time/blob/master/LICENSE)

A bot to automates clocking in and out using KING OF TIME (www.kingtime.jp).

## Features

- Automates daily clock-ins and clock-outs using [KING OF TIME](http://www.kingtime.jp/).
- Also supports [freee 勤怠管理 Plus](https://kintaiplus.freee.co.jp/independent/recorder2/personal/), which is a [KING OF TIME](http://www.kingtime.jp/)'s OEM.
- Clock in and out directly from Slack with action buttons.
- Bypasses the need for daily logins to the service.
- Automates after work clock-outs, never forget to clock out again.
- Easily deployable to Kubernetes using provided configurations.

## How to Use

### Configure

Set channel and users in `config.json`

```json
{
  "channel": "slack-channel-id",
  "users": [
    {
      "slackUser": "slack-user-id",
      "clockInCronExpression": "0 9 * * *",
      "clockOutInterval": 999999,
      "kingOfTimeUserId": "king-of-time-user-id",
      "kingOfTimePassword": "king-of-time-password",
      "workingHours": 9,
      "skipWeekend": true,
      "skipJpHoliday": true
    }
  ]
}
```

- `channel` <[string]> The Slack channel ID where the bot will post clock-in and clock-out messages (ex: `"C05AGSJPVTQ"`).
- `users` <[Array]<[Object]>>
  - `slackUser` <[string]> The Slack user ID for the user to be managed (ex. `"U04C4H79NMA"`).
  - `clockInCronExpression` <[string]> A cron expression representing the user's regular clock-in time.
  - `clockOutInterval` <[number]> Interval in milliseconds at which the bot checks if it's time to clock out. This serves as a randomization factor to prevent exact clock-out times each day.
  - `kingOfTimeUserId` <[string]> The user ID for the user on the [KING OF TIME](http://www.kingtime.jp/).
  - `kingOfTimePassword` <[string]> The password for the user on the [KING OF TIME](http://www.kingtime.jp/).
  - `workingHours` <[number]> The length of the user's typical workday in hours. This is used to calculate the clock-out time.
  - `skipWeekend` <[boolean]> If true, the bot will not clock in or out on weekends. Defaults to `false`.
  - `skipJpHoliday` <[boolean]> If true, the bot will not clock in or out on Japanese holidays. Defaults to `false`.

### Invite the bot to the configured channel.

To invite the bot, you can enter `/invite @your-bot-name`.

<img width="400" alt="invite-the-bot" src="https://github.com/yujiosaka/slack-king-of-time/assets/2261067/99db89cd-11b9-4a3a-a2b8-6c277d624195">

### Start clock in

To start clocking in, you can enter `/kot`.

<img width="400" alt="start-clock-in" src="https://github.com/yujiosaka/slack-king-of-time/assets/2261067/8cf12ec9-0729-4a3a-8503-6e1afd9b9a17">

Or, you can wait until clock-in schedule configured in `clockInCronExpression` for receiving a message automatically

### Start interaction

You can interact with action buttons for clock-ins and clock-outs.

<img width="400" alt="demo" src="https://github.com/yujiosaka/slack-king-of-time/assets/2261067/b1730bee-fdc9-497e-9596-d7c13818e4f7">

## Installation

To install the package, you can use `npm`:

```sh
npm install slack-king-of-time
```

## Integration with Existing Bolt Apps

slack-king-of-time can be plugged into your existing [Bolt](https://github.com/SlackAPI/bolt-python) apps. This allows you to add the functionality of slack-king-of-time to your existing Slack apps. Here's a simple example:

```ts
import { App } from "@slack/bolt";
import SlackKingOfTime from "slack-king-of-time";

// Assume that you have an existing Bolt app
const app = new App(...);
app.start();

// Initialize slack-king-of-time with the existing Bolt app
const slackKOT = new SlackKingOfTime({
  app,
  signingSecret: "signing-secret", // Optional, or read SLACK_SIGNING_SECRET from environment variables
  botToken: "bot-token", // Optional, or read SLACK_BOT_TOKEN from environment variables
  appToken: "app-token", // Optional, or read SLACK_APP_TOKEN from environment variables
  loginUrl: "https://kintaiplus.freee.co.jp/independent/recorder2/personal/", // Optional, or read LOGIN_URL from environment variables
})

// Start listening for Slack events
slackKOT.start()
```

## Development

There are two ways to set up the development environment: manually or using Visual Studio Code and the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).

### Manual Setup

1. Clone the repository:

```sh
git clone https://github.com/yujiosaka/slack-king-of-time.git
```

2. Navigate to the project directory:

```sh
cd slack-king-of-time
```

3. Run the `npm run config` script to set up your development environment:

4. Set the required environment variables in a `.env` file.

5. Set Slack channel and users in a `config.json` file.

6. Run the chatbot:

```sh
npm run dev
```

### Docker Dev Container Setup

Using Visual Studio Code and the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension, you can simplify the development environment setup process. The extension allows you to develop inside a Docker container and automatically sets up the development environment for you.

1. Install the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension in Visual Studio Code.

2. Clone the repository:

```sh
git clone https://github.com/yujiosaka/slack-king-of-time.git
```

3. Open the cloned repository in Visual Studio Code.

4. When prompted by Visual Studio Code, click "Reopen in Container" to open the project inside the Docker container.

5. The extension will build the Docker container and set up the development environment for you. This may take a few minutes.

6. Set the required environment variables in a `.env` file.

7. Set Slack channel and users in a `config.json` file.

8. Build and run the Docker container with Docker Compose:

```sh
docker-compose up --build
```

## Local Deployment

To deploy the services locally, follow the steps below:

### Set up the repository

1. Clone the repository:

```sh
git clone https://github.com/yujiosaka/slack-king-of-time.git
```

2. Navigate to the project directory:

```sh
cd slack-king-of-time
```

### Secrets and ConfigMaps

Before deploying the services, you need to set up Kubernetes Secrets and ConfigMaps.

1. Create a `.env` file from the `.env.example` file and fill it with your actual values.
2. Use the following command to create Kubernetes Secrets:

```sh
make create-secrets
```

3. Create a `config.json` file from the `config.json.example` file and fill it with your actual values.
4. Use the following command to create Kubernetes ConfigMaps:

```sh
make create-configmap
```

### Deploying to Kubernetes

To deploy the services to Kubernetes, use the following command:

```sh
make deploy
```

This command applies all Kubernetes configuration files located in the `./kubernetes/` directory.

### Cleaning Up

To delete all the deployed resources, use the following command:

```sh
make delete
```

Note: Make sure you have `kubectl` configured to communicate with your Kubernetes cluster.

### Docker Hub Repository

Docker images for this project are available in the [Docker Hub repository](https://hub.docker.com/r/yujiosaka/slack-king-of-time). You can find suitable images for different versions or tags of the slack-king-of-time application.

## Configuration

To configure and install slack-king-of-time in your Slack workspace, follow the steps below:

### Create a new app from the manifest

1. Go to Slack's [Your Apps](https://api.slack.com/apps) page and click on "Create an App".

   <img width="400" alt="create-new-app" src="https://github.com/yujiosaka/slack-king-of-time/assets/2261067/6e84a023-8b23-44cb-b2fb-91a92281e722">

2. Select "From an app manifest" as the creation method.

3. Choose the workspace where you want to install the app and click the "Next" button.

4. Copy the contents of the [manifest.yaml](https://github.com/yujiosaka/slack-king-of-time/blob/main/manifest.yml) file and paste it into the text field. Then click the "Next" button.

5. Review the app details and click "Create" to create the app.

### Updating App Credentials

Before starting the application, you need to update the `.env` file with the required credentials. Follow the steps below:

1. Create a `.env` file from the `.env.example` file.

2. Retrieve the "Signing Secret" from the "App Credentials" section in the "Basic Settings" menu of your Slack app.

   <img width="400" alt="app-credentials" src="https://github.com/yujiosaka/slack-king-of-time/assets/2261067/d8e4b419-f9d6-48df-981a-1b1f7505fab5">

3. Retrieve "App Token" from the "App Level Tokens" section in the "Basic Settings" menu of your Slack app.

   <img width="400" alt="app-level-tokens" src="https://github.com/yujiosaka/slack-king-of-time/assets/2261067/f0d024cd-8d7f-44dd-86d0-ca7f1cd222fe">

4. Retrieve "Bot Token" from the "OAuth Tokens for Your Workspace" section in the "OAuth & Permissions" menu of your Slack app,

   <img width="400" alt="oauth-tokens" src="https://github.com/yujiosaka/slack-king-of-time/assets/2261067/616de31a-19c2-4336-bcc0-5b30d3a769e6">

5. Replace the placeholders in the `.env` file with your actual credentials.

6. Save the `.env` file.

7. (Re)start the application.

### Install the app to your workspace

1. Clock "(Re)install to Workspace" button n the "Basic Settings" menu of your Slack app.

   <img width="400" alt="install-to-workspace" src="https://github.com/yujiosaka/slack-king-of-time/assets/2261067/8a0519b1-8f77-4b76-a016-b143cac49dbd">

That's it! slack-king-of-time is now installed in your workspace.

## Linting and Formatting

This project uses `Eslint` for linting and `prettier` for code formatting.

To lint the code, run:

```sh
npm run lint
```

To format the code, run:

```sh
npm run format
```

## License

This project is licensed under the MIT License. See [LICENSE](https://github.com/yujiosaka/slack-king-of-time/blob/main/LICENSE) for details.

[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array "Array"
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "Number"
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
