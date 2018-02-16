// Initialize using verification token from environment variables
var Airtable = require('airtable');
var moment = require('moment')
var airTable = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);

const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);
const port = process.env.PORT || 5000;

const { WebClient } = require('@slack/client');
const slackApi = new WebClient(process.env.SLACK_AUTH_TOKEN);

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('reaction_added', (event) => {
  var reaction = event.reaction
  console.log("channel: " + event.item.channel)
  console.log("ts: " + event.item.ts)
  slackApi.reactions.get({
    channel: event.item.channel,
    timestamp: event.item.ts
  }).then((res)=>{
    if(res.type!="message") return;
    var message = res.message.text;

    slackApi.channels.info(event.item.channel).then((res)=>{
      var channel = res.channel.name;

      slackApi.users.info().then((res)=>{
        var user = res.user.profile.real_name || res.user.name;

        var payload = {
          Date: moment().format('L'),
          Message: message,
          Channel: channel ? channel : 'no idea',
          User: user,
     	  Emoji: reaction ? reaction: 'idk'
        }

        airTable('Table 1').create(payload, function(err, record) {
          if (err) { console.error(err); return; }
          console.log(record.getId());
        });
      });
    });
  });
});

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);

// Start a basic HTTP server
slackEvents.start(port).then(() => {
  console.log(`server listening on port ${port}`);
});
