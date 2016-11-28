const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	https = require("https"),
	googl = require("goo.gl");
const config = framework.config;
googl.setKey(config.googleKey);

var command = new Command("shorten", (message, bot) => {
	var filter = config.options.linkFilter;
	filter = new RegExp(filter);
	if(!message.content) {
		return "please provide a link to shorten";
	} else if(!filter.test(message.content)) {
		return "please provide a valid link";
	} else {
		var editMsg = message.reply("`Shortening Link...`");
		googl.shorten(message.content, { quotaUser: message.author.id }).then((shortUrl) => {
			Promise.resolve(editMsg).then(msg => {
				msg.edit(`${message.author}, shortened link: ${shortUrl}`);
			});
		});
		return false;
	}
}, {
	type: "default",
	description: "Shorten a link using goo.gl",
	aliases: ["shortenlink", "googl", "shortlink"],
	args: [{ type: "link" }]
});
