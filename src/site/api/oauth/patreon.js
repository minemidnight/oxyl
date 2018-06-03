const { discordAuth, patreonAuth } = require("../oauth");
const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

router.get("/clientid", async (req, res) => {
	res.status(200).json({ clientID: patreonAuth.clientID });
});

router.post("/callback", async (req, res) => {
	const { r } = req.app.locals;

	if(!req.body.code) {
		res.status(400).json({ error: "No code", redirect: { name: "dashboard_premium" } });
		return;
	} else if(!req.body.discordToken) {
		res.status(400).json({ error: "No discord token", redirect: { name: "dashboard_premium" } });
		return;
	}

	let user;
	try {
		user = await discordAuth.info(req.body.discordToken, "/users/@me");

		if(user.token) {
			res.set("New-Token", JSON.stringify(user.token));
			user = user.info;
		}
	} catch(err) {
		res.status(400).json({ error: "Invalid discord token", redirect: { name: "accounts" } });
		return;
	}

	let token;
	try {
		token = await patreonAuth.token(req.body.code);
	} catch(err) {
		res.status(400).json({ error: "Invalid code", redirect: { name: "dashboard_premium" } });
		return;
	}

	const patreonInfo = await patreonAuth.info(token, "current_user");
	const oxylPledge = patreonInfo.data.relationships.pledges.data
		.find(pledge => pledge.relations.creator.id === "5374558" && !pledge.attributes.is_paused);
	await r.table("discordPatreonLink")
		.insert({
			id: user.id,
			patreonID: patreonInfo.data.id,
			premiumServers: 0,
			pledge: oxylPledge ? oxylPledge.amount_cents : 0,
			token
		})
		.run();

	res.status(204).end();
});
