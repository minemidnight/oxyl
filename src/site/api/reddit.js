const router = module.exports = require("express").Router(); // eslint-disable-line new-cap
const superagent = require("superagent");

const canManage = require("./middleware/canManage");
const expectedBody = require("./middleware/expectedBody");
const hasGuild = require("./middleware/hasGuild");
router.param("guild", canManage());
router.param("guild", hasGuild());

const getChannels = require("./getChannels");

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const reddits = await r.table("feeds")
		.getAll(req.params.guild, { index: "guildID" })
		.filter(r.row("id")(0).eq("reddit"))
		.map(doc => ({
			subreddit: doc("id")(1),
			channelID: doc("id")(2),
			type: doc("type")
		}))
		.run();

	res.status(200).json({ subreddits: reddits, channels: await getChannels(req.params.guild) });
});

router.delete("/:guild(\\d{17,21})", expectedBody({
	subreddit: String,
	channelID: String
}), async (req, res) => {
	const { r, redis } = req.app.locals;

	const { deleted } = await r.table("feeds")
		.get(["reddit", req.body.subreddit, req.body.channelID])
		.delete()
		.run();

	if(!deleted) {
		res.status(400).json({ error: "Feed does not exist" });
		return;
	}

	let channels = await redis.get(`feeds:reddit:${req.body.type}:${req.body.subreddit}`);
	channels = channels ? JSON.parse(channels) : [];
	channels.splice(channels.indexOf(req.body.channelID), 1);
	await redis.set(`feeds:reddit:${req.body.type}:${req.body.subreddit}`, JSON.stringify(channels), "EX", 2419200);

	res.status(204).end();
});

router.put("/:guild(\\d{17,21})", expectedBody({
	subreddit: String,
	channelID: String,
	type: { in: ["new", "top"] }
}), async (req, res) => {
	const { r, redis } = req.app.locals;

	if(typeof req.body.subreddit !== "string") {
		res.status(400).json({ error: "No subreddit or invalid subreddit data" });
		return;
	} else if(typeof req.body.channelID !== "string") {
		res.status(400).json({ error: "No channel id or invalid channel id data" });
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

	const exists = await r.table("feeds")
		.get(["reddit", req.body.subreddit, req.body.channelID])
		.run();

	if(exists) {
		res.status(400).json({ error: "Already exists", alreadyExists: true });
		return;
	}

	let channels = await redis.get(`feeds:reddit:${req.body.type}:${req.body.subreddit}`);
	channels = channels ? JSON.parse(channels) : [];
	await redis.set(`feeds:reddit:${req.body.type}:${req.body.subreddit}`,
		JSON.stringify(channels.concat(req.body.channelID)), "EX", 2419200);


	const { changes: [{ new_val: feed }] } = await r.table("feeds")
		.insert({
			id: ["reddit", req.body.subreddit, req.body.channelID],
			type: req.body.type,
			guildID: req.params.guild
		}, { returnChanges: true })
		.run();

	res.status(200).json({
		subreddit: feed.id[1],
		channelID: feed.id[2],
		type: feed.type
	});
});
