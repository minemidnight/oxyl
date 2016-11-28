const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("purge", (message, bot) => {
	var deletePerms = message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES"),
		args = message.content.split(" "),
		amt = parseInt(args[0]),
		mentions = message.mentions.users;
	if(!deletePerms) {
		return "Oxyl does not have permissions to delete messages";
	} else if(isNaN(amt)) {
		return "please provide the amount of messages you'd like to delete";
	} else if(amt < 1) {
		return "[lease provide an amount of messages to delete above 0";
	} else if(amt > 100) {
		return "you can only delete up to 100 messages at a time";
	} else if(mentions.length === 0) {
		message.delete();
		message.channel.fetchMessages({ limit: amt }).then(deleteMsgs => message.channel.bulkDelete(deleteMsgs));
	} else {
		message.delete();
		message.channel.fetchMessages({ limit: amt }).then(messages => {
			if(mentions && mentions.size > 0) {
				messages = messages.filter(msg => mentions.array().includes(msg.author));
			}
			message.channel.bulkDelete(messages);
		});
	}
	return false;
}, {
	type: "moderator",
	aliases: ["deletemessages"],
	description: "Delete up to 100 messages by all users or a list of users",
	args: [{
		type: "int",
		min: 1,
		max: 100,
		label: "amount"
	}, {
		type: "mention",
		infinite: true,
		optional: true,
		label: "mentions"
	}]
});
