function isBannable(member) {
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

exports.cmd = new Oxyl.Command("ban", async message => {
	let banPerms = message.channel.guild.members.get(bot.user.id).permission.has("banMembers");

	if(!banPerms) {
		return "Oxyl does not have permissions to ban.";
	} else {
		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return "Error -- user not found";
		let bannable = isBannable(member);
		if(!bannable) {
			return `${framework.unmention(member)} couldn't be banned (has higher permissions)`;
		} else {
			message.channel.guild.banMember(message.args[0].id);
			return `${framework.unmention(member)} has been banned`;
		}
	}
}, {
	perm: "banMembers",
	guildOnly: true,
	type: "moderator",
	description: "Ban a user from the guild",
	args: [{ type: "user" }]
});
