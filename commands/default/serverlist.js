const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js");
const perPage = Oxyl.config.options.commands.serverListPerPage;

Oxyl.registerCommand("serverlist", "default", (message, bot) => {
	var guilds = bot.guilds.array();
	var page = 1;
	var pageAmount = Math.ceil(guilds.length / perPage), listMsg = ``;
	if(message.content) {
		page = parseInt(message.content);
		if(isNaN(page) || page < 1 || page > pageAmount) {
			return `invalid page number (between 1 and ${pageAmount})`;
		}
	}
	listMsg += `**Server List**`;
	for(var i = 0; i < perPage; i++) {
		var index = ((page - 1) * perPage) + i;
		var guild = guilds[index];
		if(guilds.length - 1 === index || i === perPage - 1) {
			listMsg += `\n **╚ ${index + 1})** ${guild.name} - ${guild.memberCount} members`;
			break;
		} else {
			listMsg += `\n **╠ ${index + 1})** ${guild.name} - ${guild.memberCount} members`;
		}
	}
	listMsg += `\n**Page ${page}/${pageAmount}**`;
	return listMsg;
}, [], `List all servers of Oxyl (${perPage}/page)`, "[page]");
