const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

const getRoles = require("./getRoles");

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const roles = await getRoles(req.params.guild);
	const roleSettings = await r.table("roleSettings")
		.getAll(req.params.guild, { index: "guildID" })
		.default({})
		.map(doc => ({
			type: doc("id")(1),
			roles: doc("roles")
		}))
		.run();

	res.status(200).json(Object.assign(roleSettings.reduce((a, b) => {
		a[b.type] = b.roles;
		return a;
	}, {}), { roles }));
});


const types = ["autoRole", "roleMe", "rolePersist"];
router.put("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	for(const type of types) {
		if(!Array.isArray(req.body[type]) || !req.body[type].every(role => typeof role === "string")) {
			res.status(400).json({ error: `No ${type} roles or ${type} data` });
			return;
		}
	}

	for(const type of types) {
		await r.table("roleSettings")
			.insert({
				guildID: req.params.guild,
				id: [req.params.guild, type],
				roles: req.body[type]
			}, { conflict: "replace" })
			.run();
	}


	res.status(204).end();
});
