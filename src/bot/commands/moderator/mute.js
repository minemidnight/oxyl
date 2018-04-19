const modLog = require("../../modules/modLog");

async function getMutedRole(message) {
	const guild = message.channel.guild;
	const botMember = guild.members.get(bot.user.id);
	let mutedRole = guild.roles.find(role => role.name.toLowerCase() === "muted");

	if(mutedRole && !mutedRole.addable) {
		return message.t("commands.mute.cantAdd");
	} else if(!mutedRole) {
		const rolePerms = botMember.permission.has("manageRoles");
		const channelPerms = botMember.permission.has("manageChannels");
		if(!rolePerms && !channelPerms) {
			return message.t("commands.mute.bothPerms");
		} else if(!rolePerms) {
			return message.t("commands.mute.rolePerms");
		} else if(!channelPerms) {
			return message.t("commands.mute.channelPerms");
		} else {
			mutedRole = await guild.createRole({
				name: "Muted",
				permissions: 0,
				color: 0xDF4242
			});

			guild.channels
				.filter(channel => channel.type === 0)
				.forEach(channel => channel.editPermission(mutedRole.id, 0, 2048, "role", "Configure Muted Role")
					.catch(err => { })); // eslint-disable-line handle-callback-err, no-empty-function
			return mutedRole;
		}
	} else {
		return mutedRole;
	}
}

module.exports = {
	async run({
		args: [user, reason = "Unspecified"], author, flags: { time }, guild,
		message, message: { member: authorMember }, t,
		wiggle: { erisClient: client }, wiggle
	}) {
		const mutedRole = await getMutedRole(message);
		if(typeof mutedRole === "string") return mutedRole;

		const member = guild.members.get(user.id);
		if(!member) return t("errors.userNotInGuild");
		else if(!member.punishable(authorMember)) return t("commands.mute.cantPunish");

		if(~member.roles.indexOf(mutedRole.id)) {
			modLog.removeRole({
				punished: user,
				guild,
				responsible: author,
				reason,
				role: mutedRole
			}, wiggle);

			await member.removeRole(mutedRole.id, message.args[1]);
			return t("commands.mute.unmuted", { user: `${user.username}#${user.discriminator}` });
		}

		modLog.addRole({
			punished: user,
			guild,
			responsible: author,
			reason,
			time,
			role: mutedRole
		}, wiggle);

		if(time) {
			return t("commands.mute.tempmute", { user: `${user.username}#${user.discriminator}` });
		} else {
			await member.addRole(mutedRole.id, message.args[1]);
			return t("commands.mute.muted", { user: `${user.username}#${user.discriminator}` });
		}
	},
	guildOnly: true,
	perm: "kickMembers",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}],
	flags: [{
		name: "time",
		short: "t",
		type: "timespan"
	}]
};
