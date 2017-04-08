const modLog = require("../../modules/modLog.js");
async function getMutedRole(guild) {
	let botMember = guild.members.get(bot.user.id);
	let mutedRole = guild.roles.find(role => role.name.toLowerCase() === "muted");

	if(mutedRole && !bot.utils.canAddRole(guild, mutedRole)) {
		return "Either I do not have permissions, or the muted role's position is higher than mine!";
	} else if(!mutedRole) {
		let rolePerms = botMember.permission.has("manageRoles");
		let channelPerms = botMember.permission.has("manageChannels");
		if(!rolePerms && !channelPerms) {
			return "I do not have permissions to create and configure a Muted role " +
				"(needed: `Manage Roles` and `Manage Channels`)";
		} else if(!rolePerms) {
			return "I do not have permissions to create the Muted role (needed: `Manage Roles`)";
		} else if(!channelPerms) {
			return "I cannot correctly configure the Muted role (needed: `Manage Channels`)";
		} else {
			mutedRole = await guild.createRole({
				name: "Muted",
				permissions: 0,
				color: 0xDF4242
			});
			mutedRole.editPosition(0);

			guild.channels
				.filter(ch => ch.type === 0)
				.forEach(ch => ch.editPermission(mutedRole.id, 0, 2048, "role"));
			return mutedRole;
		}
	} else {
		return mutedRole;
	}
}

module.exports = {
	process: async message => {
		let mutedRole = await getMutedRole(message.channel.guild);
		if(typeof mutedRole === "string") return mutedRole;

		if(message.args[1]) {
			let guild = message.channel.guild;
			let channel = await modLog.channel(guild);
			let trackedList = (await r.table("settings").filter({ guildID: guild.id, name: "modLog.track" }).run())[0];
			if(channel && trackedList && ~trackedList.value.indexOf(mutedRole.id)) {
				modLog.presetReasons[guild.id] = { mod: message.author, reason: message.args[1] };
			}
		}

		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return "Error: user not in server";
		let isMuted = ~member.roles.indexOf(mutedRole.id);
		if(isMuted) {
			await member.removeRole(mutedRole.id);
			return `${member.user.username} has been unmuted`;
		} else {
			await member.addRole(mutedRole.id);
			return `${member.user.username} has been muted`;
		}
	},
	guildOnly: true,
	perm: "manageRoles",
	description: "Toggle a person's mute state in the guild (for text chat)",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
