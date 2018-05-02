const { getPardons } = require("../../modules/warnings");

module.exports = {
	async run({ args: [member, page = 1], client, guild, wiggle: { locals: { r } }, t }) {
		const pardons = await getPardons(member, r);
		if(!pardons.length) return t("commands.pardons.noPardons");
		else if(page > Math.ceil(pardons.length / 5)) page = Math.ceil(pardons.length / 5);

		return t("commands.pardons", {
			username: member.username,
			pardons: pardons.slice((page - 1) * 5, ((page - 1) * 5) + 5).map(pardon => {
				const warner = client.users.has(pardon.warning.warnerID) ?
					client.users.get(pardon.warning.warnerID).username :
					pardon.warning.warnerID;

				const pardoner = client.users.has(pardon.pardonerID) ?
					client.users.get(pardon.pardonerID).username :
					pardon.pardonerID;

				return `Original Warning: ${pardon.warning.reason} (warner: ${warner})\n` +
					`Pardon: ${pardon.reason} (pardoner: ${pardoner})`;
			}).join("\n\n"),
			page,
			pageCount: Math.ceil(pardons.length / 5)
		});
	},
	guildOnly: true,
	args: [{ type: "member" }, {
		type: "int",
		label: "page",
		min: 1,
		optional: true
	}]
};
