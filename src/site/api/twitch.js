const router = module.exports = require("express").Router(); // eslint-disable-line new-cap
const clientID = "jzkbprff40iqj646a697cyrvl0zt2m6";
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

	const channels = await r.table("feeds").getAll(req.params.guild, { index: "guildID" })
		.filter(r.row("id")(0).eq("twitch")).run();

	res.status(200).json({ channels, textChannels: await getChannels(req.params.guild) });
});

router.delete("/:guild(\\d{17,21})", async (req, res) => {
	const { r, redis } = req.app.locals;

	if(typeof req.body.channel !== "string") {
		res.status(400).json({ error: "No channel or invalid channel data" });
		return;
	} else if(typeof req.body.textChannel !== "string") {
		res.status(400).json({ error: "No text channel or invalid text channel data" });
		return;
	}

	const { deleted } = await r.table("feeds").get(["twitch", req.body.channel, req.body.textChannel]).delete().run();
	if(!deleted) {
		res.status(400).json({ error: "Feed does not exist" });
		return;
	}

	let channels = await redis.get(`feeds:twitch:${req.body.channel}`);
	channels = channels ? JSON.parse(channels) : [];
	channels.splice(channels.indexOf(req.body.textChannel), 1);
	await redis.set(`feeds:twitch:${req.body.channel}`, JSON.stringify(channels), "EX", 2419200);

	res.status(204).end();
});

router.put("/:guild(\\d{17,21})", async (req, res) => {
	const { r, redis } = req.app.locals;

	if(typeof req.body.channel !== "string") {
		res.status(400).json({ error: "No channel or invalid channel data" });
		return;
	} else if(typeof req.body.textChannel !== "string") {
		res.status(400).json({ error: "No text channel or invalid text channel data" });
		return;
	}

	try {
		const { body: { name } } = await superagent
			.get(`https://api.twitch.tv/kraken/channels/${req.body.channel}`)
			.set("Client-ID", clientID);

		req.body.channel = name;
	} catch(err) {
		res.status(400).json({ error: "Invalid channel", invalidChannel: true });
		return;
	}

	const exists = await r.table("feeds").get(["twitch", req.body.channel, req.body.textChannel]).run();
	if(exists) {
		res.status(400).json({ error: "Already exists", alreadyExists: true });
		return;
	}

	let channels = await redis.get(`feeds:twitch:${req.body.channel}`);
	channels = channels ? JSON.parse(channels) : [];
	await redis.set(`feeds:twitch:${req.body.channel}`,
		JSON.stringify(channels.concat(req.body.textChannel)), "EX", 2419200);

	const toAdd = {
		id: ["twitch", req.body.channel, req.body.textChannel],
		guildID: req.params.guild
	};

	await r.table("feeds").insert(toAdd).run();
	res.status(200).json({ added: toAdd });
});

router.patch("/:guild(\\d{17,21})", async (req, res) => {
	const { r, redis } = req.app.locals;
	const { previous, edited } = req.body;

	if(typeof previous.channel !== "string") {
		res.status(400).json({ error: "No previous channel or invalid previous channel data" });
		return;
	} else if(typeof previous.textChannel !== "string") {
		res.status(400).json({ error: "No previous text channel or invalid previous text channel data" });
		return;
	} else if(typeof edited.channel !== "string") {
		res.status(400).json({ error: "No new channel or invalid new channel data" });
		return;
	} else if(typeof edited.textChannel !== "string") {
		res.status(400).json({ error: "No new text channel or invalid new text channel data" });
		return;
	}

	try {
		const { body: { name } } = await superagent
			.get(`https://api.twitch.tv/kraken/channels/${edited.channel}`)
			.set("Client-ID", clientID);

		edited.channel = name;
	} catch(err) {
		res.status(400).json({ error: "Invalid channel", invalidChannel: true });
		return;
	}

	const { deleted } = await r.table("feeds").get(["twitch", previous.channel, previous.textChannel]).delete().run();
	if(!deleted) {
		res.status(400).json({ error: "Feed does not exist" });
		return;
	}

	let channelsRemove = await redis.get(`feeds:twitch:${previous.channel}`);
	channelsRemove = channelsRemove ? JSON.parse(channelsRemove) : [];
	channelsRemove.splice(channelsRemove.indexOf(previous.textChannel), 1);
	await redis.set(`feeds:twitch:${previous.channel}`, JSON.stringify(channelsRemove), "EX", 2419200);

	let channelsAdd = await redis.get(`feeds:twitch:${edited.channel}`);
	channelsAdd = channelsAdd ? JSON.parse(channelsAdd) : [];
	await redis.set(`feeds:twitch:${edited.channel}`,
		JSON.stringify(channelsAdd.concat(edited.textChannel)), "EX", 2419200);

	const toAdd = {
		id: ["twitch", edited.channel, edited.textChannel],
		guildID: req.params.guild
	};

	await r.table("feeds").insert(toAdd).run();
	res.status(200).json({ edited: toAdd });
});
