const babelify = require("express-babelify-middleware");
const config = require("../../config");
const cookieParser = require("cookie-parser");
const express = require("express");
const fs = require("fs");
const oauth = require("../oauth/index");
const path = require("path");

const app = express();
app.locals.url = config.panelURL;
app.locals.oauthURI = `https://discordapp.com/oauth2/authorize?response_type=code&redirect_uri=` +
	`${`${encodeURIComponent(config.panelURL)}/callback`}&scope=identify&client_id=${config.clientID}`;

app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
require("http").createServer(app).listen(config.panelPort);

app.use(`/js`, babelify(path.resolve(__dirname, "public", "js"), babelify.browserifySettings, { presets: ["env"] }));
app.use(express.static(path.resolve(__dirname, "public")));
app.use(cookieParser());

app.use(async (req, res, next) => {
	if(req.path === "/callback") return next();

	if(!req.cookies.token) return res.redirect(req.app.locals.oauthURI);
	let token;
	try {
		token = JSON.parse(req.cookies.token);
	} catch(err) {
		return res.redirect(req.app.locals.oauthURI);
	}

	try {
		let info = oauth.info(token, "users/@me");
		if(info.token) {
			res.set("Set-Cookie", `token=${JSON.stringify(info.token)}; Max-Age=31,540,000`);
			info = info.data;
		}

		if(!~config.owners.indexOf(info.id)) return res.status(403).send("Forbidden");
	} catch(err) {
		return res.redirect(req.app.locals.oauthURI);
	}

	return next();
});

const routes = fs.readdirSync(path.resolve(__dirname, "routes"));
routes.forEach(script => {
	const name = script.slice(0, -3);
	const router = require(path.resolve(__dirname, "routes", script));

	if(name === "index") app.use("/", router);
	else app.use(`/${name}`, router);
});
