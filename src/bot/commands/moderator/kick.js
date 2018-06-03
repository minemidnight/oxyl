const modLog = require("../../modules/modLog");

module.exports = {
	async run({
		args: [member, reason = "Unspecified"], author, client,
		guild, member: authorMember, t, wiggle
	}) {
		if(!guild.members.get(client.user.id).permission.has("kickMembers")) return t("commands.kick.botNoPerms");

		if(!member.kickable) return t("commands.kick.botCantKick");
		else if(!member.punishable(authorMember)) return t("commands.kick.youCantKick");

		await modLog.kick({
			punished: member.user,
			guild,
			responsible: author,
			reason
		}, wiggle);

		await client.kickGuildMember(guild.id, member.id, reason);
		return t("commands.kick", { user: `${member.username}#${member.discriminator}` });
	},
	guildOnly: true,
	perm: "kickMembers",
	args: [{ type: "member" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
