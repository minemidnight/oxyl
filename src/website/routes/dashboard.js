const router = module.exports = express.Router(); // eslint-disable-line new-cap

router.get("/overview/*", async (req, res) => {
	let id = req.path.substring(9).replace(/\//g, "");
	if(!id.match(/\d+/)) {
		res.status(404).send(await app.page(req, "404", { guild: id })).end();
		return;
	}

	let hasServer = (await process.output({
		target: id,
		input: `return bot.guilds.has("${id}")`,
		type: "guild"
	})).result;

	if(hasServer) {
		let modLog = (await r.table("modLog").filter({ guildID: id }).run()).length;
		let { botCount, channelCount, memberCount, onlineMembers, owner, region } = (await process.output({
			target: id,
			input: `let guild = bot.guilds.get("${id}");` +
								`let owner = bot.users.get(guild.ownerID);` +
								`return {` +
									`botCount: guild.members.filter(m => m.bot).length,` +
									`channelCount: guild.channels.size,` +
									`memberCount: guild.memberCount,` +
									`onlineMembers: guild.members.filter(m => m.status !== "offline").length,` +
									`owner: owner.username + "#" + owner.discriminator,` +
									`region: guild.region,` +
								`}`,
			type: "guild"
		})).result;

		res.status(200).send(await app.page(req, "dashboard", {
			botCount,
			botPercent: (botCount / memberCount * 100).toFixed(2),
			channelCount,
			guild: id,
			memberCount,
			modLog,
			onlineMembers,
			owner,
			region,
			userCount: memberCount - botCount,
			userPercent: ((memberCount - botCount) / memberCount * 100).toFixed(2)
		})).end();
	} else {
		res.status(200).send(await app.page(req, "invite", { guild: id })).end();
	}
});

router.get("/settings/*", async (req, res) => {
	let id = req.path.substring(9).replace(/\//g, "");
	if(!id.match(/\d+/)) {
		res.status(404).send(await app.page(req, "404", { guild: id })).end();
		return;
	}

	let hasServer = (await process.output({
		target: id,
		input: `return bot.guilds.has("${id}")`,
		type: "guild"
	})).result;

	if(hasServer) {
		let modLog = (await r.table("modLog").filter({ guildID: id }).run()).length;
		let guildSettings = JSON.parse(JSON.stringify(settings));
		(await r.table("settings").filter({ guildID: id }).run()).forEach(data => {
			let index = guildSettings.indexOf(guildSettings.find(gset => gset.name === data.name));
			guildSettings[index].value = data.value;
		});

		let [channels, roles] = (await process.output({
			target: id,
			input: `let guild = bot.guilds.get("${id}");` +
								`return [guild.channels.map(c => ({ id: c.id, name: c.name })),` +
									`guild.roles.map(r => ({ id: r.id, name: r.name }))]`,
			type: "target"
		})).result;

		res.status(200)
			.send(await app.page(req, "settings", { channels, guild: id, modLog, settings: guildSettings, roles })).end();
	} else {
		res.status(200).send(await app.page(req, "invite", { guild: id })).end();
	}
});

const readableActions = {
	specialRoleAdd: "Special Role Added",
	specialRoleRemove: "Special Role Removed"
};
router.get("/modlog/*", async (req, res) => {
	let id = req.path.substring(7).replace(/\//g, "");
	if(!id.match(/\d+/)) {
		res.status(404).send(await app.page(req, "404", { guild: id })).end();
		return;
	}

	let hasServer = (await process.output({
		target: id,
		input: `return bot.guilds.has("${id}")`,
		type: "guild"
	})).result;

	if(hasServer) {
		let cases = await r.table("modLog").filter({ guildID: id }).run();
		let roles = (await process.output({
			target: id,
			input: `return bot.guilds.get("${id}").roles.map(data => ({ id: data.id, name: data.name }))`,
			type: "guild"
		})).result;
		cases = cases.sort((a, b) => b.caseNum - a.caseNum);
		cases.forEach(data => {
			data.action = readableActions[data.action] ||
					data.action.substring(0, 1).toUpperCase() + data.action.substring(1);
			if(data.role) data.role = roles.find(role => role.id === data.role).name || data.role;
		});
		if(!cases.length) {
			res.status(200).send(await app.page(req, "modlog", { guild: id })).end();
		} else {
			res.status(200).send(await app.page(req, "modlog", { guild: id, cases })).end();
		}
	} else {
		res.status(200).send(await app.page(req, "invite", { guild: id })).end();
	}
});

let settings = require(require("path").resolve("src", "bot", "commands", "admin", "settings").settings;
