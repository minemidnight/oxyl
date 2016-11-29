const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("kick", (message, bot) => {
	var mention = message.mentions.users.first();
	var kickPerms = message.guild.member(bot.user).hasPermission("KICK_MEMBERS");
	if(!mention) {
		return "please mention the user you would like kicked";
	} else if(!kickPerms) {
		return "Oxyl does not have permissions to kick any user";
	} else {
		var kickable = message.guild.member(mention).kickable;
		if(!kickable) {
			return `${mention} could not be kicked because they have a higher role`;
		} else {
			message.guild.member(mention).kick();
			return `${mention} has been kicked`;
		}
	}
}, {
	type: "moderator",
	description: "Kick a user from the guild",
	args: [{
		type: "user",
		label: "user"
	}]
});
