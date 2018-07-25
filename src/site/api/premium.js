const { discordAuth, patreonAuth } = require("./oauth");
const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const canManage = require("./middleware/canManage");
const expectedBody = require("./middleware/expectedBody");
const hasGuild = require("./middleware/hasGuild");
router.param("guild", canManage());
router.param("guild", hasGuild());

router.get("/:guild(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;

	const premium = await r.table("premiumServers")
		.get(req.params.guild)
		.run();

	const data = {
		activator: premium ? premium.donatorID : null,
		premium: !!premium
	};

	const { id } = await discordAuth.info(res.locals.token, "/users/@me");
	data.self = id;
	const link = await r.table("discordPatreonLink")
		.get(id)
		.default(false)
		.run();

	data.linked = !!link;
	if(link && !link.pledge) {
		const patreonInfo = await patreonAuth.info(link.token, "current_user");
		const oxylPledge = patreonInfo.data.relationships.pledges.data
			.find(pledge => pledge.relations.creator.id === "5374558" && !pledge.attributes.is_paused);

		data.pledge = oxylPledge ? oxylPledge.amount_cents : 0;
		if(data.pledge) {
			await r.table("discordPatreonLink")
				.get(id)
				.update({ pledge: data.pledge })
				.run();
		}
	}

	data.serversRemaining = Math.floor(data.pledge / 100) - (link ? link.premiumServers : 0);
	res.status(200).json(data);
});

router.put("/:guild(\\d{17,21})", expectedBody({ enabled: Boolean }), async (req, res) => {
	const { r } = req.app.locals;

	const { id } = await discordAuth.info(res.locals.token, "/users/@me");
	const link = await r.table("discordPatreonLink")
		.get(id)
		.default(false)
		.run();

	if(!link) {
		res.status(401).json({ error: "Patreon not linked to discord" });
		return;
	} else if(!link.pledge) {
		res.status(403).json({ error: "Not a patron" });
		return;
	} else if(Math.floor(link.pledge / 100) - (link ? link.premiumServers : 0) <= 0) {
		res.status(403).json({ error: "No premium servers remaining" });
		return;
	}

	if(req.body.enabled) {
		await r.table("premiumServers")
			.insert({
				id: req.params.guild,
				donatorID: id
			})
			.run();

		await r.table("discordPatreonLink")
			.get(id)
			.update({ premiumServers: r.row("premiumServers").add(1) });
	} else {
		await r.table("premiumServers")
			.get(req.params.guild)
			.delete()
			.run();
	}

	res.status(204).end();
});
