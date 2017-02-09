const express = require("express"),
	main = require("../website.js");
const router = express.Router(); // eslint-disable-line new-cap

async function getDesc(user) {
	let query = `SELECT \`VALUE\` FROM \`Description\` WHERE \`USER\` = '${user}'`;
	let data = await framework.dbQuery(query);

	if(data && data[0]) return data[0].VALUE;
	else return "None set";
}

async function resetDesc(user) {
	return await framework.dbQuery(`DELETE FROM \`Description\` WHERE \`USER\` = '${user}'`);
}

async function setDesc(user, value) {
	if(value === "None set") return false;

	let desc = await getDesc(user);
	if(desc === "None set") return await framework.dbQuery(`INSERT INTO \`Description\`(\`USER\`, \`VALUE\`) VALUES ('${user}',${framework.sqlEscape(value)})`);
	else return await framework.dbQuery(`UPDATE \`Description\` SET \`VALUE\`=${framework.sqlEscape(value)} WHERE \`USER\` = '${user}'`);
}

router.get("/update", async (req, res) => {
	res.redirect("http://minemidnight.work/user/");
	res.end();
});

router.post("/update", async (req, res) => {
	if(main.tokens[req.sessionID]) {
		let loggedUser = await main.getInfo(req.sessionID, "users/@me");

		if(req.body.reset) await resetDesc(loggedUser.id);
		else if(req.body.desc) await setDesc(loggedUser.id, req.body.desc);
		res.redirect(`http://minemidnight.work/user/${loggedUser.id}`);
		res.end();
	} else {
		res.redirect(`http://minemidnight.work/user`);
		res.end();
	}
});

router.get("*", async (req, res) => {
	let data = {};
	let user = req.path.substring(1);

	if(bot.users.has(user)) {
		user = bot.users.get(user);
		user.shared = bot.guilds.filter(guild => guild.members.has(user.id)).length;
		user.description = await getDesc(user.id);
		data.viewUser = user;

		if(main.tokens[req.sessionID]) {
			let loggedUser = await main.getInfo(req.sessionID, "users/@me");
			if(loggedUser.id === user.id) data.desc = true;
		}
	}

	res.send(await main.parseHB("user", req, data));
	res.end();
});

module.exports = router;
