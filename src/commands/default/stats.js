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

		let workerUsage = process.memoryUsage().heapUsed;
		let masterUsage = (await process.output({
			type: "masterEval",
			input: () => process.memoryUsage().heapUsed
		})).result;
		let totalUsage = (masterUsage + results.map(res => res[2]).reduce((a, b) => a + b)) / Math.pow(1024, 3);

		return `__**Guilds**__\n` +
			`Large (over 250 members): ${largeGuilds}\n` +
			`Others: ${totalGuilds - largeGuilds}\n` +
			`Total: ${totalGuilds}\n` +
			`Streaming In: 0\n\n` +
			`__**Other**__\n` +
			`Worker Memory Usage: ${(workerUsage / Math.pow(1024, 2)).toFixed(2)}MB\n` +
			`Total: ${totalUsage.toFixed(2)}GB\n` +
			`Worker: ${cluster.worker.id} (shards: ${cluster.worker.shardStart}-${cluster.worker.shardEnd})\n` +
			`Uptime: ${bot.utils.parseMs(Date.now() - bot.startTime)}\n` +
			`Website: http://minemidnight.work`;
	},
	description: "View information about Oxyl",
	aliases: ["info"]
};
