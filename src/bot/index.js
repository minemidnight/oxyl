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

const r = require("../rethinkdb/index");
process.logger = require("../logger/index")(r);

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
	require("./middleware/permissionHandler"),
	require("./middleware/stats")
).use("creator", (message, next) => {
	if(client.locals.owners.includes(message.author.id)) return next();
	else return message.channel.createMessage(message.t("errors.notCreator"));
});

client.locals.r = r;
client.locals.owners = config.owners;
client.locals.config = config;
client.locals.messageCounter = 0;

// post server count to sites if in production

const cluster = require("cluster");
const guildChangeMiddleware = [(guild, next) => {
	r.table("workerStats").insert({
		type: "guilds",
		ppid: process.ppid,
		workerID: cluster.worker.id,
		time: Date.now(),
		value: client.erisClient.guilds.size
	});

	return next();
}];

if(process.env.NODE_ENV === "production") {
	guildChangeMiddleware.push(...Object.entries(config.serverCounts || {})
		.map(([site, key]) => wiggle.middleware[site]({ key })));
}

client.use("guildCreate", ...guildChangeMiddleware)
	.use("guildDelete", ...guildChangeMiddleware);

const { update: updateGroupRoles } = require("./modules/syncGroupRole");
const { update: updateTimedEvents } = require("./modules/timedEvents");
const { updateAll: updatePremiumServers } = require("./modules/premiumChecker");

// once message is recieved from master with shard info, start bot

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

	client.connect();
	client.locals.shardDisplay = shards;

	// functions needing periodic updates, only if on shard 0 because it is not necessary to run multiple

	if(shardStart === 0) {
		setInterval(() => updatePremiumServers(client.locals.r), 14400000);
		setInterval(() => updateGroupRoles(client), 900000);
		setInterval(() => updateTimedEvents(client), 30000);
	}

	return { client };
};
