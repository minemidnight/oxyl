const googl = require("goo.gl");
googl.setKey(framework.config.private.googleKey);

exports.cmd = new Oxyl.Command("shorten", async message => {
	message.channel.sendTyping();

	let shortUrl = await googl.shorten(message.args[0], { quotaUser: message.author.id });
	return `Shortened link: ${shortUrl}`;
}, {
	type: "default",
	description: "Shorten a link using goo.gl",
	aliases: ["googl", "shortlink"],
	args: [{ type: "link" }]
});
