const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js");
const router = express.Router(); // eslint-disable-line new-cap

router.get("/", async (req, res) => {
	let data = {};
	if(main.tokens[req.sessionID]) {
		let guilds = await main.getInfo(req.sessionID, "users/@me/guilds");
		guilds = guilds.filter(guild => Oxyl.bot.guilds.has(guild.id));
		guilds.forEach(guild => {
			guild.subname = guild.name.split(" ").map(str => str.charAt(0)).join("");
		});
		data.guilds = guilds;
	}

	res.send(await main.parseHB("select", req, data));
	res.end();
});

module.exports = router;
