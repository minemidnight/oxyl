const modLog = require("../../modules/modLog");

module.exports = {
	async run({
		args: [member, reason = "Unspecified"], author, client, guild,
		member: authorMember, t, wiggle
	}) {
		if(!guild.members.get(client.user.id).permission.has("banMembers")) return t("commands.ban.botNoPerms");

		if(member) {
			if(!member.bannable) return t("commands.ban.botCantBan");
			else if(!member.punishable(authorMember)) return t("commands.ban.youCantBan");
		}

		await modLog.ban({
			punished: member.user,
			guild,
			responsible: author,
			reason
		}, wiggle);

		await client.banGuildMember(guild.id, member.id, 7, reason);
		await client.unbanGuildMember(guild.id, member.id, reason);
		return t("commands.ban.softban", { user: `${member.username}#${member.discriminator}` });
	},
	guildOnly: true,
	perm: "banMembers",
	args: [{ type: "member" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
