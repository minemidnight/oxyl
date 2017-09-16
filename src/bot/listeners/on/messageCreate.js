const commands = require("../../modules/commands.js");
module.exports = message => {
	if(message.channel.guild) {
		message.locale = bot.localeCache.get(message.author.id) || bot.localeCache.get(message.channel.guild.id) || "en";
	} else {
		message.locale = bot.localeCache.get(message.author.id) || "en";
	}

	if(message.author.bot || !message.member) return;
	else if(bot.ignoredChannels.has(message.channel.id) &&
		!(message.member.permission.has("administrator") || message.author.id === message.channel.guild.ownerID)) return;
	else commands(message);
};
