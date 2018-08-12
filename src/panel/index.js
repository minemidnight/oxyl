const api = require("./api/index");
const bodyParser = require("body-parser");
const config = require("../../config");
const express = require("express");
const path = require("path");

const app = express();
app.locals.r = require("../rethinkdb/index");

app.disable("etag");
app.set("env", process.env.NODE_ENV);
app.set("x-powered-by", false);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(
	path.resolve(__dirname, "public"),
	{ maxAge: process.env.NODE_ENV === "production" ? 31536000000 : 0 }
));
require("http").createServer(app).listen(config.panelPort, () => process.output({ op: "ready" }));

app.use("/api", api);
app.get("*", (req, res) => {
	res.header("cache-control", "no-cache, no-store, must-revalidate");
	res.status(200).sendFile(path.resolve(__dirname, "public", "app.html"));
});

module.exports = { app };

