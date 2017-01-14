const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js");
const router = express.Router(); // eslint-disable-line new-cap

router.get("*", async (req, res) => {
	let ip = main.getIp(req), data = {};
	let user = req.path.substring(1);

	if(Oxyl.bot.users.has(user)) {
		user = Oxyl.bot.users.get(user);
		user.username = user.username;
		user.avatar = user.avatarURL;
		user.guildCount = Oxyl.bot.guilds.filter(guild => guild.members.has(user.id));
		data.viewUser = user;

		if(main.tokens[ip]) {
			let loggedUser = await main.getInfo(main.tokens[ip], "users/@me");
			if(loggedUser.id === user.id) data.desc = true;
		}
	}

	res.send(await main.parseHB("user", req, data));
});

module.exports = router;
