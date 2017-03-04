function isBannable(member, executor) {
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

exports.cmd = new Oxyl.Command("ban", async message => {
	let banPerms = message.channel.guild.members.get(bot.user.id).permission.has("banMembers");

	if(!banPerms) {
		return "Oxyl does not have permissions to ban members.";
	} else {
		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return "Error -- user not found";

		let bannableBot = isBannable(member, bot.user.id);
		let bannable = isBannable(member, message.author.id);
		if(!bannableBot) {
			return `${framework.unmention(member)} couldn't be banned (has higher permissions than Oxyl)`;
		} else if(!bannable) {
			return `${framework.unmention(member)} couldn't be banned (you do not have sufficient permissions)`;
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

			message.channel.guild.banMember(message.args[0].id, 7);
			return `${framework.unmention(member)} has been banned`;
		}
	}
}, {
	perm: "banMembers",
	guildOnly: true,
	type: "moderator",
	description: "Ban a user from the guild",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
});
