const modLog = require("../../modules/modLog");

module.exports = {
	async run({
		args: [user, reason = "Unspecified"], author, guild, message: { member: authorMember },
		t, wiggle: { erisClient: client }, wiggle
	}) {
		if(!guild.members.get(client.user.id).permission.has("banMembers")) return t("commands.ban.botNoPerms");

		const member = guild.members.get(user.id);
		if(member) {
			if(!member.bannable) return t("commands.ban.botCantBan");
			else if(!member.punishable(authorMember)) return t("commands.ban.youCantBan");
		} else {
			t("errors.userNotInGuild");
		}

		modLog.ban({
			punished: user,
			guild,
			responsible: author,
			reason
		}, wiggle);

		await client.banGuildMember(guild.id, user.id, 7, reason);
		await client.unbanGuildMember(guild.id, user.id, reason);
		return t("commands.ban.softban", { user: `${user.username}#${user.discriminator}` });
	},
	guildOnly: true,
	perm: "banMembers",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}]
};
