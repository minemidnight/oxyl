const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const bot = Oxyl.bot;

bot.on("channelCreate", (channel) => {
	const mutedRole = channel.guild.roles.find("name", "Muted");
	if(mutedRole) { channel.overwritePermissions(mutedRole, { SEND_MESSAGES: false }); }
});

var command = new Command("mute", (message) => {
	let guild = message.guild;
	let mention = message.mentions.users.first();

	var rolePerms = message.guild.member(bot.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS");
	if(!mention) {
		return "please mention the user you would like muted.";
	} else {
		var checkRole = guild.roles.find(role => role.name.toLowerCase() === "muted");
		if(!checkRole && !rolePerms) {
			return "Oxyl does not have the permission to create and configure the muted role.";
		} else if(!checkRole) {
			message.guild.createRole({ name: "Muted", color: "#DF4242", permissions: [] }).then((role) => {
				var channels = message.guild.channels.filter(ch => ch.type === "text").array();
				for(var i = 0; i < channels.length; i++) {
					channels[i].overwritePermissions(role, { SEND_MESSAGES: false });
				}
			});
		} if(!rolePerms) {
			return "Oxyl does not have permissions to mute any user.";
		} else {
			var addRole = guild.roles.find(role => role.name.toLowerCase() === "muted");
			var isMuted = message.guild.member(mention).roles.find(role => role.name.toLowerCase() === "muted");
			if(isMuted) {
				message.guild.member(mention).removeRole(addRole);
				return `${mention} has been muted`;
			} else {
				message.guild.member(mention).addRole(addRole);
				return `${mention} has been unmuted`;
			}
		}
	}
}, {
	type: "moderator",
	description: "Toggle a person's mute state in the guild (for text chat)",
	args: [{ type: "mention" }]
});
