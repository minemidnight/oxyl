const left = (string, length, spacing = " ") => {
	string = string.toString();
	if(string.length >= length) return string;
	else return spacing.repeat(length - string.length) + string;
};

module.exports = {
	process: async message => {
		const { results: info } = await process.output({
			type: "all_shards",
			input: () => ({
				id: cluster.worker.id,
				guilds: bot.guilds.size,
				memoryUsed: process.memoryUsage().heapUsed,
				streams: Array.from(bot.players.values()).filter(player => player.connection).length,
				shards: cluster.worker.shardRange.substring(cluster.worker.shardRange.indexOf(" ") + 1),
				uptime: Date.now() - bot.startTime
			})
		});

		const maxLen = {};
		maxLen.id = Math.max(...info.map(data => data.id.toString().length));

		const totalGuilds = info.reduce((a, b) => a + b.guilds, 0);
		maxLen.guilds = totalGuilds.toString().length;

		const totalMemory = (info.reduce((a, b) => a + b.memoryUsed, 0) / Math.pow(1024, 3)).toFixed(2);
		maxLen.memory = Math.max(
			totalMemory.length,
			...info.map(data => (data.memoryUsed / Math.pow(1024, 3)).toFixed(2).length)
		);

		const totalStreams = info.reduce((a, b) => a + b.streams, 0);
		maxLen.streams = totalStreams.toString().length;

		const totalShards = bot.options.maxShards;
		maxLen.shards = Math.max(...info.map(data => data.shards.length));

		maxLen.uptime = Math.max(...info.map(data => bot.utils.parseMs(data.uptime).length));

		const workerInfo = [];
		info.sort((a, b) => a.id - b.id).forEach(data => {
			let line = "";
			line += cluster.worker.id === data.id ? "* " : "  ";
			line += left(data.id, maxLen.id);
			line += ": Guilds ";
			line += left(data.guilds, maxLen.guilds);
			line += ", Streams ";
			line += left(data.streams, maxLen.streams);
			line += ", Shards ";
			line += left(data.shards, maxLen.shards);
			line += ", RAM ";
			line += left((data.memoryUsed / Math.pow(1024, 3)).toFixed(2), maxLen.memory);
			line += "GiB, Uptime ";
			line += left(bot.utils.parseMs(data.uptime), maxLen.uptime);

			workerInfo.push(line);
		});
		workerInfo.push(`  T: Guilds ${totalGuilds}, Streams ${totalStreams}, ` +
			`Shards ${left(totalShards, maxLen.shards)}, RAM ${left(totalMemory, maxLen.memory)}GiB`);

		return bot.utils.codeBlock(workerInfo.join("\n"), "prolog");
	},
	description: "Get info about each worker that hosts a bot"
};
