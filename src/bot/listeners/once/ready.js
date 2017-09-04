const { PlayerManager } = require("eris-lavalink");
const Player = require("../../structures/player");
const channels = require("../../modules/channels");
module.exports = () => {
	console.startup(`Worker ${cluster.worker.id} bot ready (took ${bot.utils.parseMs(process.uptime() * 1000)})`);

	const nodeOptions = Object.assign(bot.config.lavalink.nodeOptions);
	bot.voiceConnections = new PlayerManager(bot, bot.lavalink.nodes, {
		numShards: cluster.worker.totalShards,
		userId: bot.user.id
	});

	let mentionIndex = bot.config.bot.prefixes.indexOf("mention");
	if(~mentionIndex) bot.config.bot.prefixes[mentionIndex] = `<@!?${bot.user.id}>`;

	let name = `${bot.config.bot.prefixes[0]}help | ${cluster.worker.shardRange}`;
	bot.editStatus("online", { name });
	cluster.worker.send({ type: "startup" });

	Player.resumeQueues();
	channels.load();
};
