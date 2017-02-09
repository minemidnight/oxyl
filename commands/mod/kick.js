function isKickable(member) {
	let guild = member.guild;
	let botMember = guild.members.get(Oxyl.bot.user.id);

	let highestBot = botMember.roles.length >= 1 ?
		botMember.roles.map(role => guild.roles.get(role)).sort((a, b) => b.position - a.position)[0] :
		guild.roles.get(guild.id);
	let highestMember = member.roles.length >= 1 ?
		member.roles.map(role => guild.roles.get(role)).sort((a, b) => b.position - a.position)[0] :
		guild.roles.get(guild.id);

	if(member.id === guild.ownerID) return false;
	else if(member.id === botMember.id) return false;
	else if(highestBot.position === highestMember.position) return highestMember.id - highestBot.id > 0;
	else return highestBot.position - highestMember.position > 0;
}

exports.cmd = new Oxyl.Command("kick", async message => {
	let kickPerms = message.channel.guild.members.get(bot.user.id).permission.has("kickMembers");

	if(!kickPerms) {
		return "Oxyl does not have permissions to kick.";
	} else {
		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return "Error -- user not found";
		let kickable = isKickable(member);
		if(!kickable) {
			return `${framework.unmention(member)} couldn't be kicked (has higher permissions)`;
		} else {
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
	args: [{ type: "user" }]
});
