const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("codingmeme", async (message, bot) => {
	message.channel.sendTyping();

	let body = await framework.getContent("https://www.reddit.com/r/ProgrammerHumor/random/.json");
	body = JSON.parse(body)[0].data.children[0].data;

	let embed = { title: body.title, url: `https://redd.it/${body.id}` };
	if(body.preview && body.preview.images) embed.image = { url: body.preview.images[0].source.url };
	if(body.selftext) embed.description = body.selftext;
	return { embed };
}, {
	type: "default",
	description: "Grab a coding from /r/ProgrammerHumor"
});
