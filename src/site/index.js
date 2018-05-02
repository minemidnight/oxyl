const api = require("./api/index");
const bodyParser = require("body-parser");
const config = require("../../config");
const express = require("express");
const path = require("path");
const r = require("../rethinkdb/index");

let Redis;
if(process.env.NODE_ENV === "development") Redis = require("ioredis-mock");
else Redis = require("ioredis");
const redis = new Redis({ db: config.redisDB });

const app = express();
app.locals.config = config;
app.locals.r = r;
app.locals.redis = redis;
app.set("env", process.env.NODE_ENV);
app.set("x-powered-by", false);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "public")));
require("http").createServer(app).listen(config.dashboardPort, () => process.output({ op: "ready" }));

app.use("/api", api);
app.get("/invite", (req, res) => {
	res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.clientID}&scope=bot&permissions=298183686`);
});
app.get("/patreon", (req, res) => res.redirect("https://www.patreon.com/minemidnight"));
app.get("/support", (req, res) => res.redirect("https://discord.gg/9wkTDcE"));

app.get("*", (req, res) => res.status(200).sendFile(path.resolve(__dirname, "public", "app.html")));

module.exports = { app };
