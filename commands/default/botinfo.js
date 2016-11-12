const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");
const config = framework.config;

Oxyl.registerCommand("botinfo", "default", (message, bot) => {
	var users = bot.users;
	var onlineUsers = users.filter(user => user.presence.status === "online").size;
	var offlineUsers = users.filter(user => user.presence.status === "offline").size;
	var dndUsers = users.filter(user => user.presence.status === "dnd").size;
	var idleUsers = users.filter(user => user.presence.status === "idle").size;
	var guilds = bot.guilds;
	var largeGuilds = guilds.filter(guild => guild.large === true).size;
	var channels = bot.channels;
	var voiceChannels = channels.filter(vc => vc.type === "voice").size;
	var dmChannels = channels.filter(dmc => dmc.type === "dm").size;
	var textChannels = channels.filter(tc => tc.type === "text").size;

	var channelsInfo = [
		`Voice: ${voiceChannels}`,
		`Text: ${textChannels}`,
		`DM: ${dmChannels}`,
		`Total: ${channels.size}`
	];

	var guildsInfo = [
		`Large (over 250 members): ${largeGuilds}`,
		`Other: ${guilds.size - largeGuilds}`,
		`Total: ${guilds.size}`
	];

	var usersInfo = [
		`Online: ${users.size - offlineUsers}`, [
			`DND: ${dndUsers}`,
			`Idle: ${idleUsers}`,
			`Online: ${onlineUsers}`
		],
		`Offline: ${offlineUsers}`,
		`Total: ${users.size}`
	];

	var otherInfo = [
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
