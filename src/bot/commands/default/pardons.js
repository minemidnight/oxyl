const { getPardons } = require("../../modules/warnings");

module.exports = {
	async run({ args: [user, page = 1], guild, wiggle: { erisClient, locals: { r } }, t }) {
		const member = guild.members.get(user.id);
		if(!member) return t("errors.userNotInGuild");

		const pardons = await getPardons(member, r);
		if(!pardons.length) return t("commands.pardons.noPardons");
		else if(page > Math.ceil(pardons.length / 5)) page = Math.ceil(pardons.length / 5);

		return t("commands.pardons", {
			username: user.username,
			pardons: pardons.slice((page - 1) * 5, ((page - 1) * 5) + 5).map(pardon => {
				const warner = erisClient.users.has(pardon.warning.warnerID) ?
					erisClient.users.get(pardon.warning.warnerID).username :
					pardon.warning.warnerID;

				const pardoner = erisClient.users.has(pardon.pardonerID) ?
					erisClient.users.get(pardon.pardonerID).username :
					pardon.pardonerID;

				return `Original Warning: ${pardon.warning.reason} (warner: ${warner})\n` +
					`Pardon: ${pardon.reason} (pardoner: ${pardoner})`;
			}).join("\n\n"),
			page,
			pageCount: Math.ceil(pardons.length / 5)
		});
	},
	guildOnly: true,
	args: [{ type: "user" }, {
		type: "int",
		label: "page",
		min: 1,
		optional: true
	}]
};
