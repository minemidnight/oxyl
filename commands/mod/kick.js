function isKickable(member, executor) {
	let guild = member.guild;
	let executorMember = guild.members.get(executor);

	let highestExecutor = executorMember.roles.length >= 1 ?
		executorMember.roles.map(role => guild.roles.get(role)).sort((a, b) => b.position - a.position)[0] :
		guild.roles.get(guild.id);
	let highestMember = member.roles.length >= 1 ?
		member.roles.map(role => guild.roles.get(role)).sort((a, b) => b.position - a.position)[0] :
		guild.roles.get(guild.id);

	if(member.id === guild.ownerID) return false;
	else if(member.id === highestExecutor.id) return false;
	else if(highestExecutor.position === highestMember.position) return highestMember.id - highestExecutor.id > 0;
	else return highestExecutor.position - highestMember.position > 0;
}

exports.cmd = new Oxyl.Command("kick", async message => {
	let kickPerms = message.channel.guild.members.get(bot.user.id).permission.has("kickMembers");

	if(!kickPerms) {
		return "Oxyl does not have permissions to kick members.";
	} else {
		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return "Error: user not in server";

		let kickableBot = isKickable(member, bot.user.id);
		let kickable = isKickable(member, message.author.id);
		if(!kickableBot) {
			return `${framework.unmention(member)} couldn't be kicked (has higher permissions than Oxyl)`;
		} else if(!kickable) {
			return `${framework.unmention(member)} couldn't be kicked (you do not have sufficient permissions)`;
		} else {
			if(message.args[1]) {
				let modChannel = await Oxyl.modScripts.modLog.modChannel(message.channel.guild);
				if(modChannel) {
					Oxyl.modScripts.modLog.reasons[message.channel.guild.id] = {
						mod: message.author,
						reason: message.args[1]
					};
				}
			}

			message.channel.guild.kickMember(message.args[0].id);
			Oxyl.modScripts.modLog.createCase(message.channel.guild, 2, message.args[0]);
			return `${framework.unmention(member)} has been kicked`;
		}
	}
}, {
	perm: "kickMembers",
	guildOnly: true,
	type: "moderator",
	description: "Kick a user from the guild",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
});
