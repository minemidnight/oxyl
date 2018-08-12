const config = require("../../../config");
const router = module.exports = require("express").Router(); // eslint-disable-line new-cap
const superagent = require("superagent");

const expectedBody = require("./middleware/expectedBody");

router.get("/", async (req, res) => {
	const { r } = req.app.locals;

	if(!res.locals.user) {
		res.status(401).json({ error: "Not logged in" });
		return;
	}

	const newsletter = await r.table("newsletter")
		.get(res.locals.user.id)
		.default({ email: null, dm: null })
		.without("userID")
		.run();

	res.status(200).json(newsletter);
});

router.put("/", expectedBody({
	dm: Boolean,
	email: Boolean
}), async (req, res) => {
	const { r } = req.app.locals;

	if(!res.locals.user) {
		res.status(401).json({ error: "Not logged in" });
		return;
	}

	const { body: { id: dmChannelID } } = await superagent.post(`https://discordapp.com/api/users/@me/channels`)
		.set("Authorization", `Bot ${config.token}`)
		.send({ recipient_id: res.locals.user.id }); // eslint-disable-line camelcase

	await r.table("newsletter")
		.insert({
			userID: res.locals.user.id,
			email: {
				enabled: req.body.email,
				address: res.locals.user.email
			},
			dm: {
				enabled: req.body.dm,
				channelID: dmChannelID
			}
		}, { conflict: "replace" })
		.run();

	res.status(201).end();
});

