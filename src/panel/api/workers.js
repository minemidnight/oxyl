const router = module.exports = require("express").Router(); // eslint-disable-line new-cap
const validateOwner = require("./middleware/validateOwner");

router.use(validateOwner());

router.get("/", async (req, res) => {
	const workers = await process.output({
		op: "eval",
		target: "master",
		input: `return Array.from(context.workerData.values())`
	});

	res.status(200).json({ workers: workers });
});

router.get("/:id(\\d+)", async (req, res) => {
	const { r } = req.app.locals;

	req.params.id = parseInt(req.params.id);
	const timespan = parseInt(req.query.timespan || -1);

	if(isNaN(timespan)) {
		res.status(400).json({ error: "Timespan was not a number" });

		return;
	}

	const memoryUsage = await r.table("workerStats")
		.between(
			["memory", process.ppid, req.params.id, Date.now() - (timespan === -1 ? 86400000 : timespan)],
			["memory", process.ppid, req.params.id, Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	const streams = await r.table("workerStats")
		.between(
			["streams", process.ppid, req.params.id, Date.now() - (timespan === -1 ? 86400000 : timespan)],
			["streams", process.ppid, req.params.id, Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	const guilds = await r.table("workerStats")
		.between(
			["guilds", process.ppid, req.params.id, Date.now() - (timespan === -1 ? 604800000 : timespan)],
			["guilds", process.ppid, req.params.id, Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	res.status(200).json({ memoryUsage, guilds, streams });
});

router.get("/:id(\\d+)/streams", async (req, res) => {
	const { r } = req.app.locals;

	req.params.id = parseInt(req.params.id);
	const timespan = parseInt(req.query.timespan || 86400000);

	if(isNaN(timespan)) {
		res.status(400).json({ error: "Timespan was not a number" });

		return;
	}

	const streams = await r.table("workerStats")
		.between(
			["streams", process.ppid, req.params.id, Date.now() - timespan],
			["streams", process.ppid, req.params.id, Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	res.status(200).json({ streams });
});

router.get("/:id(\\d+)/guilds", async (req, res) => {
	const { r } = req.app.locals;

	req.params.id = parseInt(req.params.id);
	const timespan = parseInt(req.query.timespan || 604800000);

	if(isNaN(timespan)) {
		res.status(400).json({ error: "Timespan was not a number" });

		return;
	}

	const guilds = await r.table("workerStats")
		.between(
			["guilds", process.ppid, req.params.id, Date.now() - timespan],
			["guilds", process.ppid, req.params.id, Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	res.status(200).json({ guilds });
});

router.get("/:id(\\d+)/memoryUsage", async (req, res) => {
	const { r } = req.app.locals;

	req.params.id = parseInt(req.params.id);
	const timespan = parseInt(req.query.timespan || 86400000);

	if(isNaN(timespan)) {
		res.status(400).json({ error: "Timespan was not a number" });

		return;
	}

	const memoryUsage = await r.table("workerStats")
		.between(
			["memory", process.ppid, req.params.id, Date.now() - timespan],
			["memory", process.ppid, req.params.id, Date.now()],
			{ index: "compound" }
		)
		.orderBy(r.asc("time"))
		.pluck("time", "value")
		.run();

	res.status(200).json({ memoryUsage });
});
