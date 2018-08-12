const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const getUser = require("./middleware/getUser");
router.use(getUser());

["reddit", "censors", "commands", "general", "modlog",
	"music", "newsletter", "oauth", "oxylscript", "reddit",
	"roblox", "roles", "twitch", "userlog", "premium"]
	.forEach(route => router.use(`/${route.toLowerCase()}`, require(`./${route}`)));

router.all("*", (req, res) => res.status(404).json({ error: "Method not found" }));
