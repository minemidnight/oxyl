const router = module.exports = require("express").Router(); // eslint-disable-line new-cap
const clientID = "jzkbprff40iqj646a697cyrvl0zt2m6";
const superagent = require("superagent");

const canManage = require("./middleware/canManage");
const expectedBody = require("./middleware/expectedBody");
const hasGuild = require("./middleware/hasGuild");
router.param("guild", canManage());
router.param("guild", hasGuild());

const getChannels = require("./getChannels");

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const discordChannels = await getChannels(req.params.guild);
	const twitchFeeds = await r.table("feeds").getAll(req.params.guild, { index: "guildID" })
		.filter(r.row("id")(0).eq("twitch"))
		.map(doc => ({
			twitchChannel: doc("id")(1),
			discordChannel: doc("id")(2)
		}))
		.run();

	res.status(200).json({ twitchFeeds, discordChannels });
});

router.delete("/:guild(\\d{17,21})", expectedBody({
	twitchChannel: String,
	discordChannel: String
}), async (req, res) => {
	const { r, redis } = req.app.locals;

	const { deleted } = await r.table("feeds")
		.get(["twitch", req.body.twitchChannel, req.body.discordChannel])
		.delete()
		.run();

	if(!deleted) {
		res.status(400).json({ error: "Feed does not exist" });
		return;
	}

	let channels = await redis.get(`feeds:twitch:${req.body.twitchChannel}`);
	channels = channels ? JSON.parse(channels) : [];
	channels.splice(channels.indexOf(req.body.discordChannel), 1);
	await redis.set(`feeds:twitch:${req.body.twitchChannel}`, JSON.stringify(channels), "EX", 2419200);

	res.status(204).end();
});

router.put("/:guild(\\d{17,21})", expectedBody({
	twitchChannel: String,
	discordChannel: String
}), async (req, res) => {
	const { r, redis } = req.app.locals;

	try {
		const { body: { name } } = await superagent
			.get(`https://api.twitch.tv/kraken/channels/${req.body.twitchChannel}`)
			.set("Client-ID", clientID);

		req.body.twitchChannel = name;
	} catch(err) {
		res.status(400).json({ error: "Invalid channel", invalidChannel: true });
		return;
	}

	const exists = await r.table("feeds")
		.get(["twitch", req.body.twitchChannel, req.body.discordChannel])
		.run();

	if(exists) {
		res.status(400).json({ error: "Already exists", alreadyExists: true });
		return;
	}

	let channels = await redis.get(`feeds:twitch:${req.body.twitchChannel}`);
	channels = channels ? JSON.parse(channels) : [];
	await redis.set(`feeds:twitch:${req.body.twitchChannel}`,
		JSON.stringify(channels.concat(req.body.discordChannel)), "EX", 2419200);

	const { changes: [{ new_val: feed }] } = await r.table("feeds")
		.insert({
			id: ["twitch", req.body.twitchChannel, req.body.discordChannel],
			guildID: req.params.guild
		}, { returnChanges: true })
		.run();

	res.status(200).json({
		twitchChannel: feed.id[1],
		discordChannel: feed.id[2]
	});
});
