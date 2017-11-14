const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const reddits = await r.table("feeds").getAll(req.params.guild, { index: "guildID" })
		.filter(r.row("id")(0).eq("reddit")).run();

	res.status(200).json({ subreddits: reddits });
});
