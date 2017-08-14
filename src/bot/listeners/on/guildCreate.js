const statPoster = require("../../modules/statPoster.js");
module.exports = async guild => {
	let defaultChannel = guild.channels.filter(channel => channel.type === 0)
		.sort((a, b) => a.position - b.position)
		.find(channel => channel.permissionsOf(bot.user.id).has("readMessages") &&
			channel.permissionsOf(bot.user.id).has("sendMessages"));

	if(bot.config.beta) {
		let donator = await r.db("Oxyl").table("donators").get(guild.ownerID).run();
		if(!donator) {
			if(defaultChannel) {
				await defaultChannel.createMessage("You are not a donator, you cannot use Oxyl Beta!")
				.catch(err => {}); // eslint-disable-line
			}

			guild.leave();
		}
		return;
	}

	let joinMessage = "Thanks for adding Oxyl to your server! Here is how to get started:\n";
	joinMessage += "❓ Run `o!help` to get a list of commands.";
	joinMessage += `Oxyl also supports ${bot.user.mention} or \`oxyl\` as prefixes.\n`;
	joinMessage += "⚙ Feeling like configuring the bot? Use the dashboard at <http://minemidnight.work>.\n";
	joinMessage += "🎵 Like music? Use the `play` command to start to queue music!\n";
	joinMessage += "💰 Feeling generous? Donate at <http://patreon.com/minemidnight>.\n";
	joinMessage += "📎 Need support, or want to be notified about updates? ";
	joinMessage += "Join Oxyl's Server at http://discord.gg/9wkTDcE";
	if(defaultChannel) defaultChannel.createMessage(joinMessage);

	if(bot.config.bot.serverChannel) {
		let owner = bot.users.get(guild.ownerID);
		let botCount = guild.members.filter(member => member.bot).length;
		let botPercent = ((botCount / guild.memberCount) * 100).toFixed(2);
		let userCount = guild.memberCount - botCount;
		let userPercent = ((userCount / guild.memberCount) * 100).toFixed(2);

		let content = "✅ JOINED GUILD ✅\n";
		content += `Guild: ${guild.name} (${guild.id})\n`;
		content += `Owner: ${owner.username}#${owner.discriminator} (${owner.id})\n`;
		content += `Members: ${guild.memberCount} **|** `;
		content += `Users: ${userCount} (${userPercent}%) **|** `;
		content += `Bots: ${botCount} (${botPercent}%)`;

		try {
			await bot.createMessage(bot.config.bot.serverChannel, content);
		} catch(err) {
			console.error(`Failed to send message to server log: ${err.message}`);
		}
	}

	statPoster();
};
