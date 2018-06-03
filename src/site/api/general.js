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

router.put("/:guild(\\d{17,21})", expectedBody({
	prefix: {
		value: String,
		overwrite: Boolean
	},
	suggestions: {
		enabled: Boolean,
		channelID: String
	}
}), async (req, res) => {
	const { r } = req.app.locals;

	if(req.body.prefix.value === "o!") {
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
		}, { conflict: "replace" });

	res.status(204).end();
});
