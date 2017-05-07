const modLog = require("../../modules/modLog.js");
async function getMutedRole(message) {
	const guild = message.channel.guild;
	let botMember = guild.members.get(bot.user.id);
	let mutedRole = guild.roles.find(role => role.name.toLowerCase() === __("words.muted", guild));

	if(mutedRole && !bot.utils.canAddRole(guild, mutedRole)) {
		return __("commands.moderator.mute.roleError", message);
	} else if(!mutedRole) {
		let rolePerms = botMember.permission.has("manageRoles");
		let channelPerms = botMember.permission.has("manageChannels");
		if(!rolePerms && !channelPerms) {
			return __("commands.moderator.mute.missingBothPerms", message);
		} else if(!rolePerms) {
			return __("commands.moderator.mute.missingRolePerms", message);
		} else if(!channelPerms) {
			return __("commands.moderator.mute.missingChannelPerms", message);
		} else {
			mutedRole = await guild.createRole({
				name: __("words.muted", guild, {}, true),
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
		let mutedRole = await getMutedRole(message);
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
		if(!member) return __("phrases.notInGuild", message);
		let isMuted = ~member.roles.indexOf(mutedRole.id);
		if(isMuted) {
			await member.removeRole(mutedRole.id);
			return __("commands.moderator.mute.unmuted", message, { user: member.user.username });
		} else {
			await member.addRole(mutedRole.id);
			return __("commands.moderator.mute.muted", message, { user: member.user.username });
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
