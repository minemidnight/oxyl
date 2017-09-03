const modLog = require("../../modules/modLog.js");

module.exports = {
	process: async message => {
		let mutedRole = await bot.utils.getMutedRole(message);
		if(typeof mutedRole === "string") return mutedRole;

		if(message.args[1]) {
			let guild = message.channel.guild;
			let channel = await modLog.channel(guild);
			let trackedList = await r.table("settings").get(["modLog.track", guild.id]).run();
			if(channel && trackedList && ~trackedList.value.indexOf(mutedRole.id)) {
				modLog.presetReasons[guild.id] = { mod: message.author, reason: message.args[1] };
			}
		}

		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return __("phrases.notInGuild", message);
		let isMuted = ~member.roles.indexOf(mutedRole.id);
		if(isMuted) {
			await member.removeRole(mutedRole.id, message.args[1]);
			return __("commands.moderator.mute.unmuted", message, { user: member.user.username });
		} else {
			await member.addRole(mutedRole.id, message.args[1]);
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
