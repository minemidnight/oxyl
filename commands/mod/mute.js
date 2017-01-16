const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const bot = Oxyl.bot;

bot.on("channelCreate", (channel) => {
	if(channel.type !== 0) return;
	let mutedRole = channel.guild.roles.find(role => role.name.toLowerCase() === "muted");
	let rolePerms = channel.guild.members.get(bot.user.id).permission.has("manageRoles");
	if(mutedRole && rolePerms) bot.editChannelPermission(channel.id, mutedRole.id, 0, 2048, "role");
});

async function getMutedRole(guild) {
	let botMember = guild.members.get(bot.user.id);
	let mutedRole = guild.roles.find(role => role.name.toLowerCase() === "muted");
	let rolePerms = botMember.permission.has("manageRoles");
	if(!mutedRole && !rolePerms) {
		return "Oxyl does not have the permission to create and configure the muted role.";
	} else if(!mutedRole) {
		let role = await guild.createRole();
		role = await role.edit({
			name: "Muted",
			permissions: 0,
			color: 0xDF4242
		});
		role.editPosition(0);

		let channels = guild.channels.filter(channel => channel.type === 0);
		channels.forEach(channel => bot.editChannelPermission(channel.id, role.id, 0, 2048, "role"));
		return role;
	} else if(!rolePerms) {
		return "Oxyl does not have permissions to add roles";
	} else {
		return mutedRole;
	}
}

var command = new Command("mute", async (message) => {
	let mutedRole = await getMutedRole(message.channel.guild);

	if(typeof mutedRole !== "object") return mutedRole;

	let mention = message.channel.guild.members.get(message.args[0].id);
	let isMuted = mention.roles.indexOf(mutedRole.id);
	if(isMuted === -1) {
		mention.addRole(mutedRole.id);
		return `${framework.unmention(mention)} has been muted`;
	} else {
		mention.removeRole(mutedRole.id);
		return `${framework.unmention(mention)} has been unmuted`;
	}
}, {
	perm: "manageRoles",
	guildOnly: true,
	type: "moderator",
	description: "Toggle a person's mute state in the guild (for text chat)",
	args: [{ type: "user" }]
});
