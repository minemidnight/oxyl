const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

function isKickable(member) {
	let guild = member.guild;
	let botMember = guild.members.get(Oxyl.bot.user.id);
	let highestRoleBot = Math.max(botMember.roles.map(role => guild.roles.get(role).position));
	let highestRoleMember = Math.max(member.roles.map(role => guild.roles.get(role).position));
	if(member.id === guild.ownerID) return false;
	else if(member.id === botMember.id) return false;
	else return highestRoleBot > highestRoleMember;
}

var command = new Command("kick", async (message, bot) => {
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
