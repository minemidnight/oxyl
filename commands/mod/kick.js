const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("kick", (message, bot) => {
	var kickPerms = message.guild.member(bot.user).hasPermission("KICK_MEMBERS");

	if(!kickPerms) {
		return "Oxyl does not have permissions to kick any user";
	} else {
		let kickable = message.guild.member(message.args[0]).kickable;
		if(!kickable) {
			return `${message.args[0]} could not be kicked because they have a higher role`;
		} else {
			message.guild.member(message.args[0]).kick();
			return `${message.args[0]} has been kicked`;
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
