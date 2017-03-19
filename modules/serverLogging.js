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

	guild.defaultChannel.createMessage("Thanks for adding Oxyl to your server! Here how to get started:" +
		"\n❓ `Run `o!help` to get a list of commands. Oxyl also supports @Oxyl#7994 or `oxyl` as prefixes." +
		"\n⚙ Feeling like configuring the bot? Use the dashboard at <http://minemidnight.work>" +
		"\n🎵 Like music? Use the `play` command to start to queue music!" +
		"\n💰 Feeling generous? Donate at <http://patreon.com/minemidnight>" +
		"\n📎 Need support, or want to be notified about updates? Join Oxyl's Server at http://discord.gg/9wkTDcE"
	);
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
