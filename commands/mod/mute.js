const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const bot = Oxyl.bot;

bot.on("channelCreate", (channel) => {
	if(channel.type !== 0) return;
	let mutedRole = channel.guild.roles.find(role => role.name.toLowerCase() === "muted");
	let rolePerms = channel.permissionsOf(bot.user.id).has("manageRoles");
	if(mutedRole && rolePerms) bot.editChannelPermission(channel.id, mutedRole.id, 0, 2048, "role");
});

var command = new Command("mute", (message) => {
	let guild = message.guild;
	if(!guild) return "This command can only be used in guilds";

	let mutedRole = message.channel.guild.roles.find(role => role.name.toLowerCase() === "muted");
	let rolePerms = message.channel.permissionsOf(bot.user.id).has("manageRoles");
	if(!mutedRole && !rolePerms) {
		return "Oxyl does not have the permission to create and configure the muted role.";
	} else if(!mutedRole) {
		console.log("role made");
		message.guild.createRole({ name: "Muted", color: "#DF4242", permissions: [] }).then(role => {
			let channels = message.guild.channels.filter(channel => channel.type === 0);
			channels.forEach(channel => bot.editChannelPermission(channel.id, role.id, 0, 2048, "role"));
		});
	} else if(!rolePerms) {
		return "Oxyl does not have permissions to add roles";
	}

	let mention = message.guild.members.get(message.args[0].id);
	let isMuted = mention.roles.indexOf(mutedRole.id);
	if(isMuted === -1) {
		mention.addRole(mutedRole.id);
		return `${mention.mention} has been muted`;
	} else {
		mention.removeRole(mutedRole.id);
		return `${mention.mention} has been unmuted`;
	}
}, {
	type: "moderator",
	description: "Toggle a person's mute state in the guild (for text chat)",
	args: [{
		type: "user",
		label: "user"
	}]
});
