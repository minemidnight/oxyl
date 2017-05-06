module.exports = {
	process: async message => {
		let shardInfo = "";
		let	thisShard = message.channel.guild ? message.channel.guild.shard.id : 0;

		bot.shards.map(shard => shard).forEach(shard => {
			let onShard = bot.guilds.filter(guild => guild.shard.id === shard.id);
			let shardUsers = new Set();
			onShard.forEach(guild => guild.members.forEach(member => shardUsers.add(member.id)));
			let channelCount = 0;
			onShard.forEach(guild => channelCount += guild.channels.size);

			shardInfo += __("commands.default.shardInfo.success", message, {
				shard: thisShard === shard.id ? `\* ${shard.id}` : shard.id,
				guilds: onShard.length,
				channels: channelCount,
				users: shardUsers.size,
				latency: shard.latency,
				status: shard.status
			});
			shardInfo += `\n\n`;
		});
		return shardInfo;
	},
	description: "List info about the shards the worker is running on"
};
