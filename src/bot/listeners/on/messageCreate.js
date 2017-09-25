const commands = require("../../modules/commands.js");
const handleCensor = require("../../modules/censors.js");

module.exports = async message => {
	if(message.author.bot || !message.member) return;
	if(message.channel.guild) {
		await handleCensor(message);
		message.locale = bot.localeCache.get(message.author.id) || bot.localeCache.get(message.channel.guild.id) || "en";
	} else {
		message.locale = bot.localeCache.get(message.author.id) || "en";
	}

	if(bot.ignoredChannels.has(message.channel.id) &&
		!(message.member.permission.has("administrator") || message.author.id === message.channel.guild.ownerID)) return;
	else commands(message);
};
