const crypto = require("crypto");
const superagent = require("superagent");
const { updateMember: syncGroupRole } = require("../../modules/syncGroupRole");

module.exports = {
	async run({ args: [username], author, guild, member, r, t }) {
		const settings = await r.table("robloxVerification")
			.get(guild.id)
			.default({ enabled: false })
			.without("id")
			.run();

		if(!settings.enabled) return t("commands.verify.disabled");
		const hash = crypto.createHash("md4").update(author.id).digest("hex");
		const { body: { success, Id: userID, Username: name } } = await superagent
			.get("https://api.roblox.com/users/get-by-username")
			.query({ username });

		if(success === false) return t("commands.verify.invalidAccount");
		const alreadyVerified = await r.table("robloxVerified")
			.get([guild.id, author.id])
			.default(false)
			.run();

		if(alreadyVerified) return t("commands.verify.alreadyVerified");

		const { text: html } = await superagent.get(`https://www.roblox.com/users/${userID}/profile`);
		let [, status] = html.match(/data-statustext=(".+?"|[^\s]+)/);
		if(status.startsWith(`"`) && status.endsWith(`"`)) status = status.slice(1, -1);
		const [, about] = html.match(/<span .*?class=".*?profile-about-content-text.*?".*?>(.+?)<\/span>/);

		if(about.indexOf(hash) || ~status.includes(hash)) {
			if(settings.setNickname) member.edit({ nick: name }).catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function, max-len
			member.addRole(settings.roleID, "Verified ROBLOX Account").catch(err => { }); // eslint-disable-line handle-callback-err, no-empty-function, max-len

			await r.table("robloxVerified")
				.insert({
					id: [guild.id, author.id],
					guildID: guild.id,
					username: name,
					userID
				})
				.run();

			syncGroupRole(member, userID, settings.groupID);
			return t("commands.verify.verified", { name });
		} else {
			return t("commands.verify.noHash", { hash });
		}
	},
	guildOnly: true,
	aliases: ["verify"],
	args: [{
		type: "text",
		label: "roblox username"
	}]
};
