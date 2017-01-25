const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("xkcd", async (message, bot) => {
	message.channel.sendTyping();

	let comic = message.args[0] || Math.floor(Math.random() * 1785) + 1;
	let body = await framework.getContent(`http://xkcd.com/${comic}/info.0.json`);
	body = JSON.parse(body);

	let buffer = await framework.getContent(body.img, { encoding: null });
	return [`<http://xkcd.com/${comic}>\n**${body.title}** (#${comic})`, {
		file: buffer,
		name: body.img.substring(body.img.lastIndexOf("/") + 1)
	}];
}, {
	type: "default",
	description: "Grab a xkcd from xkcd.com",
	args: [{
		label: "comic number",
		type: "int",
		min: 1,
		max: 1785,
		optional: true
	}]
});
