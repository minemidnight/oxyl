const os = require("os");
const config = framework.config;

exports.cmd = new Oxyl.Command("botinfo", async message => {
	let guilds = bot.guilds;
	let largeGuilds = guilds.filter(guild => guild.large === true).length;
	let channels = Object.keys(bot.channelGuildMap).length;
	let usedMemory = process.memoryUsage().heapUsed;
	let totalMemory = os.totalmem();

	let guildsInfo = [
		`Large (over 250 members): ${largeGuilds}`,
		`Other: ${guilds.size - largeGuilds}`,
		`Total: ${guilds.size}`,
		`Streaming In: ${Object.keys(Oxyl.managers).filter(man => Oxyl.managers[man].connection).length} Guilds`
	];

	let extraInfo = [
		`Channels: ${channels}`,
		`Users: ${bot.users.size}`
	];

	let memoryInfo = `${((usedMemory / totalMemory) * 100).toFixed(2)}%, `;
	memoryInfo += `${(usedMemory / Math.pow(1024, 3)).toFixed(2)} GB / ${(totalMemory / Math.pow(1024, 3)).toFixed(2)} GB`;
	let otherInfo = [
		`Memory Usage: ${memoryInfo}`,
		`Website: http://minemidnight.work`,
		`Creator: minemidnight & TonyMaster21`,
		`Library: Eris`,
		`GitHub: <http://github.com/minemidnight/oxyl>`,
		`Prefix - o!, oxyl, or ${bot.user.mention}`
	];

	guildsInfo = framework.listConstructor(guildsInfo);
	extraInfo = framework.listConstructor(extraInfo);
	otherInfo = framework.listConstructor(otherInfo);

	return `Information about ${bot.user.username} (ID: ${bot.user.id})` +
				`\n\n**Channels/Users:** ${extraInfo}` +
				`\n\n**Guilds:** ${guildsInfo}` +
				`\n\n**Other:** ${otherInfo}`;
}, {
	type: "default",
	description: "View information and statistics about Oxyl",
	aliases: ["info", "stats"]
});
