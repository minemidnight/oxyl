const express = require("express"),
	main = require("../website.js"),
	twemoji = require("twemoji"),
	framework = require("../../framework.js"),
	SSE = require("express-sse");
const router = express.Router(); // eslint-disable-line new-cap

const sse = new SSE();
router.get("/", sse.init);
exports.sse = sse;

module.exports = router;

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

let prev;
module.exports.messageCreate = message => {
	if(prev === message.id) return;
	let content = message.cleanContent;
	let embed = message.embeds.filter(em => em.type === "rich")[0];
	prev = message.id;

	content = main.escapeHTML(content);
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
		guildid: message.channel.guild ? message.channel.guild.id : message.channel.id,
		guildname: message.channel.guild ? message.channel.guild.name : "DM",
		channelname: message.channel.name,
		bot: message.author.bot,
		sent: message.createdAt
	});
};
