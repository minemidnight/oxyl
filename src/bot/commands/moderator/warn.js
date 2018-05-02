const { warn } = require("../../modules/warnings");

module.exports = {
	async run({
		args: [member, reason = "Unspecified"], author,
		message: { member: authorMember }, t, wiggle
	}) {
		if(member && !member.punishable(authorMember)) {
			return t("commands.warn.noPermission");
		}

		const warnCount = await warn(member, reason, author, wiggle);
		return t("commands.warn.warned", { user: `${member.username}#${member.discriminator}`, warnCount });
	},
	guildOnly: true,
	perm: "banMembers",
	args: [{ type: "member" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
