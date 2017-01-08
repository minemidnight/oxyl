const express = require("express"),
	framework = require("../../framework.js"),
	main = require("../website.js");
const router = express.Router(); // eslint-disable-line new-cap

router.get("/", (req, res) => {
	main.parseHB("index", req)
	.then(hbs => res.send(hbs));
});

module.exports = router;
