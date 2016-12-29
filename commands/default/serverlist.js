const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const perPage = framework.config.options.commands.serverListPerPage;

var command = new Command("serverlist", (message, bot) => {
	let guilds = bot.guilds.array().sort((a, b) => b.memberCount - a.memberCount);
	let page = 1 || message.args[0];
	let pageAmount = Math.ceil(guilds.length / perPage);
	if(page > pageAmount) page = pageAmount;
	let listMsg = `**Server List:**`, guildsPage = [];

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
}, {
	type: "default",
	description: "List all servers of Oxyl",
	args: [{
		type: "int",
		label: "page",
		min: 1,
		optional: true
	}]
});
