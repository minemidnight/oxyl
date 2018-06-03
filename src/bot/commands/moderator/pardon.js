const { pardon } = require("../../modules/warnings");

module.exports = {
	async run({ args: [warningID, reason = "Unspecified"], author, guild, t, wiggle }) {
		const warning = await wiggle.locals.r.table("warnings").get(warningID).run();
		if(!warning) return t("commands.pardon.invalidWarning");
		else if(warning.guildAndUserID[0] !== guild.id) return t("commands.pardon.wrongGuild");

		const member = guild.members.get(warning.guildAndUserID[1]);
		if(!member) return t("errors.userNotInGuild");

		await pardon(member, reason, warningID, author, wiggle);
		return t("commands.pardon.pardoned", { user: `${member.username}#${member.discriminator}`, warningID });
	},
	guildOnly: true,
	perm: "banMembers",
	args: [{
		type: "text",
		label: "warning id"
	}, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
