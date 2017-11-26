const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

const getRoles = require("./getRoles");

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const censors = await r.table("censors")
		.getAll(req.params.guild, { index: "guildID" })
		.map(doc => ({
			regex: doc("regex")(0),
			flags: doc("regex")(1),
			action: doc("action"),
			roleID: doc("roleID").default(null),
			message: doc("message"),
			uuid: doc("id")
		}))
		.run();

	const roles = await getRoles(req.params.guild);
	res.status(200).json({ censors, roles });
});

router.put("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	if(typeof req.body.regex !== "string") {
		res.status(400).json({ error: "No regex or invalid regex data" });
		return;
	} else if(!Array.isArray(req.body.flags) || !req.body.flags.every(flag => typeof flag === "string")) {
		res.status(400).json({ error: "No regex flags or invalid flag data" });
		return;
	} else if(typeof req.body.action !== "string") {
		res.status(400).json({ error: "No action or invalid action data" });
		return;
	} else if(req.body.action === "role" && typeof req.body.roleID !== "string") {
		res.status(400).json({ error: "No role id or invalid role id data" });
		return;
	} else if(typeof req.body.message !== "string") {
		res.status(400).json({ error: "No message or invalid message data" });
		return;
	}

	const { changes: [{ new_val: censor }] } = await r.table("censors")
		.insert({
			guildID: req.params.guild,
			regex: [req.body.regex, req.body.flags],
			action: req.body.action,
			roleID: req.body.roleID,
			message: req.body.message
		}, { returnChanges: true })
		.run();

	res.status(201).json({
		regex: censor.regex[0],
		flags: censor.flags[1],
		action: censor.action,
		roleID: censor.roleID,
		message: censor.message,
		uuid: censor.id
	});
});

router.patch("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;
	const { previous, edited } = req.body;

	if(typeof previous.uuid !== "string") {
		res.status(400).json({ error: "No uuid or invalid uuid data" });
		return;
	} else if(typeof edited.regex !== "string") {
		res.status(400).json({ error: "No regex or invalid regex data" });
		return;
	} else if(!Array.isArray(edited.flags) || !edited.flags.every(flag => typeof flag === "string")) {
		res.status(400).json({ error: "No regex flags or invalid flag data" });
		return;
	} else if(typeof edited.action !== "string") {
		res.status(400).json({ error: "No action or invalid action data" });
		return;
	} else if(edited.action === "role" && typeof edited.roleID !== "string") {
		res.status(400).json({ error: "No role id or invalid role id data" });
		return;
	} else if(typeof edited.message !== "string") {
		res.status(400).json({ error: "No message or invalid message data" });
		return;
	}

	const { skipped, changes: [{ new_val: censor }] } = await r.table("censors")
		.get(previous.uuid)
		.update({
			regex: [edited.regex, edited.flags],
			action: edited.action,
			roleID: edited.roleID,
			message: edited.message
		}, { returnChanges: true })
		.run();

	if(skipped) {
		res.status(400).json({ error: "Censor does not exist" });
	} else {
		res.status(200).json({
			regex: censor.regex[0],
			flags: censor.regex[1],
			action: censor.action,
			roleID: censor.roleID,
			message: censor.message,
			uuid: censor.id
		});
	}
});

router.delete("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	if(typeof req.body.uuid !== "string") {
		res.status(400).json({ error: "No uuid or invalid uuid data" });
		return;
	}

	const { deleted } = await r.table("censors")
		.get(req.body.uuid)
		.delete()
		.run();

	if(!deleted) res.status(400).json({ error: "Censor does not exist" });
	else res.status(204).end();
});
