const router = module.exports = require("express").Router(); // eslint-disable-line new-cap
const validateOwner = require("./middleware/validateOwner");

router.use(validateOwner());

router.get("/", async (req, res) => {
	const { r } = req.app.locals;

	const level = req.query.level || "all";
	const offset = parseInt(req.query.offset || 0);
	const limit = parseInt(req.query.limit || 10);

	if(isNaN(offset)) {
		res.status(400).json({ error: "Offset was not a number" });

		return;
	} else if(isNaN(limit)) {
		res.status(400).json({ error: "Limit was not a number" });

		return;
	} else if(limit > 100) {
		res.status(400).json({ error: "Limit cannot be more than 100" });

		return;
	}

	let logs;
	if(level === "all") {
		logs = await r.table("logs")
			.orderBy({ index: r.desc("time") })
			.without("uuid")
			.skip(offset)
			.limit(limit)
			.run();
	} else {
		logs = await r.table("logs")
			.getAll(level, { index: "level" })
			.orderBy(r.desc("time"))
			.without("uuid")
			.skip(offset)
			.limit(limit)
			.run();
	}

	res.status(200).json({ logs });
});
