const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js");
const router = express.Router(); // eslint-disable-line new-cap

router.get("/", (req, res) => {
	let ip = main.getIp(req), context = {};
	if(main.tokens[ip]) {
		main.getInfo(main.tokens[ip], "users/@me/guilds")
		.then(guilds => {
			guilds = guilds.filter(guild => Oxyl.bot.guilds.has(guild.id));
			guilds.forEach(guild => {
				guild.subname = guild.name.split(" ").map(str => str.charAt(0)).join("");
			});
			context.guilds = guilds;

			main.parseHB("select", req, context)
			.then(hbs => {
				res.send(hbs);
			});
		});
	} else {
		main.parseHB("select", req)
		.then(hbs => {
			res.send(hbs);
			res.end();
		});
	}
});

module.exports = router;
