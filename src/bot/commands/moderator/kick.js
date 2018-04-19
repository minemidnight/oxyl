const modLog = require("../../modules/modLog");

module.exports = {
	async run({
		args: [user, reason = "Unspecified"], author, guild,
		message: { member: authorMember }, t,
		wiggle: { erisClient: client }, wiggle
	}) {
		if(!guild.members.get(client.user.id).permission.has("kickMembers")) return t("commands.kick.botNoPerms");

		const member = guild.members.get(user.id);
		if(!member) return t("errors.userNotInGuild");
		else if(!member.kickable) return t("commands.kick.botCantKick");
		else if(!member.punishable(authorMember)) return t("commands.kick.youCantKick");

		modLog.kick({
			punished: user,
			guild,
			responsible: author,
			reason
		}, wiggle);

		await client.kickGuildMember(guild.id, user.id, reason);
		return t("commands.kick", { user: `${user.username}#${user.discriminator}` });
	},
	guildOnly: true,
	perm: "kickMembers",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
