module.exports = {
	process: async message => {
		let results = (await process.output({
			type: "all_shards",
			input: () => [
				bot.guilds.filter(guild => guild.large).length,
				bot.guilds.size,
				process.memoryUsage().heapUsed,
				Array.from(bot.players.values()).filter(player => player.connection).length
			]
		})).results;
		let largeGuilds = results.map(res => res[0]).reduce((a, b) => a + b);
		let totalGuilds = results.map(res => res[1]).reduce((a, b) => a + b);
		let streams = results.map(res => res[3]).reduce((a, b) => a + b);

		let workerUsage = process.memoryUsage().heapUsed;
		let masterUsage = (await process.output({
			type: "master",
			input: () => process.memoryUsage().heapUsed
		})).result;
		let totalUsage = masterUsage + results.map(res => res[2]).reduce((a, b) => a + b);

		return __("commands.default.stats.success", message, {
			largeGuilds,
			smallGuilds: totalGuilds - largeGuilds,
			totalGuilds,
			streamCount: streams,
			workerUsage: (workerUsage / Math.pow(1024, 2)).toFixed(2),
			totalUsage: (totalUsage / Math.pow(1024, 3)).toFixed(2),
			worker: cluster.worker.id,
			shardRange: `${cluster.worker.shardRange}`,
			uptime: bot.utils.parseMs(Date.now() - bot.startTime),
			website: "http://minemidnight.work"
		});
	},
	description: "View information about Oxyl",
	aliases: ["info"]
};
