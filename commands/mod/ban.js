const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("ban", (message, bot) => {
	let banPerms = message.guild.member(bot.user).hasPermission("BAN_MEMBERS");

	if(!banPerms) {
		return "Oxyl does not have permissions to ban any user.";
	} else {
		let bannable = message.guild.member(message.args[0]).bannable;
		if(!bannable) {
			return `${message.args[0]} could not ban be banned because they have a higher role`;
		} else {
			message.guild.ban(message.args[0]);
			return `${message.args[0]} has been banned`;
		}
	}
}, {
	type: "moderator",
	description: "Ban a user from the guild",
	args: [{
		type: "user",
		label: "user"
	}]
});
