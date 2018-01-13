const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

const getChannels = require("./getChannels");
const getRoles = require("./getRoles");

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const channels = await getChannels(req.params.guild);
	const roles = await getRoles(req.params.guild);

	const data = await r.table("modLogSettings")
		.get(req.params.guild)
		.default({ enabled: false, tracked: [] })
		.without("id")
		.run();

	res.status(200).json(Object.assign(data, { channels, roles }));
});

router.put("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	if(typeof req.body.enabled !== "boolean") {
		res.status(400).json({ error: "No enabled or invalid enabled data" });
		return;
	} else if(typeof req.body.channelID !== "string") {
		res.status(400).json({ error: "No channel id or invalid channel id data" });
		return;
	} else if(!Array.isArray(req.body.tracked) || req.body.tracked.some(roleID => typeof roleID !== "string")) {
		res.status(400).json({ error: "No tracked or invalid tracked data" });
		return;
	}

	await r.table("modLogSettings")
		.insert({
			id: req.params.guild,
			enabled: req.body.enabled,
			channelID: req.body.channelID,
			tracked: req.body.tracked
		}, { conflict: "replace" })
		.run();

	res.status(204).end();
});
