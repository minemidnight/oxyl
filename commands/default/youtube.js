const music = require("../../modules/music.js"),
	https = require("https"),
	Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

var command = new Command("youtube", (message, bot) => {
	if(!message.content) {
		return "please provide a query to search for";
	}
	var editMsg = message.reply("`Searching...`");
	music.searchVideo(message.content).then(res => {
		if(res === "NO_RESULTS") {
			Promise.resolve(editMsg).then(msg => {
				msg.edit(`${message.author}, no results found`);
			});
		} else {
			Promise.resolve(editMsg).then(msg => {
				msg.edit(`${message.author}, here is the video you searched for: http://youtube.com/watch?v=${res}`);
			});
		}
	}).catch(() => {
		Promise.resolve(editMsg).then(msg => {
			msg.edit(`${message.author}, error contating the Youtube API`);
		});
	});
	return false;
}, {
	type: "default",
	aliases: ["yt"],
	description: "Search a youtube query",
	args: [{
		type: "text",
		label: "query"
	}]
});
