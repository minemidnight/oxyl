const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

const getChannels = require("./getChannels");
const getRoles = require("./getRoles");

let commands;
async function getCommands() {
	commands = await process.output({
		op: "eval",
		target: "shard",
		targetValue: 0,
		input: () => {
			const wiggle = process.evalContext.client;

			return [...wiggle.categories.values()].reduce((all, category) => {
				if(category.name === "creator") return all;
				const subcommands = [...category.subcommands.values()].reduce((a, b) => {
					a[b.name] = [...b.commands.values()].map(command => command.name);
					return a;
				}, {});

				all[category.name] = [...category.commands.values()]
					.map(command => command.name)
					.concat(Object.keys(subcommands).length ? subcommands : []);
				return all;
			}, {});
		}
	});
}

function checkNode(node) {
	const parts = node.split(".");
	const category = commands[parts[0]];

	if(!category) {
		return false;
	} else if(~category.indexOf(parts[1])) {
		return true;
	} else {
		const subcommands = category.find(command => typeof command !== "string");
		if(~Object.keys(subcommands).indexOf(parts[1])) return true;
		else if(!parts[2]) return false;
		else return Object.values(subcommands).some(cmds => ~cmds.indexOf(parts[2]));
	}
}

router.get("/:guild(\\d{17,21})", async (req, res) => {
	if(!commands) await getCommands();

	const channels = await getChannels(req.params.guild);
	const roles = await getRoles(req.params.guild);

	res.status(200).json({ commands, channels, roles });
});

router.get("/:guild(\\d{17,21})/:commandNode", async (req, res) => {
	const { r } = req.app.locals;
	const settings = await r.table("commandSettings")
		.get([req.params.guild, req.params.commandNode])
		.default({
			enabled: true,
			roleType: "whitelist",
			roles: [req.params.guild],
			blacklistedChannels: []
		})
		.without("id", "guildID")
		.run();

	res.status(200).json(settings);
});

router.put("/:guild(\\d{17,21})/:commandNode", async (req, res) => {
	const { r } = req.app.locals;

	if(!checkNode(req.params.commandNode)) {
		res.status(400).json({ error: "Invalid command node" });
		return;
	} else if(typeof req.body.enabled !== "boolean") {
		res.status(400).json({ error: "No enabled or invalid enabled data" });
		return;
	} else if(!~["blacklist", "whitelist"].indexOf(req.body.roleType)) {
		res.status(400).json({ error: "No role type or invalid role type data" });
		return;
	} else if(!Array.isArray(req.body.roles) || !req.body.roles.every(role => typeof role === "string")) {
		res.status(400).json({ error: "No roles or invalid roles data" });
		return;
	} else if(!Array.isArray(req.body.blacklistedChannels) ||
		!req.body.blacklistedChannels.every(role => typeof role === "string")) {
		res.status(400).json({ error: "No blacklisted channels or invalid blacklisted channels data" });
		return;
	}

	await r.table("commandSettings")
		.insert({
			id: [req.params.guild, req.params.commandNode],
			guildID: req.params.guild,
			enabled: req.body.enabled,
			roleType: req.body.roleType,
			roles: req.body.roles,
			blacklistedChannels: req.body.blacklistedChannels
		}, { conflict: "replace" })
		.run();

	res.status(204).end();
});
