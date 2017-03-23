exports.cmd = new Oxyl.Command("shardinfo", async message => {
	let returnstr = "", guilds = bot.guilds, thisShard = message.channel.guild ? message.channel.guild.shard.id : 0;
	let page = message.args[0] || 1;
	let pageAmount = Math.ceil(bot.shards.size / 3);
	if(page > pageAmount) page = pageAmount;

	bot.shards.map(shard => shard).splice((page - 1) * 3, 3).forEach(shard => {
		let onShard = guilds.filter(guild => guild.shard.id === shard.id);
		let shardUsers = new Set();
		onShard.forEach(guild => guild.members.forEach(member => shardUsers.add(member.id)));
		let channelCount = 0;
		onShard.forEach(guild => { channelCount += guild.channels.size; });

		returnstr += `\n**Shard ${shard.id}**`;
		if(thisShard === shard.id) returnstr += " (shard of guild)";
		let info = [
			`Guilds: ${onShard.length}`,
			`Channels: ${channelCount}`,
			`Users: ${shardUsers.size}`,
			`Latency: ${shard.latency}ms`,
			`Status: ${shard.status}`
		];
		returnstr += framework.listConstructor(info);
	});
	return returnstr + `\nPage ${page} of ${pageAmount}`;
}, {
	type: "default",
	description: "List info about each shard of Oxyl",
	args: [{
		type: "int",
		label: "page",
		min: 1,
		optional: true
	}]
});
