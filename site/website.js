const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	express = require("express"),
	handlebars = require("handlebars"),
	fs = require("fs"),
	request = require("request"),
	bodyParser = require("body-parser");

const app = express();
app.use(express.static("./site/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
exports.app = app;
exports.tokens = {};

var entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
	"/": "&#x2F;",
	"#": "&#35;"
};

let escapeHTML = exports.escapeHTML = (string) => String(string).replace(/[&<>"'\#/]/g, str => entityMap[str]);

let routes = exports.routes = framework.loadScripts("./site/routes/");
for(let script in routes) {
	if(script === "index") app.use("/", routes[script]);
	else app.use(`/${script}`, routes[script]);
}

app.get("*", async (req, res) => {
	res.send(exports.getHTML("404"));
});

exports.getInfo = async (token, path) => {
	let url = `https://discordapp.com/api/${path}`;
	if(Date.now() - token.time >= 604800) {
		await refreshToken(token);
		token = exports.tokens[token.ip];
	}
	let body = await framework.getContent(url, { headers: { Authorization: `Bearer ${token.token}` } });
	return JSON.parse(body);
};

async function refreshToken(token) {
	let ip = token.ip;
	let data = {
		refresh_token: token.refresh, // eslint-disable-line camelcase
		grant_type: "refresh_token" // eslint-disable-line camelcase
	};

	let base64 = new Buffer(`${framework.config.botid}:${framework.config.private.secret}`).toString("base64");
	request.post({
		url: "https://discordapp.com/api/oauth2/token",
		headers: { Authorization: `Basic ${base64}` },
		form: data
	}, (err, httpResponse, body) => {
		if(err) throw err;
		body = JSON.parse(body);
		exports.tokens[ip] = {
			token: body.access_token,
			ip: ip,
			time: Date.now(),
			refresh: body.refresh_token
		};

		return false;
	});
}
exports.refreshToken = refreshToken;

exports.getIp = (req) => req.headers["x-forwarded-for"] || req.connection.remoteAddress;

function parseHBRest(hb, context) {
	let hbst = fs.readFileSync(`./site/views/${hb}.hbs`).toString();
	let hbs = handlebars.compile(hbst);
	return hbs(context);
}

exports.parseHB = async (hb, req, context = {}) => {
	let ip = exports.getIp(req);
	if(exports.tokens[ip]) {
		let body = await exports.getInfo(exports.tokens[ip], "users/@me");
		context.user = body;
	}
	return parseHBRest(hb, context);
};

exports.getHTML = (name) => fs.readFileSync(`./site/views/${name}.html`).toString();
