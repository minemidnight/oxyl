const { getWarns } = require("../../modules/warnings");

module.exports = {
	async run({ args: [user, page = 1], guild, wiggle: { erisClient, locals: { r } }, t }) {
		const member = guild.members.get(user.id);
		if(!member) return t("errors.userNotInGuild");

		const warns = await getWarns(member, r);
		if(!warns.length) return t("commands.warns.noWarnings");
		else if(page > Math.ceil(warns.length / 5)) page = Math.ceil(warns.length / 5);

		return t("commands.warns", {
			username: user.username,
			warns: warns.slice((page - 1) * 5, ((page - 1) * 5) + 5).map(warning => {
				const warner = erisClient.users.has(warning.warnerID) ?
					erisClient.users.get(warning.warnerID).username :
					warning.warnerID;

				return `${warning.id} - ${warning.reason} (warner: ${warner})`;
			}).join("\n"),
			page,
			pageCount: Math.ceil(warns.length / 5)
		});
	},
	guildOnly: true,
	aliases: ["warnings"],
	args: [{ type: "user" }, {
		type: "int",
		label: "page",
		min: 1,
		optional: true
	}]
};
