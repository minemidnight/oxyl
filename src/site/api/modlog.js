const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const canManage = require("./middleware/canManage");
const expectedBody = require("./middleware/expectedBody");
const hasGuild = require("./middleware/hasGuild");
router.param("guild", canManage());
router.param("guild", hasGuild());

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

	const thresholds = await r.table("warningThresholds")
		.getAll(req.params.guild, { index: "guildID" })
		.default([])
		.map(doc => ({
			warnCount: doc("id")(1),
			action: doc("action"),
			roleID: doc("roleID")
		}))
		.run();

	res.status(200).json(Object.assign(data, { channels, roles, thresholds }));
});

router.put("/:guild(\\d{17,21})", expectedBody({
	enabled: Boolean,
	channelID: String,
	tracked: [String]
}), async (req, res) => {
	const { r } = req.app.locals;

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

router.put("/:guild(\\d{17,21})/thresholds", expectedBody({
	warnCount: Number,
	action: String,
	roleID: {
		type: String,
		if: "action",
		is: "role"
	},
	time: {
		type: Number,
		if: "action",
		in: ["role, ban"]
	}
}), async (req, res) => {
	const { r } = req.app.locals;

	const { changes: [{ new_val: threshold }] } = await r.table("warningThresholds")
		.insert({
			id: [req.params.guild, req.body.warnCount],
			guildID: req.params.guild,
			action: req.body.action,
			roleID: req.body.roleID,
			time: req.body.time
		}, { returnChanges: true })
		.run();

	res.status(201).json({
		warnCount: threshold.id[1],
		action: threshold.action,
		roleID: threshold.roleID
	});
});

router.delete("/:guild(\\d{17,21})", expectedBody({ warnCoun: Number }), async (req, res) => {
	const { r } = req.app.locals;

	const { deleted } = await r.table("warningThresholds")
		.get([req.params.guild, req.body.warnCount])
		.delete()
		.run();

	if(!deleted) res.status(400).json({ error: "Threshold does not exist" });
	else res.status(204).end();
});
