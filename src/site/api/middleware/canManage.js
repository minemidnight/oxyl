const { discordAuth } = require("../oauth");

module.exports = () => async (req, res, next, guild) => {
	try {
		res.locals.token = JSON.parse(req.headers.authorization);
	} catch(err) {
		return res.status(400).json({ error: "Authorization not JSON", redirect: { name: "selector" } });
	}

	try {
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
};
