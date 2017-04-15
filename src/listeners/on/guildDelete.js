const excludedTables = ["blacklist", "musicCache", "timedEvents"];
const statPoster = require("../../modules/statPoster.js");
module.exports = async guild => {
	let tables = await r.tableList().run();
	tables.forEach(table => r.table(table).filter({ guildID: guild.id }).delete());

	if(bot.publicConfig.serverChannel) {
		let owner = bot.users.get(guild.ownerID);
		let botCount = guild.members.filter(member => member.bot).length;
		let botPercent = ((botCount / guild.memberCount) * 100).toFixed(2);
		let userCount = guild.memberCount - botCount;
		let userPercent = ((userCount / guild.memberCount) * 100).toFixed(2);

		let content = "❌ LEFT GUILD ❌\n";
		content += `Guild: ${guild.name} (${guild.id})\n`;
		content += `Owner: ${owner.username}#${owner.discriminator} (${owner.id})\n`;
		content += `Members: ${guild.memberCount} **|** `;
		content += `Users: ${userCount} (${userPercent}%) **|** `;
		content += `Bots: ${botCount} (${botPercent}%)`;

		try {
			await bot.createMessage(bot.publicConfig.serverChannel, content);
		} catch(err) {
			console.error(`Failed to send message to server log: ${err.message}`);
		}
	}

	statPoster();
};
