const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const canManage = require("./middleware/canManage");
const expectedBody = require("./middleware/expectedBody");
const hasGuild = require("./middleware/hasGuild");
router.param("guild", canManage());
router.param("guild", hasGuild());

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

router.put("/:guild(\\d{17,21})", expectedBody({
	regex: String,
	flags: [String],
	action: String,
	roleID: {
		type: String,
		if: "action",
		is: "role"
	},
	time: {
		type: Number,
		if: "action",
		in: ["role", "ban"]
	},
	message: String
}), async (req, res) => {
	const { r } = req.app.locals;

	const { changes: [{ new_val: censor }] } = await r.table("censors")
		.insert({
			guildID: req.params.guild,
			regex: [req.body.regex, req.body.flags],
			action: req.body.action,
			roleID: req.body.roleID,
			message: req.body.message,
			time: req.body.time
		}, { returnChanges: true })
		.run();

	res.status(201).json({
		regex: censor.regex[0],
		flags: censor.regex[1],
		action: censor.action,
		roleID: censor.roleID,
		time: censor.time,
		message: censor.message,
		uuid: censor.id
	});
});

router.patch("/:guild(\\d{17,21})", expectedBody({
	uuid: String,
	regex: String,
	flags: [String],
	action: String,
	roleID: {
		type: String,
		if: "action",
		is: "role"
	},
	time: {
		type: Number,
		if: "action",
		in: ["role", "ban"]
	},
	message: String
}), async (req, res) => {
	const { r } = req.app.locals;
	const { previous, edited } = req.body;

	const { skipped, changes: [{ new_val: censor }] } = await r.table("censors")
		.get(previous.uuid)
		.update({
			regex: [edited.regex, edited.flags],
			action: edited.action,
			roleID: edited.roleID,
			time: req.body.time,
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
			time: censor.time,
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
