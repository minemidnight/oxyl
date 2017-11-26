const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

["reddit", "censors", "commands", "general",
	"modlog", "music", "oauth", "reddit",
	"roblox", "roles", "twitch", "userlog"].forEach(route => router.use(`/${route}`, require(`./${route}`)));

router.all("*", (req, res) => res.status(404).json({ error: "Method not found" }));
