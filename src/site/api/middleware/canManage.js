const { discordAuth } = require("../oauth");

module.exports = () => async (req, res, next, guild) => {
	const guilds = await discordAuth.info(res.locals.token, "/users/@me/guilds");

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
};
