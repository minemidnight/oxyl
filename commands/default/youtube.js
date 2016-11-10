const Discord = require("discord.js"),
	Oxyl = require("./../oxyl.js"),
	music = require("../modules/music.js"),
	https = require("https");
const config = Oxyl.config;

Oxyl.registerCommand("youtube", "default", (message, bot) => {
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
}, ["yt"], "Search a youtube query", "<query>");
