const inGuild = require("./inGuild");

module.exports = () => async (req, res, next, guild) => {
	if(!await inGuild(guild)) {
		const url = `https://discordapp.com/oauth2/authorize?client_id=${req.app.locals.config.clientID}` +
			`&scope=bot&response_type=code&permissions=298183686&guild_id=${guild}` +
			`&redirect_uri=${encodeURIComponent(req.app.locals.config.dashboardURL)}`;

		return res.status(400).json({ error: "Oxyl not in guild", popup: { url } });
	} else {
		return next();
	}
};
