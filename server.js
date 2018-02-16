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
    if(res.items[0].type!="message") return;
    var message = res.items[0].message.text;
    console.log(res)
    // var reaction = res.items[0].

    slackApi.channels.info(event.item.channel).then((res)=>{
      var channel = res.channel.name;

      slackApi.users.info(event.user).then((res)=>{
        var user = res.user.profile.real_name || res.user.name;

        var payload = {
          Date: moment().format('L'),
          Message: message, // event.item_user, // https://api.slack.com/methods/reactions.list
          Channel: channel, // event.item.channel, // https://api.slack.com/methods/channels.info
          User: user // event.user // https://api.slack.com/methods/users.info
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
