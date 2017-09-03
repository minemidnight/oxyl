const Duration = require("duration-js");
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
				modLog.presetReasons[guild.id] = { mod: message.author, reason: message.args[2] };
			}
		}

		let time = message.args[1].trim()
			.replace(/weeks?/g, "w")
			.replace(/days?/g, "d")
			.replace(/hours?/g, "h")
			.replace(/minutes?/g, "m")
			.replace(/seconds?/g, "s")
			.replace(/milliseconds?/g, "ms")
			.replace(/ /g, "");

		try {
			var duration = new Duration(time);
			duration = duration.milliseconds();
		} catch(err) {
			return err.message;
		}

		let member = message.channel.guild.members.get(message.args[0].id);
		if(!member) return __("phrases.notInGuild", message);
		let isMuted = ~member.roles.indexOf(mutedRole.id);
		if(!~member.roles.indexOf(mutedRole.id)) await member.addRole(mutedRole.id, message.args[1]);

		let date = Date.now();
		await r.table("timedEvents").insert({
			type: "tempmute",
			date: date + duration,
			guildID: message.channel.guild.id,
			memberID: member.id,
			mutedRole: mutedRole.id
		}).run();

		return __("commands.moderator.mute.tempMuted", message, {
			user: member.user.username,
			date: bot.utils.formatDate(date + duration)
		});
	},
	guildOnly: true,
	perm: "manageRoles",
	description: "Mute someone in the server for a said amount of time",
	args: [{ type: "user" }, {
		type: "text",
		label: "duration"
	}, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
