const { discordAuth } = require("../oauth");
const { inGuild } = require("../middleware");
const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

router.get("/clientid", async (req, res) => {
	res.status(200).json({ clientID: discordAuth.clientID });
});

router.get("/info", async (req, res) => {
	if(!req.query.path) {
		res.status(400).json({ error: "No path" });
		return;
	}

	let auth;
	try {
		auth = JSON.parse(req.headers.authorization);
	} catch(err) {
		res.status(400).json({ error: "Authorization not JSON", redirect: { name: "accounts" } });
		return;
	}

	try {
		let info = await discordAuth.info(auth, req.query.path);
		if(info.token) {
			res.set("New-Token", JSON.stringify(info.token));
			info = info.info;
		}

		if(Array.isArray(info) && info[0].permissions !== undefined && info[0].owner !== undefined) {
			for(const guild of info) {
				if(guild.owner || guild.permissions & 32) guild.needsInvite = !await inGuild(guild.id);
			}
		}

		res.status(200).json(info);
	} catch(err) {
		res.status(400).json({ error: "Invalid path or token", redirect: { name: "accounts" } });
		return;
	}
});

router.post("/callback", async (req, res) => {
	if(!req.body.code) {
		res.status(400).json({ error: "No code", redirect: { name: "accounts" } });
		return;
	}

	try {
		const token = await discordAuth.token(req.body.code);
		res.status(200).json(token);
	} catch(err) {
		res.status(400).json({ error: "Invalid code", redirect: { name: "accounts" } });
	}
});
