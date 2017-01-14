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
exports.app = app;
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
	"/": "&#x2F;",
	"#": "&#35;"
};

function escapeHTML(string) {
	return String(string).replace(/[&<>"'\#/]/g, str => entityMap[str]);
}

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

exports.messageCreate = message => {
	let content = message.cleanContent;
	let embed = message.embeds.filter(em => em.type === "rich")[0];

	content = escapeHTML(content);
	if(embed) content += parseEmbed(embed);
	content = content.replace(/(?:&lt;|<):[A-Z0-9_]{2,32}:(\d{14,20})(?:&gt;|>)/gi,
	`<img class="emoji" src="https://cdn.discordapp.com/emojis/$1.png"></img>`);
	message.attachments.forEach(attachment => {
		content += `\n<img src="${attachment.url}" class="attachment" alt="Attachment"></img>`;
	});
	content = content.replace(/`([^`]+)`/g, `<code class="inline-code">$1</code>`);
	content = content.replace(/\n/g, `<br />`);
	content = content.trim();

	sse.send({
		content: twemoji.parse(content),
		author: framework.unmention(message.author),
		guildid: message.guild ? message.guild.id : message.channel.id,
		guildname: message.guild ? message.guild.name : "DM",
		channelname: message.channel.name,
		bot: message.author.bot,
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

exports.getInfo = async (token, path) => {
	let url = `https://discordapp.com/api/${path}`;
	if(Date.now() - token.time >= 604800) token = await refreshToken(token);

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
		if(err) return new Error(err);
		body = JSON.parse(body);
		exports.tokens[ip] = {
			token: body.access_token,
			ip: ip,
			time: Date.now(),
			refresh: body.refresh_token
		};
		return exports.tokens[ip];
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
