const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const { value, overwrite } = await r.table("prefixes")
		.get(req.params.guild)
		.default({ value: "o!", overwrite: false })
		.pluck("value", "overwrite")
		.run();

	res.status(200).json({ prefix: { value, overwrite } });
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

	res.status(204).end();
});
