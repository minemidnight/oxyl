const router = module.exports = require("express").Router(); // eslint-disable-line new-cap
const validateOwner = require("./middleware/validateOwner");

router.use(validateOwner());

router.get("/", async (req, res) => {
	const { r } = req.app.locals;

	const timespan = parseInt(req.query.timespan || -1);

	if(isNaN(timespan)) {
		res.status(400).json({ error: "Timespan was not a number" });

		return;
	}

	const memoryUsage = await r.table("globalStats")
		.between(
			["memoryUsage", Date.now() - (timespan === -1 ? 86400000 : timespan)],
			["memoryUsage", Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	const streams = await r.table("globalStats")
		.between(
			["streams", Date.now() - (timespan === -1 ? 86400000 : timespan)],
			["streams", Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	const guilds = await r.table("globalStats")
		.between(
			["guilds", Date.now() - (timespan === -1 ? 604800000 : timespan)],
			["guilds", Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	const users = await r.table("globalStats")
		.between(
			["users", Date.now() - (timespan === -1 ? 604800000 : timespan)],
			["users", Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	const messages = await r.table("globalStats")
		.between(
			["messages", Date.now() - (timespan === -1 ? 86400000 : timespan)],
			["messages", Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	const commands = await r.table("commandStats")
		.between(
			Date.now() - (timespan === -1 ? 86400000 : timespan),
			Date.now(),
			{ index: "time" }
		)
		.group("node")
		.count()
		.ungroup()
		.orderBy(r.desc("reduction"))
		.run();

	res.status(200).json({ commands, memoryUsage, guilds, streams, messages, users });
});

router.get("/users", async (req, res) => {
	const { r } = req.app.locals;

	const timespan = parseInt(req.query.timespan || 604800000);

	if(isNaN(timespan)) {
		res.status(400).json({ error: "Timespan was not a number" });

		return;
	}

	const users = await r.table("globalStats")
		.between(
			["users", Date.now() - timespan],
			["users", Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	res.status(200).json({ users });
});

router.get("/messages", async (req, res) => {
	const { r } = req.app.locals;

	const timespan = parseInt(req.query.timespan || 86400000);

	if(isNaN(timespan)) {
		res.status(400).json({ error: "Timespan was not a number" });

		return;
	}

	const messages = await r.table("globalStats")
		.between(
			["messages", Date.now() - timespan],
			["messages", Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	res.status(200).json({ messages });
});

router.get("/streams", async (req, res) => {
	const { r } = req.app.locals;

	const timespan = parseInt(req.query.timespan || 86400000);

	if(isNaN(timespan)) {
		res.status(400).json({ error: "Timespan was not a number" });

		return;
	}

	const streams = await r.table("globalStats")
		.between(
			["streams", Date.now() - timespan],
			["streams", Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	res.status(200).json({ streams });
});

router.get("/guilds", async (req, res) => {
	const { r } = req.app.locals;

	const timespan = parseInt(req.query.timespan || 604800000);

	if(isNaN(timespan)) {
		res.status(400).json({ error: "Timespan was not a number" });

		return;
	}

	const guilds = await r.table("globalStats")
		.between(
			["guilds", Date.now() - timespan],
			["guilds", Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	res.status(200).json({ guilds });
});

router.get("/memoryUsage", async (req, res) => {
	const { r } = req.app.locals;

	const timespan = parseInt(req.query.timespan || 86400000);

	if(isNaN(timespan)) {
		res.status(400).json({ error: "Timespan was not a number" });

		return;
	}

	const memoryUsage = await r.table("globalStats")
		.between(
			["memoryUsage", Date.now() - timespan],
			["memoryUsage", Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	res.status(200).json({ memoryUsage });
});

router.get("/commandUsage", async (req, res) => {
	const { r } = req.app.locals;

	const timespan = parseInt(req.query.timespan || 86400000);

	if(isNaN(timespan)) {
		res.status(400).json({ error: "Timespan was not a number" });

		return;
	}

	const commands = await r.table("commandStats")
		.between(
			Date.now() - timespan,
			Date.now(),
			{ index: "time" }
		)
		.group("node")
		.count()
		.ungroup()
		.orderBy(r.desc("reduction"))
		.run();

	res.status(200).json({ commands });
});
