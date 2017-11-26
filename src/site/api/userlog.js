const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

const getChannels = require("./getChannels");

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const channels = await getChannels(req.params.guild);

	const data = await r.table("userlog")
		.get(req.params.guild)
		.default({ enabled: false })
		.without("id")
		.run();

	res.status(200).json(Object.assign(data, { channels }));
});

router.put("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	if(typeof req.body.enabled !== "boolean") {
		res.status(400).json({ error: "No enabled or invalid enabled data" });
		return;
	} else if(req.body.channelID !== undefined && typeof req.body.channelID !== "string") {
		res.status(400).json({ error: "Invalid channel id data" });
		return;
	} else if(req.body.greeting !== undefined && typeof req.body.greeting !== "string") {
		res.status(400).json({ error: "Invalid greeting data" });
		return;
	} else if(req.body.greetingDM !== undefined && typeof req.body.greetingDM !== "boolean") {
		res.status(400).json({ error: "Invalid greeting dm data" });
		return;
	} else if(req.body.farewell !== undefined && typeof req.body.farewell !== "string") {
		res.status(400).json({ error: "Invalid farewell data" });
		return;
	}

	await r.table("userlog")
		.insert({
			id: req.params.guild,
			enabled: req.body.enabled,
			channelID: req.body.channelID,
			greeting: req.body.greeting.length ? req.body.greeting : undefined,
			greetingDM: req.body.greetingDM,
			farewell: req.body.farewell.length ? req.body.farewell : undefined
		}, { conflict: "replace" })
		.run();

	res.status(204).end();
});
