const { clientID, dashboardURL } = require("../../../config");

async function inGuild(id) {
	return await process.output({
		op: "eval",
		target: "guild",
		targetValue: id,
		input: "return context.client.erisClient.guilds.has(message.targetValue)"
	});
}

module.exports = {
	async hasGuild(req, res, next, guild) {
		if(!await inGuild(guild)) {
			const url = `https://discordapp.com/oauth2/authorize?client_id=${clientID}&scope=bot&response_type=code` +
				`&permissions=298183686&redirect_uri=${encodeURIComponent(dashboardURL)}&guild_id=${guild}`;

			return res.status(400).json({ error: "Oxyl not in guild", popup: { url } });
		} else {
			return next();
		}
	},
	async canManage(req, res, next, guild) {
		try {
			res.locals.token = JSON.parse(req.headers.authorization);
		} catch(err) {
			return res.status(400).json({ error: "Authorization not JSON", redirect: { name: "selector" } });
		}

		try {
			const { discordAuth } = require("./oauth"); // circular deps if i don't require inside function ;(

			let guilds = await discordAuth.info(res.locals.token, "/users/@me/guilds");
			if(guilds.token) {
				res.locals.token = guilds.token;
				res.set("New-Token", JSON.stringify(guilds.token));
				guilds = guilds.info;
			}

			guild = guilds.find(({ id }) => id === guild);
			if(!guild) {
				return res.status(400).json({ error: "User not in server", redirect: { name: "selector" } });
			} else if(!guild.owner && !(guild.permissions & 32)) {
				return res.status(400).json({
					error: "User does not have permission to Manage Guild",
					redirect: { name: "selector" }
				});
			} else {
				return next();
			}
		} catch(err) {
			return res.status(401).json({ error: "Invalid token", redirect: { name: "selector" } });
		}
	}
};

Object.entries(module.exports).forEach(([key, value]) => module.exports[key] = () => value);
module.exports.inGuild = inGuild;
