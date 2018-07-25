const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const checkScript = require("./middleware/checkScript");
const expectedBody = require("./middleware/expectedBody");
const getUserInfo = require("./middleware/getUserInfo");
const snowflakeGenerator = require("./util/SnowflakeGenerator");

router.use(getUserInfo());
router.param("id", checkScript());

router.get("/", async (req, res) => {
	const { r } = req.app.locals;

	const scripts = await r.table("oxylscript")
		.getAll(res.locals.user.id, { index: "creatorID" })
		.map(doc => ({
			id: doc("id"),
			name: doc("name"),
			lastUpdated: doc("lastUpdated"),
			lineCount: doc("content").split("\n").count()
		}))
		.run();

	res.status(200).json({ scripts });
});

router.get("/:id(\\d{17,21})", (req, res) => {
	res.status(200).json({ script: res.locals.script });
});

router.put("/", expectedBody({ name: String }), async (req, res) => {
	const { r } = req.app.locals;

	const insertion = {
		id: snowflakeGenerator.next(),
		creatorID: res.locals.user.id,
		name: req.body.name,
		lastUpdated: Date.now(),
		content: ""
	};

	await r.table("oxylscript")
		.insert(insertion)
		.run();

	res.status(200).json({ script: insertion });
});

router.patch("/:id(\\d{17,21})", expectedBody({
	name: "string?",
	content: String
}), async (req, res) => {
	const { r } = req.app.locals;

	const { changes: [{ new_val: script }] } = await r.table("oxylscript")
		.get(res.locals.script.id)
		.update({
			name: req.body.name || res.locals.script.name,
			lastUpdated: Date.now(),
			content: req.body.content
		}, { returnChanges: true })
		.run();

	res.status(200).json({ script });
});

router.delete("/:id(\\d{17,21})", async (req, res) => {
	const { r } = req.app.locals;
	await r.table("oxylscript")
		.get(res.locals.script.id)
		.delete()
		.run();

	await r.table("oxylscriptSettings")
		.getAll(res.locals.script.id, { index: "scriptID" })
		.delete()
		.run();

	res.status(204).end();
});
