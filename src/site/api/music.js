const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const settings = await r.table("musicSettings")
		.get(req.params.guild)
		.default({ musicMessages: true, voteSkip: false, songLength: 0 })
		.without("id")
		.run();

	res.status(200).json(settings);
});

router.put("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	if(typeof req.body.musicMessages !== "boolean") {
		res.status(400).json({ error: "No music messages or invalid music messages data" });
		return;
	} else if(typeof req.body.voteSkip !== "boolean") {
		res.status(400).json({ error: "No vote skip or invalid vote skip data" });
		return;
	} else if(typeof req.body.songLength !== "number") {
		res.status(400).json({ error: "No song length or invalid song length data" });
		return;
	}

	await r.table("musicSettings")
		.insert({
			id: req.params.guild,
			musicMessages: req.body.musicMessages,
			voteSkip: req.body.voteSkip,
			songLength: req.body.songLength
		}, { conflict: "replace" })
		.run();

	res.status(204).end();
});
