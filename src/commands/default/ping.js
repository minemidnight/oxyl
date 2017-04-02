module.exports = {
	process: async message =>
		`Pong! \`${message.channel.guild ?
			message.channel.guild.shard.latency :
			bot.shards.map(shard => shard)[0].latency}ms\``,
	description: "Test Oxyl's responsiveness"
};
