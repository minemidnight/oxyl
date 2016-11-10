const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js");
const config = Oxyl.config;

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

	return `information about ${bot.user.username} (ID: ${bot.user.id})` +
				`\n**Channels:**` +
				`\n **╠** Voice: ${voiceChannels}` +
				`\n **╠** Text: ${textChannels}` +
				`\n **╠** DM: ${dmChannels}` +
				`\n **╚** Total: ${channels.size}` +
				`\n\n**Guilds:**` +
				`\n **╠** Large (over 250 members): ${largeGuilds}` +
				`\n **╠** Other: ${guilds.size - largeGuilds}` +
				`\n **╚** Total: ${guilds.size}` +
				`\n\n**Users:**` +
				`\n **╠** Online: ${users.size - offlineUsers}` +
				`\n **║ ╠** DND: ${dndUsers}` +
				`\n **║ ╠** Idle: ${idleUsers}` +
				`\n **║ ╚** Online: ${onlineUsers}` +
				`\n **╠** Offline: ${offlineUsers}` +
				`\n **╚** Total: ${users.size}` +
				`\n\n**Other:**` +
				`\n **╠** Creators: minemidnight & TonyMaster21` +
				`\n **╠** Library: discord.js` +
				`\n **╠** GitHub: http://github.com/minemidnight/oxyl` +
				`\n **╚** Prefix/Suffix (either) - \`${config.options.prefix}\``;
}, [], "View lots of information about Oxyl", "[]");
