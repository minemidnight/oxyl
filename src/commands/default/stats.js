module.exports = {
	process: async message => {
		let results = (await process.output({
			type: "globalEval",
			input: () => [
				bot.guilds.filter(guild => guild.large).length,
				bot.guilds.size,
				process.memoryUsage().heapUsed / Math.pow(1024, 2)
			]
		})).results;
		let largeGuilds = results.map(res => res[0]).reduce((a, b) => a + b);
		let totalGuilds = results.map(res => res[1]).reduce((a, b) => a + b);

		let workerUsage = process.memoryUsage().heapUsed / Math.pow(1024, 2);
		let masterUsage = (await process.output({
			type: "masterEval",
			input: () => process.memoryUsage().heapUsed / Math.pow(1024, 2)
		})).result;
		let totalUsage = (masterUsage + results.map(res => res[2]).reduce((a, b) => a + b)) / 1024;

		let shardStart = Math.min.apply(null, bot.shards.map(shard => shard.id));
		return `__**Guilds**__\n` +
			`Large (over 250 members): ${largeGuilds}\n` +
			`Others: ${totalGuilds - largeGuilds}\n` +
			`Total: ${totalGuilds}\n` +
			`Streaming In: 0\n\n` +
			`__**Other**__\n` +
			`Worker Memory Usage: ${workerUsage.toFixed(2)}MB\n` +
			`Total: ${totalUsage.toFixed(2)}GB\n` +
			`Worker: ${cluster.worker.id} (shards: ${shardStart}-${shardStart + (bot.shards.size - 1)})\n` +
			`Uptime: ${bot.utils.parseMs(Date.now() - bot.startTime)}\n` +
			`Website: http://minemidnight.work`;
	},
	description: "View information about Oxyl",
	aliases: ["info"]
};
