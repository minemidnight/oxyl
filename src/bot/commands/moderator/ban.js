const modLog = require("../../modules/modLog");

module.exports = {
	async run({
		args: [user, reason], author, flags: { time, deleteDays, softban },
		guild, message: { member: authorMember }, t,
		wiggle: { erisClient: client }, wiggle
	}) {
		if(!guild.members.get(client.user.id).permission.has("banMembers")) return t("commands.ban.botNoPerms");

		const member = guild.members.get(user.id);
		if(member) {
			if(!member.bannable) return t("commands.ban.botCantBan");
			else if(!member.punishable(authorMember)) return t("commands.ban.youCantBan");
		}

		modLog.ban({
			punished: user,
			command: true,
			guild,
			responsible: author,
			reason,
			time
		}, wiggle);

		await client.banGuildMember(guild.id, user.id, deleteDays, reason);
		if(softban) {
			await client.unbanGuildMember(guild.id, user.id, reason);
			return t("commands.ban.softban", { user: `${user.username}#${user.discriminator}` });
		} else if(time) {
			return t("commands.tempban", { user: `${user.username}#${user.discriminator}` });
		} else {
			return t("commands.ban", { user: `${user.username}#${user.discriminator}` });
		}
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
	}, {
		name: "softban",
		short: "s",
		aliases: ["soft"],
		type: "boolean",
		default: false
	}]
};
