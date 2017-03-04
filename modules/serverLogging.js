function updateServerChannel() {
	bot.editChannel(framework.config.channels.servers, { topic: `Server Count: ${bot.guilds.size}` });
}

bot.on("guildCreate", async guild => {
	Oxyl.postStats();
	let owner = bot.users.get(guild.ownerID);
	let botcount = guild.members.filter(gM => gM.user.bot).length;

	framework.consoleLog(`<:vpGreenTick:257437292820561920> ${guild.name} (\`${guild.id}\`)\n` +
		`Owned by ${framework.unmention(owner)}\n` +
		`Members: ${guild.memberCount} - Users: ${guild.memberCount - botcount} - ` +
		`Bots: ${botcount} - Percent: ${((botcount / guild.memberCount) * 100).toFixed(2)}`, "servers");
	updateServerChannel();
});

bot.on("guildDelete", async guild => {
	Oxyl.postStats();
	let owner = bot.users.get(guild.ownerID);
	let botcount = guild.members.filter(gM => gM.user.bot).length;

	framework.consoleLog(`<:vpRedTick:257437215615877129> ${guild.name} (\`${guild.id}\`)\n` +
		`Owned by ${framework.unmention(owner)}\n` +
		`Members: ${guild.memberCount} - Users: ${guild.memberCount - botcount} - ` +
		`Bots: ${botcount} - Percent: ${((botcount / guild.memberCount) * 100).toFixed(2)}`, "servers");
	updateServerChannel();

	Oxyl.modScripts.sqlQueries.clearGuildData(guild);
});
