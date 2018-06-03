const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const canManage = require("./middleware/canManage");
const expectedBody = require("./middleware/expectedBody");
const hasGuild = require("./middleware/hasGuild");
router.param("guild", canManage());
router.param("guild", hasGuild());

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const settings = await r.table("musicSettings")
		.get(req.params.guild)
		.default({ musicMessages: true, voteSkip: false, songLength: 0 })
		.without("id")
		.run();

	res.status(200).json(settings);
});

router.put("/:guild(\\d{17,21})", expectedBody({
	musicMessages: Boolean,
	voteSkip: Boolean,
	songLength: Number
}), async (req, res) => {
	const { r } = req.app.locals;

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
