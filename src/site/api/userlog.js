const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const canManage = require("./middleware/canManage");
const expectedBody = require("./middleware/expectedBody");
const hasGuild = require("./middleware/hasGuild");
router.param("guild", canManage());
router.param("guild", hasGuild());

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

router.put("/:guild(\\d{17,21})", expectedBody({
	enabled: Boolean,
	channelID: "string?",
	greeting: "string?",
	greetingDM: "boolean?",
	farewell: "string?"
}), async (req, res) => {
	const { r } = req.app.locals;

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
