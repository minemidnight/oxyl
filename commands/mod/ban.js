const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("ban", (message, bot) => {
	var mention = message.mentions.users.first();
	var banPerms = message.guild.member(bot.user).hasPermission("BAN_MEMBERS");
	if(!mention) {
		return "please mention the user you would like banned.";
	} else if(!banPerms) {
		return "Oxyl does not have permissions to ban any user.";
	} else {
		var bannable = message.guild.member(mention).bannable;
		if(!bannable) {
			return `${mention} could not ban be banned because they have a higher role`;
		} else {
			message.guild.ban(mention);
			return `${mention} has been banned`;
		}
	}
}, {
	type: "moderator",
	description: "Ban a user from the guild",
	args: [{ type: "mention" }]
});
