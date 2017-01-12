const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

function isBannable(member) {
	let guild = member.guild;
	let botMember = guild.members.get(Oxyl.bot.user.id);
	let highestRoleBot = Math.max(botMember.roles.map(role => guild.roles.get(role).position));
	let highestRoleMember = Math.max(member.roles.map(role => guild.roles.get(role).position));
	if(member.id === guild.ownerID) return false;
	else if(member.id === botMember.id) return false;
	else return highestRoleBot > highestRoleMember;
}

var command = new Command("ban", (message, bot) => {
	let banPerms = message.channel.permissionsOf(bot.user.id).has("banMembers");

	if(!banPerms) {
		return "Oxyl does not have permissions to ban.";
	} else {
		let member = message.guild.members.get(message.args[0].id);
		if(!member) return "Error -- user not found";
		let bannable = isBannable(member);
		if(!bannable) {
			return `${framework.unmention(member)} couldn't be banned (has higher permissions)`;
		} else {
			message.guild.banMember(message.args[0].id);
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
