const router = module.exports = require("express").Router(); // eslint-disable-line new-cap
const superagent = require("superagent");

const middleware = require("./middleware");
router.param("guild", middleware.hasGuild());
router.param("guild", middleware.canManage());

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

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const reddits = await r.table("feeds").getAll(req.params.guild, { index: "guildID" })
		.filter(r.row("id")(0).eq("reddit")).run();

	res.status(200).json({ subreddits: reddits, channels: await getChannels(req.params.guild) });
});

router.delete("/:guild(\\d{17,21})", async (req, res) => {
	const { r, redis } = req.app.locals;

	if(typeof req.body.subreddit !== "string") {
		res.status(400).json({ error: "No subreddit or invalid subreddit data" });
		return;
	} else if(typeof req.body.channel !== "string") {
		res.status(400).json({ error: "No channel or invalid channel data" });
		return;
	}

	const { deleted } = await r.table("feeds").get(["reddit", req.body.subreddit, req.body.channel]).delete().run();
	if(!deleted) {
		res.status(400).json({ error: "Feed does not exist" });
		return;
	}

	let channels = await redis.get(`feeds:reddit:${req.body.type}:${req.body.subreddit}`);
	channels = channels ? JSON.parse(channels) : [];
	channels.splice(channels.indexOf(req.body.channel), 1);
	await redis.set(`feeds:reddit:${req.body.type}:${req.body.subreddit}`, JSON.stringify(channels), "EX", 2419200);

	res.status(204).end();
});

router.put("/:guild(\\d{17,21})", async (req, res) => {
	const { r, redis } = req.app.locals;

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

	let channels = await redis.get(`feeds:reddit:${req.body.type}:${req.body.subreddit}`);
	channels = channels ? JSON.parse(channels) : [];
	await redis.set(`feeds:reddit:${req.body.type}:${req.body.subreddit}`,
		JSON.stringify(channels.concat(req.body.channel)), "EX", 2419200);

	const toAdd = {
		id: ["reddit", req.body.subreddit, req.body.channel],
		type: req.body.type,
		guildID: req.params.guild
	};

	await r.table("feeds").insert(toAdd).run();
	res.status(200).json({ added: toAdd });
});

router.patch("/:guild(\\d{17,21})", async (req, res) => {
	const { r, redis } = req.app.locals;
	const { previous, edited } = req.body;

	if(typeof previous.subreddit !== "string") {
		res.status(400).json({ error: "No previous subreddit or invalid previous subreddit data" });
		return;
	} else if(typeof previous.channel !== "string") {
		res.status(400).json({ error: "No previous channel or invalid previous channel data" });
		return;
	} else if(typeof edited.subreddit !== "string") {
		res.status(400).json({ error: "No new subreddit or invalid new subreddit data" });
		return;
	} else if(typeof edited.channel !== "string") {
		res.status(400).json({ error: "No new channel or invalid new channel data" });
		return;
	} else if(typeof edited.type !== "string") {
		res.status(400).json({ error: "No new type or invalid new type data" });
		return;
	}

	try {
		const { body: { data: { children: [{ data, kind }] } } } = await superagent
			.get(`https://reddit.com/r/${edited.subreddit}.json`)
			.query({ limit: 1 });

		if(kind !== "t3") {
			res.status(400).json({ error: "Invalid subreddit", invalidSubreddit: true });
			return;
		} else {
			edited.subreddit = data.subreddit;
		}
	} catch(err) {
		res.status(400).json({ error: "Invalid subreddit", invalidSubreddit: true });
		return;
	}

	const { deleted } = await r.table("feeds").get(["reddit", previous.subreddit, previous.channel]).delete().run();
	if(!deleted) {
		res.status(400).json({ error: "Feed does not exist" });
		return;
	}

	let channelsRemove = await redis.get(`feeds:reddit:${previous.type}:${previous.subreddit}`);
	channelsRemove = channelsRemove ? JSON.parse(channelsRemove) : [];
	channelsRemove.splice(channelsRemove.indexOf(previous.channel), 1);
	await redis.set(`feeds:reddit:${previous.type}:${previous.subreddit}`, JSON.stringify(channelsRemove), "EX", 2419200);

	let channelsAdd = await redis.get(`feeds:reddit:${edited.type}:${edited.subreddit}`);
	channelsAdd = channelsAdd ? JSON.parse(channelsAdd) : [];
	await redis.set(`feeds:reddit:${edited.type}:${edited.subreddit}`,
		JSON.stringify(channelsAdd.concat(edited.channel)), "EX", 2419200);

	const toAdd = {
		id: ["reddit", edited.subreddit, edited.channel],
		type: edited.type,
		guildID: req.params.guild
	};

	await r.table("feeds").insert(toAdd).run();
	res.status(200).json({ edited: toAdd });
});
