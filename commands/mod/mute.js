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

function getMutedRole(guild) {
	let botMember = guild.members.get(bot.user.id);
	let mutedRole = guild.roles.find(role => role.name.toLowerCase() === "muted");
	let rolePerms = botMember.permissions.has("manageRoles");
	return new Promise((resolve, reject) => {
		if(!mutedRole && !rolePerms) {
			reject("Oxyl does not have the permission to create and configure the muted role.");
		} else if(!mutedRole) {
			guild.createRole().then(role => {
				role.edit({
					name: "Muted",
					permissions: 0,
					color: "0xDF4242"
				});
				let channels = guild.channels.filter(channel => channel.type === 0);
				channels.forEach(channel => bot.editChannelPermission(channel.id, role.id, 0, 2048, "role"));
				resolve(role);
			});
		} else if(!rolePerms) {
			reject("Oxyl does not have permissions to add roles");
		}
	});
}

var command = new Command("mute", (message) => {
	getMutedRole(message.guild).then(mutedRole => {
		let mention = message.guild.members.get(message.args[0].id);
		let isMuted = mention.roles.indexOf(mutedRole.id);
		if(isMuted === -1) {
			mention.addRole(mutedRole.id);
			message.channel.sendMessage(`${framework.unmention(mention)} has been muted`);
		} else {
			mention.removeRole(mutedRole.id);
			message.channel.sendMessage(`${framework.unmention(mention)} has been unmuted`);
		}
	}).catch(reason => message.channel.createMessage(reason));
}, {
	perm: "manageRoles",
	guildOnly: true,
	type: "moderator",
	description: "Toggle a person's mute state in the guild (for text chat)",
	args: [{
		type: "user",
		label: "user"
	}]
});
