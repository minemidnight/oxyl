const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const canManage = require("./middleware/canManage");
const expectedBody = require("./middleware/expectedBody");
const hasGuild = require("./middleware/hasGuild");
router.param("guild", canManage());
router.param("guild", hasGuild());

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

router.put("/:guild(\\d{17,21})", expectedBody({
	enabled: Boolean,
	setNickname: Boolean,
	roleID: {
		type: String,
		if: "enabled",
		is: true
	},
	groupID: "string?"
}), async (req, res) => {
	const { r } = req.app.locals;

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
