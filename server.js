// Initialize using verification token from environment variables
var Airtable = require('airtable');
var airTable = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);

const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);
const port = process.env.PORT || 3000;

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('reaction_added', (event) => {
    var payload = {
      date: event.item.ts,
      message: event.item_user,
      channel: event.item.channel,
      user: event.user
    }
    airTable('Table 1').create(payload, function(err, record) {
      if (err) { console.error(err); return; }
      console.log(record.getId());
  });
});

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);

// Start a basic HTTP server
slackEvents.start(port).then(() => {
  console.log(`server listening on port ${port}`);
});
