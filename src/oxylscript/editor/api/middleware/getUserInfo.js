const { discordAuth } = require("../oauth");

module.exports = () => async (req, res, next) => {
	try {
		res.locals.token = JSON.parse(req.headers.authorization);
	} catch(err) {
		return res.status(400).json({ error: "Authorization not JSON", redirect: { name: "home" } });
	}

	try {
		let user = await discordAuth.info(res.locals.token, "/users/@me");
		if(user.token) {
			res.locals.token = user.token;
			res.set("New-Token", JSON.stringify(user.token));
			user = user.info;
		}

		res.locals.user = user;
		return next();
	} catch(err) {
		return res.status(401).json({ error: "Invalid token", redirect: { name: "home" } });
	}
};
