// Initialize using verification token from environment variables
var Airtable = require('airtable');
var moment = require('moment')
var airTable = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);

const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);
const port = process.env.PORT || 3000;

const { WebClient } = require('@slack/client');
const slackApi = new WebClient(process.env.SLACK_AUTH_TOKEN);

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('reaction_added', (event) => {
  slackApi.reactions.list(event.user).then((res)=>{
    message = res.items[0].message.text;

    var payload = {
      Date: moment().format('L'),
      Message: message, //event.item_user, // https://api.slack.com/methods/reactions.list
      Channel: event.item.channel, // https://api.slack.com/methods/channels.info
      User: event.user // https://api.slack.com/methods/users.info
    }

    airTable('Table 1').create(payload, function(err, record) {
      if (err) { console.error(err); return; }
      console.log(record.getId());
    });
  });
});

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);

// Start a basic HTTP server
slackEvents.start(port).then(() => {
  console.log(`server listening on port ${port}`);
});
