const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js"),
	Oxyl = require("../../oxyl.js");
const router = express.Router(); // eslint-disable-line new-cap

router.get("*", async (req, res) => {
	let ip = main.getIp(req), data = {};
	let guild = req.path.substring(1);

	if(Oxyl.bot.guilds.has(guild)) {
		guild = Oxyl.bot.guilds.get(guild);
		guild.subname = guild.name.split(" ").map(str => str.charAt(0)).join("");
		guild.owner = guild.members.get(guild.ownerID);
		guild.onlineCount = guild.members.filter(gM => gM.status === "online").length;
		guild.botCount = guild.members.filter(gM => gM.bot).length;
		guild.botPercent = ((guild.botCount / guild.memberCount) * 100).toFixed(2);
		guild.userCount = guild.memberCount - guild.botCount;
		guild.userPercent = ((guild.userCount / guild.memberCount) * 100).toFixed(2);
		data.guild = guild;

		if(main.tokens[ip]) {
			let user = await main.getInfo(main.tokens[ip], "users/@me");
			if(guild.members.get(user.id) && framework.guildLevel(guild.members.get(user.id)) >= 1) data.panel = true;
		}
	}

	res.send(await main.parseHB("guild", req, data));
});

module.exports = router;
