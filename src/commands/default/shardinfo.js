const shardsPerPage = 3;
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

			shardInfo += `__**Shard ${shard.id}**__`;
			if(thisShard === shard.id) shardInfo += " (shard of guild)";
			shardInfo += `\nGuilds: ${onShard.length}\n`;
			shardInfo += `Channels: ${channelCount}\n`;
			shardInfo += `Users: ${shardUsers.size}\n`;
			shardInfo += `Latency: ${shard.latency}ms\n`;
			shardInfo += `Status: ${shard.status}\n\n`;
		});
		return shardInfo;
	},
	description: "List info about the shards the worker is running on"
};
