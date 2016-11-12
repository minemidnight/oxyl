const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js");
const perPage = framework.config.options.commands.serverListPerPage;

Oxyl.registerCommand("serverlist", "default", (message, bot) => {
	var guilds = bot.guilds.array();
	var page = 1;
	var pageAmount = Math.ceil(guilds.length / perPage);
	if(message.content) {
		page = parseInt(message.content);
		if(isNaN(page) || page < 1 || page > pageAmount) {
			return `invalid page number (between 1 and ${pageAmount})`;
		}
	}
	let listMsg = `\n**Server List:**`, guildsPage = [];

	for(var i = 0; i < perPage; i++) {
		var index = ((page - 1) * perPage) + i;
		var guild = guilds[index];
		guildsPage.push(`**${index + 1})** ${guild.name} - ${guild.memberCount} members`);
		if(guilds.length - 1 === index || i === perPage - 1) break;
	}

	guildsPage = framework.listConstructor(guildsPage);
	listMsg += guildsPage;
	listMsg += `\nPage ${page} of ${pageAmount}`;
	return listMsg;
}, [], `List all servers of Oxyl (${perPage}/page)`, "[page]");
