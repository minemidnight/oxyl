module.exports = () => {
	console.startup(`Worker ${cluster.worker.id} bot ready (took ${bot.utils.parseMs(process.uptime() * 1000)})`);

	let mentionIndex = bot.publicConfig.prefixes.indexOf("mention");
	if(mentionIndex !== -1) bot.publicConfig.prefixes[mentionIndex] = `<@!?${bot.user.id}>`;

	let name = `${bot.publicConfig.prefixes[0]}help | ${cluster.worker.shardStart}-${cluster.worker.shardEnd}`;
	bot.editStatus("online", { name });
};
