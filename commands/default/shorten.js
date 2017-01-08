const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	googl = require("goo.gl");
const config = framework.config;
googl.setKey(config.private.googleKey);

var command = new Command("shorten", (message, bot) => {
	var editMsg = message.channel.createMessage("`Shortening Link...`");
	googl.shorten(message.args[0], { quotaUser: message.author.id }).then((shortUrl) => {
		Promise.resolve(editMsg).then(msg => {
			msg.edit(`Shortened link: ${shortUrl}`);
		});
	});
	return false;
}, {
	type: "default",
	description: "Shorten a link using goo.gl",
	aliases: ["googl", "shortlink"],
	args: [{ type: "link" }]
});
