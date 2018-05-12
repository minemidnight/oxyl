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

const cachedPrefixes = new Map();
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
	commands: "src/bot/commands",
	contextLocals: ["r"],
	async getPrefixes({ channel: { guild } }) {
		if(!guild) return config.prefixes;
		else if(cachedPrefixes.has(guild.id)) return cachedPrefixes.get(guild.id);

		const prefixData = await client.locals.r.table("prefixes").get(guild.id).run();
		if(prefixData) {
			const prefix = [prefixData.value];
			cachedPrefixes.set(guild.id, prefixData.overwrite ? prefix : prefix.concat(config.prefixes));
		} else {
			cachedPrefixes.set(guild.id, config.prefixes);
		}

		setTimeout(() => cachedPrefixes.delete(guild.id), 600000);
		return cachedPrefixes.get(guild.id);
	},
	async localeFunction(message) {
		message.locale = "en";

		if(message.channel.guild) message.channel.guild.locale = "en";
	}
}).use("message",
	wiggle.middleware.commandParser(),
	wiggle.middleware.argHandler(),
	require("./middleware/censors"),
	require("./middleware/permissionHandler")
);

const { update: updateGroupRoles } = require("./modules/syncGroupRole");
const { update: updateTimedEvents } = require("./modules/timedEvents");
const { updateAll: updatePremiumServers } = require("./modules/timedEvents");
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

	setInterval(() => updatePremiumServers(client.locals.r), 14400000);
	setInterval(() => updateGroupRoles(client), 900000);
	setInterval(() => updateTimedEvents(client), 30000);

	return { client };
};
