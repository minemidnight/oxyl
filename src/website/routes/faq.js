const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

router.get("/", async (req, res) => {
	res.status(200).send(await req.app.page(req, "faq")).end();
});
