const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

router.post("/reset/*", async (req, res) => {
	let id = req.path.substring(6).replace(/\//g, "");
	if(!id.match(/\d+/)) {
		res.status(400).end();
		return;
	}

	let { result: hasServer } = await process.output({
		target: id,
		input: `return bot.guilds.has("${id}")`,
		type: "guild"
	});
	if(!hasServer) {
		res.status(404).json({ error: "Bot not in Server" }).end();
		return;
	}

	if(!req.cookies.currentToken) {
		res.status(401).json({ error: "Not logged on" }).end();
		return;
	} else {
		req.currentToken = JSON.parse(req.cookies[`token_${req.cookies.currentToken}`]);
	}

	let guilds = await req.app.discordInfo(null, "users/@me/guilds", req);
	let isAdmin = guilds.find(guild => guild.id === id).permissions & (1 << 3);
	if(!isAdmin) {
		res.status(401).json({ error: "Insufficient permissions" }).end();
		return;
	}

	if(req.body.name === "prefix") {
		process.output({
			target: id,
			input: `bot.prefixes.delete("${id}")`,
			type: "guildEval"
		});
	}

	await r.table("settings").get([req.body.name, id]).delete().run();
	res.status(200).json({ success: true }).end();
});

router.post("/set/*", async (req, res) => {
	let id = req.path.substring(4).replace(/\//g, "");
	if(!id.match(/\d+/)) {
		res.status(400).json({ error: "Invalid Guild ID" }).end();
		return;
	}

	let { result: hasServer } = await process.output({
		target: id,
		input: `return bot.guilds.has("${id}")`,
		type: "guild"
	});
	if(!hasServer) {
		res.status(404).json({ error: "Bot not in Server" }).end();
		return;
	}

	if(!req.cookies.currentToken) {
		res.status(401).json({ error: "Not logged on" }).end();
		return;
	} else {
		req.currentToken = JSON.parse(req.cookies[`token_${req.cookies.currentToken}`]);
	}

	let guilds = await req.app.discordInfo(null, "users/@me/guilds", req);
	let isAdmin = guilds.find(guild => guild.id === id).permissions & (1 << 3);
	if(!isAdmin) {
		res.status(401).json({ error: "Insufficient permissions" }).end();
		return;
	}

	Object.keys(req.body).forEach(key => {
		if(req.body[key] === "true") req.body[key] = true;
		else if(req.body[key] === "false") req.body[key] = false;
	});

	if(Object.keys(req.body).length === 1) {
		let settingName = Object.keys(req.body)[0];
		let current = await r.table("settings").get([settingName, id]).run();
		if(current) {
			await r.table("settings").get(current.id).update({ value: req.body[settingName] }).run();
		} else {
			await r.table("settings")
				.insert({ id: [settingName, id], guildID: id, name: settingName, value: req.body[settingName] }).run();
		}

		if(settingName === "prefix") {
			process.output({
				target: id,
				input: `bot.prefixes.set("${id}", "${req.body.prefix}")`,
				type: "guild"
			});
		}

		res.status(200).json({ success: true }).end();
	} else if(Object.keys(req.body)[0].startsWith("track")) {
		let value = [], settingName = "modLog.track";
		Object.keys(req.body)
			.filter(key => req.body[key])
			.forEach(key => value.push(key.substring(key.indexOf("[") + 1, key.indexOf("]"))));

		let current = await r.table("settings").get([settingName, id]).run();
		if(current && value.length) {
			await r.table("settings").get(current.id).update({ value }).run();
		} else if(current && !value.length) {
			await r.table("settings").get(current.id).delete().run();
		} else {
			await r.table("settings")
				.insert({ id: [settingName, id], guildID: id, name: settingName, value: req.body[settingName] }).run();
		}

		res.status(200).json({ success: true }).end();
	}
});
