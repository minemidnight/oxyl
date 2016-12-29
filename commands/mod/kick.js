const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

function isKickable(member, guild) {
	let botMember = guild.members.get(Oxyl.bot.user.id);
	let highestRoleBot = Math.max(botMember.roles.map(role => guild.roles.get(role).position));
	let highestRoleMember = Math.max(member.roles.map(role => guild.roles.get(role).position));
	if(member.id === guild.ownerID) return false;
	else if(member.id === botMember.id) return false;
	else return highestRoleBot > highestRoleMember;
}

var command = new Command("kick", (message, bot) => {
	var kickPerms = message.channel.permissionsOf(bot.user.id).has("kickMembers");

	if(!kickPerms) {
		return "Oxyl does not have permissions to kick.";
	} else {
		let member = message.guild.members.get(message.args[0].id);
		let kickable = isKickable(member, message.guild);
		if(!kickable) {
			return `${framework.unmention(member)} couldn't be kicked (has higher permissions)`;
		} else {
			message.guild.member(message.args[0]).kick();
			return `${member.mention()} has been kicked`;
		}
	}
}, {
	perm: "kickMembers",
	guildOnly: true,
	type: "moderator",
	description: "Kick a user from the guild",
	args: [{
		type: "user",
		label: "user"
	}]
});
