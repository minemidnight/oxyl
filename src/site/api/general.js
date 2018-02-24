const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

const getChannels = require("./getChannels");

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const channels = await getChannels(req.params.guild);

	const prefix = await r.table("prefixes")
		.get(req.params.guild)
		.default({ value: "o!", overwrite: false })
		.pluck("value", "overwrite")
		.run();

	const suggestions = await r.table("suggestions")
		.get(req.params.guild)
		.default({ enabled: false, channelID: null })
		.pluck("enabled", "channelID")
		.run();

	res.status(200).json({ channels, prefix, suggestions });
});

router.put("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	if(typeof req.body.prefix !== "object") {
		res.status(400).json({ error: "No prefix object or invalid prefix data" });
		return;
	} else if(typeof req.body.prefix.value !== "string") {
		res.status(400).json({ error: "No prefix value object or invalid prefix data" });
		return;
	} else if(typeof req.body.prefix.overwrite !== "boolean") {
		res.status(400).json({ error: "No prefix overwrite or invalid overwrite data" });
		return;
	} else if(typeof req.body.suggestions !== "object") {
		res.status(400).json({ error: "No suggestions object or invalid suggestions data" });
		return;
	} else if(typeof req.body.suggestions.enabled !== "boolean") {
		res.status(400).json({ error: "No suggestions enabled or invalid suggestions enabled data" });
		return;
	} else if(typeof req.body.suggestions.channelID !== "string") {
		res.status(400).json({ error: "No suggestions channel ID overwrite or invalid suggestions channel ID data" });
		return;
	}

	if(req.body.prefix === "o!") {
		await r.table("prefixes")
			.get(req.params.guild)
			.delete()
			.run();
	} else {
		await r.table("prefixes")
			.insert({
				id: req.params.guild,
				value: req.body.prefix.value,
				overwrite: req.body.prefix.overwrite,
				escaped: req.body.prefix.value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
			}, { conflict: "replace" })
			.run();
	}

	await r.table("suggestions")
		.insert({
			guildID: req.params.guild,
			enabled: req.body.suggestions.enabled,
			channelID: req.body.suggestions.channelID
		});

	res.status(204).end();
});
