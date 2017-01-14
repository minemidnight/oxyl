const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js");
const router = express.Router(); // eslint-disable-line new-cap

router.get("/", async (req, res) => {
	res.send(await main.parseHB("index", req));
});

module.exports = router;
