const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js");
const router = express.Router(); // eslint-disable-line new-cap

router.get("/", async (req, res) => {
	let ip = main.getIp(req), data = {};
	if(main.tokens[ip]) {
		let guilds = await main.getInfo(main.tokens[ip], "users/@me/guilds");
		guilds = guilds.filter(guild => Oxyl.bot.guilds.has(guild.id));
		guilds.forEach(guild => {
			guild.subname = guild.name.split(" ").map(str => str.charAt(0)).join("");
		});
		data.guilds = guilds;
	}

	res.send(await main.parseHB("select", req, data));
});

module.exports = router;
