const workerID = require("cluster").worker.id;

module.exports = {
	async run({ client }) {
		const info = await process.output({
			op: "eval",
			target: "allBots",
			input: () => ({
				id: require("cluster").worker.id,
				guilds: context.client.erisClient.guilds.size, // eslint-disable-line no-undef
				memoryUsed: process.memoryUsage().heapUsed,
				streams: [...require("../bot/modules/Player").getPlayers().values()]
					.filter(player => player.currentSong).length,
				shards: context.client.locals.shardDisplay // eslint-disable-line no-undef
					.substring(context.client.locals.shardDisplay.indexOf(" ") + 1), // eslint-disable-line no-undef
				uptime: Date.now() - context.client.erisClient.startTime // eslint-disable-line no-undef
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

		const totalShards = client.options.maxShards;
		maxLen.shards = Math.max(...info.map(data => data.shards.length));

		maxLen.uptime = Math.max(...info.map(data => {
			data.uptime = Object.entries({
				months: Math.floor(data.uptime / 2592000000),
				weeks: Math.floor(data.uptime % 2592000000 / 604800000),
				days: Math.floor(data.uptime % 2592000000 % 604800000 / 86400000),
				hours: Math.floor(data.uptime % 2592000000 % 604800000 % 86400000 / 3600000),
				minutes: Math.floor(data.uptime % 2592000000 % 604800000 % 86400000 % 3600000 / 60000),
				seconds: Math.floor(data.uptime % 2592000000 % 604800000 % 86400000 % 3600000 % 60000 / 1000)
			}).reduce((a, [key, value]) => {
				if(!value) return a;
				else return `${a}${value}${key === "months" ? "M" : key.charAt(0)}`;
			}, "");

			return data.uptime.length;
		}));

		const workerInfo = info.sort((a, b) => a.id - b.id).map(data => {
			let line = "";
			line += workerID === data.id ? "* " : "  ";
			line += data.id.toString().padStart(maxLen.id);
			line += ": Guilds ";
			line += data.guilds.toString().padStart(maxLen.guilds);
			line += ", Streams ";
			line += data.streams.toString().padStart(maxLen.streams);
			line += ", Shards ";
			line += data.shards.toString().padStart(maxLen.shards);
			line += ", RAM ";
			line += (data.memoryUsed / Math.pow(1024, 3)).toFixed(2).padStart(maxLen.memory);
			line += "GiB, Uptime ";
			line += data.uptime.toString().padStart(maxLen.uptime);

			return line;
		});


		workerInfo.push(`  ${"T".padStart(maxLen.id)}: Guilds ${totalGuilds}, Streams ${totalStreams}, ` +
		`Shards ${totalShards.toString().padStart(maxLen.shards)}, ` +
		`RAM ${totalMemory.toString().padStart(maxLen.memory)}GiB`);

		return `\`\`\`prolog\n${workerInfo.join("\n")}\n\`\`\``;
	},
	aliases: ["stats"]
};
