# oxyl

Discord bot using Eris library

Example `public-config.json`:
```
{
        "creators": ["155112606661607425"],
        "datadog": { "prefix": "oxyl." },
        "defaultInvitePermissionNumber": 298183686,
        "donator": {
                "channel": "254770965018443776",
                "role": "292657073987125249"
        },
        "prefixes": ["o!", "oxyl", "mention"],
        "postStats": true,
        "serverChannel": "265998475831934977",
        "shardsPerWorker": 2,
        "updates": {
                "channel": "270576454117359617",
                "guild": "254768930223161344",
                "role": "265293123821895680"
        },
        "websocketServer": true
}
```
beta is optional stating whether or not the bot is in beta, if true then some stuff is disabled
creators is required and is an array of user ids
datadog is optional if you want to send stats to datadog
databaseName is optional, if you want a different database name besides Oxyl, set it there
defaultInvitePermissionNumber is required and is used for the invite command
donator is optional to say thank you for donating and add a role to a member in a server
prefixes is an array of prefixes, mention is replaced with a bot mention
postStats is not required, but if true see private-config to set the site tokens
serverChannel is not required, sends server joins/leaves to a channel
shardsPerWorker specifies how many shards should be put on each worker
updates is all optional which sets up the update command
websocketServer is optional and states whether or not to start a web socket server on 7025. should only be used if done with oxyl-site too


Example `private-config.json`:
```
{
	"database": { "password": "cool fam" },
	"dbotsKey": "very long key",
	"dbotsOrgKey": "very long key"
	"carbonKey": "shorter key",
	"googleKeys": ["a key", "Another"],
	"secret": "thing from bot page",
	"sentryLink": "url from sentry",
	"token": "thing from bot page",
	"webhook": "webhook url"
}
```
database is optional but bot will most likely break without it. this is passed to rethinkdbdash login
*Posting stuff - if a key is not present it will just not post to the site it corresponds to, if you have postStats off there is no reason for any of the keys*
dbotsKey is to post to https://bots.discord.pw
dbotsOrgKey is to post to http://discordbots.org
carbonKey is to post to https://www.carbonitex.net/discord/bots
googleKeys is an array of keys with the youtube data api v3 enabled and required for the bot to work correctly
secret is only required if you use the web socket server
sentryLink is optional, but if you want to use sentry.io put the link there
token is required for the bot to log in
webhook is optional for status about restarts and stuff
