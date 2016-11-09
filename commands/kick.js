const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js");

Oxyl.registerCommand("kick", "moderator", (message, bot) => {
	var mention = message.mentions.users.first();
	var kickPerms = message.guild.member(bot.user).hasPermission("KICK_MEMBERS");
	if(mention === null) {
		return "please mention the user you would like kicked";
	} else if(!kickPerms) {
		return "Oxyl does not have permissions to kick any user";
	} else {
		var kickable = message.guild.member(mention).kickable;
		if(!kickable) {
			return `${mention} could not be banned because they have a higher role`;
		} else {
			message.guild.member(mention).kick();
			return `${mention} has been kicked`;
		}
	}
}, [], "Kick a user from the guild", "<mention>");
