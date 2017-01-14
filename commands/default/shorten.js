const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	googl = require("goo.gl");
const config = framework.config;
googl.setKey(config.private.googleKey);

var command = new Command("shorten", async (message, bot) => {
	message.channel.startTyping();

	let shortUrl = await googl.shorten(message.args[0], { quotaUser: message.author.id });
	return `Shortened link: ${shortUrl}`;
}, {
	type: "default",
	description: "Shorten a link using goo.gl",
	aliases: ["googl", "shortlink"],
	args: [{ type: "link" }]
});
