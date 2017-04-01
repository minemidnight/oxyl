module.exports = () => {
	console.startup(`Worker ${cluster.worker.id} bot ready (took ${bot.utils.parseMs(process.uptime() * 1000)})`);

	let shardStart = Math.min.apply(null, bot.shards.map(shard => shard.id));
	bot.editStatus("online", { name: `o!help | ${shardStart}-${shardStart + (bot.shards.size - 1)}` });
};
