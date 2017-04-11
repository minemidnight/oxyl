module.exports = async guild => {
	let joinMessage = "Thanks for adding Oxyl Beta to your server! Here is how to get started:\n";
	joinMessage += "❓ Run `ob!help` to get a list of commands.";
	joinMessage += `Oxyl Beta also supports ${bot.user.mention} or \`oxylb\` as prefixes.\n`;
	joinMessage += "⚙ Feeling like configuring the bot? Use the dashboard at <http://beta.minemidnight.work>.\n";
	joinMessage += "🎵 Like music? Use the `play` command to start to queue music!\n";
	joinMessage += "💰 Feeling generous? Donate at <http://patreon.com/minemidnight>.\n";
	joinMessage += "📎 Need support, or want to be notified about updates? ";
	joinMessage += "Join Oxyl's Server at http://discord.gg/9wkTDcE";
	guild.defaultChannel.createMessage(joinMessage);

	if(bot.publicConfig.channels.servers) {
		let owner = bot.users.get(guild.ownerID);
		let botCount = guild.members.filter(member => member.bot).length;
		let botPercent = ((botCount / guild.memberCount) * 100).toFixed(2);
		let userCount = guild.memberCount - botCount;
		let userPercent = ((userCount / guild.memberCount) * 100).toFixed(2);

		let content = "⬜ JOINED GUILD ⬜\n";
		content += `Guild: ${guild.name} (${guild.id})\n`;
		content += `Owner: ${owner.username}#${owner.discriminator} (${owner.id})\n`;
		content += `Members: ${guild.memberCount} **|** `;
		content += `Users: ${userCount} (${userPercent}%) **|** `;
		content += `Bots: ${botCount} (${botPercent}%)`;

		try {
			await bot.createMessage(bot.publicConfig.channels.servers, content);
		} catch(err) {
			console.err(`Failed to send message to server log: ${err.message}`);
		}
	}

	let guilds = (await process.output({
		type: "globalEval",
		input: () => bot.guilds.size
	})).results.reduce((a, b) => a + b);
	statsd({ type: "gauge", stat: "guilds", value: guilds });
};
