const { getWarns } = require("../../modules/warnings");

module.exports = {
	async run({ args: [member, page = 1], client, guild, r, t }) {
		const warns = await getWarns(member, r);
		if(!warns.length) return t("commands.warns.noWarnings");
		else if(page > Math.ceil(warns.length / 5)) page = Math.ceil(warns.length / 5);

		return t("commands.warns", {
			username: member.username,
			warns: warns.slice((page - 1) * 5, ((page - 1) * 5) + 5).map(warning => {
				const warner = client.users.has(warning.warnerID) ?
					client.users.get(warning.warnerID).username :
					warning.warnerID;

				return `${warning.id} - ${warning.reason} (warner: ${warner})`;
			}).join("\n"),
			page,
			pageCount: Math.ceil(warns.length / 5)
		});
	},
	guildOnly: true,
	aliases: ["warnings"],
	args: [{ type: "member" }, {
		type: "int",
		label: "page",
		min: 1,
		optional: true
	}]
};
