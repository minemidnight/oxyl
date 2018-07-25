const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const canManage = require("./middleware/canManage");
const expectedBody = require("./middleware/expectedBody");
const hasGuild = require("./middleware/hasGuild");
router.param("guild", canManage());
router.param("guild", hasGuild());

const { discordAuth } = require("./oauth");

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const scripts = await r.table("oxylscriptSettings")
		.getAll(req.params.guild, { index: "guildID" })
		.map(doc => ({
			scriptID: doc("scriptID"),
			name: r.table("oxylscript").get(doc("scriptID")).getField("name").coerceTo("string"),
			event: doc("id")(2)
		}))
		.run();

	const { id } = await discordAuth.info(res.locals.token, "/users/@me");
	const userscripts = await r.table("oxylscript")
		.getAll(id, { index: "creatorID" })
		.pluck("id", "name")
		.run();

	res.status(200).json({ scripts, userscripts });
});

router.put("/:guild(\\d{17,21})", expectedBody({
	scriptID: String,
	event: String
}), async (req, res) => {
	const { r } = req.app.locals;

	const script = await r.table("oxylscript")
		.get(req.body.scriptID)
		.default({})
		.pluck("id", "name", "creatorID")
		.run();

	if(!script.id) {
		res.status(400).json({ error: "Script does not exist" });
		return;
	}

	const { id } = await discordAuth.info(res.locals.token, "/users/@me");
	if(script.creatorID !== id) {
		res.status(403).json({ error: "User trying to add script does not own it" });
		return;
	} else {
		delete script.creatorID;
	}

	await r.table("oxylscriptSettings")
		.insert({
			id: [req.params.guild, req.body.scriptID, req.body.event],
			guildID: req.params.guild,
			scriptID: req.body.scriptID
		})
		.run();

	script.event = req.body.event;
	res.status(200).json({ script });
});

router.delete("/:guild(\\d{17,21})", expectedBody({
	scriptID: String,
	event: String
}), async (req, res) => {
	const { r } = req.app.locals;

	const { deleted } = await r.table("oxylscriptSettings")
		.get([req.params.guild, req.body.scriptID, req.body.event])
		.delete()
		.run();

	if(!deleted) {
		res.status(400).json({ error: "Script does not exist" });
		return;
	}

	res.status(204).end();
});
