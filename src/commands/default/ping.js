module.exports = {
	process: async message => {
		let latency = message.channel.guild ?
			message.channel.guild.shard.latency :
			bot.shards.map(shard => shard)[0].latency;
		return __("commands.default.ping.success", message, { latency });
	},
	description: "Test Oxyl's responsiveness"
};
