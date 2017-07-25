const excludedTables = ["blacklist", "musicCache", "timedEvents"];
const statPoster = require("../../modules/statPoster.js");
module.exports = async guild => {
	let tables = await r.tableList().run();
	for(let table of tables) {
		let indexes = await r.table(table).indexList().run();
		if(~indexes.indexOf("guildID")) r.table(table).getAll(guild.id, { index: "guildID" }).delete().run();
		else r.table(table).filter({ guildID: guild.id }).delete().run();
	}

	if(bot.config.bot.serverChannel) {
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
			await bot.createMessage(bot.config.bot.serverChannel, content);
		} catch(err) {
			console.error(`Failed to send message to server log: ${err.message}`);
		}
	}

	statPoster();
};
