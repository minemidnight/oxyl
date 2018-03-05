const oauth = require("../../oauth/index");

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
			return res.status(400).json({ error: "Oxyl not in guild", redirect: { name: "invite" } });
		} else {
			return next();
		}
	},
	async canManage(req, res, next, guild) {
		let auth;
		try {
			auth = JSON.parse(req.headers.authorization);
		} catch(err) {
			return res.status(400).json({ error: "Authorization not JSON", redirect: { name: "selector" } });
		}

		try {
			let guilds = await oauth.info(auth, "/users/@me/guilds");
			if(guilds.token) {
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
