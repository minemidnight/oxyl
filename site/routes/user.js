const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js");
const router = express.Router(); // eslint-disable-line new-cap

router.get("*", (req, res) => {
	let ip = main.getIp(req), context = {};
	let user = req.path.substring(1);

	if(Oxyl.bot.users.has(user)) {
		user = Oxyl.bot.users.get(user);
		user.username = user.username;
		user.avatar = user.avatarURL;
		user.guildCount = Oxyl.bot.guilds.filter(guild => guild.members.has(user.id));
		context.viewUser = user;

		if(main.tokens[ip]) {
			main.getInfo(main.tokens[ip], "users/@me")
			.then(loggedUser => {
				if(loggedUser.id === user.id) context.desc = true;
				main.parseHB("user", req, context)
				.then(hbs => res.send(hbs));
			});
		} else {
			main.parseHB("user", req, context)
			.then(hbs => res.send(hbs));
		}
	} else {
		main.parseHB("user", req, context)
		.then(hbs => res.send(hbs));
	}
});

module.exports = router;
