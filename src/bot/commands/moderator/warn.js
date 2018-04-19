const { warn } = require("../../modules/warnings");

module.exports = {
	async run({
		args: [user, reason = "Unspecified"], author, guild,
		message: { member: authorMember }, t,
		wiggle: { erisClient: client }, wiggle
	}) {
		const member = guild.members.get(user.id);
		if(member && !member.punishable(authorMember)) {
			return t("commands.warn.noPermission");
		} else if(!member) {
			return t("errors.userNotInGuild");
		}

		const warnCount = await warn(member, reason, author, wiggle);
		return t("commands.warn.warned", { user: `${user.username}#${user.discriminator}`, warnCount });
	},
	guildOnly: true,
	perm: "banMembers",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
