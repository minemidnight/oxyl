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
const client = wiggle();

module.exports = async ({ shardStart, shardEnd, shardCount, shards }) => {
	client
		.set("prefixes", config.prefixes)
		.set("clientOptions", {
			firstShardID: shardStart,
			lastShardID: shardEnd,
			maxShards: shardCount,
			disableEvents: { TYPING_START: true },
			messageLimit: 0,
			defaultImageFormat: "png",
			defaultImageSize: 256,
			latencyThreshold: 1000 * 60 * 60
		})
		.set("token", config.token)
		.set("commandOptions", {
			sendTyping: true,
			replyResult: true
		})
		.set("locales", "locales")
		.use("message", wiggle.middleware.commandParser(), wiggle.middleware.argHandler())
		.set("listeners", "src/bot/listeners")
		.set("commands", "src/bot/commands")
		.set("r", require("../rethinkdb/index"))
		.set("owners", config.owners)
		.use("creator", (message, next) => {
			if(~client.get("owners").indexOf(message.author.id)) return next();
			else return message.channel.createMessage(message.t("commands.notCreator"));
		})
		.connect();

	client.locals.config = config;
	client.locals.shardDisplay = shards;
	return { client };
};

process.on("unhandledRejection", err => console.error(err.stack));
