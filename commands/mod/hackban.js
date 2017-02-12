exports.cmd = new Oxyl.Command("hackban", async message => {
	let banPerms = message.channel.guild.members.get(bot.user.id).permission.has("banMembers");

	if(!banPerms) {
		return "Oxyl does not have permissions to ban members.";
	} else if(message.args[0].match(/\d{17,21}/) === undefined) {
		return "Invalid user id";
	} else {
		let member = message.channel.guild.members.get(message.args[0]);
		if(member) return "That user is in the guild, please ban them normally!";

		if(message.args[1]) {
			let modChannel = await Oxyl.modScripts.modLog.modChannel(message.channel.guild);
			if(modChannel) {
				Oxyl.modScripts.modLog.reasons[message.channel.guild.id] = {
					mod: message.author,
					reason: message.args[1]
				};
			}
		}

		bot.banGuildMember(message.channel.guild.id, message.args[0], 7);
		return `${bot.users.has(message.args[0]) ? bot.users.get(message.args[0]).username : `\`${message.args[0]}\``} has been banned`;
	}
}, {
	perm: "banMembers",
	guildOnly: true,
	type: "moderator",
	description: "Ban a user not in the guild by ID",
	args: [{
		type: "text",
		label: "user id"
	}, {
		type: "text",
		label: "reason",
		optional: true
	}]
});
