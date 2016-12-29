const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("purge", (message, bot) => {
	let deletePerms = message.channel.permissionsOf(bot.user.id).has("manageMessages"),
		mentions = message.mentions.users;
	if(!deletePerms) {
		message.channel.createMessage("Oxyl does not have permissions to delete messages")
		.then(msg => msg.delete(3000));
	} else {
		message.delete().then(() => {
			message.channel.purge(message.args[0], msg => {
				if(mentions && mentions.length >= 1 && mentions.includes(message.author)) {
					return true;
				} else if(!mentions || mentions.length === 0) {
					return true;
				} else {
					return false;
				}
			});
		});
	}
}, {
	perm: "manageMessages",
	guildOnly: true,
	type: "moderator",
	aliases: [],
	description: "Delete up to 2500 messages by all users or a list of users",
	args: [{
		type: "int",
		min: 1,
		max: 2500,
		label: "amount"
	}, {
		type: "custom",
		optional: true,
		label: "mentions"
	}]
});
