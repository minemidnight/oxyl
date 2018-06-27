const bodyParser = require("body-parser");
const config = require("../../config");
const express = require("express");
const path = require("path");

const OAuth2 = require("../oauth2/index");
const discordAuth = new OAuth2({
	api: "https://discordapp.com/api/",
	oauth2: "https://discordapp.com/api/oauth2/"
}, {
	clientID: config.clientID,
	secret: config.secret,
	redirectURI: config.panelURL
});

const app = express();
app.set("env", process.env.NODE_ENV);
app.set("x-powered-by", false);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(
	path.resolve(__dirname, "public"),
	{ maxAge: process.env.NODE_ENV === "production" ? 31536000000 : 0 }
));
require("http").createServer(app).listen(config.panelPort, () => process.output({ op: "ready" }));

app.get("/api/config", async (req, res) => {
	res.status(200).json({
		clientID: config.clientID,
		owners: config.owners
	});
});

app.get("/api/info", async (req, res) => {
	if(!req.query.path) {
		res.status(400).send({ error: "No path" });
		return;
	}

	let auth;
	try {
		auth = JSON.parse(req.headers.authorization);
	} catch(err) {
		res.status(400).send({ error: "Authorization not JSON" });
		return;
	}

	try {
		const info = await discordAuth.info(auth, req.query.path);
		res.status(200).json(info);
	} catch(err) {
		res.status(400).send({ error: "Invalid path or token" });
		return;
	}
});

app.post("/api/callback", async (req, res) => {
	if(!req.body.code) {
		res.status(400).send({ error: "No code" });
		return;
	}

	try {
		const token = await discordAuth.token(req.body.code);
		res.status(200).json(token);
	} catch(err) {
		res.status(400).send({ error: "Invalid code" });
		return;
	}
});

app.get("*", (req, res) => {
	res.header("cache-control", "no-cache, no-store, must-revalidate");
	res.status(200).sendFile(path.resolve(__dirname, "public", "app.html"));
});
module.exports = { app };

