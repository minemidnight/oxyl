const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

const getRoles = require("./getRoles");

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const roles = await getRoles(req.params.guild);

	const data = await r.table("robloxVerification")
		.get(req.params.guild)
		.default({ enabled: false, setNickname: true })
		.without("id")
		.run();

	res.status(200).json(Object.assign(data, { roles }));
});

router.put("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	if(typeof req.body.enabled !== "boolean") {
		res.status(400).json({ error: "No enabled or invalid enabled data" });
		return;
	} else if(typeof req.body.setNickname !== "boolean") {
		res.status(400).json({ error: "No set nickname or invalid set nickname data" });
		return;
	} else if(req.body.enabled && typeof req.body.roleID !== "string") {
		res.status(400).json({ error: "No role id or invalid role id data" });
		return;
	} else if(req.body.groupID !== undefined && typeof req.body.groupID !== "string") {
		res.status(400).json({ error: "Invalid group id data" });
		return;
	}

	await r.table("robloxVerification")
		.insert({
			id: req.params.guild,
			enabled: req.body.enabled,
			setNickname: req.body.setNickname,
			roleID: req.body.roleID,
			groupID: req.body.groupID === "" ? undefined : req.body.groupID
		}, { conflict: "replace" })
		.run();

	res.status(204).end();
});
