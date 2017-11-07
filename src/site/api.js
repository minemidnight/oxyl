const oauth = require("../oauth/index");
const r = require("../rethinkdb/index");
const router = module.exports = require("express").Router(); // eslint-disable-line new-cap
const superagent = require("superagent");

async function inGuild(id) {
	return await process.output({
		op: "eval",
		target: "guild",
		targetValue: id,
		input: "return context.client.erisClient.guilds.has(message.targetValue)"
	});
}

async function getChannels(id) {
	return await process.output({
		op: "eval",
		target: "guild",
		targetValue: id,
		input: () => {
			const client = context.client.erisClient; // eslint-disable-line no-undef
			const guild = client.guilds.get(message.targetValue); // eslint-disable-line no-undef

			return guild.channels.filter(({ type }) => type === 0).sort((a, b) => a.position - b.position).map(channel => ({
				id: channel.id,
				name: channel.name,
				canSend: channel.permissionsOf(client.user.id).has("sendMessages") &&
					channel.permissionsOf(client.user.id).has("readMessages")
			}));
		}
	});
}

const hasGuild = () => async (req, res, next) => {
	if(!req.params.guild) {
		return res.status(400).json({ error: "No guild" });
	} else if(!await inGuild(req.params.guild)) {
		return res.status(400).json({ error: "Oxyl not in guild", redirect: { name: "invite" } });
	} else {
		return next();
	}
};

const canManage = () => async (req, res, next) => {
	let auth;
	try {
		auth = JSON.parse(req.headers.authorization);
	} catch(err) {
		return res.status(400).json({ error: "Authorization not JSON", redirect: { name: "selector" } });
	}

	try {
		let guilds = await oauth.info(auth, "/users/@me/guilds");
		if(guilds.token) {
			res.set("New-Token", JSON.stringify(guilds.token));
			guilds = guilds.info;
		}

		const guild = guilds.find(({ id }) => id === req.params.guild);
		if(!guild) {
			return res.status(400).json({ error: "User not in server", redirect: { name: "selector" } });
		} else if(!guild.owner || !(guild.permissions & 32)) {
			return res.status(400).json({
				error: "User does not have permission to Manage Guild",
				redirect: { name: "selector" }
			});
		} else {
			return next();
		}
	} catch(err) {
		return res.status(401).json({ error: "Invalid token", redirect: { name: "selector" } });
	}
};

router.get("/info", async (req, res) => {
	if(!req.query.path) {
		res.status(400).json({ error: "No path" });
		return;
	}

	let auth;
	try {
		auth = JSON.parse(req.headers.authorization);
	} catch(err) {
		res.status(400).json({ error: "Authorization not JSON", redirect: { name: "accounts" } });
		return;
	}

	try {
		let info = await oauth.info(auth, req.query.path);
		if(info.token) {
			res.set("New-Token", JSON.stringify(info.token));
			info = info.info;
		}

		res.status(200).json(info);
	} catch(err) {
		res.status(400).json({ error: "Invalid path or token", redirect: { name: "accounts" } });
		return;
	}
});

router.get("/reddit/:guild", hasGuild(), canManage(), async (req, res) => {
	const reddits = await r.table("feeds").getAll(req.params.guild, { index: "guildID" })
		.filter(r.row("id")(0).eq("reddit")).run();

	res.status(200).json({ subreddits: reddits, channels: await getChannels(req.params.guild) });
});

router.delete("/reddit/:guild", hasGuild(), canManage(), async (req, res) => {
	if(typeof req.body.subreddit !== "string") {
		res.status(400).json({ error: "No subreddit or invalid subreddit data" });
		return;
	} else if(typeof req.body.channel !== "string") {
		res.status(400).json({ error: "No channel or invalid channel data" });
		return;
	}

	const { deleted } = await r.table("feeds").get(["reddit", req.body.subreddit, req.body.channel]).delete().run();
	if(!deleted) res.status(400).json({ error: "Feed does not exist" });
	else res.status(204).end();
});

router.put("/reddit/:guild", hasGuild(), canManage(), async (req, res) => {
	if(typeof req.body.subreddit !== "string") {
		res.status(400).json({ error: "No subreddit or invalid subreddit data" });
		return;
	} else if(typeof req.body.channel !== "string") {
		res.status(400).json({ error: "No channel or invalid channel data" });
		return;
	} else if(typeof req.body.type !== "string") {
		res.status(400).json({ error: "No type or invalid type data" });
		return;
	}

	try {
		const { body: { data: { children: [{ data, kind }] } } } = await superagent
			.get(`https://reddit.com/r/${req.body.subreddit}.json`)
			.query({ limit: 1 });

		if(kind !== "t3") {
			res.status(400).json({ error: "Invalid subreddit", invalidSubreddit: true });
			return;
		} else {
			req.body.subreddit = data.subreddit;
		}
	} catch(err) {
		res.status(400).json({ error: "Invalid subreddit", invalidSubreddit: true });
		return;
	}

	const exists = await r.table("feeds").get(["reddit", req.body.subreddit, req.body.channel]).run();
	if(exists) {
		res.status(400).json({ error: "Already exists", alreadyExists: true });
		return;
	}

	const redis = req.app.locals.redis;
	const redisExists = await redis.get(`feeds:reddit:${req.body.type}:${req.body.subreddit}`) || [];
	await redis.set(`feeds:reddit:${req.body.type}:${req.body.subreddit}`, redisExists.concat(req.body.channel),
		"EX", 2419200);

	const toAdd = {
		id: ["reddit", req.body.subreddit, req.body.channel],
		type: req.body.type,
		guildID: req.params.guild
	};

	await r.table("feeds").insert(toAdd).run();
	res.status(200).json({ added: toAdd });
});

router.post("/callback", async (req, res) => {
	if(!req.body.code) {
		res.status(400).json({ error: "No code", redirect: { name: "oauth" } });
		return;
	}

	try {
		const token = await oauth.token(req.body.code, req.app.locals.config.dashboardURL);
		res.status(200).json(token);
	} catch(err) {
		res.status(400).json({ error: "Invalid code", redirect: { name: "oauth" } });
	}
});

