const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	express = require("express"),
	handlebars = require("handlebars"),
	fs = require("fs"),
	request = require("request"),
	SSE = require("express-sse"),
	twemoji = require("twemoji");

const app = express();
app.use(express.static("./site/public"));
exports.tokens = {};

const	sse = new SSE();
app.get("/sse", sse.init);
exports.sse = sse;

var entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
	"/": "&#x2F;"
};

function escapeHTML(string) {
	return String(string).replace(/[&<>"'\/]/g, str => entityMap[str]);
}

exports.messageCreate = message => {
	let content = escapeHTML(message.cleanContent);
	content = content.replace(/\n/g, "<br />");
	content = content.replace(/&lt;:[A-Z0-9_]{2,32}:\d{14,20}&gt;/gi, id =>
		`<img src="https://cdn.discordapp.com/emojis/${id.substring(id.lastIndexOf(":") + 1, id.length - 4)}.png"></img>`);

	sse.send({
		content: twemoji.parse(content),
		author: framework.unmention(message.author),
		guildid: message.guild ? message.guild.id : message.channel.id,
		guildname: message.guild ? message.guild.name : "DM",
		channelname: message.channel.name,
		sent: message.createdAt
	});
};

let routes = framework.loadScripts("./site/routes/");
for(let script in routes) {
	if(script === "index") {
		app.use("/", routes[script]);
	} else {
		app.use(`/${script}`, routes[script]);
	}
}

exports.getInfo = (token, path) => {
	let url = `https://discordapp.com/api/${path}`;
	return new Promise((resolve, reject) => {
		if(Date.now() - token.time >= 604800) {
			refreshToken(token)
			.then(newToken => exports.getInfo(newToken, path).then(resolve).catch(reject))
			.catch(console.log);
		}		else {
			framework.getContent(url, { headers: { Authorization: `Bearer ${token.token}` } })
		.then(body => resolve(JSON.parse(body))).catch(reject);
		}
	});
};

function refreshToken(token) {
	return new Promise((resolve, reject) => {
		let ip = token.ip;
		let data = {
			refresh_token: token.refresh_token, // eslint-disable-line camelcase
			grant_type: "refresh_token" // eslint-disable-line camelcase
		};

		console.log(data);
		let base64 = new Buffer(`${framework.config.botid}:${framework.config.private.secret}`).toString("base64");
		console.log(`Basic ${base64}`);
		request.post({
			url: "https://discordapp.com/api/oauth2/token",
			headers: { Authorization: `Basic ${base64}` },
			form: data
		}, (err, httpResponse, body) => {
			if(err) {
				reject(err);
			} else {
				body = JSON.parse(body);
				console.log(body);
				exports.tokens[ip] = {
					token: body.access_token,
					ip: ip,
					time: Date.now(),
					refresh: body.refresh_token
				};
			}
		});
	});
}
exports.refreshToken = refreshToken;

exports.getIp = (req) => req.headers["x-forwarded-for"] || req.connection.remoteAddress;

function parseHBRest(hb, context) {
	let hbst = fs.readFileSync(`./site/views/${hb}.hbs`).toString();
	let hbs = handlebars.compile(hbst);
	return hbs(context);
}

exports.parseHB = (hb, req, context = {}) => {
	let ip = exports.getIp(req);
	return new Promise((resolve, reject) => {
		if(exports.tokens[ip]) {
			exports.getInfo(exports.tokens[ip], "users/@me")
			.then(body => {
				context.user = body;
				resolve(parseHBRest(hb, context));
			});
		} else {
			resolve(parseHBRest(hb, context));
		}
	});
};

exports.getHTML = (name) => fs.readFileSync(`./site/views/${name}.html`).toString();

app.listen(8080);
