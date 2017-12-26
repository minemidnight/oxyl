const modLog = require("../../modules/modLog");

module.exports = {
	async run({
		args: [user, reason], author, flags: { time, deleteDays },
		guild, message: { member: authorMember }, t,
		wiggle: { erisClient: client }
	}) {
		if(!guild.members.get(client.id).permission.has("banMembers")) return t("commands.ban.botNoPerms");

		const member = guild.members.get(user.id);
		if(member) {
			if(!member.bannable) return t("commands.ban.botCantBan");
			else if(!member.punishable(authorMember)) return t("commands.ban.youCantBan");
		}


		modLog.ban({
			banned: user,
			command: true,
			guild,
			responsible: author,
			reason,
			time
		});

		await client.banGuildMember(guild.id, user.id, deleteDays, reason);
		return t("commands.ban", { user: `${user.username}#${user.discriminator}` });
	},
	guildOnly: true,
	perm: "banMembers",
	args: [{ type: "user" }, {
		type: "text",
		label: "reason",
		optional: true
	}],
	flags: [{
		name: "time",
		short: "t",
		type: "timespan"
	}, {
		name: "deleteDays",
		short: "d",
		type: "int",
		min: 0,
		max: 7,
		default: 7
	}]
};
