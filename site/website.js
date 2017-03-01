const express = require("express"),
	handlebars = require("handlebars"),
	fs = require("fs"),
	request = require("request"),
	bodyParser = require("body-parser"),
	cookieParser = require("cookie-parser"),
	session = require("express-session"),
	http = require("http"),
	twemoji = require("twemoji"),
	WebSocket = require("ws");

const app = exports.app = express();
const server = exports.server = http.createServer(app);
const wss = exports.wss = new WebSocket.Server({ port: 8085 });
const connectDatadog = require("connect-datadog")({
	response_code: true, // eslint-disable-line camelcase
	tags: ["app:my_app"]
});
server.listen(8080);
exports.tokens = {};

app.use(connectDatadog);
app.use(express.static("./site/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
	secret: framework.config.private.secret,
	resave: false,
	saveUninitialized: true
}));

let routes = exports.routes = framework.loadScripts("./site/routes/");
for(let script in routes) {
	if(script === "index") app.use("/", routes[script]);
	else app.use(`/${script}`, routes[script]);
}

let entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
	"/": "&#x2F;",
	"#": "&#35;"
};

let escapeHTML = exports.escapeHTML = (string) => String(string).replace(/[&<>"'\#/]/g, str => entityMap[str]);

app.get("*", async (req, res) => {
	res.send(exports.getHTML("404"));
	res.end();
});

exports.getInfo = async (sesid, path) => {
	let token = exports.tokens[sesid];
	let url = `https://discordapp.com/api/${path}`;
	if(Date.now() - token.time >= 604800) {
		await refreshToken(token);
		token = exports.tokens[sesid];
	}

	let body = await framework.getContent(url, { headers: { Authorization: `Bearer ${token.token}` } });
	return JSON.parse(body);
};

async function refreshToken(token) {
	let data = {
		refresh_token: token.refresh, // eslint-disable-line camelcase
		grant_type: "refresh_token" // eslint-disable-line camelcase
	};

	let base64 = new Buffer(`${bot.user.id}:${framework.config.private.secret}`).toString("base64");
	request.post({
		url: "https://discordapp.com/api/oauth2/token",
		headers: { Authorization: `Basic ${base64}` },
		form: data
	}, (err, httpResponse, body) => {
		if(err) throw err;
		body = JSON.parse(body);
		exports.tokens[token.session] = {
			token: body.access_token,
			session: token.session,
			time: Date.now(),
			refresh: body.refresh_token
		};

		return false;
	});
}
exports.refreshToken = refreshToken;

function parseHBRest(hb, context) {
	let hbst = fs.readFileSync(`./site/views/${hb}.hbs`).toString();
	let hbs = handlebars.compile(hbst);
	return hbs(context);
}

exports.parseHB = async (hb, req, context = {}) => {
	if(exports.tokens[req.sessionID]) {
		let body = await exports.getInfo(req.sessionID, "users/@me");
		context.user = body;
	}
	return parseHBRest(hb, context);
};

exports.getHTML = (name) => fs.readFileSync(`./site/views/${name}.html`).toString();


/* LIVE CHAT */

wss.broadcast = (data) => {
	wss.clients.forEach(client => {
		if(client.readyState === WebSocket.OPEN) client.send(data);
	});
};

let prev;
module.exports.messageCreate = message => {
	if(prev === message.id) return;
	let content = message.cleanContent;
	let embed = message.embeds.filter(em => em.type === "rich")[0];
	prev = message.id;

	content = exports.escapeHTML(content);
	if(embed) content += parseEmbed(embed);
	content = content.replace(/(?:&lt;|<):[A-Z0-9_]{2,32}:(\d{14,20})(?:&gt;|>)/gi,
	`<img class="emoji" src="https://cdn.discordapp.com/emojis/$1.png"></img>`);
	if(message.attachments) {
		message.attachments.forEach(attachment => {
			content += `\n<img src="${attachment.url}" class="attachment" alt="Attachment"></img>`;
		});
	}

	content = content
		.replace(/```\n/g, "```")
		.replace(/`([^`]+)`/g, `<code class="inline-code">$1</code>`)
		.replace(/\n/g, `<br />`)
		.trim();

	let data = {
		content: twemoji.parse(content),
		author: framework.unmention(message.author),
		avatar: message.author.avatarURL,
		guildid: message.channel.guild ? message.channel.guild.id : message.channel.id,
		guildname: message.channel.guild ? message.channel.guild.name : "DM",
		channelname: message.channel.name,
		channelid: message.channel.id,
		bot: message.author.bot,
		sent: message.createdAt
	};

	data = JSON.stringify(data);
	wss.broadcast(data);
};

function parseEmbed(embed) {
	let html = `<div class="w3-container embed w3-leftbar w3-round" style="position:relative;` +
		`background:#32353A;border-color:#${embed.color ? embed.color.toString(16) : "4f545c"}!important">`;
	html += `<div class="embed-content w3-padding-bottom w3-padding-top" style="position:relative;">`;

	if(embed.author) {
		html += `<div class="embed-author"><h6>`;
		if(embed.author.icon_url) html += `<img class="embed-icon" src="${embed.author.icon_url}" />`;

		html += `${embed.author.name}`;
		html += `</h6></div>`;
	}
	if(embed.title) {
		html += `<div class="embed-title"><h6>`;
		if(embed.url) html += `<a href="${embed.url}">${embed.title}</a>`;
		else html += `${embed.title}`;
		html += "</h6></div>";
	}
	if(embed.description) html += `<div class="embed-description"><p>${embed.description}</p></div>`;
	if(embed.thumbnail) {
		html += `<div class="embed-thumb" style="position:absolute;right:7.5px;top:7.5px">`;
		html += `<img class="embed-thumbnail" src="${embed.thumbnail.url}"`;
		if(embed.thumbnail.height) html += `height="${embed.thumbnail.height}px"`;
		if(embed.thumbnail.width) html += `width="${embed.thumbnail.width}px"`;
		html += `/></div>`;
	}
	if(embed.fields && embed.fields.length >= 1) {
		let inline, inlineCount = -1;
		if(embed.thumbnail) inline = 2;
		else inline = 3;
		embed.fields.forEach(field => {
			if(field.inline) {
				if(inlineCount === inline) html += "</div>";
				if(inlineCount === inline || inlineCount === -1) {
					html += `<div class="w3-row w3-margin-bottom embed-field">`;
					inlineCount = 0;
				}
				html += `<div class="w3-${inline === 2 ? "half" : "third"} embed-field-content">`;

				inlineCount++;
			} else {
				if(inlineCount !== 0) html += "</div>";
				inlineCount = 0;
				html += `<div class="w3-row w3-margin-bottom embed-field">`;
				html += `<div class="w3-full embed-field-content">`;
			}

			html += `<h6>${field.name}</h6>`;
			html += `<p>${field.value}</p>`;

			html += "</div>";
		});
		html += "</div>";
	}
	if(embed.image) {
		html += `<div class="embed-image w3-container"><img src="${embed.image.url}" /></div>`;
	}
	if(embed.footer) {
		html += `<div class="embed-footer"><p class="w3-small">`;
		if(embed.footer.icon_url) html += `<img class="embed-icon" src="${embed.footer.icon_url}" />`;

		html += `${embed.footer.text}`;
		if(embed.timestamp) html += ` | ${framework.formatDate(embed.timestamp)}`;
		html += `</p></div>`;
	}

	html += "</div></div>";
	return html;
}
