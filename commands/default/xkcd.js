const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("xkcd", async (message, bot) => {
	message.channel.sendTyping();

	let comic = message.args[0] || Math.floor(Math.random() * 1785) + 1;
	let body = await framework.getContent(`http://xkcd.com/${comic}/info.0.json`);
	body = JSON.parse(body);
	let embed = {
		url: `http://xkcd.com/${comic}/`,
		title: `${body.title} (#${comic})`,
		image: { url: body.img }
	};

	return { embed };
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
