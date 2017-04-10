const commands = require("../../modules/commands.js");
module.exports = message => {
	if(message.author.bot) return;
	else if(bot.ignoredChannels.has(message.channel.id) &&
		!(message.member.permission.has("administrator") || message.author.id === message.channel.guild.ownerID)) return;
	else commands(message);
};
