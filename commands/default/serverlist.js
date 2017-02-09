exports.cmd = new Oxyl.Command("serverlist", async message => {
	// convert to array
	let guilds = bot.guilds.map(guild => guild);
	guilds.sort((a, b) => b.memberCount - a.memberCount);
	let page = message.args[0] || 1;
	let pageAmount = Math.ceil(guilds.length / 15);
	if(page > pageAmount) page = pageAmount;
	let listMsg = `**Server List:**`, guildsPage = [];

	for(var i = 0; i < 15; i++) {
		var index = ((page - 1) * 15) + i;
		var guild = guilds[index];
		guildsPage.push(`**${index + 1})** ${guild.name} - ${guild.memberCount} members (\`${guild.id}\`)`);
		if(guilds.length - 1 === index || i === 14) break;
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
