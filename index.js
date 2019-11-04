const humanizeDuration = require('humanize-duration');
const { IncomingWebhook } = require('@slack/webhook');

const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);
const colorMap = {
  SUCCESS: 'good',
  FAILURE: 'danger',
  INTERNAL_ERROR: 'warning',
  TIMEOUT: 'warning',
};

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = (data) => JSON.parse(Buffer.from(data, 'base64').toString());

// createSlackMessage creates a message from a build object.
const createSlackMessage = (build) => {
  const duration = humanizeDuration(new Date(build.finishTime) - new Date(build.startTime));
  const message = {
    text: `Build \`${build.id}\`: ${build.status} (after ${duration})`,
    mrkdwn: true,
    attachments: [{
      title: 'Build logs',
      title_link: build.logUrl,
      color: colorMap[build.status],
      fields: [
        ...build.steps.map((step) => ({
          title: `${step.name} ${step.entrypoint} ${step.args.join(' ')}`,
          value: step.status,
          short: true,
          color: colorMap[step.status],
        })),
      ],
    },
    ],
  };
  if (build.substitutions) {
    message.footer = `${build.substitutions.REPO_NAME}: ${build.substitutions.BRANCH_NAME} - ${build.substitutions.SHORT_SHA}`;
  }
  return message;
};

// subscribeSlack is the main function called by Cloud Functions.
module.exports.subscribeSlack = (pubSubEvent) => {
  const build = eventToBuild(pubSubEvent.data);
  console.info(JSON.stringify(build));
  // Skip if the current status is not in the status list.
  // Add additional statuses to list if you'd like:
  // QUEUED, WORKING, SUCCESS, FAILURE,
  // INTERNAL_ERROR, TIMEOUT, CANCELLED
  const status = ['SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT'];
  if (status.indexOf(build.status) === -1) {
    return;
  }

  // Send message to Slack.
  const message = createSlackMessage(build);
  webhook.send(message);
};
