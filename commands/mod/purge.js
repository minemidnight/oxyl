const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("purge", (message, bot) => {
	let deletePerms = message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES"), mentions = message.mentions.users;
	if(!deletePerms) {
		message.channel.sendMessage("Oxyl does not have permissions to delete messages")
		.then(msg => msg.delete(3000));
	} else if(!mentions || mentions.size === 0) {
		message.delete();
		message.channel.fetchMessages({ limit: message.args[0] })
		.then(messages => {
			message.channel.bulkDelete(messages);
		});
	} else {
		message.delete();
		message.channel.fetchMessages({ limit: message.args[0] }).then(messages => {
			messages = messages.filter(msg => mentions.array().includes(message.author));
			message.channel.bulkDelete(messages);
		});
	}
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
		type: "custom",
		optional: true,
		label: "mentions"
	}]
});
