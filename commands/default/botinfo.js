const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	os = require("os");
const config = framework.config;

Oxyl.registerCommand("botinfo", "default", (message, bot) => {
	let guilds = bot.guilds;
	let largeGuilds = guilds.filter(guild => guild.large === true).size;
	let channels = bot.channels;
	let voiceChannels = channels.filter(vc => vc.type === "voice").size;
	let dmChannels = channels.filter(dmc => dmc.type === "dm").size;
	let textChannels = channels.filter(tc => tc.type === "text").size;
	let usedMemory = process.memoryUsage().heapUsed;
	let totalMemory = os.totalmem();

	let channelsInfo = [
		`Voice: ${voiceChannels}`,
		`Text: ${textChannels}`,
		`DM: ${dmChannels}`,
		`Total: ${channels.size}`
	];

	let guildsInfo = [
		`Large (over 250 members): ${largeGuilds}`,
		`Other: ${guilds.size - largeGuilds}`,
		`Total: ${guilds.size}`
	];

	let totalUsers = 0;
	guilds.forEach((guild) => {
		totalUsers += guild.memberCount;
	});

	let usersInfo = [
		`Total Users: ${totalUsers}`
	];

	let memoryInfo = `${((usedMemory / totalMemory) * 100).toFixed(2)}%, `;
	memoryInfo += `${(usedMemory / Math.pow(1024, 2)).toFixed(2)} MB / ${(totalMemory / Math.pow(1024, 3)).toFixed(2)} GB`;
	let otherInfo = [
		`Memory Usage: ${memoryInfo}`,
		`Creators: minemidnight & TonyMaster21`,
		`Library: discord.js`,
		`GitHub: http://github.com/minemidnight/oxyl`,
		`Prefix/Suffix (either) - \`${config.options.prefix}\``
	];

	channelsInfo = framework.listConstructor(channelsInfo);
	guildsInfo = framework.listConstructor(guildsInfo);
	usersInfo = framework.listConstructor(usersInfo);
	otherInfo = framework.listConstructor(otherInfo);

	return `information about ${bot.user.username} (ID: ${bot.user.id})` +
				`\n\n**Channels:** ${channelsInfo}` +
				`\n\n**Guilds:** ${guildsInfo}` +
				`\n\n**Users:** ${usersInfo}` +
				`\n\n**Other:** ${otherInfo}`;
}, [], "View lots of information about Oxyl", "[]");
