const lavalink = require("eris-lavalink");
lavalink.Player.prototype.stateUpdate = function(state) {
	this.state = state;
	if(bot.players.has(this.guildId)) bot.players.get(this.guildId).setTime(state.position);
};

const Player = require("../../structures/player");
const channels = require("../../modules/channels");
module.exports = () => {
	console.startup(`Worker ${cluster.worker.id} bot ready (took ${bot.utils.parseMs(process.uptime() * 1000)})`);

	bot.voiceConnections = new lavalink.PlayerManager(bot, bot.config.lavalink.nodes, {
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
