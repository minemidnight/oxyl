require("eris-additions")(require("eris"), {
	enabled: [
		"Channel.awaitMessages",
		"Member.bannable",
		"Member.kickable",
		"Member.punishable",
		"Role.addable",
		"User.createMessage"
	]
});

const config = require("../../config");
const wiggle = require("eris-wiggle");
const client = wiggle({
	prefixes: config.prefixes,
	token: config.token,
	commandOptions: {
		sendTyping: true,
		replyResult: true
	},
	locales: "locales",
	listeners: "src/bot/listeners",
	commands: "src/bot/commands"
}).use("message",
	wiggle.middleware.commandParser(),
	wiggle.middleware.argHandler(),
	require("./middleware/permissionHandler")
);

module.exports = async ({ shardStart, shardEnd, shardCount, shards }) => {
	client.set("clientOptions", {
		firstShardID: shardStart,
		lastShardID: shardEnd,
		maxShards: shardCount,
		disableEvents: { TYPING_START: true },
		messageLimit: 0,
		defaultImageFormat: "png",
		defaultImageSize: 256,
		latencyThreshold: 1000 * 60 * 60
	});

	client.use("creator", (message, next) => {
		if(~client.locals.owners.indexOf(message.author.id)) return next();
		else return message.channel.createMessage(message.t("errors.notCreator"));
	});
	client.connect();

	client.locals.owners = config.owners;
	client.locals.r = require("../rethinkdb/index");
	client.locals.config = config;
	client.locals.shardDisplay = shards;
	return { client };
};
