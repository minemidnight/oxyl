const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js");

Oxyl.registerCommand("purge", "moderator", (message, bot) => {
	var deletePerms = message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES"),
		args = message.content.split(" "),
		amt = parseInt(args[0]),
		mentions = message.mentions.users;
	if(!deletePerms) {
		return "Oxyl does not have permissions to delete messages.";
	} else if(isNaN(amt)) {
		return "Please provide the amount of messages you'd like to delete.";
	} else if(amt < 1) {
		return "Please provide an amount of messages to delete above 0.";
	} else if(mentions.length === 0) {
		message.delete();
		message.channel.fetchMessages({ limit: amt }).then(deleteMsgs => message.channel.bulkDelete(deleteMsgs));
	} else {
		message.delete();
		var deleteMessages = [];
		message.channel.fetchMessages({ limit: amt }).then((value) => {
			value = value.array();
			for(var i = 0; i < value.length; i++) {
				if(mentions.includes(value[i].author)) {
					deleteMessages.push(value[i]);
				}
				message.channel.bulkDelete(deleteMessages);
			}
		});
	}
	return false;
}, ["deletemessages"], "Delete up to messages by all users or a list of users", "<amount> [mentions]");
