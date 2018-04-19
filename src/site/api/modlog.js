const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

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

router.put("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	if(typeof req.body.enabled !== "boolean") {
		res.status(400).json({ error: "No enabled or invalid enabled data" });
		return;
	} else if(typeof req.body.channelID !== "string") {
		res.status(400).json({ error: "No channel id or invalid channel id data" });
		return;
	} else if(!Array.isArray(req.body.tracked) || req.body.tracked.some(roleID => typeof roleID !== "string")) {
		res.status(400).json({ error: "No tracked or invalid tracked data" });
		return;
	}

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

router.put("/:guild(\\d{17,21})/thresholds", async (req, res) => {
	const { r } = req.app.locals;

	if(typeof req.body.warnCount !== "number") {
		res.status(400).json({ error: "No warn count or invalid warn count data" });
		return;
	} else if(typeof req.body.action !== "string") {
		res.status(400).json({ error: "No action or invalid action data" });
		return;
	} else if(req.body.action === "role" && typeof req.body.roleID !== "string") {
		res.status(400).json({ error: "No role id or invalid role id data" });
		return;
	} else if(req.body.time && (!~["role", "ban"].indexOf(req.body.action) || typeof req.body.time !== "number")) {
		res.status(400).json({ error: "Invalid time or time for invalid action" });
		return;
	}

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

router.delete("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	if(typeof req.body.warnCount !== "number") {
		res.status(400).json({ error: "No warn count or invalid warn count data" });
		return;
	}

	const { deleted } = await r.table("warningThresholds")
		.get([req.params.guild, req.body.warnCount])
		.delete()
		.run();

	if(!deleted) res.status(400).json({ error: "Threshold does not exist" });
	else res.status(204).end();
});
